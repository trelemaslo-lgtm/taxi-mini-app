import sqlite3
import time
from typing import Any, Dict, List, Optional

DB_PATH = "taxi.db"


def now_ts() -> int:
    return int(time.time())


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_conn()
    cur = conn.cursor()

    # ADS
    cur.execute("""
    CREATE TABLE IF NOT EXISTS ads (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      carBrand TEXT DEFAULT '',
      carNumber TEXT DEFAULT '',
      photo TEXT DEFAULT '',
      from_place TEXT NOT NULL,
      to_place TEXT NOT NULL,
      type TEXT NOT NULL,
      price TEXT NOT NULL,
      seats INTEGER DEFAULT 0,
      comment TEXT DEFAULT '',
      lat REAL,
      lng REAL,
      created_at INTEGER NOT NULL
    )
    """)

    # LIKES (points per ad or per driver phone)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ad_id TEXT NOT NULL,
      phone TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
    """)

    # STATS by phone
    cur.execute("""
    CREATE TABLE IF NOT EXISTS user_stats (
      phone TEXT PRIMARY KEY,
      points INTEGER DEFAULT 0,
      likes_count INTEGER DEFAULT 0,
      rating REAL DEFAULT 4.0
    )
    """)

    # VIEWS (unique/cooldown)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ad_id TEXT NOT NULL,
      viewer_key TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
    """)

    # NEWS (admin posts)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS news (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      image TEXT DEFAULT '',
      created_at INTEGER NOT NULL
    )
    """)

    # REPORTS
    cur.execute("""
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      ad_id TEXT,
      reporter_phone TEXT,
      reason TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
    """)

    conn.commit()
    conn.close()


# ---------------- ADS ----------------
def insert_ad(ad: Dict[str, Any]) -> None:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
      INSERT INTO ads (
        id, role, name, phone, carBrand, carNumber, photo,
        from_place, to_place, type, price, seats, comment,
        lat, lng, created_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    """, (
        ad["id"], ad["role"], ad["name"], ad["phone"],
        ad.get("carBrand", ""), ad.get("carNumber", ""), ad.get("photo", ""),
        ad["from"], ad["to"], ad["type"], ad["price"],
        int(ad.get("seats", 0)), ad.get("comment", ""),
        ad.get("lat", None), ad.get("lng", None),
        int(ad["created_at"])
    ))
    conn.commit()
    conn.close()


def list_ads() -> List[Dict[str, Any]]:
    conn = get_conn()
    cur = conn.cursor()
    rows = cur.execute("""
      SELECT * FROM ads ORDER BY created_at DESC
    """).fetchall()
    conn.close()

    out = []
    for r in rows:
        out.append({
            "id": r["id"],
            "role": r["role"],
            "name": r["name"],
            "phone": r["phone"],
            "carBrand": r["carBrand"],
            "carNumber": r["carNumber"],
            "photo": r["photo"],
            "from": r["from_place"],
            "to": r["to_place"],
            "type": r["type"],
            "price": r["price"],
            "seats": r["seats"],
            "comment": r["comment"],
            "lat": r["lat"],
            "lng": r["lng"],
            "created_at": r["created_at"]
        })
    return out


def get_ad(ad_id: str) -> Optional[Dict[str, Any]]:
    conn = get_conn()
    cur = conn.cursor()
    row = cur.execute("SELECT * FROM ads WHERE id=?", (ad_id,)).fetchone()
    conn.close()
    if not row:
        return None
    return {
        "id": row["id"],
        "role": row["role"],
        "name": row["name"],
        "phone": row["phone"],
        "carBrand": row["carBrand"],
        "carNumber": row["carNumber"],
        "photo": row["photo"],
        "from": row["from_place"],
        "to": row["to_place"],
        "type": row["type"],
        "price": row["price"],
        "seats": row["seats"],
        "comment": row["comment"],
        "lat": row["lat"],
        "lng": row["lng"],
        "created_at": row["created_at"]
    }


def update_seats(ad_id: str, seats: int) -> bool:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("UPDATE ads SET seats=? WHERE id=?", (int(seats), ad_id))
    conn.commit()
    ok = cur.rowcount > 0
    conn.close()
    return ok


