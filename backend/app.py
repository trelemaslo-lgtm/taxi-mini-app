import time
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS

from db import init_db, add_ad, get_ads, delete_old_ads, like_phone, get_points, top_list

AUTO_DELETE_SECONDS = 60 * 60  # 60 minutes
AUTO_DELETE_MS = AUTO_DELETE_SECONDS * 1000

app = Flask(__name__)
CORS(app)

init_db()


def cleanup():
    cutoff = int(time.time() * 1000) - AUTO_DELETE_MS
    delete_old_ads(cutoff)


@app.get("/")
def home():
    return "✅ 711 TAXI BACKEND OK"


@app.get("/api/ads")
def api_ads_get():
    cleanup()
    return jsonify(get_ads())


@app.post("/api/ads")
def api_ads_post():
    cleanup()
    data = request.json or {}

    # VALIDATION
    if not data.get("phone"):
        return jsonify({"error": "phone required"}), 400
    if not data.get("from") or not data.get("to") or not data.get("price"):
        return jsonify({"error": "from/to/price required"}), 400

    ad = {
        "id": str(uuid.uuid4()),
        "role": data.get("role", "driver"),
        "name": data.get("name", "—"),
        "phone": data.get("phone"),

        "carBrand": data.get("carBrand", ""),
        "carNumber": data.get("carNumber", ""),
        "photo": data.get("photo", ""),

        "from": data.get("from", ""),
        "to": data.get("to", ""),
        "type": data.get("type", "now"),
        "price": str(data.get("price", "")),
        "seats": int(data.get("seats", 0)),
        "comment": data.get("comment", ""),

        "lat": data.get("lat", None),
        "lng": data.get("lng", None),

        "created_at": int(time.time() * 1000)
    }

    add_ad(ad)
    return jsonify({"ok": True, "ad": ad})


@app.post("/api/like")
def api_like():
    data = request.json or {}
    phone = data.get("phone", "")
    if not phone:
        return jsonify({"error": "phone required"}), 400

    likes = like_phone(phone)
    return jsonify({"ok": True, "phone": phone, "likes": likes})


@app.get("/api/points")
def api_points():
    phone = request.args.get("phone", "")
    if not phone:
        return jsonify({"error": "phone required"}), 400

    likes = get_points(phone)
    return jsonify({"phone": phone, "likes": likes})


@app.get("/api/top")
def api_top():
    return jsonify(top_list(20))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
