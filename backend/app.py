from flask import Flask, request, jsonify, abort
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

ADMIN_ID = 6813692852  # ← ВСТАВЬ СВОЙ TELEGRAM ID

ads = []
banned = set()
stats = {
    "users": set(),
    "drivers": set(),
    "clients": set(),
    "ads_total": 0,
    "likes": 0,
    "donations": []
}

ad_id_counter = 1

@app.route("/")
def home():
    return "BACKEND IS WORKING"

@app.route("/api/ads", methods=["GET", "POST"])
def handle_ads():
    global ad_id_counter

    if request.method == "POST":
        data = request.json
        if data.get("phone") in banned:
            abort(403)

        ad = {
            "id": ad_id_counter,
            "role": data.get("role"),
            "route": data.get("route"),
            "time": data.get("time"),
            "seats": data.get("seats"),
            "price": data.get("price"),
            "phone": data.get("phone"),
            "comment": data.get("comment"),
            "lat": data.get("lat"),
            "lng": data.get("lng")
        }
        ads.append(ad)
        ad_id_counter += 1
        stats["ads_total"] += 1
        return jsonify(ad)

    return jsonify(ads)

@app.route("/api/admin/ad/<int:ad_id>", methods=["DELETE"])
def delete_ad(ad_id):
    if request.args.get("admin_id") != str(ADMIN_ID):
        abort(403)
    global ads
    ads = [a for a in ads if a["id"] != ad_id]
    return {"status": "deleted"}

@app.route("/api/admin/ban", methods=["POST"])
def ban_user():
    if request.json.get("admin_id") != ADMIN_ID:
        abort(403)
    banned.add(request.json.get("phone"))
    return {"status": "banned"}

@app.route("/api/stats/visit", methods=["POST"])
def stat_visit():
    user_id = request.json.get("user_id")
    role = request.json.get("role")
    stats["users"].add(user_id)
    if role == "driver":
        stats["drivers"].add(user_id)
    if role == "client":
        stats["clients"].add(user_id)
    return {"ok": True}

@app.route("/api/stats/donate", methods=["POST"])
def stat_donate():
    amount = request.json.get("amount")
    stats["donations"].append(amount)
    return {"ok": True}

@app.route("/api/admin/stats")
def get_stats():
    if request.args.get("admin_id") != str(ADMIN_ID):
        abort(403)
    return {
        "users": len(stats["users"]),
        "drivers": len(stats["drivers"]),
        "clients": len(stats["clients"]),
        "ads_total": stats["ads_total"],
        "likes": stats["likes"],
        "donations_sum": sum(stats["donations"]),
        "donations_count": len(stats["donations"])
    }

if __name__ == "__main__":
    app.run()

