import sqlite3
from pathlib import Path
import time
from typing import Optional, List, Dict, Any, Tuple

DB_PATH = Path(__file__).parent / "taxi.db"


# =========================
# DB CORE
# =========================
def now_ts() -> int:
    return int(time.time())


def conn():
    c = sqlite3.connect(DB_PATH)
    c.row_factory = sqlite3.Row
    return c


def q1(sql: str, args: tuple = ()):
    with conn() as db:
        r = db.execute(sql, args).fetchone()
        return dict(r) if r else None


def qall(sql: str, args: tuple = ()):
    with conn() as db:
        rows = db.execute(sql, args).fetchall()
        return [dict(r) for r in rows]


def exec1(sql: str, args: tuple = ()) -> int:
    with conn() as db:
        cur = db.execute(sql, args)
        db.commit()
        return cur.lastrowid


def exec_many(sql: str, items: List[tuple]):
    with conn() as db:
        db.executemany(sql, items)
        db.commit()


# =========================
# INIT SCHEMA (ULTRA)
# =========================
def init_db():
    with conn() as db:
        # ---- USERS / PROFILES ----
        db.execute("""
        CREATE TABLE IF NOT EXISTS users(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          telegram_id TEXT UNIQUE,
          role TEXT,
          name TEXT,
          phone TEXT,
          username TEXT,
          bio TEXT,
          photo_url TEXT,
          cover_url TEXT,
          city TEXT,
          is_verified INTEGER DEFAULT 0,
          trust_score REAL DEFAULT 0,
          level INTEGER DEFAULT 1,
          points INTEGER DEFAULT 0,
          created_at INTEGER
        )
        """)

        # car gallery (profile only)
        db.execute("""
        CREATE TABLE IF NOT EXISTS car_photos(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          telegram_id TEXT,
          image_url TEXT,
          created_at INTEGER
        )
        """)

        # ---- ADS ----
        db.execute("""
        CREATE TABLE IF NOT EXISTS ads(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          telegram_id TEXT,
          role TEXT,
          name TEXT,
          phone TEXT,
          car_brand TEXT,
          car_number TEXT,
          photo_url TEXT,

          frm TEXT,
          too TEXT,
          ad_type TEXT,
          price TEXT,
          seats INTEGER,
          comment TEXT,

          lat REAL,
          lng REAL,

          is_vip INTEGER DEFAULT 0,
          is_pinned INTEGER DEFAULT 0,

          status TEXT DEFAULT 'active', -- active/closed/full

          created_at INTEGER,
          updated_at INTEGER
        )
        """)

        # ---- FAVORITES ----
        db.execute("""
        CREATE TABLE IF NOT EXISTS favorites(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          telegram_id TEXT,
          target_telegram_id TEXT,
          created_at INTEGER,
          UNIQUE(telegram_id, target_telegram_id)
        )
        """)

        # ---- LIKES / POINTS ----
        db.execute("""
        CREATE TABLE IF NOT EXISTS likes(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          target_phone TEXT,
          from_telegram_id TEXT,
          created_at INTEGER,
          UNIQUE(target_phone, from_telegram_id)
        )
        """)

        # ---- AD VIEWS ----
        db.execute("""
        CREATE TABLE IF NOT EXISTS ad_views(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ad_id INTEGER,
          viewer_telegram_id TEXT,
          created_at INTEGER,
          UNIQUE(ad_id, viewer_telegram_id)
        )
        """)

        # ---- RATINGS & REVIEWS ----
        db.execute("""
        CREATE TABLE IF NOT EXISTS reviews(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          target_telegram_id TEXT,
          from_telegram_id TEXT,
          rating INTEGER,
          text TEXT,
          created_at INTEGER
        )
        """)

        # ---- REPORTS / COMPLAINTS ----
        db.execute("""
        CREATE TABLE IF NOT EXISTS reports(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          target_telegram_id TEXT,
          from_telegram_id TEXT,
          reason TEXT,
          text TEXT,
          status TEXT DEFAULT 'open', -- open/closed
          created_at INTEGER
        )
        """)

        # ---- NEWS POSTS (ADMIN) ----
        db.execute("""
        CREATE TABLE IF NOT EXISTS news(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          text TEXT,
          image_url TEXT,
          created_at INTEGER
        )
        """)

        # ---- ADMIN BANNER ----
        db.execute("""
        CREATE TABLE IF NOT EXISTS admin_banner(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          image_url TEXT,
          created_at INTEGER
        )
        """)

        # ---- DONATIONS ----
        db.execute("""
        CREATE TABLE IF NOT EXISTS donations(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          telegram_id TEXT,
          amount INTEGER,
          method TEXT,
          created_at INTEGER
        )
        """)

        # ---- ORDERS SYSTEM ----
        db.execute("""
        CREATE TABLE IF NOT EXISTS orders(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_telegram_id TEXT,
          driver_telegram_id TEXT,
          ad_id INTEGER,
          status TEXT DEFAULT 'created', -- created/driver_done/client_arrived/admin_confirmed/cancelled
          cancel_reason TEXT,
          created_at INTEGER,
          updated_at INTEGER
        )
        """)

        # ---- CHAT MESSAGES ----
        db.execute("""
        CREATE TABLE IF NOT EXISTS messages(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          chat_id TEXT,
          from_telegram_id TEXT,
          to_telegram_id TEXT,
          text TEXT,
          voice_url TEXT,
          created_at INTEGER
        )
        """)

        # ---- PRESENCE LOG ----
        db.execute("""
        CREATE TABLE IF NOT EXISTS presence_log(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          telegram_id TEXT,
          status TEXT,
          created_at INTEGER
        )
        """)

        db.commit()


