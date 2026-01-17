import os
import time
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

import db as DB

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ===== ENV =====
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
BUCKET_NAME = os.getenv("BUCKET_NAME", "taxi-medi")
ADMIN_TELEGRAM_ID = str(os.getenv("ADMIN_TELEGRAM_ID", "")).strip()

MAX_FILE_MB = 8

def now_ts():
    return int(time.time())

def ok(data=None):
    return jsonify({"ok": True, **(data or {})})

def err(message, code=400, extra=None):
    payload = {"ok": False, "error": message}
    if extra:
        payload.update(extra)
    return jsonify(payload), code

def is_admin(tid: str) -> bool:
    return str(tid) == ADMIN_TELEGRAM_ID

def require_tid(data, key="telegram_id"):
    tid = str(data.get(key, "")).strip()
    if not tid:
        return None
    return tid

# =========================
# HEALTH
# =========================
@app.get("/api/health")
def health():
    return ok({"ts": now_ts(), "admin": bool(ADMIN_TELEGRAM_ID)})

# =========================
# UPLOAD (SUPABASE STORAGE)
# device only
# =========================
@app.post("/api/upload")
def upload():
    if "file" not in request.files:
        return err("file required", 400)

    f = request.files["file"]
    if not f:
        return err("empty file", 400)

    # size limit
    f.stream.seek(0, 2)
    size = f.stream.tell()
    f.stream.seek(0)
    if size > MAX_FILE_MB * 1024 * 1024:
        return err(f"file too large (max {MAX_FILE_MB}MB)", 413)

    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        return err("supabase env missing", 500)

    content = f.read()
    filename = f"{int(time.time()*1000)}_{f.filename}".replace(" ", "_")
    path = f"uploads/{filename}"

    upload_url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{path}"

    r = requests.post(
        upload_url,
        headers={
            "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
            "apikey": SUPABASE_ANON_KEY,
            "Content-Type": f.mimetype or "application/octet-stream",
        },
        data=content
    )

    if not r.ok:
        return err("upload failed", 500, {"status": r.status_code, "detail": r.text})

    public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{path}"
    return ok({"url": public_url})

# =========================
# USERS
# =========================
@app.post("/api/users/upsert")
def users_upsert():
    data = request.json or {}
    tid = require_tid(data)
    if not tid:
        return err("telegram_id required")

    DB.upsert_user(
        telegram_id=tid,
        role=str(data.get("role", "")).strip(),
        name=str(data.get("name", "")).strip(),
        phone=str(data.get("phone", "")).strip(),
        username=str(data.get("username", "")).strip(),
        bio=str(data.get("bio", "")).strip(),
        photo_url=str(data.get("photo_url", "")).strip(),
        cover_url=str(data.get("cover_url", "")).strip(),
        city=str(data.get("city", "")).strip(),
    )
    return ok()

@app.get("/api/users/<telegram_id>")
def users_get(telegram_id):
    u = DB.get_user(str(telegram_id))
    if not u:
        return err("not found", 404)
    u["rating"] = DB.calc_rating(str(telegram_id))
    u["car_photos"] = DB.list_car_photos(str(telegram_id))
    return ok({"user": u})

@app.get("/api/users")
def users_list():
    role = (request.args.get("role") or "").strip()
    q = (request.args.get("q") or "").strip()
    users = DB.list_users(role=role, q=q)
    return ok({"users": users})

# admin verify driver
@app.post("/api/admin/users/verify")
def admin_verify():
    data = request.json or {}
    tid = require_tid(data)
    target = str(data.get("target_telegram_id", "")).strip()
    val = int(data.get("is_verified") or 0)

    if not is_admin(tid):
        return err("forbidden", 403)
    if not target:
        return err("target_telegram_id required")

    DB.set_verified(target, val)
    return ok()

# =========================
# CAR GALLERY
# =========================
@app.post("/api/car-photos/add")
def car_photo_add():
    data = request.json or {}
    tid = require_tid(data)
    url = str(data.get("image_url", "")).strip()
    if not tid:
        return err("telegram_id required")
    if not url:
        return err("image_url required")

    DB.add_car_photo(tid, url)
    return ok()

@app.get("/api/car-photos/<telegram_id>")
def car_photo_list(telegram_id):
    items = DB.list_car_photos(str(telegram_id))
    return ok({"items": items})

