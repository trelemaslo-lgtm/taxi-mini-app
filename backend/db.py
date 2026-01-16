import sqlite3
from pathlib import Path

DB_PATH = Path("data.sqlite")


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_conn()
    cur = conn.cursor()

    # ADS
    cur.execute("""
    CREATE TABLE IF NOT EXISTS ads (
      id TEXT PRIMARY KEY,
      role TEXT,
      name TEXT,
      phone TEXT,
      carBrand TEXT,
      carNumber TEXT,
      photo TEXT,
      "from" TEXT,
      "to" TEXT,
      type TEXT,
      price TEXT,
      seats INTEGER,
      comment TEXT,
      lat REAL,
      lng REAL,
      created_at INTEGER
    )
    """)

    # LIKES
    cur.execute("""
    CREATE TABLE IF NOT EXISTS likes (
      phone TEXT PRIMARY KEY,
      likes INTEGER DEFAULT 0
    )
    """)

    conn.commit()
    conn.close()


def add_ad(ad: dict):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
    INSERT INTO ads (
      id, role, name, phone, carBrand, carNumber, photo,
      "from", "to", type, price, seats, comment, lat, lng, created_at
    )
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    """, (
        ad["id"], ad["role"], ad["name"], ad["phone"],
        ad.get("carBrand",""), ad.get("carNumber",""), ad.get("photo",""),
        ad.get("from",""), ad.get("to",""), ad.get("type","now"),
        ad.get("price",""), int(ad.get("seats",0)),
        ad.get("comment",""), ad.get("lat"), ad.get("lng"),
        int(ad["created_at"])
    ))

    conn.commit()
    conn.close()


def get_ads():
    conn = get_conn()
    cur = conn.cursor()
    rows = cur.execute("""SELECT * FROM ads ORDER BY created_at DESC""").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def delete_old_ads(cutoff_ts: int):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""DELETE FROM ads WHERE created_at < ?""", (cutoff_ts,))
    conn.commit()
    conn.close()


def like_phone(phone: str) -> int:
    conn = get_conn()
    cur = conn.cursor()

    row = cur.execute("SELECT likes FROM likes WHERE phone=?", (phone,)).fetchone()
    if row is None:
        cur.execute("INSERT INTO likes(phone, likes) VALUES(?, ?)", (phone, 1))
        likes = 1
    else:
        likes = int(row["likes"]) + 1
        cur.execute("UPDATE likes SET likes=? WHERE phone=?", (likes, phone))

    conn.commit()
    conn.close()
    return likes


def get_points(phone: str) -> int:
    conn = get_conn()
    cur = conn.cursor()
    row = cur.execute("SELECT likes FROM likes WHERE phone=?", (phone,)).fetchone()
    conn.close()
    return int(row["likes"]) if row else 0


def top_list(limit: int = 20):
    conn = get_conn()
    cur = conn.cursor()
    rows = cur.execute("""
      SELECT phone, likes FROM likes ORDER BY likes DESC LIMIT ?
    """, (limit,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]