# =========================
# USERS
# =========================
def upsert_user(telegram_id: str, role: str, name: str, phone: str,
                username: str = "", bio: str = "", photo_url: str = "",
                cover_url: str = "", city: str = ""):
    sql = """
    INSERT INTO users(telegram_id, role, name, phone, username, bio, photo_url, cover_url, city, created_at)
    VALUES(?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(telegram_id) DO UPDATE SET
      role=excluded.role,
      name=excluded.name,
      phone=excluded.phone,
      username=excluded.username,
      bio=excluded.bio,
      photo_url=excluded.photo_url,
      cover_url=excluded.cover_url,
      city=excluded.city
    """
    exec1(sql, (telegram_id, role, name, phone, username, bio, photo_url, cover_url, city, now_ts()))


def get_user(telegram_id: str) -> Optional[Dict[str, Any]]:
    return q1("SELECT * FROM users WHERE telegram_id=?", (telegram_id,))


def list_users(role: str = "", q: str = "") -> List[Dict[str, Any]]:
    q = (q or "").strip().lower()
    args = []
    where = []

    sql = "SELECT * FROM users"
    if role:
        where.append("role=?")
        args.append(role)

    if q:
        where.append("(lower(name) LIKE ? OR lower(phone) LIKE ? OR lower(username) LIKE ?)")
        like = f"%{q}%"
        args += [like, like, like]

    if where:
        sql += " WHERE " + " AND ".join(where)

    sql += " ORDER BY created_at DESC"
    return qall(sql, tuple(args))


def set_verified(telegram_id: str, is_verified: int):
    exec1("UPDATE users SET is_verified=? WHERE telegram_id=?", (is_verified, telegram_id))


def update_points(telegram_id: str, points: int):
    exec1("UPDATE users SET points=? WHERE telegram_id=?", (points, telegram_id))


def update_level(telegram_id: str, level: int):
    exec1("UPDATE users SET level=? WHERE telegram_id=?", (level, telegram_id))


# =========================
# CAR PHOTOS (Gallery)
# =========================
def add_car_photo(telegram_id: str, image_url: str):
    exec1("INSERT INTO car_photos(telegram_id, image_url, created_at) VALUES(?,?,?)",
          (telegram_id, image_url, now_ts()))