@app.delete("/api/car-photos/<int:photo_id>")
def car_photo_delete(photo_id):
    tid = (request.args.get("telegram_id") or "").strip()
    if not tid:
        return err("telegram_id required")
    DB.delete_car_photo(photo_id, tid)
    return ok()

# =========================
# ADS
# =========================
@app.get("/api/ads")
def ads_list():
    ads = DB.list_ads()

    # add points, views, rating, badges
    for a in ads:
        a["points"] = DB.points_for_phone(a.get("phone", "") or "")
        a["views"] = DB.views_for_ad(int(a["id"]))
        a["rating"] = DB.calc_rating(str(a.get("telegram_id", "")))
        # auto status update
        if int(a.get("seats") or 0) == 0:
            a["status"] = "full"

    return ok({"ads": ads})

@app.post("/api/ads")
def ads_create():
    data = request.json or {}
    tid = require_tid(data)
    if not tid:
        return err("telegram_id required")

    frm = str(data.get("from","")).strip()
    too = str(data.get("to","")).strip()
    price = str(data.get("price","")).strip()

    if not frm or not too or not price:
        return err("from/to/price required")

    seats = int(data.get("seats") or 0)
    if seats < 0:
        seats = 0
    if seats > 8:
        seats = 8

    payload = {
        "telegram_id": tid,
        "role": str(data.get("role","")).strip(),
        "name": str(data.get("name","")).strip(),
        "phone": str(data.get("phone","")).strip(),
        "car_brand": str(data.get("car_brand","")).strip(),
        "car_number": str(data.get("car_number","")).strip(),
        "photo_url": str(data.get("photo_url","")).strip(),

        "from": frm,
        "to": too,
        "type": str(data.get("type","now")).strip(),
        "price": price,
        "seats": seats,
        "comment": str(data.get("comment","")).strip(),

        "lat": data.get("lat", None),
        "lng": data.get("lng", None),

        "is_vip": int(data.get("is_vip") or 0),
        "is_pinned": int(data.get("is_pinned") or 0),
        "status": "active" if seats > 0 else "full",
    }

    ad_id = DB.create_ad(payload)
    return ok({"ad_id": ad_id})

@app.get("/api/ads/<int:ad_id>")
def ads_get(ad_id):
    ad = DB.get_ad(ad_id)
    if not ad:
        return err("not found", 404)
    ad["points"] = DB.points_for_phone(ad.get("phone","") or "")
    ad["views"] = DB.views_for_ad(ad_id)
    ad["rating"] = DB.calc_rating(str(ad.get("telegram_id","")))
    return ok({"ad": ad})

@app.put("/api/ads/<int:ad_id>")
def ads_edit(ad_id):
    data = request.json or {}
    tid = require_tid(data)
    if not tid:
        return err("telegram_id required")

    ok_edit = DB.update_ad(ad_id, tid, data)
    if not ok_edit:
        return err("forbidden or not found", 403)
    return ok()

@app.delete("/api/ads/<int:ad_id>")
def ads_delete(ad_id):
    tid = (request.args.get("telegram_id") or "").strip()
    if not tid:
        return err("telegram_id required")

    ad = DB.get_ad(ad_id)
    if not ad:
        return err("not found", 404)

    if str(ad.get("telegram_id")) != str(tid) and not is_admin(tid):
        return err("forbidden", 403)

    DB.delete_ad(ad_id)
    return ok()

# seats +/- (driver only)
@app.post("/api/ads/<int:ad_id>/seats")
def ads_seats(ad_id):
    data = request.json or {}
    tid = require_tid(data)
    if not tid:
        return err("telegram_id required")

    delta = int(data.get("delta") or 0)
    new_seats = DB.change_ad_seats(ad_id, tid, delta)
    if new_seats is None:
        return err("forbidden or not found", 403)

    return ok({"seats": new_seats})

# view counter unique
@app.post("/api/ads/<int:ad_id>/view")
def ads_view(ad_id):
    data = request.json or {}
    viewer = str(data.get("viewer_telegram_id","")).strip()
    if not viewer:
        return err("viewer_telegram_id required")
    views = DB.add_view(ad_id, viewer)
    return ok({"views": views})

# admin pin/vip
@app.post("/api/admin/ads/pin")
def admin_pin():
    data = request.json or {}
    tid = require_tid(data)
    if not tid or not is_admin(tid):
        return err("forbidden", 403)
    ad_id = int(data.get("ad_id") or 0)
    val = int(data.get("is_pinned") or 0)
    DB.pin_ad(ad_id, val)
    return ok()

