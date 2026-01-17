import os
import sqlite3
import time
import json
import hashlib
from typing import Any, Dict, List, Optional, Tuple

# =========================================================
# 711 TAXI — ULTRA FINAL DB CORE (SUPER BIG)
# - SQLite production pragmas
# - Full schema for FINAL PACK
# - Helpers + migrations + analytics
# =========================================================

DB_PATH = os.getenv("DB_PATH", "taxi.db").strip()

# =========================================================
# TIME
# =========================================================
def now_ms() -> int:
    return int(time.time() * 1000)

def now_s() -> int:
    return int(time.time())

def ms_to_s(ms: int) -> int:
    return int(ms / 1000)

# =========================================================
# CONNECTION
# =========================================================
def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row

    # render friendly pragmas
    try:
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        conn.execute("PRAGMA temp_store=MEMORY;")
        conn.execute("PRAGMA foreign_keys=ON;")
        conn.execute("PRAGMA busy_timeout=6000;")
        conn.execute("PRAGMA cache_size=-8000;")  # ~8MB
    except:
        pass

    return conn

def row_to_dict(row: sqlite3.Row) -> Dict[str, Any]:
    if not row:
        return {}
    return {k: row[k] for k in row.keys()}

def rows_to_list(rows: List[sqlite3.Row]) -> List[Dict[str, Any]]:
    return [row_to_dict(r) for r in rows]

# =========================================================
# BASIC EXEC HELPERS
# =========================================================
def db_execute(sql: str, params: Tuple[Any, ...] = ()) -> None:
    conn = get_conn()
    try:
        conn.execute(sql, params)
        conn.commit()
    finally:
        conn.close()

def db_exec_many(sql: str, rows: List[Tuple[Any, ...]]) -> None:
    conn = get_conn()
    try:
        conn.executemany(sql, rows)
        conn.commit()
    finally:
        conn.close()

def db_fetchone(sql: str, params: Tuple[Any, ...] = ()) -> Optional[Dict[str, Any]]:
    conn = get_conn()
    try:
        cur = conn.execute(sql, params)
        row = cur.fetchone()
        if not row:
            return None
        return row_to_dict(row)
    finally:
        conn.close()

def db_fetchall(sql: str, params: Tuple[Any, ...] = ()) -> List[Dict[str, Any]]:
    conn = get_conn()
    try:
        cur = conn.execute(sql, params)
        rows = cur.fetchall()
        return rows_to_list(rows)
    finally:
        conn.close()

def db_scalar(sql: str, params: Tuple[Any, ...] = (), default: Any = 0) -> Any:
    conn = get_conn()
    try:
        cur = conn.execute(sql, params)
        row = cur.fetchone()
        if not row:
            return default
        return list(row)[0]
    finally:
        conn.close()

# =========================================================
# UTILS
# =========================================================
def stable_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def json_dumps(obj: Any) -> str:
    try:
        return json.dumps(obj, ensure_ascii=False)
    except:
        return "{}"

def json_loads(text: str) -> Any:
    try:
        return json.loads(text or "{}")
    except:
        return {}

def table_exists(name: str) -> bool:
    conn = get_conn()
    try:
        r = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
            (name,)
        ).fetchone()
        return r is not None
    finally:
        conn.close()

def column_exists(table: str, column: str) -> bool:
    conn = get_conn()
    try:
        cur = conn.execute(f"PRAGMA table_info({table});")
        cols = [x["name"] for x in cur.fetchall()]
        return column in cols
    finally:
        conn.close()

# =========================================================
# MIGRATIONS
# =========================================================
def ensure_migrations_table(conn: sqlite3.Connection) -> None:
    conn.execute("""
    CREATE TABLE IF NOT EXISTS migrations(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        created_at INTEGER NOT NULL
    );
    """)

def has_migration(conn: sqlite3.Connection, key: str) -> bool:
    r = conn.execute("SELECT id FROM migrations WHERE key=?", (key,)).fetchone()
    return r is not None

