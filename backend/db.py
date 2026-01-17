import sqlite3
import time
import os

DB_PATH = os.environ.get("DB_PATH", "taxi.db")

# ===== CONNECTION =====
def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False, timeout=30)
    conn.row_factory = sqlite3.Row
    try:
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
    except:
        pass
    return conn


# ===== INIT DB =====
def init_db():
    conn = get_conn()
    cur = conn.cursor()

    # ADS TABLE
    cur.execute("""
    CREATE TABLE IF NOT EXISTS ads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT,
      name TEXT,
      phone TEXT,
      carBrand TEXT,
      carNumber TEXT,
      photo TEXT,
      bio TEXT,

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

    # PROFILES TABLE
    cur.execute("""
    CREATE TABLE IF NOT EXISTS profiles (
      phone TEXT PRIMARY KEY,
      tg_id TEXT,
      role TEXT,
      name TEXT,
      carBrand TEXT,
      carNumber TEXT,
      photo TEXT,
      bio TEXT,

      verified INTEGER DEFAULT 0,
      banned INTEGER DEFAULT 0,
      online INTEGER DEFAULT 1,

      created_at INTEGER,
      updated_at INTEGER
    )
    """)

    # LIKES TABLE (stable points)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_tg_id TEXT,
      target_phone TEXT,
      created_at INTEGER
    )
    """)

    # REVIEWS TABLE
    cur.execute("""
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_tg_id TEXT,
      target_phone TEXT,
      rating REAL,
      text TEXT,
      created_at INTEGER
    )
    """)

    # BANNERS
    cur.execute("""
    CREATE TABLE IF NOT EXISTS banners (
      id TEXT PRIMARY KEY,
      title TEXT,
      text TEXT,
      image TEXT,
      link TEXT,
      active INTEGER,
      created_at INTEGER
    )
    """)

    # ORDERS
    cur.execute("""
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_phone TEXT,
      driver_phone TEXT,
      "from" TEXT,
      "to" TEXT,
      price TEXT,
      status TEXT,
      created_at INTEGER
    )
    """)

    conn.commit()
    conn.close()

# ===== ADS =====
def ads_cleanup(max_age_seconds=3600):
    """Delete ads older than 60 minutes"""
    conn = get_conn()
    cur = conn.cursor()
    now = int(time.time() * 1000)
    cutoff = now - (max_age_seconds * 1000)

    cur.execute("DELETE FROM ads WHERE created_at < ?", (cutoff,))
    conn.commit()
    conn.close()

def ads_create(ad):
    conn = get_conn()
    cur = conn.cursor()

    ts = int(time.time() * 1000)

    cur.execute("""
    INSERT INTO ads(role,name,phone,carBrand,carNumber,photo,bio,
      "from","to",type,price,seats,comment,lat,lng,created_at)
    VALUES(?,?,?,?,?,?,?,
      ?,?,?,?,?,?,?,?,?,
      ?)
    """, (
        ad.get("role",""),
        ad.get("name",""),
        ad.get("phone",""),
        ad.get("carBrand",""),
        ad.get("carNumber",""),
        ad.get("photo",""),
        ad.get("bio",""),

        ad.get("from",""),
        ad.get("to",""),
        ad.get("type","now"),
        str(ad.get("price","")),
        int(ad.get("seats",0) or 0),
        ad.get("comment",""),

        ad.get("lat", None),
        ad.get("lng", None),
        ts
    ))

    conn.commit()
    conn.close()
    return True


def ads_list(limit=50, offset=0):
    ads_cleanup(3600)

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
      SELECT * FROM ads
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    """, (int(limit), int(offset)))

    rows = cur.fetchall()
    conn.close()

    return [dict(r) for r in rows]

# ===== PROFILES =====
def profile_save(p, tg_id=None):
    conn = get_conn()
    cur = conn.cursor()

    phone = (p.get("phone") or "").strip()
    if not phone:
        conn.close()
        return False

    ts = int(time.time() * 1000)

    cur.execute("""
      INSERT INTO profiles(phone, tg_id, role, name, carBrand, carNumber, photo, bio,
        verified, banned, online, created_at, updated_at)
      VALUES(?,?,?,?,?,?,?,?,
        0,0,1,?,?)
      ON CONFLICT(phone) DO UPDATE SET
        tg_id=excluded.tg_id,
        role=excluded.role,
        name=excluded.name,
        carBrand=excluded.carBrand,
        carNumber=excluded.carNumber,
        photo=excluded.photo,
        bio=excluded.bio,
        updated_at=excluded.updated_at
    """, (
        phone,
        str(tg_id or ""),
        p.get("role",""),
        p.get("name",""),
        p.get("carBrand",""),
        p.get("carNumber",""),
        p.get("photo",""),
        p.get("bio",""),
        ts,
        ts
    ))

    conn.commit()
    conn.close()
    return True

def profile_get(phone):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM profiles WHERE phone=?", (phone,))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None

def profiles_all():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM profiles ORDER BY updated_at DESC")
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def profile_verify(phone, verified=True):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("UPDATE profiles SET verified=?, updated_at=? WHERE phone=?",
                (1 if verified else 0, int(time.time()*1000), phone))
    conn.commit()
    conn.close()
    return True

def profile_ban(phone, banned=True):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("UPDATE profiles SET banned=?, updated_at=? WHERE phone=?",
                (1 if banned else 0, int(time.time()*1000), phone))
    conn.commit()
    conn.close()
    return True

def profile_online(phone, online=True):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("UPDATE profiles SET online=?, updated_at=? WHERE phone=?",
                (1 if online else 0, int(time.time()*1000), phone))
    conn.commit()
    conn.close()
    return True

# ===== LIKES / POINTS =====
def like_add(from_tg_id, target_phone, cooldown_hours=24):
    """Allow one like per user per driver per 24h"""
    if not from_tg_id or not target_phone:
        return (False, "missing")

    now = int(time.time() * 1000)
    cooldown = cooldown_hours * 3600 * 1000

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
      SELECT created_at FROM likes
      WHERE from_tg_id=? AND target_phone=?
      ORDER BY created_at DESC LIMIT 1
    """, (str(from_tg_id), target_phone))
    row = cur.fetchone()

    if row:
        last_ts = int(row["created_at"] or 0)
        if now - last_ts < cooldown:
            conn.close()
            return (False, "cooldown")

    cur.execute("""
      INSERT INTO likes(from_tg_id, target_phone, created_at)
      VALUES(?,?,?)
    """, (str(from_tg_id), target_phone, now))

    conn.commit()
    conn.close()
    return (True, "ok")

