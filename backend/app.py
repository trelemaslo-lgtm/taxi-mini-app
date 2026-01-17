import os
import math
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

import db

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "*")
ADMIN_TELEGRAM_ID = int(os.getenv("ADMIN_TELEGRAM_ID", "0") or "0")
AUTO_DELETE_SECONDS = int(os.getenv("AUTO_DELETE_SECONDS", "3600") or "3600")
VIEW_COOLDOWN_SECONDS = int(os.getenv("VIEW_COOLDOWN_SECONDS", "3600") or "3600")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": [FRONTEND_URL, "*"]}})

db.init_db()


def ok(data=None):
    return jsonify(data or {"ok": True})


def err(msg, code=400):
    return jsonify({"error": msg}), code


def haversine_km(lat1, lng1, lat2, lng2):
    R = 6371
    dLat = math.radians(lat2 - lat1)
    dLng = math.radians(lng2 - lng1)
    a = math.sin(dLat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dLng / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@app.get("/")
def root():
    return ok({"name": "711 TAXI BACKEND ULTRA", "ok": True})


@app.get("/health")
def health():
    return ok({"ok": True})


# -------------------------
# ADS
# -------------------------
@app.get("/api/ads")
def get_ads():
    ads = db.list_ads(active_only=True)

    # Optional query: lat/lng for distance
    lat = request.args.get("lat")
    lng = request.args.get("lng")

    if lat and lng:
        try:
            lat = float(lat)
            lng = float(lng)
            for a in ads:
                if a.get("lat") is not None and a.get("lng") is not None:
                    a["distance_km"] = haversine_km(lat, lng, float(a["lat"]), float(a["lng"]))
                else:
                    a["distance_km"] = None
        except:
            pass

    # rename fields for frontend compatibility
    for a in ads:
        a["from"] = a.get("point_a") or ""
        a["to"] = a.get("point_b") or ""
        a["carBrand"] = a.get("car_brand") or ""
        a["carNumber"] = a.get("car_number") or ""

    return jsonify(ads)


@app.post("/api/ads")
def post_ad():
    try:
        payload = request.get_json(force=True) or {}

        # Required: from/to/phone
        if not payload.get("phone"):
            return err("phone required")
        if not (payload.get("from") or payload.get("point_a")):
            return err("from required")
        if not (payload.get("to") or payload.get("point_b")):
            return err("to required")

        ad = db.create_ad(payload)
        ad["from"] = ad.get("point_a") or ""
        ad["to"] = ad.get("point_b") or ""
        ad["carBrand"] = ad.get("car_brand") or ""
        ad["carNumber"] = ad.get("car_number") or ""

        return ok(ad)

    except Exception as e:
        return err(str(e), 500)


@app.patch("/api/ads/<int:ad_id>")
def patch_ad(ad_id: int):
    try:
        patch = request.get_json(force=True) or {}
        phone = (patch.get("phone") or "").strip()
        if not phone:
            return err("phone required")
        ad = db.update_ad(ad_id, phone, patch)
        if not ad:
            return err("not found or not owner", 404)
        ad["from"] = ad.get("point_a") or ""
        ad["to"] = ad.get("point_b") or ""
        return ok(ad)
    except Exception as e:
        return err(str(e), 500)


@app.delete("/api/ads/<int:ad_id>")
def delete_ad(ad_id: int):
    try:
        payload = request.get_json(force=True) or {}
        phone = (payload.get("phone") or "").strip()
        if not phone:
            return err("phone required")
        ok_del = db.delete_ad(ad_id, phone)
        if not ok_del:
            return err("not found or not owner", 404)
        return ok({"ok": True})
    except Exception as e:
        return err(str(e), 500)


# Like endpoint (REAL points)
@app.post("/api/ads/<int:ad_id>/like")
def like_ad(ad_id: int):
    try:
        payload = request.get_json(force=True) or {}
        from_phone = (payload.get("from_phone") or payload.get("phone") or "guest").strip()
        result = db.like_ad(ad_id, from_phone)
        return ok(result)
    except Exception as e:
        return err(str(e), 500)


# Views endpoint (unique cooldown)
@app.post("/api/ads/<int:ad_id>/view")
def view_ad(ad_id: int):
    try:
        payload = request.get_json(force=True) or {}
        viewer_id = (payload.get("viewer_id") or payload.get("phone") or payload.get("tg_id") or "anon").strip()
        result = db.add_view(ad_id, str(viewer_id), cooldown_seconds=VIEW_COOLDOWN_SECONDS)
        return ok(result)
    except Exception as e:
        return err(str(e), 500)


# Seats update (driver can decrease/increase)
@app.post("/api/ads/<int:ad_id>/seats")
def seats_update(ad_id: int):
    try:
        payload = request.get_json(force=True) or {}
        phone = (payload.get("phone") or "").strip()
        delta = int(payload.get("delta", 0))
        if not phone:
            return err("phone required")
        ad = db.get_ad(ad_id)
        if not ad:
            return err("ad not found", 404)
        if ad["phone"] != phone:
            return err("not owner", 403)
        new_seats = int(ad.get("seats") or 0) + delta
        if new_seats < 0:
            new_seats = 0
        if new_seats > 4:
            new_seats = 4
        updated = db.update_ad(ad_id, phone, {"seats": new_seats})
        return ok({"ok": True, "seats": new_seats, "ad": updated})
    except Exception as e:
        return err(str(e), 500)


# -------------------------
# USERS / PROFILE
# -------------------------
@app.post("/api/profile")
def profile_upsert():
    try:
        payload = request.get_json(force=True) or {}
        user = db.upsert_user(payload)
        return ok(user)
    except Exception as e:
        return err(str(e), 500)


@app.get("/api/profile/<phone>")
def profile_get(phone: str):
    u = db.get_user_by_phone(phone)
    if not u:
        return err("not found", 404)
    return ok(u)


# -------------------------
# ADMIN BANNER
# -------------------------
def is_admin(req) -> bool:
    try:
        payload = req.get_json(force=True) or {}
    except:
        payload = {}
    tg_id = payload.get("tg_id") or payload.get("telegram_id")
    try:
        return int(tg_id) == int(ADMIN_TELEGRAM_ID)
    except:
        return False


@app.get("/api/banner")
def banner_get():
    return ok(db.get_banner())


@app.post("/api/admin/banner")
def banner_set():
    try:
        payload = request.get_json(force=True) or {}
        # allow admin by tg_id
        tg_id = payload.get("tg_id")
        if tg_id is not None:
            if int(tg_id) != int(ADMIN_TELEGRAM_ID):
                return err("not admin", 403)

        image = payload.get("image")
        if not image:
            return err("image required")
        return ok(db.set_banner(image))
    except Exception as e:
        return err(str(e), 500)


@app.post("/api/admin/clear")
def admin_clear():
    try:
        payload = request.get_json(force=True) or {}
        tg_id = payload.get("tg_id")
        if tg_id is not None:
            if int(tg_id) != int(ADMIN_TELEGRAM_ID):
                return err("not admin", 403)
        return ok(db.admin_clear_all())
    except Exception as e:
        return err(str(e), 500)
