from flask import Flask, request, jsonify
from flask_cors import CORS
import time, math, os

from db import Session, Ad, Like, init_db

ADMIN_ID = os.getenv("ADMIN_ID")  # твой Telegram ID

app = Flask(__name__)
CORS(app)
init_db()

def distance(lat1, lon1, lat2, lon2):
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dl/2)**2
    return R * (2 * math.atan2(math.sqrt(a), math.sqrt(1-a)))

@app.route("/")
def home():
    return "Backend is working"

@app.route("/api/ads", methods=["GET"])
def get_ads():
    session = Session()
    now = time.time()

    user_lat = request.args.get("lat", type=float)
    user_lon = request.args.get("lon", type=float)

    result = []
    for ad in session.query(Ad).all():
        lifetime = 900 if ad.mode == "now" else 1800
        if now - ad.created_at < lifetime:
            dist = None
            if user_lat and ad.lat:
                dist = round(distance(user_lat, user_lon, ad.lat, ad.lon), 2)

            result.append({
                "id": ad.id,
                "role": ad.role,
                "name": ad.name,
                "phone": ad.phone,
                "route": ad.route,
                "mode": ad.mode,
                "price": ad.price,
                "seats": ad.seats,
                "comment": ad.comment,
                "points": ad.points,
                "distance": dist
            })

    session.close()

    result.sort(key=lambda x: (
        x["mode"] != "now",
        x["distance"] if x["distance"] is not None else 9999,
        -x["points"]
    ))

    return jsonify(result)

@app.route("/api/ads", methods=["POST"])
def create_ad():
    data = request.json
    session = Session()

    ad = Ad(
        role=data["role"],
        name=data["name"],
        phone=data["phone"],
        route=data["route"],
        mode=data["mode"],
        price=data.get("price",""),
        seats=data.get("seats",0),
        comment=data.get("comment",""),
        lat=data.get("lat"),
        lon=data.get("lon"),
        created_at=time.time(),
        points=0
    )

    session.add(ad)
    session.commit()
    session.close()
    return jsonify({"status":"ok"})

@app.route("/api/like", methods=["POST"])
def like():
    data = request.json
    session = Session()

    ad = session.get(Ad, data["ad_id"])
    if not ad:
        return jsonify({"error":"not found"}), 404

    exists = session.query(Like).filter_by(
        ad_id=ad.id,
        user_id=data["user_id"]
    ).first()

    if exists:
        return jsonify({"status":"already liked"})

    session.add(Like(ad_id=ad.id, user_id=data["user_id"]))
    ad.points += 1
    session.commit()
    session.close()

    return jsonify({"status":"liked","points":ad.points})

@app.route("/api/admin/delete", methods=["POST"])
def admin_delete():
    data = request.json
    if str(data.get("admin_id")) != str(ADMIN_ID):
        return jsonify({"error":"forbidden"}), 403

    session = Session()
    ad = session.get(Ad, data["ad_id"])
    if ad:
        session.delete(ad)
        session.commit()
    session.close()

    return jsonify({"status":"deleted"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