def list_car_photos(telegram_id: str) -> List[Dict[str, Any]]:
    return qall("SELECT * FROM car_photos WHERE telegram_id=? ORDER BY id DESC", (telegram_id,))


def delete_car_photo(photo_id: int, telegram_id: str):
    exec1("DELETE FROM car_photos WHERE id=? AND telegram_id=?", (photo_id, telegram_id))


# =========================
# ADS
# =========================
def create_ad(payload: Dict[str, Any]) -> int:
    ts = now_ts()
    return exec1("""
    INSERT INTO ads(
      telegram_id, role, name, phone, car_brand, car_number, photo_url,
      frm, too, ad_type, price, seats, comment, lat, lng,
      is_vip, is_pinned, status, created_at, updated_at
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    """, (
        payload.get("telegram_id",""),
        payload.get("role",""),
        payload.get("name",""),
        payload.get("phone",""),
        payload.get("car_brand",""),
        payload.get("car_number",""),
        payload.get("photo_url",""),

        payload.get("from",""),
        payload.get("to",""),
        payload.get("type","now"),
        str(payload.get("price","")),
        int(payload.get("seats") or 0),
        payload.get("comment",""),

        payload.get("lat", None),
        payload.get("lng", None),

        int(payload.get("is_vip") or 0),
        int(payload.get("is_pinned") or 0),
        payload.get("status","active"),
        ts, ts
    ))


def list_ads() -> List[Dict[str, Any]]:
    return qall("SELECT * FROM ads ORDER BY created_at DESC")


def get_ad(ad_id: int) -> Optional[Dict[str, Any]]:
    return q1("SELECT * FROM ads WHERE id=?", (ad_id,))


def delete_ad(ad_id: int):
    exec1("DELETE FROM ads WHERE id=?", (ad_id,))


def update_ad(ad_id: int, telegram_id: str, data: Dict[str, Any]):
    ad = get_ad(ad_id)
    if not ad:
        return False
    if str(ad["telegram_id"]) != str(telegram_id):
        return False

    # only allowed fields
    fields = {
        "frm": data.get("from", ad["frm"]),
        "too": data.get("to", ad["too"]),
        "ad_type": data.get("type", ad["ad_type"]),
        "price": str(data.get("price", ad["price"])),
        "seats": int(data.get("seats", ad["seats"]) or 0),
        "comment": data.get("comment", ad["comment"]),
        "lat": data.get("lat", ad["lat"]),
        "lng": data.get("lng", ad["lng"]),
        "status": data.get("status", ad["status"]),
        "updated_at": now_ts()
    }

    exec1("""
    UPDATE ads SET
      frm=?, too=?, ad_type=?, price=?, seats=?, comment=?, lat=?, lng=?, status=?, updated_at=?
    WHERE id=?
    """, (
        fields["frm"], fields["too"], fields["ad_type"],
        fields["price"], fields["seats"], fields["comment"],
        fields["lat"], fields["lng"], fields["status"], fields["updated_at"],
        ad_id
    ))
    return True


def change_ad_seats(ad_id: int, telegram_id: str, delta: int) -> Optional[int]:
    ad = get_ad(ad_id)
    if not ad:
        return None
    if str(ad["telegram_id"]) != str(telegram_id):
        return None
    seats = int(ad["seats"] or 0) + delta
    if seats < 0:
        seats = 0
    if seats > 8:
        seats = 8

    status = "active"
    if seats == 0:
        status = "full"

    exec1("UPDATE ads SET seats=?, status=?, updated_at=? WHERE id=?",
          (seats, status, now_ts(), ad_id))
    return seats


def pin_ad(ad_id: int, is_pinned: int):
    exec1("UPDATE ads SET is_pinned=?, updated_at=? WHERE id=?", (is_pinned, now_ts(), ad_id))


def vip_ad(ad_id: int, is_vip: int):
    exec1("UPDATE ads SET is_vip=?, updated_at=? WHERE id=?", (is_vip, now_ts(), ad_id))