def add_migration(conn: sqlite3.Connection, key: str) -> None:
    conn.execute(
        "INSERT OR IGNORE INTO migrations(key, created_at) VALUES(?,?)",
        (key, now_ms())
    )

# =========================================================
# SCHEMA CREATION
# =========================================================
def init_db() -> None:
    """
    ULTRA FINAL schema.
    """
    conn = get_conn()
    try:
        ensure_migrations_table(conn)

        # -------------------------------------------------
        # ADS
        # -------------------------------------------------
        conn.execute("""
        CREATE TABLE IF NOT EXISTS ads(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role TEXT NOT NULL,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,

            car_brand TEXT DEFAULT '',
            car_number TEXT DEFAULT '',
            photo_url TEXT DEFAULT '',

            from_place TEXT NOT NULL,
            to_place TEXT NOT NULL,
            ad_type TEXT DEFAULT 'now',

            price TEXT NOT NULL,
            seats INTEGER DEFAULT 0,
            comment TEXT DEFAULT '',

            lat REAL DEFAULT NULL,
            lng REAL DEFAULT NULL,

            vip INTEGER DEFAULT 0,
            pinned INTEGER DEFAULT 0,
            hidden INTEGER DEFAULT 0,

            created_at INTEGER NOT NULL,
            auto_delete_at INTEGER DEFAULT NULL,
            updated_at INTEGER NOT NULL
        );
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_ads_role ON ads(role);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_ads_phone ON ads(phone);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_ads_created ON ads(created_at);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_ads_autodel ON ads(auto_delete_at);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_ads_vip ON ads(vip);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_ads_pinned ON ads(pinned);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_ads_hidden ON ads(hidden);")

        # -------------------------------------------------
        # PROFILES
        # -------------------------------------------------
        conn.execute("""
        CREATE TABLE IF NOT EXISTS profiles(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role TEXT NOT NULL,
            name TEXT NOT NULL,
            phone TEXT NOT NULL UNIQUE,

            bio TEXT DEFAULT '',

            car_brand TEXT DEFAULT '',
            car_number TEXT DEFAULT '',

            photo_url TEXT DEFAULT '',
            cover_url TEXT DEFAULT '',

            verified INTEGER DEFAULT 0,
            trusted_badge INTEGER DEFAULT 0,

            trust_score INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,

            orders_total INTEGER DEFAULT 0,
            orders_done INTEGER DEFAULT 0,
            cancel_count INTEGER DEFAULT 0,
            report_count INTEGER DEFAULT 0,

            telegram_id TEXT DEFAULT NULL,
            telegram_username TEXT DEFAULT NULL,

            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        );
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_profiles_updated ON profiles(updated_at);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_profiles_trust ON profiles(trust_score);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_profiles_level ON profiles(level);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_profiles_orders_done ON profiles(orders_done);")

        # -------------------------------------------------
        # LIKES / POINTS
        # -------------------------------------------------
        conn.execute("""
        CREATE TABLE IF NOT EXISTS likes_points(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT NOT NULL UNIQUE,
            likes INTEGER DEFAULT 0,
            points INTEGER DEFAULT 0,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        );
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_lp_phone ON likes_points(phone);")

        # -------------------------------------------------
        # AD VIEWS (unique per viewer w/ cooldown in app)
        # -------------------------------------------------
        conn.execute("""
        CREATE TABLE IF NOT EXISTS ad_views(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ad_id INTEGER NOT NULL,
            viewer_phone TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            FOREIGN KEY(ad_id) REFERENCES ads(id) ON DELETE CASCADE
        );
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_views_ad ON ad_views(ad_id);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_views_combo ON ad_views(ad_id, viewer_phone);")

        # -------------------------------------------------
        # FAVORITES
        # -------------------------------------------------
        conn.execute("""
        CREATE TABLE IF NOT EXISTS favorites(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner_phone TEXT NOT NULL,
            target_phone TEXT NOT NULL,
            created_at INTEGER NOT NULL
        );
        """)
        conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS ux_fav_pair ON favorites(owner_phone, target_phone);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_fav_owner ON favorites(owner_phone);")

        # -------------------------------------------------
        # CAR GALLERY
        # -------------------------------------------------
        conn.execute("""
        CREATE TABLE IF NOT EXISTS car_gallery(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT NOT NULL,
            image_url TEXT NOT NULL,
            caption TEXT DEFAULT '',
            created_at INTEGER NOT NULL,
            FOREIGN KEY(phone) REFERENCES profiles(phone) ON DELETE CASCADE
        );
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_gallery_phone ON car_gallery(phone);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_gallery_created ON car_gallery(created_at);")

        # -------------------------------------------------
        # NEWS
        # -------------------------------------------------
        conn.execute("""
        CREATE TABLE IF NOT EXISTS news(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            text TEXT NOT NULL,
            image_url TEXT DEFAULT '',
            created_at INTEGER NOT NULL
        );
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_news_created ON news(created_at);")

        # -------------------------------------------------
        # BANNER (entry ad 3 sec)
        # -------------------------------------------------
        conn.execute("""
        CREATE TABLE IF NOT EXISTS banner(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            image_url TEXT NOT NULL,
            created_at INTEGER NOT NULL
        );
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_banner_created ON banner(created_at);")

        # -------------------------------------------------
        # COMPLAINTS / REPORTS
        # -------------------------------------------------
        conn.execute("""
        CREATE TABLE IF NOT EXISTS complaints(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            from_phone TEXT NOT NULL,
            target_phone TEXT NOT NULL,
            reason TEXT NOT NULL,
            details TEXT DEFAULT '',
            status TEXT DEFAULT 'open', -- open/closed/actioned
            created_at INTEGER NOT NULL
        );
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_complaints_target ON complaints(target_phone);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_complaints_created ON complaints(created_at);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);")

        # -------------------------------------------------
        # ORDERS
        # -------------------------------------------------
        conn.execute("""
        CREATE TABLE IF NOT EXISTS orders(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_phone TEXT NOT NULL,
            driver_phone TEXT NOT NULL,
            ad_id INTEGER DEFAULT NULL,
            note TEXT DEFAULT '',
            status TEXT NOT NULL DEFAULT 'created',
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        );
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_phone);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_orders_driver ON orders(driver_phone);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);")

        # -------------------------------------------------
        # REVIEWS
        # -------------------------------------------------
        conn.execute("""
        CREATE TABLE IF NOT EXISTS reviews(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            client_phone TEXT NOT NULL,
            driver_phone TEXT NOT NULL,
            rating INTEGER NOT NULL,
            text TEXT DEFAULT '',
            created_at INTEGER NOT NULL,
            FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
        );
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_reviews_driver ON reviews(driver_phone);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_reviews_order ON reviews(order_id);")

        # -------------------------------------------------
        # CHAT THREADS
        # -------------------------------------------------
        conn.execute("""
        CREATE TABLE IF NOT EXISTS chat_threads(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_a TEXT NOT NULL,
            user_b TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        );
        """)
        conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS ux_thread_pair ON chat_threads(user_a, user_b);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_thread_updated ON chat_threads(updated_at);")

        # -------------------------------------------------
        # CHAT MESSAGES
        # -------------------------------------------------
        conn.execute("""
        CREATE TABLE IF NOT EXISTS chat_messages(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            thread_id INTEGER NOT NULL,
            sender_phone TEXT NOT NULL,
            text TEXT DEFAULT '',
            media_url TEXT DEFAULT '',
            media_type TEXT DEFAULT '',
            created_at INTEGER NOT NULL,
            FOREIGN KEY(thread_id) REFERENCES chat_threads(id) ON DELETE CASCADE
        );
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_msg_thread ON chat_messages(thread_id);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_msg_created ON chat_messages(created_at);")

        # -------------------------------------------------
        # PRESENCE
        # -------------------------------------------------
        conn.execute("""
        CREATE TABLE IF NOT EXISTS presence(
            phone TEXT PRIMARY KEY,
            is_online INTEGER DEFAULT 0,
            last_seen INTEGER NOT NULL
        );
        """)

        # -------------------------------------------------
        # TYPING STATUS
        # -------------------------------------------------
        conn.execute("""
        CREATE TABLE IF NOT EXISTS typing_status(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            thread_id INTEGER NOT NULL,
            phone TEXT NOT NULL,
            is_typing INTEGER DEFAULT 0,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY(thread_id) REFERENCES chat_threads(id) ON DELETE CASCADE
        );
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_typing_thread ON typing_status(thread_id);")

        # -------------------------------------------------
        # UPLOADS LOG (device-only)
        # -------------------------------------------------
        conn.execute("""
        CREATE TABLE IF NOT EXISTS uploads(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner_phone TEXT NOT NULL,
            url TEXT NOT NULL,
            file_type TEXT DEFAULT '', -- profile/cover/car/news/banner/voice
            meta TEXT DEFAULT '',
            created_at INTEGER NOT NULL
        );
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_upload_owner ON uploads(owner_phone);")

        # -------------------------------------------------
        # DONATIONS
        # -------------------------------------------------
        conn.execute("""
        CREATE TABLE IF NOT EXISTS donations(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT DEFAULT '',
            telegram_id TEXT DEFAULT '',
            amount INTEGER NOT NULL,
            note TEXT DEFAULT '',
            created_at INTEGER NOT NULL
        );
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_don_created ON donations(created_at);")

        # -------------------------------------------------
        # ROUTE SUBSCRIPTIONS (bot notify)
        # -------------------------------------------------
        conn.execute("""
        CREATE TABLE IF NOT EXISTS route_subs(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT NOT NULL,
            from_place TEXT NOT NULL,
            to_place TEXT NOT NULL,
            created_at INTEGER NOT NULL
        );
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_route_phone ON route_subs(phone);")

        # -------------------------------------------------
        # ADMIN LOGS (analytics)
        # -------------------------------------------------
        conn.execute("""
        CREATE TABLE IF NOT EXISTS admin_logs(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            telegram_id TEXT NOT NULL,
            action TEXT NOT NULL,
            meta TEXT DEFAULT '',
            created_at INTEGER NOT NULL
        );
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at);")

        # -------------------------------------------------
        # RATE LIMITS (anti spam)
        # -------------------------------------------------
        conn.execute("""
        CREATE TABLE IF NOT EXISTS rate_limits(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT NOT NULL UNIQUE,
            count INTEGER DEFAULT 0,
            window_start INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        );
        """)

        # -------------------------------------------------
        # NOTIFICATION QUEUE (future)
        # -------------------------------------------------
        conn.execute("""
        CREATE TABLE IF NOT EXISTS notify_queue(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            telegram_id TEXT NOT NULL,
            text TEXT NOT NULL,
            status TEXT DEFAULT 'pending', -- pending/sent/failed
            tries INTEGER DEFAULT 0,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        );
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_notify_status ON notify_queue(status);")

        conn.commit()

        if not has_migration(conn, "ultra_init_v1"):
            add_migration(conn, "ultra_init_v1")
            conn.commit()

    finally:
        conn.close()


# =========================================================
# RATE LIMIT ENGINE (ANTI-SPAM)
# =========================================================
def rate_limit_hit(key: str, limit: int, window_seconds: int) -> bool:
    """
    Returns True if blocked (limit reached).
    key: e.g. "publish:+99890..."
    """
    conn = get_conn()
    try:
        now = now_ms()
        window_ms = window_seconds * 1000

        row = conn.execute("SELECT * FROM rate_limits WHERE key=?", (key,)).fetchone()
        if not row:
            conn.execute(
                "INSERT INTO rate_limits(key, count, window_start, updated_at) VALUES(?,?,?,?)",
                (key, 1, now, now)
            )
            conn.commit()
            return False

        row = row_to_dict(row)
        count = int(row.get("count", 0))
        ws = int(row.get("window_start", now))

        if now - ws > window_ms:
            # reset window
            conn.execute(
                "UPDATE rate_limits SET count=?, window_start=?, updated_at=? WHERE key=?",
                (1, now, now, key)
            )
            conn.commit()
            return False

        # within window
        if count >= limit:
            return True

        conn.execute(
            "UPDATE rate_limits SET count=?, updated_at=? WHERE key=?",
            (count + 1, now, key)
        )
        conn.commit()
        return False
    finally:
        conn.close()


# =========================================================
# ANALYTICS HELPERS
# =========================================================
def admin_log(telegram_id: str, action: str, meta: Optional[Dict[str, Any]] = None) -> None:
    try:
        db_execute(
            "INSERT INTO admin_logs(telegram_id, action, meta, created_at) VALUES(?,?,?,?)",
            (str(telegram_id), action, json_dumps(meta or {}), now_ms())
        )
    except:
        pass


# =========================================================
# CHAT HELPERS (threads/messages)
# =========================================================
def chat_get_thread(user_a: str, user_b: str) -> Optional[Dict[str, Any]]:
    """
    Always store pair sorted to keep unique.
    """
    a = str(user_a)
    b = str(user_b)
    if a > b:
        a, b = b, a

    return db_fetchone(
        "SELECT * FROM chat_threads WHERE user_a=? AND user_b=?",
        (a, b)
    )

def chat_ensure_thread(user_a: str, user_b: str) -> Dict[str, Any]:
    a = str(user_a)
    b = str(user_b)
    if a > b:
        a, b = b, a

    t = chat_get_thread(a, b)
    if t:
        return t

    ts = now_ms()
    db_execute(
        "INSERT INTO chat_threads(user_a, user_b, created_at, updated_at) VALUES(?,?,?,?)",
        (a, b, ts, ts)
    )
    return chat_get_thread(a, b) or {"id": 0, "user_a": a, "user_b": b}

def chat_add_message(thread_id: int, sender_phone: str, text: str = "", media_url: str = "", media_type: str = "") -> int:
    ts = now_ms()
    db_execute(
        """
        INSERT INTO chat_messages(thread_id, sender_phone, text, media_url, media_type, created_at)
        VALUES(?,?,?,?,?,?)
        """,
        (thread_id, sender_phone, text, media_url, media_type, ts)
    )
    db_execute("UPDATE chat_threads SET updated_at=? WHERE id=?", (ts, thread_id))
    last_id = db_scalar("SELECT last_insert_rowid();", (), 0)
    return int(last_id or 0)

def chat_list_threads(phone: str, limit: int = 50) -> List[Dict[str, Any]]:
    return db_fetchall(
        """
        SELECT * FROM chat_threads
        WHERE user_a=? OR user_b=?
        ORDER BY updated_at DESC
        LIMIT ?
        """,
        (phone, phone, limit)
    )

def chat_list_messages(thread_id: int, limit: int = 80) -> List[Dict[str, Any]]:
    return db_fetchall(
        """
        SELECT * FROM chat_messages
        WHERE thread_id=?
        ORDER BY created_at DESC
        LIMIT ?
        """,
        (thread_id, limit)
    )[::-1]


# =========================================================
# PRESENCE HELPERS
# =========================================================
def presence_set(phone: str, online: bool) -> None:
    ts = now_ms()
    ex = db_fetchone("SELECT phone FROM presence WHERE phone=?", (phone,))
    if ex:
        db_execute("UPDATE presence SET is_online=?, last_seen=? WHERE phone=?", (1 if online else 0, ts, phone))
    else:
        db_execute("INSERT INTO presence(phone, is_online, last_seen) VALUES(?,?,?)", (phone, 1 if online else 0, ts))

def presence_get(phone: str) -> Dict[str, Any]:
    r = db_fetchone("SELECT * FROM presence WHERE phone=?", (phone,))
    return r or {"phone": phone, "is_online": 0, "last_seen": 0}


# =========================================================
# CLEANUP JOBS
# =========================================================
def cleanup_old_ads(auto_delete_before_ms: int) -> int:
    """
    Delete ads with auto_delete_at <= given ms.
    Return deleted count.
    """
    conn = get_conn()
    try:
        cur = conn.execute("SELECT COUNT(*) FROM ads WHERE auto_delete_at IS NOT NULL AND auto_delete_at <= ?", (auto_delete_before_ms,))
        count = int(cur.fetchone()[0])
        conn.execute("DELETE FROM ads WHERE auto_delete_at IS NOT NULL AND auto_delete_at <= ?", (auto_delete_before_ms,))
        conn.commit()
        return count
    finally:
        conn.close()

def cleanup_typing_stale(stale_ms: int = 8000) -> None:
    """
    Clear typing flags older than stale_ms.
    """
    ts = now_ms() - stale_ms
    db_execute("UPDATE typing_status SET is_typing=0 WHERE updated_at < ?", (ts,))

def cleanup_presence_offline(stale_ms: int = 60000) -> None:
    """
    Mark offline if last_seen older than stale_ms.
    """
    ts = now_ms() - stale_ms
    db_execute("UPDATE presence SET is_online=0 WHERE last_seen < ?", (ts,))


# =========================================================
# SEED DATA (optional for test)
# =========================================================
def seed_demo_data() -> None:
    """
    Optional: for local test only. NOT required.
    """
    if db_scalar("SELECT COUNT(*) FROM profiles", (), 0) > 0:
        return

    t = now_ms()
    demo_profiles = [
        ("driver", "Temur Qodirov", "+998901111111", "Premium driver", "Chevrolet", "01A777AA", "", "", 1, 1, 92, 5, 24, 20, 1, 0, "111", "temur", t, t),
        ("driver", "Akmal Aliyev", "+998902222222", "Fast ride", "Cobalt", "01B555BB", "", "", 0, 0, 55, 3, 10, 8, 2, 1, None, None, t, t),
        ("client", "Sardor", "+998903333333", "Client", "", "", "", "", 0, 0, 0, 1, 0, 0, 0, 0, None, None, t, t),
    ]
    conn = get_conn()
    try:
        conn.executemany("""
        INSERT INTO profiles(
          role,name,phone,bio,car_brand,car_number,photo_url,cover_url,
          verified,trusted_badge,trust_score,level,
          orders_total,orders_done,cancel_count,report_count,
          telegram_id,telegram_username,created_at,updated_at
        )
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, demo_profiles)

        demo_ads = [
            ("driver","Temur Qodirov","+998901111111","Chevrolet","01A777AA","","Chirchiq","Sergeli","now","10000",3,"Tez ketaman",None,None,1,1,0,t,t+3600*1000,t),
            ("driver","Akmal Aliyev","+998902222222","Cobalt","01B555BB","","Yunusobod","Chorsu","20","15000",2,"Komfort",None,None,0,0,0,t,t+3600*1000,t),
            ("client","Sardor","+998903333333","","","","Sergeli","Chirchiq","fill","12000",1,"Joy bor",None,None,0,0,0,t,t+3600*1000,t),
        ]

        conn.executemany("""
        INSERT INTO ads(
          role,name,phone,car_brand,car_number,photo_url,
          from_place,to_place,ad_type,price,seats,comment,
          lat,lng,vip,pinned,hidden,created_at,auto_delete_at,updated_at
        )
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, demo_ads)

        conn.commit()
    finally:
        conn.close()
