import os
import json
import time
import asyncio
import websockets
from websockets.server import WebSocketServerProtocol

# ==============================
# 711 TAXI WS ULTRA SERVER
# ==============================
# Message types:
#  - hello: {type:"hello", user:"PHONE_OR_TGID"}
#  - presence: {type:"presence", user:"...", online:true}
#  - typing: {type:"typing", from:"...", to:"..."}
#  - chat: {type:"chat", from:"...", to:"...", text:"..."}
#  - ping: {type:"ping"}
# Server answers:
#  - pong: {type:"pong"}
#  - presence_list: {type:"presence_list", users:[...]}
#  - delivered messages

PORT = int(os.environ.get("PORT", "10000"))

# online users map: user_id -> websocket
ONLINE = {}

# reverse lookup
SOCKET_USER = {}

# store last seen timestamps
LAST_SEEN = {}

# anti spam
MSG_LIMIT_PER_5S = 40
USER_RATE = {}  # user -> [count, ts_start]


def now():
    return int(time.time())


def safe_json(data):
    try:
        return json.dumps(data)
    except:
        return json.dumps({"type": "error", "msg": "json_encode_error"})


def rate_ok(user: str) -> bool:
    t = now()
    if user not in USER_RATE:
        USER_RATE[user] = [0, t]
        return True

    count, start = USER_RATE[user]
    if t - start > 5:
        USER_RATE[user] = [0, t]
        return True

    if count >= MSG_LIMIT_PER_5S:
        return False

    USER_RATE[user][0] += 1
    return True


async def broadcast_presence():
    """Send online list to everyone"""
    users = list(ONLINE.keys())
    payload = {"type": "presence_list", "users": users}
    msg = safe_json(payload)
    tasks = []
    for ws in list(ONLINE.values()):
        try:
            tasks.append(ws.send(msg))
        except:
            pass
    if tasks:
        await asyncio.gather(*tasks, return_exceptions=True)


async def send_to(user: str, payload: dict):
    """Send message to a user if online"""
    ws = ONLINE.get(user)
    if not ws:
        return False
    try:
        await ws.send(safe_json(payload))
        return True
    except:
        return False


async def handler(ws: WebSocketServerProtocol):
    """
    Each client must send hello first:
    {type:"hello", user:"phone or tg id"}
    """
    user_id = None

    try:
        async for message in ws:
            try:
                data = json.loads(message)
            except:
                await ws.send(safe_json({"type": "error", "msg": "invalid_json"}))
                continue

            msg_type = data.get("type")

            # ping/pong keep alive
            if msg_type == "ping":
                await ws.send(safe_json({"type": "pong"}))
                continue

            # First handshake
            if msg_type == "hello":
                user_id = str(data.get("user") or "").strip()
                if not user_id:
                    await ws.send(safe_json({"type": "error", "msg": "missing_user"}))
                    continue

                ONLINE[user_id] = ws
                SOCKET_USER[ws] = user_id
                LAST_SEEN[user_id] = now()

                await ws.send(safe_json({"type": "hello_ok", "user": user_id}))
                await broadcast_presence()
                continue

            # ignore all before hello
            if not user_id:
                await ws.send(safe_json({"type": "error", "msg": "send_hello_first"}))
                continue

            # rate limiting
            if not rate_ok(user_id):
                await ws.send(safe_json({"type": "error", "msg": "rate_limited"}))
                continue

            LAST_SEEN[user_id] = now()

            # typing indicator
            if msg_type == "typing":
                to_user = str(data.get("to") or "").strip()
                payload = {"type": "typing", "from": user_id, "to": to_user}
                await send_to(to_user, payload)
                continue

            # presence manual (optional)
            if msg_type == "presence":
                # just broadcast list again
                await broadcast_presence()
                continue

            # chat message
            if msg_type == "chat":
                to_user = str(data.get("to") or "").strip()
                text = str(data.get("text") or "").strip()

                if not to_user or not text:
                    await ws.send(safe_json({"type": "error", "msg": "missing_to_or_text"}))
                    continue

                payload = {
                    "type": "chat",
                    "from": user_id,
                    "to": to_user,
                    "text": text,
                    "ts": now()
                }

                delivered = await send_to(to_user, payload)

                # ack sender
                await ws.send(safe_json({
                    "type": "sent_ack",
                    "to": to_user,
                    "delivered": delivered,
                    "ts": now()
                }))
                continue

            # unknown
            await ws.send(safe_json({"type": "error", "msg": "unknown_type"}))

    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        # cleanup on disconnect
        try:
            if ws in SOCKET_USER:
                uid = SOCKET_USER.get(ws)
                if uid and uid in ONLINE:
                    ONLINE.pop(uid, None)
                SOCKET_USER.pop(ws, None)
                LAST_SEEN[uid] = now()
        except:
            pass

        await broadcast_presence()


async def main():
    print(f"✅ 711 TAXI WS ULTRA SERVER STARTED on PORT {PORT}")
    async with websockets.serve(handler, "0.0.0.0", PORT, ping_interval=20, ping_timeout=20):
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())
