import os
import json
import time
import asyncio
import traceback
from typing import Dict, Any, Optional, Set

import websockets
from websockets.server import WebSocketServerProtocol

from db import (
    init_db,
    now_ms,
    db_fetchone,
    db_fetchall,
    db_execute,
    rate_limit_hit,
    chat_ensure_thread,
    chat_add_message,
    chat_list_messages,
    presence_set,
    presence_get,
    cleanup_presence_offline,
    cleanup_typing_stale,
)

# =========================================================
# 711 TAXI WS ULTRA SERVER
# - Realtime chat
# - Presence online/offline
# - Typing indicator
# - DB persistence
# =========================================================

WS_HOST = os.getenv("WS_HOST", "0.0.0.0")
WS_PORT = int(os.getenv("PORT", "10000"))

# security (simple for now)
ADMIN_TELEGRAM_ID = os.getenv("ADMIN_TELEGRAM_ID", "").strip()

# Anti spam
MSG_RATE_LIMIT = int(os.getenv("WS_MSG_RATE_LIMIT", "25"))          # per window
MSG_RATE_WINDOW = int(os.getenv("WS_MSG_RATE_WINDOW", "15"))        # seconds
CONNECT_RATE_LIMIT = int(os.getenv("WS_CONNECT_RATE_LIMIT", "30"))  # per window
CONNECT_RATE_WINDOW = int(os.getenv("WS_CONNECT_RATE_WINDOW", "30"))

PING_INTERVAL = int(os.getenv("WS_PING_INTERVAL", "20"))  # seconds
PING_TIMEOUT = int(os.getenv("WS_PING_TIMEOUT", "20"))    # seconds

# =========================================================
# GLOBAL CONNECTION STATE
# =========================================================

class ClientConn:
    def __init__(self, ws: WebSocketServerProtocol, phone: str, telegram_id: Optional[str] = None):
        self.ws = ws
        self.phone = phone
        self.telegram_id = telegram_id
        self.joined_threads: Set[int] = set()
        self.last_seen = now_ms()

# phone -> set of conns
ONLINE: Dict[str, Set[ClientConn]] = {}

# thread_id -> set of phones connected (for quick broadcast)
THREAD_MEMBERS: Dict[int, Set[str]] = {}

# =========================================================
# HELPERS
# =========================================================

def jdump(obj: Any) -> str:
    return json.dumps(obj, ensure_ascii=False)

def jload(txt: str) -> Dict[str, Any]:
    try:
        return json.loads(txt or "{}")
    except:
        return {}

def safe_phone(phone: Any) -> str:
    if not phone:
        return ""
    p = str(phone).strip()
    out = []
    for ch in p:
        if ch.isdigit() or ch == "+":
            out.append(ch)
    return "".join(out)

def is_admin(telegram_id: Optional[str]) -> bool:
    if not ADMIN_TELEGRAM_ID:
        return False
    return str(telegram_id or "") == str(ADMIN_TELEGRAM_ID)

async def ws_send(ws: WebSocketServerProtocol, payload: Dict[str, Any]):
    try:
        await ws.send(jdump(payload))
    except:
        pass

async def send_to_phone(phone: str, payload: Dict[str, Any]):
    conns = ONLINE.get(phone, set())
    if not conns:
        return
    dead = []
    for c in list(conns):
        try:
            await c.ws.send(jdump(payload))
        except:
            dead.append(c)
    for d in dead:
        conns.discard(d)

async def broadcast_thread(thread_id: int, payload: Dict[str, Any]):
    members = THREAD_MEMBERS.get(thread_id, set())
    if not members:
        return
    for phone in list(members):
        await send_to_phone(phone, payload)

def add_online(conn: ClientConn):
    if conn.phone not in ONLINE:
        ONLINE[conn.phone] = set()
    ONLINE[conn.phone].add(conn)

def remove_online(conn: ClientConn):
    conns = ONLINE.get(conn.phone, set())
    if conn in conns:
        conns.remove(conn)
    if not conns:
        ONLINE.pop(conn.phone, None)

def join_thread(conn: ClientConn, thread_id: int):
    conn.joined_threads.add(thread_id)
    if thread_id not in THREAD_MEMBERS:
        THREAD_MEMBERS[thread_id] = set()
    THREAD_MEMBERS[thread_id].add(conn.phone)