@app.post("/api/admin/ads/vip")
def admin_vip():
    data = request.json or {}
    tid = require_tid(data)
    if not tid or not is_admin(tid):
        return err("forbidden", 403)
    ad_id = int(data.get("ad_id") or 0)
    val = int(data.get("is_vip") or 0)
    DB.vip_ad(ad_id, val)
    return ok()

# =========================
# LIKES / POINTS
# =========================
@app.post("/api/like")
def like_phone():
    data = request.json or {}
    target_phone = str(data.get("target_phone","")).strip()
    from_tid = str(data.get("from_telegram_id","")).strip()

    if not target_phone or not from_tid:
        return err("target_phone/from_telegram_id required")

    points = DB.like_phone(target_phone, from_tid)
    return ok({"points": points})

# =========================
# FAVORITES
# =========================
@app.post("/api/favorites/add")
def fav_add():
    data = request.json or {}
    tid = require_tid(data)
    target = str(data.get("target_telegram_id","")).strip()
    if not tid:
        return err("telegram_id required")
    if not target:
        return err("target_telegram_id required")

    added = DB.add_favorite(tid, target)
    return ok({"added": bool(added)})

@app.post("/api/favorites/remove")
def fav_remove():
    data = request.json or {}
    tid = require_tid(data)
    target = str(data.get("target_telegram_id","")).strip()
    if not tid:
        return err("telegram_id required")
    if not target:
        return err("target_telegram_id required")

    DB.remove_favorite(tid, target)
    return ok()

@app.get("/api/favorites/<telegram_id>")
def fav_list(telegram_id):
    items = DB.list_favorites(str(telegram_id))
    return ok({"items": items})

# =========================
# REVIEWS / RATING
# =========================
@app.post("/api/reviews/add")
def reviews_add():
    data = request.json or {}
    tid = require_tid(data, "from_telegram_id")
    target = str(data.get("target_telegram_id","")).strip()
    rating = int(data.get("rating") or 0)
    text = str(data.get("text","")).strip()

    if not tid:
        return err("from_telegram_id required")
    if not target:
        return err("target_telegram_id required")
    if rating < 1 or rating > 5:
        return err("rating must be 1..5")

    DB.add_review(target, tid, rating, text)
    avg = DB.calc_rating(target)
    return ok({"avg": avg})

@app.get("/api/reviews/<target_telegram_id>")
def reviews_list(target_telegram_id):
    items = DB.list_reviews(str(target_telegram_id))
    avg = DB.calc_rating(str(target_telegram_id))
    return ok({"items": items, "avg": avg})

@app.get("/api/top-drivers")
def drivers_top():
    limit = int(request.args.get("limit") or 20)
    items = DB.top_drivers(limit)
    return ok({"items": items})

# =========================
# REPORTS / COMPLAINTS
# =========================
@app.post("/api/reports/add")
def reports_add():
    data = request.json or {}
    from_tid = require_tid(data, "from_telegram_id")
    target = str(data.get("target_telegram_id","")).strip()
    reason = str(data.get("reason","")).strip()
    text = str(data.get("text","")).strip()

    if not from_tid:
        return err("from_telegram_id required")
    if not target:
        return err("target_telegram_id required")
    if not reason:
        return err("reason required")

    DB.add_report(target, from_tid, reason, text)
    return ok()

@app.get("/api/admin/reports")
def reports_admin_list():
    tid = (request.args.get("telegram_id") or "").strip()
    if not is_admin(tid):
        return err("forbidden", 403)
    status = (request.args.get("status") or "open").strip()
    items = DB.list_reports(status)
    return ok({"items": items})

@app.post("/api/admin/reports/close")
def reports_admin_close():
    data = request.json or {}
    tid = require_tid(data)
    if not is_admin(tid):
        return err("forbidden", 403)
    report_id = int(data.get("report_id") or 0)
    if not report_id:
        return err("report_id required")
    DB.close_report(report_id)
    return ok()

# =========================
# NEWS (ADMIN POSTS)
# =========================
@app.post("/api/admin/news/create")
def news_create():
    data = request.json or {}
    tid = require_tid(data)
    if not is_admin(tid):
        return err("forbidden", 403)

    title = str(data.get("title","")).strip()
    text = str(data.get("text","")).strip()
    image_url = str(data.get("image_url","")).strip()

    if not title or not text:
        return err("title/text required")

    nid = DB.create_news(title, text, image_url)
    return ok({"news_id": nid})

