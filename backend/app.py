import time
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS

from db import init_db, add_ad, get_ads, cleanup_ads, like_phone, get_points, top_list

AUTO_DELETE_MS = 60 * 60 * 1000  # 60 min

app = Flask(__name__)
CORS(app)

init_db()


@app.get("/")
def home():
    return "✅ 711 TAXI BACKEND OK"


@app.route("/api/ads", methods=["GET"])
def ads_get():
    cleanup_ads(AUTO_DELETE_MS)
    return jsonify(get_ads())


@app.route("/api/ads", methods=["POST"])
def ads_post():
    cleanup_ads(AUTO_DELETE_MS)

    data = request.get_json(force=True, silent=True) or {}

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


@app.route("/api/like", methods=["POST"])
def like_post():
    data = request.get_json(force=True, silent=True) or {}
    phone = data.get("phone")

    if not phone:
        return jsonify({"error": "phone required"}), 400

    likes = like_phone(phone)
    return jsonify({"ok": True, "phone": phone, "likes": likes})


@app.route("/api/points", methods=["GET"])
def points_get():
    phone = request.args.get("phone", "")
    if not phone:
        return jsonify({"error": "phone required"}), 400

    likes = get_points(phone)
    return jsonify({"phone": phone, "likes": likes})


@app.route("/api/top", methods=["GET"])
def top_get():
    return jsonify(top_list(20))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