# =========================
# LIKES / POINTS
# =========================
def like_phone(target_phone: str, from_tid: str) -> int:
    try:
        exec1("INSERT INTO likes(target_phone, from_telegram_id, created_at) VALUES(?,?,?)",
              (target_phone, from_tid, now_ts()))
    except:
        pass
    row = q1("SELECT COUNT(*) as c FROM likes WHERE target_phone=?", (target_phone,))
    return int(row["c"]) if row else 0


def points_for_phone(target_phone: str) -> int:
    row = q1("SELECT COUNT(*) as c FROM likes WHERE target_phone=?", (target_phone,))
    return int(row["c"]) if row else 0


# =========================
# VIEWS
# =========================
def add_view(ad_id: int, viewer_tid: str) -> int:
    try:
        exec1("INSERT INTO ad_views(ad_id, viewer_telegram_id, created_at) VALUES(?,?,?)",
              (ad_id, viewer_tid, now_ts()))
    except:
        pass
    row = q1("SELECT COUNT(*) as c FROM ad_views WHERE ad_id=?", (ad_id,))
    return int(row["c"]) if row else 0


def views_for_ad(ad_id: int) -> int:
    row = q1("SELECT COUNT(*) as c FROM ad_views WHERE ad_id=?", (ad_id,))
    return int(row["c"]) if row else 0


# =========================
# FAVORITES
# =========================
def add_favorite(telegram_id: str, target_tid: str) -> bool:
    try:
        exec1("INSERT INTO favorites(telegram_id, target_telegram_id, created_at) VALUES(?,?,?)",
              (telegram_id, target_tid, now_ts()))
        return True
    except:
        return False


def remove_favorite(telegram_id: str, target_tid: str):
    exec1("DELETE FROM favorites WHERE telegram_id=? AND target_telegram_id=?", (telegram_id, target_tid))


def list_favorites(telegram_id: str) -> List[Dict[str, Any]]:
    return qall("""
      SELECT u.* FROM favorites f
      JOIN users u ON u.telegram_id=f.target_telegram_id
      WHERE f.telegram_id=?
      ORDER BY f.created_at DESC
    """, (telegram_id,))


# =========================
# REVIEWS / RATINGS
# =========================
def add_review(target_tid: str, from_tid: str, rating: int, text: str = ""):
    if rating < 1: rating = 1
    if rating > 5: rating = 5
    exec1("INSERT INTO reviews(target_telegram_id, from_telegram_id, rating, text, created_at) VALUES(?,?,?,?,?)",
          (target_tid, from_tid, rating, text, now_ts()))


def list_reviews(target_tid: str) -> List[Dict[str, Any]]:
    return qall("SELECT * FROM reviews WHERE target_telegram_id=? ORDER BY id DESC", (target_tid,))


def calc_rating(target_tid: str) -> float:
    row = q1("SELECT AVG(rating) as avg FROM reviews WHERE target_telegram_id=?", (target_tid,))
    avg = row["avg"] if row and row["avg"] is not None else 0
    return float(avg)


def top_drivers(limit: int = 20) -> List[Dict[str, Any]]:
    return qall("""
      SELECT u.*, 
        (SELECT AVG(rating) FROM reviews r WHERE r.target_telegram_id=u.telegram_id) as avg_rating
      FROM users u
      WHERE u.role='driver'
      ORDER BY avg_rating DESC NULLS LAST, u.points DESC
      LIMIT ?
    """, (limit,))


# =========================
# REPORTS
# =========================
def add_report(target_tid: str, from_tid: str, reason: str, text: str = ""):
    exec1("INSERT INTO reports(target_telegram_id, from_telegram_id, reason, text, status, created_at) VALUES(?,?,?,?,?,?)",
          (target_tid, from_tid, reason, text, "open", now_ts()))


def list_reports(status: str = "open") -> List[Dict[str, Any]]:
    return qall("SELECT * FROM reports WHERE status=? ORDER BY id DESC", (status,))