def points_get(phone):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) as c FROM likes WHERE target_phone=?", (phone,))
    row = cur.fetchone()
    conn.close()
    return int(row["c"] or 0) if row else 0

# ===== REVIEWS / RATING =====
def review_add(from_tg_id, target_phone, rating, text=""):
    if not from_tg_id or not target_phone:
        return False
    try:
        rating = float(rating)
    except:
        rating = 5.0
    if rating < 1: rating = 1
    if rating > 5: rating = 5

    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
      INSERT INTO reviews(from_tg_id, target_phone, rating, text, created_at)
      VALUES(?,?,?,?,?)
    """, (str(from_tg_id), target_phone, rating, text or "", int(time.time()*1000)))

    conn.commit()
    conn.close()
    return True

def rating_get(phone):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
      SELECT AVG(rating) as avg, COUNT(*) as cnt
      FROM reviews WHERE target_phone=?
    """, (phone,))
    row = cur.fetchone()
    conn.close()

    if not row:
        return (0.0, 0)
    avg = float(row["avg"] or 0.0)
    cnt = int(row["cnt"] or 0)
    return (avg, cnt)

# ===== TOP DRIVERS =====
def top_drivers(limit=20):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
      SELECT p.phone, p.role, p.name, p.carBrand, p.carNumber, p.photo, p.online,
        (SELECT COUNT(*) FROM likes WHERE target_phone=p.phone) AS points,
        (SELECT COALESCE(AVG(rating),0) FROM reviews WHERE target_phone=p.phone) AS rating,
        (SELECT COUNT(*) FROM reviews WHERE target_phone=p.phone) AS reviews_count
      FROM profiles p
      WHERE p.role='driver' AND p.banned=0
      ORDER BY points DESC, rating DESC, p.updated_at DESC
      LIMIT ?
    """, (int(limit),))

    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ===== BANNER =====
def banner_set(title, text, image="", link="", active=1):
    conn = get_conn()
    cur = conn.cursor()

    ts = int(time.time() * 1000)
    bid = "main"

    cur.execute("""
      INSERT INTO banners(id, title, text, image, link, active, created_at)
      VALUES(?,?,?,?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET
        title=excluded.title,
        text=excluded.text,
        image=excluded.image,
        link=excluded.link,
        active=excluded.active,
        created_at=excluded.created_at
    """, (bid, title, text, image or "", link or "", int(active), ts))

    conn.commit()
    conn.close()
    return True

def banner_get():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
      SELECT id, title, text, image, link, active, created_at
      FROM banners
      WHERE id='main'
    """)
    r = cur.fetchone()
    conn.close()

    if not r:
        return None

    return {
        "id": r["id"],
        "title": r["title"] or "",
        "text": r["text"] or "",
        "image": r["image"] or "",
        "link": r["link"] or "",
        "active": int(r["active"] or 0),
        "created_at": int(r["created_at"] or 0),
    }

# ===== ORDERS =====
def order_create(client_phone, driver_phone, from_, to_, price):
    conn = get_conn()
    cur = conn.cursor()
    ts = int(time.time() * 1000)

    cur.execute("""
      INSERT INTO orders(client_phone, driver_phone, "from", "to", price, status, created_at)
      VALUES(?,?,?,?,?,?,?)
    """, (client_phone, driver_phone, from_, to_, str(price), "new", ts))

    conn.commit()
    conn.close()
    return True

def orders_my(phone):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
      SELECT * FROM orders
      WHERE client_phone=? OR driver_phone=?
      ORDER BY created_at DESC
      LIMIT 60
    """, (phone, phone))
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]
