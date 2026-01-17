from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import os

from db import (
    init_db,
    ads_create,
    ads_list,
    profile_save,
    profile_get,
    profiles_all,
    profile_verify,
    profile_ban,
    like_add,
    points_get,
    rating_get,
    review_add,
    top_drivers,
    banner_set,
    banner_get,
    orders_my,
    order_create,
)

# ===== CONFIG =====
ADMIN_TG_ID = os.environ.get("ADMIN_TG_ID", "123456789")  # <-- YOUR TELEGRAM ID
APP_SECRET = os.environ.get("APP_SECRET", "711GROUP")

app = Flask(__name__)
CORS(app)

init_db()

# ===== HELPERS =====
def now_ms():
    return int(time.time() * 1000)

def get_tg_user_id():
    """
    Simple way:
    Frontend sends X-TG-INITDATA header (Telegram WebApp initData).
    Full real verify requires HMAC validation.
    For now we read tg id from initDataUnsafe is not possible on backend,
    so we allow client to pass tg_id in header too (optional).
    """
    # optional fast header
    tg_id = request.headers.get("X-TG-ID", "").strip()
    if tg_id:
        return tg_id

    # fallback: try parse initdata (not fully verified)
    initdata = request.headers.get("X-TG-INITDATA", "")
    if not initdata:
        return ""
    # telegram initData contains "user=%7B...id...%7D"
    # We won't decode fully to keep it simple stable.
    # Better: pass tg_id explicitly from frontend later.
    return ""

def is_admin():
    # allow admin by ENV or secret key fallback
    tg_id = request.headers.get("X-TG-ID", "").strip()
    if tg_id and tg_id == str(ADMIN_TG_ID):
        return True
    # fallback secret
    key = request.headers.get("X-ADMIN-KEY", "")
    if key and key == APP_SECRET:
        return True
    return False

def ok(data=None):
    resp = {"ok": True}
    if data:
        resp.update(data)
    return jsonify(resp)

def err(msg="error", code=400):
    return jsonify({"ok": False, "error": msg}), code

# ===== ROOT =====
@app.route("/")
def root():
    return jsonify({
        "ok": True,
        "name": "711 TAXI BACKEND",
        "time": now_ms()
    })

# ===== ADS =====
@app.route("/api/ads", methods=["GET"])
def api_ads_list():
    try:
        limit = int(request.args.get("limit", "30"))
        offset = int(request.args.get("offset", "0"))
        if limit < 1: limit = 30
        if limit > 100: limit = 100
        if offset < 0: offset = 0

        items = ads_list(limit=limit, offset=offset)

        # enrich: points + rating + reviews_count + online from profile
        enriched = []
        for a in items:
            phone = a.get("phone") or ""
            pts = points_get(phone)
            avg, cnt = rating_get(phone)
            pr = profile_get(phone) or {}

            a["points"] = pts
            a["rating"] = float(avg or 0)
            a["reviews_count"] = int(cnt or 0)
            a["online"] = int(pr.get("online", 1) or 0)

            # ensure fields exist
            a["photo"] = a.get("photo") or pr.get("photo") or ""
            a["carBrand"] = a.get("carBrand") or pr.get("carBrand") or ""
            a["carNumber"] = a.get("carNumber") or pr.get("carNumber") or ""
            a["name"] = a.get("name") or pr.get("name") or ""

            enriched.append(a)

        next_offset = offset + len(items)

        return ok({"items": enriched, "next_offset": next_offset})

    except Exception as e:
        return err("ads list error", 500)

@app.route("/api/ads", methods=["POST"])
def api_ads_create():
    try:
        payload = request.json or {}

        # basic validation
        if not payload.get("from") or not payload.get("to") or not payload.get("price"):
            return err("missing fields", 400)

        ok_save = ads_create(payload)
        if not ok_save:
            return err("failed to create", 500)

        return ok({"saved": True})

    except Exception as e:
        return err("publish error", 500)

# ===== PROFILE =====
@app.route("/api/profile/save", methods=["POST"])
def api_profile_save():
    try:
        payload = request.json or {}
        tg_id = request.headers.get("X-TG-ID", "").strip()

        if not payload.get("phone"):
            return err("phone required", 400)

        profile_save(payload, tg_id=tg_id)
        return ok({"saved": True})

    except Exception as e:
        return err("profile save error", 500)

@app.route("/api/profile/get", methods=["GET"])
def api_profile_get():
    phone = request.args.get("phone", "").strip()
    if not phone:
        return err("phone required", 400)
    p = profile_get(phone)
    if not p:
        return err("not found", 404)
    return ok({"profile": p})

# ===== POINTS =====
@app.route("/api/points", methods=["GET"])
def api_points_get():
    phone = request.args.get("phone", "").strip()
    if not phone:
        return err("phone required", 400)
    pts = points_get(phone)
    return ok({"points": pts})

