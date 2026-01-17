import os
import time
import json
import sqlite3
from typing import Optional, Dict, Any, List
from flask import Flask, request, jsonify
from flask_cors import CORS

# db helpers
from db import (
    init_db,
    now_ms,
    db_execute,
    db_fetchone,
    db_fetchall,
)

# =========================================
# CONFIG (.env from Render)
# =========================================
BACKEND_URL = os.getenv("BACKEND_URL", "").strip()
FRONTEND_URL = os.getenv("FRONTEND_URL", "*").strip()

ADMIN_TELEGRAM_ID = os.getenv("ADMIN_TELEGRAM_ID", "").strip()

BOT_TOKEN = os.getenv("BOT_TOKEN", "").strip()
BOT_USERNAME = os.getenv("BOT_USERNAME", "@ingichkataksibot").strip()

AUTO_DELETE_SECONDS = int(os.getenv("AUTO_DELETE_SECONDS", "3600"))  # 60 minutes default

# Supabase Storage (we keep it for final pack)
SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "").strip()
BUCKET_NAME = os.getenv("BUCKET_NAME", "taxi-media").strip()

# Views unique cooldown (avoid spam)
VIEW_COOLDOWN_SECONDS = int(os.getenv("VIEW_COOLDOWN_SECONDS", "3600"))  # 1 hour


# =========================================
# APP INIT
# =========================================
app = Flask(__name__)

CORS(
    app,
    resources={r"/*": {"origins": [FRONTEND_URL, "*"]}},
    supports_credentials=True
)

init_db()

# =========================================
# HELPERS
# =========================================
def ok(data=None, code=200):
    return jsonify({"ok": True, "data": data}), code

def err(message="Error", code=400, extra=None):
    payload = {"ok": False, "error": message}
    if extra is not None:
        payload["extra"] = extra
    return jsonify(payload), code

def get_json() -> Dict[str, Any]:
    try:
        return request.get_json(force=True, silent=True) or {}
    except:
        return {}

def is_admin(req_json: Dict[str, Any]) -> bool:
    """
    Admin check by Telegram ID.
    Frontend should send telegram_id from Telegram.WebApp.initDataUnsafe.user.id
    or backend can later verify initData signature (we will add in final).
    """
    if not ADMIN_TELEGRAM_ID:
        return False
    tg_id = str(req_json.get("telegram_id") or req_json.get("tg_id") or "")
    return tg_id == str(ADMIN_TELEGRAM_ID)

def safe_int(x, default=0):
    try:
        return int(x)
    except:
        return default

def safe_str(x, default=""):
    return str(x) if x is not None else default

def clamp(n, a, b):
    return max(a, min(b, n))

def clean_phone(phone: str) -> str:
    if not phone:
        return ""
    phone = phone.strip()
    # keep + and digits
    out = []
    for ch in phone:
        if ch.isdigit() or ch == "+":
            out.append(ch)
    return "".join(out)

def normalize_role(role: str) -> str:
    role = (role or "").strip().lower()
    if role not in ("driver", "client"):
        return "client"
    return role

def ad_auto_delete_at(created_at_ms: int) -> int:
    return created_at_ms + AUTO_DELETE_SECONDS * 1000

def tg_send_message(chat_id: str, text: str) -> bool:
    """
    Bot notify helper. For now it's optional.
    """
    if not BOT_TOKEN:
        return False
    try:
        import requests
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
        r = requests.post(url, json={"chat_id": chat_id, "text": text})
        return r.status_code == 200
    except:
        return False


# =========================================
# HEALTH
# =========================================
@app.route("/", methods=["GET"])
def root():
    return jsonify({
        "ok": True,
        "service": "711 TAXI BACKEND ULTRA",
        "time": int(time.time()),
        "bot": BOT_USERNAME,
        "admin_telegram_id": ADMIN_TELEGRAM_ID if ADMIN_TELEGRAM_ID else None,
    })

@app.route("/api/health", methods=["GET"])
def health():
    return ok({"status": "healthy", "ts": now_ms()})


