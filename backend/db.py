import sqlite3
import time
import os
from typing import Optional, Dict, Any, List, Tuple

DB_PATH = os.getenv("DB_PATH", "taxi.db")


def _conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def now_ts() -> int:
    return int(time.time())


def init_db():
    conn = _conn()
    cur = conn.cursor()

    # USERS (profiles)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT UNIQUE,
        tg_id INTEGER,
        role TEXT DEFAULT 'client',
        name TEXT,
        car_brand TEXT,
        car_number TEXT,
        photo TEXT,
        bio TEXT,
        points INTEGER DEFAULT 0,
        rating REAL DEFAULT 0.0,
        orders_count INTEGER DEFAULT 0,
        created_at INTEGER,
        updated_at INTEGER
    )
    """)

    # ADS
    cur.execute("""
    CREATE TABLE IF NOT EXISTS ads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        name TEXT,
        phone TEXT NOT NULL,
        car_brand TEXT,
        car_number TEXT,
        photo TEXT,
        bio TEXT,

        point_a TEXT,
        point_b TEXT,
        type TEXT DEFAULT 'now',
        price TEXT,
        seats INTEGER DEFAULT 0,
        comment TEXT,

        lat REAL,
        lng REAL,

        likes INTEGER DEFAULT 0,
        points INTEGER DEFAULT 0,
        rating REAL DEFAULT 0.0,
        views INTEGER DEFAULT 0,

        is_active INTEGER DEFAULT 1,
        created_at INTEGER,
        updated_at INTEGER
    )
    """)

    # LIKES (unique per user per ad)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS ad_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ad_id INTEGER NOT NULL,
        from_phone TEXT NOT NULL,
        created_at INTEGER,
        UNIQUE(ad_id, from_phone)
    )
    """)

    # VIEWS (unique per user cooldown)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS ad_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ad_id INTEGER NOT NULL,
        viewer_id TEXT NOT NULL,
        created_at INTEGER
    )
    """)

    # ADMIN BANNER
    cur.execute("""
    CREATE TABLE IF NOT EXISTS admin_banner (
        id INTEGER PRIMARY KEY CHECK (id=1),
        image TEXT,
        created_at INTEGER
    )
    """)
    cur.execute("INSERT OR IGNORE INTO admin_banner (id, image, created_at) VALUES (1, NULL, NULL)")

    conn.commit()
    conn.close()


# -------------------------
# USERS
# -------------------------
def upsert_user(profile: Dict[str, Any]) -> Dict[str, Any]:
    phone = profile.get("phone", "").strip()
    if not phone:
        raise ValueError("phone required")

    tg_id = profile.get("tg_id")
    role = profile.get("role", "client")
    name = profile.get("name", "")
    car_brand = profile.get("carBrand", "") or profile.get("car_brand", "")
    car_number = profile.get("carNumber", "") or profile.get("car_number", "")
    photo = profile.get("photo", "")
    bio = profile.get("bio", "")

    ts = now_ts()
    conn = _conn()
    cur = conn.cursor()

    cur.execute("SELECT * FROM users WHERE phone=?", (phone,))
    row = cur.fetchone()

    if row:
        cur.execute("""
            UPDATE users SET
                tg_id=?,
                role=?,
                name=?,
                car_brand=?,
                car_number=?,
                photo=?,
                bio=?,
                updated_at=?
            WHERE phone=?
        """, (tg_id, role, name, car_brand, car_number, photo, bio, ts, phone))
    else:
        cur.execute("""
            INSERT INTO users (phone, tg_id, role, name, car_brand, car_number, photo, bio, points, rating, orders_count, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0.0, 0, ?, ?)
        """, (phone, tg_id, role, name, car_brand, car_number, photo, bio, ts, ts))

    conn.commit()

    cur.execute("SELECT * FROM users WHERE phone=?", (phone,))
    user = dict(cur.fetchone())
    conn.close()
    return user


def get_user_by_phone(phone: str) -> Optional[Dict[str, Any]]:
    conn = _conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE phone=?", (phone,))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None


# -------------------------
# ADS
# -------------------------
def create_ad(payload: Dict[str, Any]) -> Dict[str, Any]:
    ts = now_ts()
    role = payload.get("role", "driver")
    name = payload.get("name", "")
    phone = payload.get("phone", "").strip()
    if not phone:
        raise ValueError("phone required")

    car_brand = payload.get("carBrand", "") or payload.get("car_brand", "")
    car_number = payload.get("carNumber", "") or payload.get("car_number", "")
    photo = payload.get("photo", "")
    bio = payload.get("bio", "")

    point_a = payload.get("from", "") or payload.get("point_a", "")
    point_b = payload.get("to", "") or payload.get("point_b", "")

    ad_type = payload.get("type", "now")
    price = str(payload.get("price", "") or "")
    seats = int(payload.get("seats", 0) or 0)
    comment = payload.get("comment", "")

    lat = payload.get("lat", None)
    lng = payload.get("lng", None)

    conn = _conn()
    cur = conn.cursor()

    # sync points/rating from user (real)
    user = get_user_by_phone(phone)
    points = int(user["points"]) if user else 0
    rating = float(user["rating"]) if user else 0.0

    cur.execute("""
        INSERT INTO ads (
            role, name, phone, car_brand, car_number, photo, bio,
            point_a, point_b, type, price, seats, comment,
            lat, lng,
            likes, points, rating, views,
            is_active, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 0, 1, ?, ?)
    """, (
        role, name, phone, car_brand, car_number, photo, bio,
        point_a, point_b, ad_type, price, seats, comment,
        lat, lng,
        points, rating,
        ts, ts
    ))

    ad_id = cur.lastrowid
    conn.commit()

    cur.execute("SELECT * FROM ads WHERE id=?", (ad_id,))
    ad = dict(cur.fetchone())
    conn.close()
    return ad


def list_ads(active_only: bool = True) -> List[Dict[str, Any]]:
    conn = _conn()
    cur = conn.cursor()
    if active_only:
        cur.execute("SELECT * FROM ads WHERE is_active=1 ORDER BY created_at DESC")
    else:
        cur.execute("SELECT * FROM ads ORDER BY created_at DESC")
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_ad(ad_id: int) -> Optional[Dict[str, Any]]:
    conn = _conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM ads WHERE id=?", (ad_id,))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None


def delete_ad(ad_id: int, phone: str) -> bool:
    conn = _conn()
    cur = conn.cursor()
    cur.execute("SELECT phone FROM ads WHERE id=?", (ad_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        return False
    if row["phone"] != phone:
        conn.close()
        return False

    cur.execute("UPDATE ads SET is_active=0, updated_at=? WHERE id=?", (now_ts(), ad_id))
    conn.commit()
    conn.close()
    return True


def update_ad(ad_id: int, phone: str, patch: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    ad = get_ad(ad_id)
    if not ad:
        return None
    if ad["phone"] != phone:
        return None

    fields = []
    values = []

    mapping = {
        "from": "point_a",
        "to": "point_b",
        "type": "type",
        "price": "price",
        "seats": "seats",
        "comment": "comment",
        "lat": "lat",
        "lng": "lng",
    }

    for k, col in mapping.items():
        if k in patch:
            fields.append(f"{col}=?")
            values.append(patch[k])

    if not fields:
        return get_ad(ad_id)

    fields.append("updated_at=?")
    values.append(now_ts())
    values.append(ad_id)

    conn = _conn()
    cur = conn.cursor()
    cur.execute(f"UPDATE ads SET {', '.join(fields)} WHERE id=?", values)
    conn.commit()
    conn.close()
    return get_ad(ad_id)


# -------------------------
# Likes / Points / Rating
# -------------------------
def like_ad(ad_id: int, from_phone: str) -> Dict[str, Any]:
    ts = now_ts()
    conn = _conn()
    cur = conn.cursor()

    # unique like per user per ad
    try:
        cur.execute("INSERT INTO ad_likes (ad_id, from_phone, created_at) VALUES (?, ?, ?)", (ad_id, from_phone, ts))
    except sqlite3.IntegrityError:
        # already liked
        conn.close()
        return {"ok": True, "duplicate": True, "ad": get_ad(ad_id)}

    # increment like
    cur.execute("UPDATE ads SET likes = likes + 1, points = points + 1, updated_at=? WHERE id=?", (ts, ad_id))

    # update user points too
    cur.execute("SELECT phone FROM ads WHERE id=?", (ad_id,))
    row = cur.fetchone()
    if row:
        owner_phone = row["phone"]
        cur.execute("UPDATE users SET points = points + 1, updated_at=? WHERE phone=?", (ts, owner_phone))

        # rating formula: 4.0 + points/50 max 5.0
        cur.execute("SELECT points FROM users WHERE phone=?", (owner_phone,))
        u = cur.fetchone()
        if u:
            pts = int(u["points"])
            rating = 4.0 + (pts / 50.0)
            if rating > 5.0:
                rating = 5.0
            cur.execute("UPDATE users SET rating=?, updated_at=? WHERE phone=?", (rating, ts, owner_phone))
            cur.execute("UPDATE ads SET rating=? WHERE phone=?", (rating, owner_phone))

    conn.commit()
    conn.close()
    return {"ok": True, "duplicate": False, "ad": get_ad(ad_id)}


# -------------------------
# Views (unique + cooldown)
# -------------------------
def add_view(ad_id: int, viewer_id: str, cooldown_seconds: int = 3600) -> Dict[str, Any]:
    ts = now_ts()
    conn = _conn()
    cur = conn.cursor()

    # cooldown check
    cur.execute("""
        SELECT created_at FROM ad_views
        WHERE ad_id=? AND viewer_id=?
        ORDER BY created_at DESC LIMIT 1
    """, (ad_id, viewer_id))
    row = cur.fetchone()
    if row:
        last = int(row["created_at"])
        if ts - last < cooldown_seconds:
            conn.close()
            return {"ok": True, "counted": False, "ad": get_ad(ad_id)}

    cur.execute("INSERT INTO ad_views (ad_id, viewer_id, created_at) VALUES (?, ?, ?)", (ad_id, viewer_id, ts))
    cur.execute("UPDATE ads SET views = views + 1, updated_at=? WHERE id=?", (ts, ad_id))

    conn.commit()
    conn.close()
    return {"ok": True, "counted": True, "ad": get_ad(ad_id)}


# -------------------------
# Banner
# -------------------------
def set_banner(image_b64: Optional[str]) -> Dict[str, Any]:
    ts = now_ts()
    conn = _conn()
    cur = conn.cursor()
    cur.execute("UPDATE admin_banner SET image=?, created_at=? WHERE id=1", (image_b64, ts))
    conn.commit()
    conn.close()
    return {"ok": True, "created_at": ts}


def get_banner() -> Dict[str, Any]:
    conn = _conn()
    cur = conn.cursor()
    cur.execute("SELECT image, created_at FROM admin_banner WHERE id=1")
    row = cur.fetchone()
    conn.close()
    if not row:
        return {"image": None, "created_at": None}
    return {"image": row["image"], "created_at": row["created_at"]}


# -------------------------
# Admin utils
# -------------------------
def admin_clear_all():
    conn = _conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM ads")
    cur.execute("DELETE FROM ad_likes")
    cur.execute("DELETE FROM ad_views")
    conn.commit()
    conn.close()
    return {"ok": True}
