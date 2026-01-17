import os
import json
import time
import asyncio
import websockets
from websockets.server import WebSocketServerProtocol

HOST = "0.0.0.0"
PORT = int(os.getenv("PORT", "10000"))

PING_INTERVAL = int(os.getenv("WS_PING_INTERVAL", "20"))
PING_TIMEOUT = int(os.getenv("WS_PING_TIMEOUT", "20"))

MSG_RATE_LIMIT = int(os.getenv("WS_MSG_RATE_LIMIT", "25"))
MSG_RATE_WINDOW = int(os.getenv("WS_MSG_RATE_WINDOW", "15"))  # seconds

clients = {}  # ws -> {"phone":..., "tg_id":..., "last":..., "count":...}
rooms = {}    # room_id -> set(ws)


def ts():
    return int(time.time())


async def send(ws, data):
    try:
        await ws.send(json.dumps(data))
    except:
        pass


def rate_ok(meta):
    now = ts()
    if "window_start" not in meta:
        meta["window_start"] = now
        meta["count"] = 0

    if now - meta["window_start"] > MSG_RATE_WINDOW:
        meta["window_start"] = now
        meta["count"] = 0

    meta["count"] += 1
    return meta["count"] <= MSG_RATE_LIMIT


async def broadcast(room_id, data):
    conns = rooms.get(room_id, set()).copy()
    for ws in conns:
        await send(ws, data)


async def handler(ws: WebSocketServerProtocol):
    clients[ws] = {"phone": None, "tg_id": None, "count": 0, "window_start": ts()}

    await send(ws, {"type": "hello", "ts": ts(), "server": "711-TAXI-WS-ULTRA"})

    try:
        async for msg in ws:
            meta = clients.get(ws, {})

            if not rate_ok(meta):
                await send(ws, {"type": "error", "message": "rate_limit"})
                continue

            try:
                data = json.loads(msg)
            except:
                await send(ws, {"type": "error", "message": "bad_json"})
                continue

            action = data.get("action")

            if action == "auth":
                meta["phone"] = data.get("phone")
                meta["tg_id"] = data.get("tg_id")
                await send(ws, {"type": "auth_ok", "phone": meta["phone"], "ts": ts()})
                continue

            if action == "join":
                room_id = str(data.get("room_id") or "")
                if not room_id:
                    await send(ws, {"type": "error", "message": "room_id_required"})
                    continue
                rooms.setdefault(room_id, set()).add(ws)
                await send(ws, {"type": "joined", "room_id": room_id})
                await broadcast(room_id, {"type": "presence", "room_id": room_id, "online": online_count(room_id)})
                continue

            if action == "leave":
                room_id = str(data.get("room_id") or "")
                if room_id in rooms and ws in rooms[room_id]:
                    rooms[room_id].remove(ws)
                    await send(ws, {"type": "left", "room_id": room_id})
                    await broadcast(room_id, {"type": "presence", "room_id": room_id, "online": online_count(room_id)})
                continue

            if action == "message":
                room_id = str(data.get("room_id") or "")
                text = str(data.get("text") or "")[:2000]
                if not room_id or not text:
                    await send(ws, {"type": "error", "message": "room_id_text_required"})
                    continue

                payload = {
                    "type": "message",
                    "room_id": room_id,
                    "text": text,
                    "from_phone": meta.get("phone"),
                    "from_tg_id": meta.get("tg_id"),
                    "ts": ts()
                }
                await broadcast(room_id, payload)
                continue

            if action == "typing":
                room_id = str(data.get("room_id") or "")
                if not room_id:
                    continue
                await broadcast(room_id, {"type": "typing", "room_id": room_id, "phone": meta.get("phone"), "ts": ts()})
                continue

            await send(ws, {"type": "error", "message": "unknown_action"})

    except websockets.ConnectionClosed:
        pass
    finally:
        # cleanup
        for room_id, s in list(rooms.items()):
            if ws in s:
                s.remove(ws)
                asyncio.create_task(broadcast(room_id, {"type": "presence", "room_id": room_id, "online": online_count(room_id)}))
        clients.pop(ws, None)


def online_count(room_id):
    return len(rooms.get(room_id, set()))


async def main():
    print(f"🚀 711 TAXI WS ULTRA running on {HOST}:{PORT}")
    async with websockets.serve(handler, HOST, PORT, ping_interval=PING_INTERVAL, ping_timeout=PING_TIMEOUT):
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())