# =========================================
# CLEANUP OLD ADS (auto delete)
# =========================================
def cleanup_ads():
    """
    Delete ads past auto-delete time.
    """
    try:
        now = now_ms()
        db_execute(
            "DELETE FROM ads WHERE auto_delete_at IS NOT NULL AND auto_delete_at <= ?",
            (now,),
        )
    except:
        pass


# =========================================
# PROFILES
# =========================================
@app.route("/api/profile", methods=["POST"])
def upsert_profile():
    """
    Create or update profile by phone (unique).
    Includes device-only uploads: photo_url/cover_url stored as string (already uploaded to Supabase by frontend).
    """
    cleanup_ads()
    j = get_json()

    role = normalize_role(j.get("role"))
    name = safe_str(j.get("name")).strip()
    phone = clean_phone(j.get("phone"))
    bio = safe_str(j.get("bio")).strip()

    car_brand = safe_str(j.get("carBrand")).strip()
    car_number = safe_str(j.get("carNumber")).strip()

    photo_url = safe_str(j.get("photo")).strip()
    cover_url = safe_str(j.get("cover")).strip()

    telegram_id = safe_str(j.get("telegram_id")).strip() or None
    telegram_username = safe_str(j.get("telegram_username")).strip() or None

    if not name or not phone:
        return err("name and phone required", 400)

    created_at = now_ms()

    # Upsert
    existing = db_fetchone("SELECT id FROM profiles WHERE phone = ?", (phone,))
    if existing:
        db_execute(
            """
            UPDATE profiles
            SET role=?, name=?, bio=?, car_brand=?, car_number=?, photo_url=?, cover_url=?,
                telegram_id=?, telegram_username=?, updated_at=?
            WHERE phone=?
            """,
            (
                role, name, bio, car_brand, car_number, photo_url, cover_url,
                telegram_id, telegram_username, created_at,
                phone,
            ),
        )
    else:
        db_execute(
            """
            INSERT INTO profiles(role, name, phone, bio, car_brand, car_number, photo_url, cover_url,
                                 telegram_id, telegram_username, created_at, updated_at)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            (
                role, name, phone, bio, car_brand, car_number, photo_url, cover_url,
                telegram_id, telegram_username,
                created_at, created_at
            ),
        )

    prof = db_fetchone("SELECT * FROM profiles WHERE phone=?", (phone,))
    return ok(prof)


@app.route("/api/profiles", methods=["GET"])
def list_profiles():
    """
    Profiles directory for search.
    ?q=...
    """
    cleanup_ads()
    q = request.args.get("q", "").strip().lower()
    role = request.args.get("role", "").strip().lower()

    sql = "SELECT * FROM profiles"
    params = []

    where = []
    if q:
        where.append("(LOWER(name) LIKE ? OR phone LIKE ? OR LOWER(car_brand) LIKE ? OR LOWER(car_number) LIKE ?)")
        params += [f"%{q}%", f"%{q}%", f"%{q}%", f"%{q}%"]

    if role in ("driver", "client"):
        where.append("role = ?")
        params.append(role)

    if where:
        sql += " WHERE " + " AND ".join(where)

    sql += " ORDER BY updated_at DESC LIMIT 200"

    items = db_fetchall(sql, tuple(params))
    return ok(items)


# =========================================
# FAVORITES (saved profiles)
# =========================================
@app.route("/api/favorites/toggle", methods=["POST"])
def toggle_favorite():
    """
    body: { owner_phone, target_phone }
    """
    cleanup_ads()
    j = get_json()
    owner = clean_phone(j.get("owner_phone"))
    target = clean_phone(j.get("target_phone"))
    if not owner or not target:
        return err("owner_phone and target_phone required", 400)

    ex = db_fetchone("SELECT id FROM favorites WHERE owner_phone=? AND target_phone=?", (owner, target))
    if ex:
        db_execute("DELETE FROM favorites WHERE owner_phone=? AND target_phone=?", (owner, target))
        return ok({"favorite": False})
    else:
        db_execute(
            "INSERT INTO favorites(owner_phone, target_phone, created_at) VALUES(?,?,?)",
            (owner, target, now_ms())
        )
        return ok({"favorite": True})


@app.route("/api/favorites", methods=["GET"])
def list_favorites():
    """
    ?owner_phone=...
    """
    cleanup_ads()
    owner = clean_phone(request.args.get("owner_phone", ""))
    if not owner:
        return err("owner_phone required", 400)

    items = db_fetchall(
        """
        SELECT f.target_phone, p.*
        FROM favorites f
        LEFT JOIN profiles p ON p.phone = f.target_phone
        WHERE f.owner_phone = ?
        ORDER BY f.created_at DESC
        """,
        (owner,)
    )
    return ok(items)


# =========================================
# ADS (E'LON)
# =========================================
@app.route("/api/ads", methods=["GET"])
def list_ads():
    """
    List ads
    query: role=driver/client
    """
    cleanup_ads()

    role = normalize_role(request.args.get("role", "")) if request.args.get("role") else ""
    q = request.args.get("q", "").strip().lower()

    sql = """
    SELECT
      a.*,
      COALESCE(lp.likes, 0) AS likes,
      COALESCE(lp.points, 0) AS points,
      COALESCE(vw.views, 0) AS views
    FROM ads a
    LEFT JOIN likes_points lp ON lp.phone = a.phone
    LEFT JOIN (
        SELECT ad_id, COUNT(*) AS views
        FROM ad_views
        GROUP BY ad_id
    ) vw ON vw.ad_id = a.id
    """

    params = []
    where = []

    if role in ("driver", "client"):
        where.append("a.role = ?")
        params.append(role)

    if q:
        where.append("""
          (
            LOWER(a.name) LIKE ?
            OR a.phone LIKE ?
            OR LOWER(a.from_place) LIKE ?
            OR LOWER(a.to_place) LIKE ?
            OR LOWER(a.car_brand) LIKE ?
            OR LOWER(a.car_number) LIKE ?
          )
        """)
        params += [f"%{q}%", f"%{q}%", f"%{q}%", f"%{q}%", f"%{q}%", f"%{q}%"]

    if where:
        sql += " WHERE " + " AND ".join(where)

    sql += " ORDER BY a.created_at DESC LIMIT 500"

    items = db_fetchall(sql, tuple(params))
    return jsonify(items)  # keep original frontend compatibility


@app.route("/api/ads", methods=["POST"])
def create_ad():
    """
    Create ad (driver or client)
    body fields:
      role, name, phone, carBrand, carNumber, photo,
      from, to, type, price, seats, comment, lat, lng
    """
    cleanup_ads()
    j = get_json()

    role = normalize_role(j.get("role"))
    name = safe_str(j.get("name")).strip()
    phone = clean_phone(j.get("phone"))

    car_brand = safe_str(j.get("carBrand")).strip()
    car_number = safe_str(j.get("carNumber")).strip()
    photo = safe_str(j.get("photo")).strip()

    from_place = safe_str(j.get("from")).strip()
    to_place = safe_str(j.get("to")).strip()
    ad_type = safe_str(j.get("type")).strip() or "now"
    price = safe_str(j.get("price")).strip()

    seats = clamp(safe_int(j.get("seats"), 0), 0, 10)
    comment = safe_str(j.get("comment")).strip()

    lat = j.get("lat", None)
    lng = j.get("lng", None)
    try:
        lat = float(lat) if lat is not None else None
    except:
        lat = None
    try:
        lng = float(lng) if lng is not None else None
    except:
        lng = None

    if not phone or not name:
        return err("name/phone required", 400)

    if not from_place or not to_place or not price:
        return err("from/to/price required", 400)

    created_at = now_ms()
    auto_delete_at = ad_auto_delete_at(created_at)

    db_execute(
        """
        INSERT INTO ads(
          role, name, phone, car_brand, car_number, photo_url,
          from_place, to_place, ad_type, price, seats, comment,
          lat, lng,
          created_at, auto_delete_at, updated_at
        )
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """,
        (
            role, name, phone, car_brand, car_number, photo,
            from_place, to_place, ad_type, price, seats, comment,
            lat, lng,
            created_at, auto_delete_at, created_at
        )
    )

    ad = db_fetchone("SELECT * FROM ads WHERE id = (SELECT last_insert_rowid())", ())
    return ok(ad)


@app.route("/api/ads/<int:ad_id>", methods=["PUT"])
def edit_ad(ad_id: int):
    """
    Edit ad (owner)
    body: phone required
    """
    cleanup_ads()
    j = get_json()
    phone = clean_phone(j.get("phone"))
    if not phone:
        return err("phone required", 400)

    ad = db_fetchone("SELECT * FROM ads WHERE id=?", (ad_id,))
    if not ad:
        return err("ad not found", 404)

    if ad.get("phone") != phone:
        return err("not allowed", 403)

    # editable fields
    from_place = safe_str(j.get("from") or ad.get("from_place")).strip()
    to_place = safe_str(j.get("to") or ad.get("to_place")).strip()
    ad_type = safe_str(j.get("type") or ad.get("ad_type")).strip()
    price = safe_str(j.get("price") or ad.get("price")).strip()
    seats = clamp(safe_int(j.get("seats", ad.get("seats") or 0)), 0, 10)
    comment = safe_str(j.get("comment") or ad.get("comment")).strip()

    updated = now_ms()
    db_execute(
        """
        UPDATE ads
        SET from_place=?, to_place=?, ad_type=?, price=?, seats=?, comment=?, updated_at=?
        WHERE id=?
        """,
        (from_place, to_place, ad_type, price, seats, comment, updated, ad_id)
    )

    ad2 = db_fetchone("SELECT * FROM ads WHERE id=?", (ad_id,))
    return ok(ad2)


@app.route("/api/ads/<int:ad_id>", methods=["DELETE"])
def delete_ad(ad_id: int):
    """
    Delete ad (owner or admin)
    body: { phone, telegram_id }
    """
    cleanup_ads()
    j = get_json()
    phone = clean_phone(j.get("phone"))

    ad = db_fetchone("SELECT * FROM ads WHERE id=?", (ad_id,))
    if not ad:
        return err("ad not found", 404)

    if phone and ad.get("phone") == phone:
        db_execute("DELETE FROM ads WHERE id=?", (ad_id,))
        return ok({"deleted": True})

    if is_admin(j):
        db_execute("DELETE FROM ads WHERE id=?", (ad_id,))
        return ok({"deleted": True, "admin": True})

    return err("not allowed", 403)


@app.route("/api/ads/<int:ad_id>/seats", methods=["POST"])
def update_seats(ad_id: int):
    """
    Driver can reduce/increase seats after taking passengers.
    body: { phone, seats }
    """
    cleanup_ads()
    j = get_json()
    phone = clean_phone(j.get("phone"))
    seats = clamp(safe_int(j.get("seats"), 0), 0, 10)

    ad = db_fetchone("SELECT * FROM ads WHERE id=?", (ad_id,))
    if not ad:
        return err("ad not found", 404)

    if ad.get("phone") != phone:
        return err("not allowed", 403)

    db_execute(
        "UPDATE ads SET seats=?, updated_at=? WHERE id=?",
        (seats, now_ms(), ad_id)
    )
    ad2 = db_fetchone("SELECT * FROM ads WHERE id=?", (ad_id,))
    return ok(ad2)


# =========================================
# UNIQUE VIEWS (per user cooldown)
# =========================================
@app.route("/api/ads/<int:ad_id>/view", methods=["POST"])
def add_view(ad_id: int):
    """
    body: { viewer_phone }
    unique per cooldown
    """
    cleanup_ads()
    j = get_json()
    viewer_phone = clean_phone(j.get("viewer_phone"))
    if not viewer_phone:
        return err("viewer_phone required", 400)

    ad = db_fetchone("SELECT * FROM ads WHERE id=?", (ad_id,))
    if not ad:
        return err("ad not found", 404)

    now = now_ms()
    cool_ms = VIEW_COOLDOWN_SECONDS * 1000

    ex = db_fetchone(
        "SELECT created_at FROM ad_views WHERE ad_id=? AND viewer_phone=? ORDER BY created_at DESC LIMIT 1",
        (ad_id, viewer_phone)
    )
    if ex:
        last = safe_int(ex.get("created_at"), 0)
        if now - last < cool_ms:
            # no new view
            count = db_fetchone("SELECT COUNT(*) AS c FROM ad_views WHERE ad_id=?", (ad_id,))
            return ok({"view_added": False, "views": safe_int(count.get("c"), 0)})

    db_execute(
        "INSERT INTO ad_views(ad_id, viewer_phone, created_at) VALUES(?,?,?)",
        (ad_id, viewer_phone, now)
    )
    count = db_fetchone("SELECT COUNT(*) AS c FROM ad_views WHERE ad_id=?", (ad_id,))
    return ok({"view_added": True, "views": safe_int(count.get("c"), 0)})


# =========================================
# LIKES / POINTS / RATING
# =========================================
@app.route("/api/like", methods=["POST"])
def like_phone():
    """
    body: { phone }  -> like driver/client
    points = likes
    rating = base 4.0 + likes/50 max 5.0 (for UI)
    """
    cleanup_ads()
    j = get_json()
    phone = clean_phone(j.get("phone"))
    if not phone:
        return err("phone required", 400)

    row = db_fetchone("SELECT * FROM likes_points WHERE phone=?", (phone,))
    if row:
        likes = safe_int(row.get("likes"), 0) + 1
        points = likes
        db_execute(
            "UPDATE likes_points SET likes=?, points=?, updated_at=? WHERE phone=?",
            (likes, points, now_ms(), phone)
        )
    else:
        likes = 1
        points = 1
        db_execute(
            "INSERT INTO likes_points(phone, likes, points, created_at, updated_at) VALUES(?,?,?,?,?)",
            (phone, likes, points, now_ms(), now_ms())
        )

    return ok({"phone": phone, "likes": likes, "points": points})


@app.route("/api/points/<path:phone>", methods=["GET"])
def get_points(phone: str):
    cleanup_ads()
    phone = clean_phone(phone)
    row = db_fetchone("SELECT * FROM likes_points WHERE phone=?", (phone,))
    if not row:
        return ok({"phone": phone, "likes": 0, "points": 0})
    return ok({"phone": phone, "likes": safe_int(row.get("likes")), "points": safe_int(row.get("points"))})


# =========================================
# NEWS (admin posts)
# =========================================
@app.route("/api/news", methods=["GET"])
def list_news():
    cleanup_ads()
    items = db_fetchall("SELECT * FROM news ORDER BY created_at DESC LIMIT 200", ())
    return ok(items)

@app.route("/api/news", methods=["POST"])
def create_news():
    """
    Admin only.
    body: { telegram_id, title, text, image_url(optional) }
    image_url stored after device upload to Supabase
    """
    cleanup_ads()
    j = get_json()
    if not is_admin(j):
        return err("admin only", 403)

    title = safe_str(j.get("title")).strip()
    text = safe_str(j.get("text")).strip()
    image_url = safe_str(j.get("image_url")).strip()

    if not title or not text:
        return err("title/text required", 400)

    db_execute(
        "INSERT INTO news(title, text, image_url, created_at) VALUES(?,?,?,?)",
        (title, text, image_url, now_ms())
    )
    item = db_fetchone("SELECT * FROM news WHERE id=(SELECT last_insert_rowid())", ())
    return ok(item)

@app.route("/api/news/<int:news_id>", methods=["DELETE"])
def delete_news(news_id: int):
    cleanup_ads()
    j = get_json()
    if not is_admin(j):
        return err("admin only", 403)

    db_execute("DELETE FROM news WHERE id=?", (news_id,))
    return ok({"deleted": True})


# =========================================
# ADMIN BANNER (show on entry 3s)
# =========================================
@app.route("/api/banner", methods=["GET"])
def get_banner():
    cleanup_ads()
    row = db_fetchone("SELECT * FROM banner ORDER BY created_at DESC LIMIT 1", ())
    if not row:
        return ok(None)
    return ok(row)

@app.route("/api/banner", methods=["POST"])
def set_banner():
    """
    Admin only.
    body: { telegram_id, image_url }
    """
    cleanup_ads()
    j = get_json()
    if not is_admin(j):
        return err("admin only", 403)

    image_url = safe_str(j.get("image_url")).strip()
    if not image_url:
        return err("image_url required", 400)

    db_execute(
        "INSERT INTO banner(image_url, created_at) VALUES(?,?)",
        (image_url, now_ms())
    )
    row = db_fetchone("SELECT * FROM banner ORDER BY created_at DESC LIMIT 1", ())
    return ok(row)

@app.route("/api/banner/clear", methods=["POST"])
def clear_banner():
    cleanup_ads()
    j = get_json()
    if not is_admin(j):
        return err("admin only", 403)
    db_execute("DELETE FROM banner", ())
    return ok({"cleared": True})


# =========================================
# COMPLAINTS / REPORTS
# =========================================
@app.route("/api/complaints", methods=["POST"])
def create_complaint():
    """
    body: { from_phone, target_phone, reason, details }
    """
    cleanup_ads()
    j = get_json()
    from_phone = clean_phone(j.get("from_phone"))
    target_phone = clean_phone(j.get("target_phone"))
    reason = safe_str(j.get("reason")).strip()
    details = safe_str(j.get("details")).strip()

    if not from_phone or not target_phone or not reason:
        return err("from_phone, target_phone, reason required", 400)

    db_execute(
        "INSERT INTO complaints(from_phone, target_phone, reason, details, created_at) VALUES(?,?,?,?,?)",
        (from_phone, target_phone, reason, details, now_ms())
    )
    return ok({"sent": True})

@app.route("/api/complaints", methods=["GET"])
def list_complaints():
    cleanup_ads()
    # admin only by query header? simplest: body not in GET so use ?telegram_id=...
    telegram_id = request.args.get("telegram_id", "").strip()
    if telegram_id != str(ADMIN_TELEGRAM_ID):
        return err("admin only", 403)

    items = db_fetchall("SELECT * FROM complaints ORDER BY created_at DESC LIMIT 300", ())
    return ok(items)


# =========================================
# ORDERS SYSTEM (FLOW)
# =========================================
@app.route("/api/orders", methods=["POST"])
def create_order():
    """
    body: { client_phone, driver_phone, ad_id(optional), note }
    status: created
    """
    cleanup_ads()
    j = get_json()
    client_phone = clean_phone(j.get("client_phone"))
    driver_phone = clean_phone(j.get("driver_phone"))
    ad_id = safe_int(j.get("ad_id"), 0) or None
    note = safe_str(j.get("note")).strip()

    if not client_phone or not driver_phone:
        return err("client_phone and driver_phone required", 400)

    db_execute(
        """
        INSERT INTO orders(client_phone, driver_phone, ad_id, note, status, created_at, updated_at)
        VALUES(?,?,?,?,?,?,?)
        """,
        (client_phone, driver_phone, ad_id, note, "created", now_ms(), now_ms())
    )
    row = db_fetchone("SELECT * FROM orders WHERE id=(SELECT last_insert_rowid())", ())
    return ok(row)

@app.route("/api/orders/<int:order_id>/driver_done", methods=["POST"])
def order_driver_done(order_id: int):
    """
    body: { driver_phone }
    status: driver_done
    """
    cleanup_ads()
    j = get_json()
    driver_phone = clean_phone(j.get("driver_phone"))
    order = db_fetchone("SELECT * FROM orders WHERE id=?", (order_id,))
    if not order:
        return err("order not found", 404)
    if order.get("driver_phone") != driver_phone:
        return err("not allowed", 403)

    db_execute(
        "UPDATE orders SET status=?, updated_at=? WHERE id=?",
        ("driver_done", now_ms(), order_id)
    )
    row = db_fetchone("SELECT * FROM orders WHERE id=?", (order_id,))
    return ok(row)

@app.route("/api/orders/<int:order_id>/client_arrived", methods=["POST"])
def order_client_arrived(order_id: int):
    """
    body: { client_phone }
    status: client_arrived
    """
    cleanup_ads()
    j = get_json()
    client_phone = clean_phone(j.get("client_phone"))
    order = db_fetchone("SELECT * FROM orders WHERE id=?", (order_id,))
    if not order:
        return err("order not found", 404)
    if order.get("client_phone") != client_phone:
        return err("not allowed", 403)

    db_execute(
        "UPDATE orders SET status=?, updated_at=? WHERE id=?",
        ("client_arrived", now_ms(), order_id)
    )
    row = db_fetchone("SELECT * FROM orders WHERE id=?", (order_id,))
    return ok(row)

@app.route("/api/orders/<int:order_id>/admin_confirm", methods=["POST"])
def order_admin_confirm(order_id: int):
    """
    admin confirms: completed
    body: { telegram_id }
    """
    cleanup_ads()
    j = get_json()
    if not is_admin(j):
        return err("admin only", 403)

    order = db_fetchone("SELECT * FROM orders WHERE id=?", (order_id,))
    if not order:
        return err("order not found", 404)

    db_execute(
        "UPDATE orders SET status=?, updated_at=? WHERE id=?",
        ("completed", now_ms(), order_id)
    )
    row = db_fetchone("SELECT * FROM orders WHERE id=?", (order_id,))
    return ok(row)

@app.route("/api/orders", methods=["GET"])
def list_orders():
    """
    ?phone=... -> list orders where client or driver
    ?admin=1&telegram_id=... -> admin all
    """
    cleanup_ads()
    phone = clean_phone(request.args.get("phone", ""))
    admin = request.args.get("admin", "0") == "1"
    telegram_id = request.args.get("telegram_id", "").strip()

    if admin:
        if telegram_id != str(ADMIN_TELEGRAM_ID):
            return err("admin only", 403)
        items = db_fetchall("SELECT * FROM orders ORDER BY created_at DESC LIMIT 500", ())
        return ok(items)

    if not phone:
        return err("phone required", 400)

    items = db_fetchall(
        """
        SELECT * FROM orders
        WHERE client_phone=? OR driver_phone=?
        ORDER BY created_at DESC LIMIT 200
        """,
        (phone, phone)
    )
    return ok(items)


@app.route("/api/orders/<int:order_id>/review", methods=["POST"])
def order_review(order_id: int):
    """
    body: { client_phone, rating(1..5), text }
    """
    cleanup_ads()
    j = get_json()
    client_phone = clean_phone(j.get("client_phone"))
    rating = clamp(safe_int(j.get("rating"), 5), 1, 5)
    text = safe_str(j.get("text")).strip()

    order = db_fetchone("SELECT * FROM orders WHERE id=?", (order_id,))
    if not order:
        return err("order not found", 404)

    if order.get("client_phone") != client_phone:
        return err("not allowed", 403)

    db_execute(
        "INSERT INTO reviews(order_id, client_phone, driver_phone, rating, text, created_at) VALUES(?,?,?,?,?,?)",
        (order_id, client_phone, order.get("driver_phone"), rating, text, now_ms())
    )
    return ok({"reviewed": True})


# =========================================
# ADMIN ANALYTICS
# =========================================
@app.route("/api/admin/stats", methods=["GET"])
def admin_stats():
    telegram_id = request.args.get("telegram_id", "").strip()
    if telegram_id != str(ADMIN_TELEGRAM_ID):
        return err("admin only", 403)

    ads = db_fetchone("SELECT COUNT(*) AS c FROM ads", ())
    profiles = db_fetchone("SELECT COUNT(*) AS c FROM profiles", ())
    views = db_fetchone("SELECT COUNT(*) AS c FROM ad_views", ())
    news = db_fetchone("SELECT COUNT(*) AS c FROM news", ())
    orders = db_fetchone("SELECT COUNT(*) AS c FROM orders", ())
    complaints = db_fetchone("SELECT COUNT(*) AS c FROM complaints", ())

    return ok({
        "ads": safe_int(ads.get("c"), 0),
        "profiles": safe_int(profiles.get("c"), 0),
        "views": safe_int(views.get("c"), 0),
        "news": safe_int(news.get("c"), 0),
        "orders": safe_int(orders.get("c"), 0),
        "complaints": safe_int(complaints.get("c"), 0),
    })


# =========================================
# RUN
# =========================================
if __name__ == "__main__":
    port = int(os.getenv("PORT", "10000"))
    app.run(host="0.0.0.0", port=port)