def delete_ad(ad_id: str, phone: str) -> bool:
    conn = get_conn()
    cur = conn.cursor()
    # owner check
    row = cur.execute("SELECT phone FROM ads WHERE id=?", (ad_id,)).fetchone()
    if not row:
        conn.close()
        return False
    if row["phone"] != phone:
        conn.close()
        return False

    cur.execute("DELETE FROM ads WHERE id=?", (ad_id,))
    conn.commit()
    ok = cur.rowcount > 0
    conn.close()
    return ok


# ---------------- Likes/Points ----------------
def ensure_user_stats(phone: str) -> None:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
      INSERT OR IGNORE INTO user_stats (phone, points, likes_count, rating)
      VALUES (?,0,0,4.0)
    """, (phone,))
    conn.commit()
    conn.close()


def add_like(ad_id: str, phone: str) -> bool:
    """
    Like adds:
    - 1 point to ad owner (phone)
    """
    ensure_user_stats(phone)

    conn = get_conn()
    cur = conn.cursor()

    # insert like (no duplicate limit now, later add anti-spam)
    cur.execute("""
      INSERT INTO likes (ad_id, phone, created_at)
      VALUES (?,?,?)
    """, (ad_id, phone, now_ts()))

    # update stats
    cur.execute("""
      UPDATE user_stats
      SET points = points + 1,
          likes_count = likes_count + 1
      WHERE phone = ?
    """, (phone,))

    # rating: 4.0 + points/50 max 5.0
    cur.execute("SELECT points FROM user_stats WHERE phone=?", (phone,))
    pts = cur.fetchone()["points"]
    rating = min(5.0, 4.0 + (pts / 50.0))
    cur.execute("UPDATE user_stats SET rating=? WHERE phone=?", (rating, phone))

    conn.commit()
    conn.close()
    return True


def get_user_stats(phone: str) -> Dict[str, Any]:
    ensure_user_stats(phone)
    conn = get_conn()
    cur = conn.cursor()
    row = cur.execute("SELECT * FROM user_stats WHERE phone=?", (phone,)).fetchone()
    conn.close()
    return {
        "phone": phone,
        "points": row["points"],
        "likes_count": row["likes_count"],
        "rating": row["rating"]
    }


def points_for_ad_owner(phone: str) -> int:
    st = get_user_stats(phone)
    return st["points"]


# ---------------- Views ----------------
def count_views_for_ad(ad_id: str) -> int:
    conn = get_conn()
    cur = conn.cursor()
    row = cur.execute("SELECT COUNT(*) as c FROM views WHERE ad_id=?", (ad_id,)).fetchone()
    conn.close()
    return int(row["c"])


def add_view(ad_id: str, viewer_key: str, cooldown_seconds: int = 3600) -> bool:
    """
    Unique view by viewer_key per cooldown window.
    viewer_key can be device_id or telegram user id or phone
    """
    conn = get_conn()
    cur = conn.cursor()
    cutoff = now_ts() - cooldown_seconds

    row = cur.execute("""
      SELECT id FROM views
      WHERE ad_id=? AND viewer_key=? AND created_at > ?
      LIMIT 1
    """, (ad_id, viewer_key, cutoff)).fetchone()

    if row:
        conn.close()
        return False

    cur.execute("""
      INSERT INTO views (ad_id, viewer_key, created_at)
      VALUES (?,?,?)
    """, (ad_id, viewer_key, now_ts()))

    conn.commit()
    conn.close()
    return True


# ---------------- Admin Analytics ----------------
def analytics() -> Dict[str, Any]:
    conn = get_conn()
    cur = conn.cursor()
    ads = cur.execute("SELECT COUNT(*) as c FROM ads").fetchone()["c"]
    users = cur.execute("SELECT COUNT(*) as c FROM user_stats").fetchone()["c"]
    likes = cur.execute("SELECT COUNT(*) as c FROM likes").fetchone()["c"]
    views = cur.execute("SELECT COUNT(*) as c FROM views").fetchone()["c"]
    conn.close()
    return {"ads": ads, "users": users, "likes": likes, "views": views}
