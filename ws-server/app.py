from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json, time
from typing import Dict, Any, Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

connections: Dict[str, WebSocket] = {}
last_seen: Dict[str, float] = {}

def now():
    return time.time()

async def safe_send(ws: WebSocket, payload: Dict[str, Any]):
    try:
        await ws.send_text(json.dumps(payload))
    except:
        pass

async def send_to(uid: str, payload: Dict[str, Any]):
    ws = connections.get(uid)
    if ws:
        await safe_send(ws, payload)

async def broadcast(payload: Dict[str, Any], exclude: Optional[str]=None):
    for uid, ws in list(connections.items()):
        if exclude and uid == exclude:
            continue
        await safe_send(ws, payload)

@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()

    uid = (ws.query_params.get("uid") or "").strip()
    if not uid:
        await safe_send(ws, {"type":"error","message":"uid required"})
        await ws.close()
        return

    connections[uid] = ws
    last_seen[uid] = now()

    # notify online
    await broadcast({"type":"presence","uid":uid,"status":"online"}, exclude=uid)

    # hello
    await safe_send(ws, {"type":"hello","uid":uid,"ts":int(now())})

    try:
        while True:
            raw = await ws.receive_text()
            last_seen[uid] = now()

            try:
                data = json.loads(raw)
            except:
                await safe_send(ws, {"type":"error","message":"invalid json"})
                continue

            t = data.get("type")

            if t == "ping":
                await safe_send(ws, {"type":"pong","ts":int(now())})
                continue

            if t == "typing":
                await broadcast({
                    "type":"typing",
                    "chat_id": str(data.get("chat_id","")),
                    "uid": uid,
                    "status": str(data.get("status","on")),
                    "ts": int(now())
                }, exclude=uid)
                continue

            if t == "message":
                to_uid = str(data.get("to","")).strip()
                text = str(data.get("text","")).strip()
                chat_id = str(data.get("chat_id","")).strip()

                if not to_uid or not text:
                    await safe_send(ws, {"type":"error","message":"to/text required"})
                    continue

                payload = {
                    "type":"message",
                    "chat_id": chat_id or f"{min(uid,to_uid)}_{max(uid,to_uid)}",
                    "from": uid,
                    "to": to_uid,
                    "text": text,
                    "ts": int(now())
                }

                # send to receiver and echo sender
                await send_to(to_uid, payload)
                await safe_send(ws, payload)
                continue

            if t == "presence_list":
                online = list(connections.keys())
                await safe_send(ws, {"type":"presence_list","online":online})
                continue

            await safe_send(ws, {"type":"error","message":"unknown type"})

    except WebSocketDisconnect:
        connections.pop(uid, None)
        await broadcast({"type":"presence","uid":uid,"status":"offline"})
    except:
        connections.pop(uid, None)
        await broadcast({"type":"presence","uid":uid,"status":"offline"})