def leave_all_threads(conn: ClientConn):
    for tid in list(conn.joined_threads):
        try:
            THREAD_MEMBERS.get(tid, set()).discard(conn.phone)
            if not THREAD_MEMBERS.get(tid, set()):
                THREAD_MEMBERS.pop(tid, None)
        except:
            pass
    conn.joined_threads.clear()

# =========================================================
# DB SYNC HELPERS
# =========================================================

def ensure_profile_exists(phone: str):
    """
    If profile is missing, create placeholder (prevents chat crash).
    """
    p = db_fetchone("SELECT phone FROM profiles WHERE phone=?", (phone,))
    if p:
        return
    db_execute(
        """
        INSERT INTO profiles(role,name,phone,bio,car_brand,car_number,photo_url,cover_url,
                             verified,trusted_badge,trust_score,level,orders_total,orders_done,
                             cancel_count,report_count,telegram_id,telegram_username,created_at,updated_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """,
        ("client", "User", phone, "", "", "", "", "",
         0, 0, 0, 1, 0, 0, 0, 0, None, None, now_ms(), now_ms())
    )

def get_thread_id(phone_a: str, phone_b: str) -> int:
    """
    Create if not exists.
    """
    t = chat_ensure_thread(phone_a, phone_b)
    return int(t.get("id") or 0)

def get_last_message_preview(thread_id: int) -> Dict[str, Any]:
    msg = db_fetchone(
        "SELECT * FROM chat_messages WHERE thread_id=? ORDER BY created_at DESC LIMIT 1",
        (thread_id,)
    )
    if not msg:
        return {"text": "", "media_type": "", "created_at": 0}
    text = msg.get("text") or ""
    media_type = msg.get("media_type") or ""
    return {"text": text, "media_type": media_type, "created_at": msg.get("created_at") or 0}

# =========================================================
# PROTOCOL ACTIONS
# =========================================================
"""
All messages from client:

1) auth
{ action:"auth", phone:"+998...", telegram_id:"681...", username:"..." }

2) open_thread
{ action:"open_thread", peer_phone:"+998..." }

3) send_message
{ action:"send_message", to:"+998...", text:"Hi" }

4) send_voice
{ action:"send_voice", to:"+998...", media_url:"https://..." }

5) typing
{ action:"typing", thread_id:123, is_typing:true }

6) fetch_threads
{ action:"fetch_threads" }

7) fetch_messages
{ action:"fetch_messages", thread_id:123, limit:80 }

Server -> Client:

- auth_ok
- presence_update
- thread_opened
- message_new
- typing_update
- threads_list
- messages_list
- error
"""

# =========================================================
# BACKGROUND TASKS
# =========================================================
async def background_cleanup_loop():
    while True:
        try:
            cleanup_presence_offline(stale_ms=60000)
            cleanup_typing_stale(stale_ms=8000)
        except:
            pass
        await asyncio.sleep(10)