def close_report(report_id: int):
    exec1("UPDATE reports SET status='closed' WHERE id=?", (report_id,))


# =========================
# NEWS
# =========================
def create_news(title: str, text: str, image_url: str = "") -> int:
    return exec1("INSERT INTO news(title, text, image_url, created_at) VALUES(?,?,?,?)",
                 (title, text, image_url, now_ts()))


def list_news(limit: int = 50) -> List[Dict[str, Any]]:
    return qall("SELECT * FROM news ORDER BY id DESC LIMIT ?", (limit,))


def delete_news(news_id: int):
    exec1("DELETE FROM news WHERE id=?", (news_id,))


# =========================
# ADMIN BANNER
# =========================
def set_banner(image_url: str):
    exec1("INSERT INTO admin_banner(image_url, created_at) VALUES(?,?)", (image_url, now_ts()))


def get_banner() -> Optional[Dict[str, Any]]:
    return q1("SELECT * FROM admin_banner ORDER BY id DESC LIMIT 1")


# =========================
# DONATIONS
# =========================
def add_donation(telegram_id: str, amount: int, method: str = "manual"):
    if amount < 0: amount = 0
    exec1("INSERT INTO donations(telegram_id, amount, method, created_at) VALUES(?,?,?,?)",
          (telegram_id, amount, method, now_ts()))


def top_donaters(limit: int = 10) -> List[Dict[str, Any]]:
    return qall("""
      SELECT telegram_id, SUM(amount) as total
      FROM donations
      GROUP BY telegram_id
      ORDER BY total DESC
      LIMIT ?
    """, (limit,))


def donation_stats() -> Dict[str, Any]:
    row = q1("SELECT COUNT(*) as cnt, SUM(amount) as sum FROM donations")
    return {
        "count": int(row["cnt"] if row else 0),
        "sum": int(row["sum"] if row and row["sum"] is not None else 0)
    }


# =========================
# ORDERS
# =========================
def create_order(client_tid: str, driver_tid: str, ad_id: int) -> int:
    ts = now_ts()
    return exec1("""
      INSERT INTO orders(client_telegram_id, driver_telegram_id, ad_id, status, created_at, updated_at)
      VALUES(?,?,?,?,?,?)
    """, (client_tid, driver_tid, ad_id, "created", ts, ts))


def update_order_status(order_id: int, status: str, cancel_reason: str = ""):
    exec1("UPDATE orders SET status=?, cancel_reason=?, updated_at=? WHERE id=?",
          (status, cancel_reason, now_ts(), order_id))


def list_orders_for_user(telegram_id: str) -> List[Dict[str, Any]]:
    return qall("""
      SELECT * FROM orders
      WHERE client_telegram_id=? OR driver_telegram_id=?
      ORDER BY id DESC
    """, (telegram_id, telegram_id))


# =========================
# MESSAGES (CHAT HISTORY)
# =========================
def save_message(chat_id: str, from_tid: str, to_tid: str, text: str = "", voice_url: str = "") -> int:
    return exec1("""
      INSERT INTO messages(chat_id, from_telegram_id, to_telegram_id, text, voice_url, created_at)
      VALUES(?,?,?,?,?,?)
    """, (chat_id, from_tid, to_tid, text, voice_url, now_ts()))


def get_chat_messages(chat_id: str, limit: int = 200) -> List[Dict[str, Any]]:
    return qall("""
      SELECT * FROM messages
      WHERE chat_id=?
      ORDER BY id DESC
      LIMIT ?
    """, (chat_id, limit))


# =========================
# PRESENCE LOG
# =========================
def log_presence(telegram_id: str, status: str):
    exec1("INSERT INTO presence_log(telegram_id, status, created_at) VALUES(?,?,?)",
          (telegram_id, status, now_ts()))


def last_presence(telegram_id: str) -> Optional[Dict[str, Any]]:
    return q1("""
      SELECT * FROM presence_log
      WHERE telegram_id=?
      ORDER BY id DESC LIMIT 1
    """, (telegram_id,))