@app.get("/api/news")
def news_list():
    limit = int(request.args.get("limit") or 50)
    items = DB.list_news(limit)
    return ok({"items": items})

@app.delete("/api/admin/news/<int:news_id>")
def news_delete(news_id):
    tid = (request.args.get("telegram_id") or "").strip()
    if not is_admin(tid):
        return err("forbidden", 403)
    DB.delete_news(news_id)
    return ok()

# =========================
# ADMIN BANNER (3 sec on enter)
# =========================
@app.post("/api/admin/banner/set")
def banner_set():
    data = request.json or {}
    tid = require_tid(data)
    if not is_admin(tid):
        return err("forbidden", 403)

    image_url = str(data.get("image_url","")).strip()
    if not image_url:
        return err("image_url required")

    DB.set_banner(image_url)
    return ok()

@app.get("/api/admin/banner")
def banner_get():
    b = DB.get_banner()
    return ok({"banner": b})

# =========================
# DONATIONS
# =========================
@app.post("/api/donations/add")
def donation_add():
    data = request.json or {}
    tid = require_tid(data)
    amount = int(data.get("amount") or 0)
    method = str(data.get("method","manual")).strip()

    if not tid:
        return err("telegram_id required")
    if amount <= 0:
        return err("amount must be > 0")

    DB.add_donation(tid, amount, method)
    return ok()

@app.get("/api/donations/top")
def donation_top():
    limit = int(request.args.get("limit") or 10)
    items = DB.top_donaters(limit)
    return ok({"items": items})

@app.get("/api/admin/donations/stats")
def donation_stats():
    tid = (request.args.get("telegram_id") or "").strip()
    if not is_admin(tid):
        return err("forbidden", 403)
    st = DB.donation_stats()
    return ok({"stats": st})

# =========================
# ORDERS (FLOW)
# =========================
@app.post("/api/orders/create")
def order_create():
    data = request.json or {}
    client_tid = str(data.get("client_telegram_id","")).strip()
    driver_tid = str(data.get("driver_telegram_id","")).strip()
    ad_id = int(data.get("ad_id") or 0)

    if not client_tid or not driver_tid or not ad_id:
        return err("client_telegram_id/driver_telegram_id/ad_id required")

    oid = DB.create_order(client_tid, driver_tid, ad_id)
    return ok({"order_id": oid})

@app.post("/api/orders/status")
def order_status():
    data = request.json or {}
    tid = require_tid(data)  # actor
    order_id = int(data.get("order_id") or 0)
    status = str(data.get("status","")).strip()
    cancel_reason = str(data.get("cancel_reason","")).strip()

    if not tid or not order_id or not status:
        return err("telegram_id/order_id/status required")

    # status control (basic)
    allowed = {"created","driver_done","client_arrived","admin_confirmed","cancelled"}
    if status not in allowed:
        return err("invalid status")

    # if admin_confirmed -> only admin
    if status == "admin_confirmed" and not is_admin(tid):
        return err("admin only", 403)

    DB.update_order_status(order_id, status, cancel_reason)
    return ok()

@app.get("/api/orders/<telegram_id>")
def orders_user(telegram_id):
    items = DB.list_orders_for_user(str(telegram_id))
    return ok({"items": items})

# =========================
# CHAT HISTORY (REST, WS realtime separate)
# =========================
@app.post("/api/messages/save")
def msg_save():
    data = request.json or {}
    chat_id = str(data.get("chat_id","")).strip()
    from_tid = str(data.get("from_telegram_id","")).strip()
    to_tid = str(data.get("to_telegram_id","")).strip()
    text = str(data.get("text","")).strip()
    voice_url = str(data.get("voice_url","")).strip()

    if not chat_id or not from_tid or not to_tid:
        return err("chat_id/from_telegram_id/to_telegram_id required")

    mid = DB.save_message(chat_id, from_tid, to_tid, text, voice_url)
    return ok({"message_id": mid})

@app.get("/api/messages/<chat_id>")
def msg_list(chat_id):
    limit = int(request.args.get("limit") or 200)
    items = DB.get_chat_messages(str(chat_id), limit)
    return ok({"items": items})

# =========================
# BOOT
# =========================
@app.before_request
def _boot_once():
    # initialize db lazily
    if not getattr(app, "_db_inited", False):
        DB.init_db()
        app._db_inited = True

if __name__ == "__main__":
    DB.init_db()
    app.run(host="0.0.0.0", port=10000)