# ===== LIKE =====
@app.route("/api/like", methods=["POST"])
def api_like():
    try:
        payload = request.json or {}
        phone = (payload.get("phone") or "").strip()
        if not phone:
            return err("phone required", 400)

        from_tg_id = request.headers.get("X-TG-ID", "").strip()
        if not from_tg_id:
            # allow anonymous like in dev but stable:
            from_tg_id = request.remote_addr or "anon"

        ok_like, msg = like_add(from_tg_id=from_tg_id, target_phone=phone)
        if not ok_like:
            if msg == "cooldown":
                return err("cooldown 24h", 429)
            return err("like error", 400)

        return ok({"liked": True, "points": points_get(phone)})

    except Exception as e:
        return err("like error", 500)

# ===== REVIEWS =====
@app.route("/api/reviews/add", methods=["POST"])
def api_review_add():
    try:
        payload = request.json or {}
        phone = (payload.get("phone") or "").strip()
        rating = payload.get("rating", 5)
        text = payload.get("text", "")

        if not phone:
            return err("phone required", 400)

        from_tg_id = request.headers.get("X-TG-ID", "").strip()
        if not from_tg_id:
            from_tg_id = request.remote_addr or "anon"

        review_add(from_tg_id, phone, rating, text)
        avg, cnt = rating_get(phone)
        return ok({"avg": avg, "count": cnt})

    except Exception as e:
        return err("review error", 500)

@app.route("/api/reviews/rating", methods=["GET"])
def api_reviews_rating():
    phone = request.args.get("phone", "").strip()
    if not phone:
        return err("phone required", 400)
    avg, cnt = rating_get(phone)
    return ok({"avg": avg, "count": cnt})

# ===== TOP DRIVERS =====
@app.route("/api/top/drivers", methods=["GET"])
def api_top_drivers():
    try:
        items = top_drivers(limit=20)
        return jsonify(items)
    except Exception as e:
        return err("top drivers error", 500)

# ===== BANNER =====
@app.route("/api/banner", methods=["GET"])
def api_banner():
    try:
        b = banner_get()
        if not b:
            return ok({"banner": None})
        return ok({"banner": b})
    except Exception as e:
        return err("banner error", 500)

@app.route("/api/admin/banner/set", methods=["POST"])
def api_admin_banner_set():
    if not is_admin():
        return err("not admin", 403)

    payload = request.json or {}
    title = payload.get("title", "")[:80]
    text = payload.get("text", "")[:220]
    image = payload.get("image", "")[:400]
    link = payload.get("link", "")[:400]
    active = int(payload.get("active", 1) or 1)

    banner_set(title, text, image=image, link=link, active=active)
    return ok({"saved": True})

@app.route("/api/admin/banner/off", methods=["POST"])
def api_admin_banner_off():
    if not is_admin():
        return err("not admin", 403)

    banner_set("", "", image="", link="", active=0)
    return ok({"off": True})

# ===== ADMIN PROFILES =====
@app.route("/api/admin/profiles", methods=["GET"])
def api_admin_profiles():
    if not is_admin():
        return err("not admin", 403)

    items = profiles_all()

    # enrich points rating
    for p in items:
        phone = p.get("phone") or ""
        p["points"] = points_get(phone)
        avg, cnt = rating_get(phone)
        p["rating"] = float(avg or 0)
        p["reviews_count"] = int(cnt or 0)

    return ok({"items": items})

@app.route("/api/admin/profile/verify", methods=["POST"])
def api_admin_profile_verify():
    if not is_admin():
        return err("not admin", 403)

    payload = request.json or {}
    phone = (payload.get("phone") or "").strip()
    verified = bool(payload.get("verified", False))

    if not phone:
        return err("phone required", 400)

    profile_verify(phone, verified=verified)
    return ok({"updated": True})

@app.route("/api/admin/profile/ban", methods=["POST"])
def api_admin_profile_ban():
    if not is_admin():
        return err("not admin", 403)

    payload = request.json or {}
    phone = (payload.get("phone") or "").strip()
    banned = bool(payload.get("banned", False))

    if not phone:
        return err("phone required", 400)

    profile_ban(phone, banned=banned)
    return ok({"updated": True})

# ===== ORDERS =====
@app.route("/api/orders/create", methods=["POST"])
def api_orders_create():
    payload = request.json or {}

    client_phone = (payload.get("client_phone") or "").strip()
    driver_phone = (payload.get("driver_phone") or "").strip()
    from_ = (payload.get("from") or "").strip()
    to_ = (payload.get("to") or "").strip()
    price = (payload.get("price") or "").strip()

    if not client_phone or not driver_phone:
        return err("missing client/driver", 400)

    order_create(client_phone, driver_phone, from_, to_, price)
    return ok({"created": True})

@app.route("/api/orders/my", methods=["GET"])
def api_orders_my():
    phone = request.args.get("phone", "").strip()
    if not phone:
        return err("phone required", 400)
    items = orders_my(phone)
    return ok({"items": items})

# ===== RUN =====
if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    app.run(host="0.0.0.0", port=port)
