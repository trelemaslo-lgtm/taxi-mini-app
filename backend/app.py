import os
import time
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS

import db

app = Flask(__name__)

# CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Init DB
db.init_db()

# ---------------- BASIC ----------------
@app.get("/")
def root():
    return jsonify({"ok": True, "service": "711 TAXI BACKEND", "time": int(time.time())})


@app.get("/api/health")
def health():
    return jsonify({"ok": True})


# ---------------- ADS API ----------------
@app.get("/api/ads")
def api_ads_list():
    ads = db.list_ads()
    # attach points + views
    for a in ads:
        a["points"] = db.get_user_stats(a["phone"])["points"]
        a["views"] = db.count_views_for_ad(a["id"])
    return jsonify(ads)


@app.post("/api/ads")
def api_ads_create():
    try:
        data = request.get_json(force=True) or {}
        required = ["role", "name", "phone", "from", "to", "type", "price"]
        for k in required:
            if not data.get(k):
                return jsonify({"ok": False, "error": f"missing_{k}"}), 400

        ad_id = str(uuid.uuid4())
        ad = {
            "id": ad_id,
            "role": data.get("role"),
            "name": data.get("name"),
            "phone": data.get("phone"),
            "carBrand": data.get("carBrand", ""),
            "carNumber": data.get("carNumber", ""),
            "photo": data.get("photo", ""),
            "from": data.get("from"),
            "to": data.get("to"),
            "type": data.get("type"),
            "price": data.get("price"),
            "seats": int(data.get("seats", 0)),
            "comment": data.get("comment", ""),
            "lat": data.get("lat", None),
            "lng": data.get("lng", None),
            "created_at": int(time.time()),
        }

        db.insert_ad(ad)
        return jsonify({"ok": True, "id": ad_id})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@app.get("/api/ads/<ad_id>")
def api_ads_get(ad_id):
    ad = db.get_ad(ad_id)
    if not ad:
        return jsonify({"ok": False, "error": "not_found"}), 404

    ad["points"] = db.get_user_stats(ad["phone"])["points"]
    ad["views"] = db.count_views_for_ad(ad_id)
    return jsonify(ad)


@app.post("/api/ads/<ad_id>/view")
def api_ads_view(ad_id):
    ad = db.get_ad(ad_id)
    if not ad:
        return jsonify({"ok": False, "error": "not_found"}), 404

    viewer_key = request.headers.get("X-Viewer-Key") or request.args.get("viewer") or "anon"
    changed = db.add_view(ad_id, viewer_key, cooldown_seconds=3600)
    return jsonify({"ok": True, "counted": changed, "views": db.count_views_for_ad(ad_id)})


@app.post("/api/ads/<ad_id>/like")
def api_ads_like(ad_id):
    ad = db.get_ad(ad_id)
    if not ad:
        return jsonify({"ok": False, "error": "not_found"}), 404

    # Like adds point to owner
    db.add_like(ad_id, ad["phone"])
    return jsonify({"ok": True, "points": db.get_user_stats(ad["phone"])["points"]})


@app.post("/api/ads/<ad_id>/seats")
def api_ads_seats(ad_id):
    ad = db.get_ad(ad_id)
    if not ad:
        return jsonify({"ok": False, "error": "not_found"}), 404

    data = request.get_json(force=True) or {}
    seats = data.get("seats")
    phone = data.get("phone")

    if seats is None:
        return jsonify({"ok": False, "error": "missing_seats"}), 400
    if phone is None:
        return jsonify({"ok": False, "error": "missing_phone"}), 400

    # only owner can update
    if ad["phone"] != phone:
        return jsonify({"ok": False, "error": "not_owner"}), 403

    seats = int(seats)
    if seats < 0: seats = 0
    if seats > 6: seats = 6

    ok = db.update_seats(ad_id, seats)
    return jsonify({"ok": ok, "seats": seats})


@app.delete("/api/ads/<ad_id>")
def api_ads_delete(ad_id):
    data = request.get_json(force=True) or {}
    phone = data.get("phone")
    if not phone:
        return jsonify({"ok": False, "error": "missing_phone"}), 400

    ok = db.delete_ad(ad_id, phone)
    if not ok:
        return jsonify({"ok": False, "error": "not_allowed"}), 403

    return jsonify({"ok": True})


# ---------------- USERS STATS ----------------
@app.get("/api/users/<path:phone>/stats")
def api_user_stats(phone):
    st = db.get_user_stats(phone)
    return jsonify(st)


# ---------------- ADMIN ----------------
@app.get("/api/admin/analytics")
def api_admin_analytics():
    # later secure by ADMIN_TELEGRAM_ID + initData validation
    return jsonify(db.analytics())


# ---------------- RUN ----------------
if __name__ == "__main__":
    # Render uses PORT env
    port = int(os.environ.get("PORT", "10000"))
    app.run(host="0.0.0.0", port=port)