# =========================================================
# MAIN WS HANDLER
# =========================================================
async def handle_ws(ws: WebSocketServerProtocol):
    conn_obj: Optional[ClientConn] = None

    # simple connection rate limit per IP (best effort)
    try:
        ip = ws.remote_address[0] if ws.remote_address else "unknown"
        key = f"ws_connect:{ip}"
        if rate_limit_hit(key, CONNECT_RATE_LIMIT, CONNECT_RATE_WINDOW):
            await ws_send(ws, {"type": "error", "message": "Too many connections"})
            await ws.close()
            return
    except:
        pass

    try:
        await ws_send(ws, {"type": "hello", "server": "711 TAXI WS ULTRA", "ts": now_ms()})

        async for message in ws:
            j = jload(message)
            action = str(j.get("action") or "").strip()

            # -------------------------
            # AUTH
            # -------------------------
            if action == "auth":
                phone = safe_phone(j.get("phone"))
                telegram_id = str(j.get("telegram_id") or "").strip() or None
                username = str(j.get("username") or "").strip() or None

                if not phone:
                    await ws_send(ws, {"type": "error", "message": "phone required"})
                    continue

                ensure_profile_exists(phone)

                # mark online
                presence_set(phone, True)

                conn_obj = ClientConn(ws, phone, telegram_id=telegram_id)
                add_online(conn_obj)

                # broadcast presence to everyone who has threads with this user (light)
                await ws_send(ws, {"type": "auth_ok", "phone": phone})

                # send presence info
                await send_to_phone(phone, {"type": "presence_update", "phone": phone, "is_online": 1, "last_seen": now_ms()})
                continue

            # must auth first
            if not conn_obj:
                await ws_send(ws, {"type": "error", "message": "auth first"})
                continue

            # -------------------------
            # FETCH THREADS LIST
            # -------------------------
            if action == "fetch_threads":
                phone = conn_obj.phone
                threads = db_fetchall(
                    """
                    SELECT * FROM chat_threads
                    WHERE user_a=? OR user_b=?
                    ORDER BY updated_at DESC
                    LIMIT 80
                    """,
                    (phone, phone)
                )

                out = []
                for t in threads:
                    tid = int(t["id"])
                    peer = t["user_b"] if t["user_a"] == phone else t["user_a"]
                    prof = db_fetchone("SELECT name,photo_url,is_online,last_seen FROM profiles LEFT JOIN presence ON profiles.phone=presence.phone WHERE profiles.phone=?", (peer,))
                    preview = get_last_message_preview(tid)
                    out.append({
                        "thread_id": tid,
                        "peer_phone": peer,
                        "peer_name": (prof.get("name") if prof else "User"),
                        "peer_photo": (prof.get("photo_url") if prof else ""),
                        "peer_online": int((prof.get("is_online") if prof else 0) or 0),
                        "peer_last_seen": int((prof.get("last_seen") if prof else 0) or 0),
                        "last_text": preview["text"],
                        "last_media_type": preview["media_type"],
                        "last_time": preview["created_at"],
                        "updated_at": t.get("updated_at", 0),
                    })

                await ws_send(ws, {"type": "threads_list", "items": out})
                continue

            # -------------------------
            # OPEN THREAD
            # -------------------------
            if action == "open_thread":
                peer = safe_phone(j.get("peer_phone"))
                if not peer:
                    await ws_send(ws, {"type": "error", "message": "peer_phone required"})
                    continue

                ensure_profile_exists(peer)

                tid = get_thread_id(conn_obj.phone, peer)
                if tid <= 0:
                    await ws_send(ws, {"type": "error", "message": "thread error"})
                    continue

                join_thread(conn_obj, tid)

                prof = db_fetchone("SELECT name,photo_url FROM profiles WHERE phone=?", (peer,))
                pres = presence_get(peer)

                await ws_send(ws, {
                    "type": "thread_opened",
                    "thread_id": tid,
                    "peer_phone": peer,
                    "peer_name": (prof.get("name") if prof else "User"),
                    "peer_photo": (prof.get("photo_url") if prof else ""),
                    "peer_online": int(pres.get("is_online", 0)),
                    "peer_last_seen": int(pres.get("last_seen", 0)),
                })

                # send last messages
                msgs = chat_list_messages(tid, limit=80)
                await ws_send(ws, {"type": "messages_list", "thread_id": tid, "items": msgs})
                continue

            # -------------------------
            # FETCH MESSAGES
            # -------------------------
            if action == "fetch_messages":
                tid = int(j.get("thread_id") or 0)
                limit = int(j.get("limit") or 80)
                limit = max(10, min(200, limit))
                if tid <= 0:
                    await ws_send(ws, {"type": "error", "message": "thread_id required"})
                    continue

                join_thread(conn_obj, tid)
                msgs = chat_list_messages(tid, limit=limit)
                await ws_send(ws, {"type": "messages_list", "thread_id": tid, "items": msgs})
                continue

            # -------------------------
            # TYPING INDICATOR
            # -------------------------
            if action == "typing":
                tid = int(j.get("thread_id") or 0)
                is_typing = bool(j.get("is_typing"))
                if tid <= 0:
                    continue

                # update DB typing
                db_execute(
                    """
                    INSERT INTO typing_status(thread_id, phone, is_typing, updated_at)
                    VALUES(?,?,?,?)
                    """,
                    (tid, conn_obj.phone, 1 if is_typing else 0, now_ms())
                )

                join_thread(conn_obj, tid)
                await broadcast_thread(tid, {
                    "type": "typing_update",
                    "thread_id": tid,
                    "phone": conn_obj.phone,
                    "is_typing": 1 if is_typing else 0,
                    "ts": now_ms()
                })
                continue

            # -------------------------
            # SEND TEXT MESSAGE
            # -------------------------
            if action == "send_message":
                to_phone = safe_phone(j.get("to"))
                text = str(j.get("text") or "").strip()

                if not to_phone or not text:
                    await ws_send(ws, {"type": "error", "message": "to/text required"})
                    continue

                # rate limit per sender
                rkey = f"ws_msg:{conn_obj.phone}"
                if rate_limit_hit(rkey, MSG_RATE_LIMIT, MSG_RATE_WINDOW):
                    await ws_send(ws, {"type": "error", "message": "Too fast. Wait a bit."})
                    continue

                ensure_profile_exists(to_phone)

                tid = get_thread_id(conn_obj.phone, to_phone)
                join_thread(conn_obj, tid)

                # save message
                mid = chat_add_message(tid, conn_obj.phone, text=text)

                payload = {
                    "type": "message_new",
                    "thread_id": tid,
                    "id": mid,
                    "sender_phone": conn_obj.phone,
                    "text": text,
                    "media_url": "",
                    "media_type": "",
                    "created_at": now_ms()
                }

                # broadcast to both users
                await send_to_phone(conn_obj.phone, payload)
                await send_to_phone(to_phone, payload)
                continue

            # -------------------------
            # SEND VOICE
            # -------------------------
            if action == "send_voice":
                to_phone = safe_phone(j.get("to"))
                media_url = str(j.get("media_url") or "").strip()

                if not to_phone or not media_url:
                    await ws_send(ws, {"type": "error", "message": "to/media_url required"})
                    continue

                rkey = f"ws_msg:{conn_obj.phone}"
                if rate_limit_hit(rkey, MSG_RATE_LIMIT, MSG_RATE_WINDOW):
                    await ws_send(ws, {"type": "error", "message": "Too fast. Wait a bit."})
                    continue

                ensure_profile_exists(to_phone)

                tid = get_thread_id(conn_obj.phone, to_phone)
                join_thread(conn_obj, tid)

                mid = chat_add_message(tid, conn_obj.phone, text="", media_url=media_url, media_type="voice")

                payload = {
                    "type": "message_new",
                    "thread_id": tid,
                    "id": mid,
                    "sender_phone": conn_obj.phone,
                    "text": "",
                    "media_url": media_url,
                    "media_type": "voice",
                    "created_at": now_ms()
                }

                await send_to_phone(conn_obj.phone, payload)
                await send_to_phone(to_phone, payload)
                continue

            # -------------------------
            # ADMIN BROADCAST (optional)
            # -------------------------
            if action == "admin_broadcast":
                if not is_admin(conn_obj.telegram_id):
                    await ws_send(ws, {"type": "error", "message": "admin only"})
                    continue

                text = str(j.get("text") or "").strip()
                if not text:
                    continue

                # broadcast to all online users
                for phone in list(ONLINE.keys()):
                    await send_to_phone(phone, {"type": "admin_broadcast", "text": text, "ts": now_ms()})
                continue

            await ws_send(ws, {"type": "error", "message": f"unknown action: {action}"})

    except websockets.ConnectionClosed:
        pass
    except Exception as e:
        # debug to logs
        print("WS error:", e)
        traceback.print_exc()
    finally:
        try:
            if conn_obj:
                # mark offline if no other sessions
                remove_online(conn_obj)
                leave_all_threads(conn_obj)

                # if user has no more conns => offline
                if conn_obj.phone not in ONLINE:
                    presence_set(conn_obj.phone, False)
        except:
            pass

        try:
            await ws.close()
        except:
            pass


# =========================================================
# SERVER RUN
# =========================================================
async def main():
    init_db()

    # background cleanup loop
    asyncio.create_task(background_cleanup_loop())

    print(f"🚀 711 TAXI WS ULTRA running on {WS_HOST}:{WS_PORT}")

    async with websockets.serve(
        handle_ws,
        WS_HOST,
        WS_PORT,
        ping_interval=PING_INTERVAL,
        ping_timeout=PING_TIMEOUT,
        max_size=2 * 1024 * 1024,  # 2MB messages (voice links small)
        max_queue=64
    ):
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
