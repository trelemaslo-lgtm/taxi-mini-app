diff --git a/backend/db.py b/backend/db.py
index 29a482e9311de406e7ce08e37987a5d50cdccc05..ac7f59081661d24b8d623e1add089aaa404d6ec0 100644
--- a/backend/db.py
+++ b/backend/db.py
@@ -1,27 +1,28 @@
 import sqlite3
 import time
+import json
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
@@ -71,111 +72,337 @@ def init_db() -> None:
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
 
+
+    # Telegram users (1 telegram user = 1 profile)
+    cur.execute("""
+    CREATE TABLE IF NOT EXISTS telegram_users (
+      telegram_id TEXT PRIMARY KEY,
+      first_name TEXT DEFAULT '',
+      last_name TEXT DEFAULT '',
+      username TEXT DEFAULT '',
+      photo_url TEXT DEFAULT '',
+      auth_date INTEGER NOT NULL,
+      created_at INTEGER NOT NULL,
+      updated_at INTEGER NOT NULL
+    )
+    """)
+
+
+
+    # VIP drivers
+    cur.execute("""
+    CREATE TABLE IF NOT EXISTS vip_drivers (
+      id TEXT PRIMARY KEY,
+      phone TEXT NOT NULL,
+      active INTEGER NOT NULL DEFAULT 1,
+      expires_at INTEGER NOT NULL,
+      created_at INTEGER NOT NULL
+    )
+    """)
+
+    # Boost ads
+    cur.execute("""
+    CREATE TABLE IF NOT EXISTS boosts (
+      id TEXT PRIMARY KEY,
+      ad_id TEXT NOT NULL,
+      phone TEXT NOT NULL,
+      active INTEGER NOT NULL DEFAULT 1,
+      expires_at INTEGER NOT NULL,
+      created_at INTEGER NOT NULL
+    )
+    """)
+
+    # Promo codes
+    cur.execute("""
+    CREATE TABLE IF NOT EXISTS promo_codes (
+      code TEXT PRIMARY KEY,
+      discount_percent INTEGER NOT NULL,
+      max_uses INTEGER NOT NULL DEFAULT 1,
+      used_count INTEGER NOT NULL DEFAULT 0,
+      active INTEGER NOT NULL DEFAULT 1,
+      created_at INTEGER NOT NULL
+    )
+    """)
+
+    # Donations
+    cur.execute("""
+    CREATE TABLE IF NOT EXISTS donations (
+      id TEXT PRIMARY KEY,
+      phone TEXT DEFAULT '',
+      amount REAL NOT NULL,
+      created_at INTEGER NOT NULL
+    )
+    """)
+
+    # Daily deals banner
+    cur.execute("""
+    CREATE TABLE IF NOT EXISTS daily_deals (
+      id TEXT PRIMARY KEY,
+      title TEXT NOT NULL,
+      body TEXT NOT NULL,
+      active INTEGER NOT NULL DEFAULT 1,
+      created_at INTEGER NOT NULL
+    )
+    """)
+
+
+
+    # Ride orders (Uber-like flow)
+    cur.execute("""
+    CREATE TABLE IF NOT EXISTS ride_orders (
+      id TEXT PRIMARY KEY,
+      client_phone TEXT NOT NULL,
+      client_name TEXT DEFAULT '',
+      from_place TEXT NOT NULL,
+      to_place TEXT NOT NULL,
+      ride_time TEXT NOT NULL,
+      people_count INTEGER NOT NULL,
+      note TEXT DEFAULT '',
+      status TEXT NOT NULL,
+      driver_phone TEXT DEFAULT '',
+      offer_price TEXT DEFAULT '',
+      cancel_reason TEXT DEFAULT '',
+      canceled_by TEXT DEFAULT '',
+      created_at INTEGER NOT NULL,
+      updated_at INTEGER NOT NULL
+    )
+    """)
+
+    # Order status/cancel history
+    cur.execute("""
+    CREATE TABLE IF NOT EXISTS order_events (
+      id INTEGER PRIMARY KEY AUTOINCREMENT,
+      order_id TEXT NOT NULL,
+      event_type TEXT NOT NULL,
+      actor_phone TEXT DEFAULT '',
+      payload TEXT DEFAULT '',
+      created_at INTEGER NOT NULL
+    )
+    """)
+
+
+    # Driver profiles / verification / trust
+    cur.execute("""
+    CREATE TABLE IF NOT EXISTS driver_profiles (
+      phone TEXT PRIMARY KEY,
+      level INTEGER DEFAULT 1,
+      trust_score REAL DEFAULT 50,
+      verified INTEGER DEFAULT 0,
+      busy INTEGER DEFAULT 0,
+      available INTEGER DEFAULT 1,
+      pinned INTEGER DEFAULT 0,
+      updated_at INTEGER NOT NULL
+    )
+    """)
+
+    # Reviews
+    cur.execute("""
+    CREATE TABLE IF NOT EXISTS reviews (
+      id TEXT PRIMARY KEY,
+      driver_phone TEXT NOT NULL,
+      reviewer_phone TEXT NOT NULL,
+      rating INTEGER NOT NULL,
+      comment TEXT DEFAULT '',
+      created_at INTEGER NOT NULL
+    )
+    """)
+
+    # Favorites (saved drivers)
+    cur.execute("""
+    CREATE TABLE IF NOT EXISTS favorites (
+      id INTEGER PRIMARY KEY AUTOINCREMENT,
+      user_phone TEXT NOT NULL,
+      driver_phone TEXT NOT NULL,
+      created_at INTEGER NOT NULL,
+      UNIQUE(user_phone, driver_phone)
+    )
+    """)
+
+    # Route subscriptions
+    cur.execute("""
+    CREATE TABLE IF NOT EXISTS route_subscriptions (
+      id TEXT PRIMARY KEY,
+      user_phone TEXT NOT NULL,
+      from_place TEXT NOT NULL,
+      to_place TEXT NOT NULL,
+      active INTEGER NOT NULL DEFAULT 1,
+      created_at INTEGER NOT NULL
+    )
+    """)
+
+    # Notifications (app side history)
+    cur.execute("""
+    CREATE TABLE IF NOT EXISTS notifications (
+      id TEXT PRIMARY KEY,
+      user_phone TEXT NOT NULL,
+      title TEXT NOT NULL,
+      body TEXT NOT NULL,
+      read INTEGER NOT NULL DEFAULT 0,
+      created_at INTEGER NOT NULL
+    )
+    """)
+
+    # Calendar bookings
+    cur.execute("""
+    CREATE TABLE IF NOT EXISTS bookings (
+      id TEXT PRIMARY KEY,
+      ad_id TEXT DEFAULT '',
+      client_phone TEXT NOT NULL,
+      driver_phone TEXT DEFAULT '',
+      booking_time TEXT NOT NULL,
+      seats INTEGER NOT NULL DEFAULT 1,
+      status TEXT NOT NULL,
+      created_at INTEGER NOT NULL
+    )
+    """)
+
+    # Moderator flags (anti-spam)
+    cur.execute("""
+    CREATE TABLE IF NOT EXISTS moderation_flags (
+      id TEXT PRIMARY KEY,
+      actor_phone TEXT NOT NULL,
+      kind TEXT NOT NULL,
+      score INTEGER NOT NULL,
+      note TEXT DEFAULT '',
+      created_at INTEGER NOT NULL
+    )
+    """)
+
+    # Hidden ads by moderation
+    cur.execute("""
+    CREATE TABLE IF NOT EXISTS hidden_ads (
+      ad_id TEXT PRIMARY KEY,
+      reason TEXT DEFAULT '',
+      created_at INTEGER NOT NULL
+    )
+    """)
+
+    # Support / ticket center
+    cur.execute("""
+    CREATE TABLE IF NOT EXISTS support_tickets (
+      id TEXT PRIMARY KEY,
+      user_phone TEXT NOT NULL,
+      subject TEXT NOT NULL,
+      message TEXT NOT NULL,
+      status TEXT NOT NULL,
+      admin_reply TEXT DEFAULT '',
+      created_at INTEGER NOT NULL,
+      updated_at INTEGER NOT NULL
+    )
+    """)
+
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
-      SELECT * FROM ads ORDER BY created_at DESC
+      SELECT a.* FROM ads a
+      LEFT JOIN hidden_ads h ON h.ad_id = a.id
+      WHERE h.ad_id IS NULL
+      ORDER BY a.created_at DESC
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
-    row = cur.execute("SELECT * FROM ads WHERE id=?", (ad_id,)).fetchone()
+    row = cur.execute("""
+      SELECT a.* FROM ads a
+      LEFT JOIN hidden_ads h ON h.ad_id = a.id
+      WHERE a.id=? AND h.ad_id IS NULL
+    """, (ad_id,)).fetchone()
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
@@ -298,25 +525,672 @@ def add_view(ad_id: str, viewer_key: str, cooldown_seconds: int = 3600) -> bool:
 
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
+
+
+# ---------------- Telegram Users ----------------
+def upsert_telegram_user(user: Dict[str, Any], auth_date: int) -> Dict[str, Any]:
+    telegram_id = str(user.get("id", "")).strip()
+    if not telegram_id:
+        raise ValueError("missing_telegram_id")
+
+    first_name = str(user.get("first_name", "") or "")
+    last_name = str(user.get("last_name", "") or "")
+    username = str(user.get("username", "") or "")
+    photo_url = str(user.get("photo_url", "") or "")
+
+    now = now_ts()
+    conn = get_conn()
+    cur = conn.cursor()
+    cur.execute("""
+      INSERT INTO telegram_users (
+        telegram_id, first_name, last_name, username, photo_url,
+        auth_date, created_at, updated_at
+      ) VALUES (?,?,?,?,?,?,?,?)
+      ON CONFLICT(telegram_id) DO UPDATE SET
+        first_name=excluded.first_name,
+        last_name=excluded.last_name,
+        username=excluded.username,
+        photo_url=excluded.photo_url,
+        auth_date=excluded.auth_date,
+        updated_at=excluded.updated_at
+    """, (telegram_id, first_name, last_name, username, photo_url, int(auth_date), now, now))
+    conn.commit()
+    conn.close()
+
+    return {
+        "telegram_id": telegram_id,
+        "first_name": first_name,
+        "last_name": last_name,
+        "username": username,
+        "photo_url": photo_url,
+        "auth_date": int(auth_date)
+    }
+
+
+def get_telegram_user(telegram_id: str) -> Optional[Dict[str, Any]]:
+    conn = get_conn()
+    cur = conn.cursor()
+    row = cur.execute("SELECT * FROM telegram_users WHERE telegram_id=?", (str(telegram_id),)).fetchone()
+    conn.close()
+    if not row:
+        return None
+    return {
+        "telegram_id": row["telegram_id"],
+        "first_name": row["first_name"],
+        "last_name": row["last_name"],
+        "username": row["username"],
+        "photo_url": row["photo_url"],
+        "auth_date": row["auth_date"],
+        "created_at": row["created_at"],
+        "updated_at": row["updated_at"],
+    }
+
+
+# ---------------- Monetization / Admin ----------------
+def grant_vip(phone: str, days: int = 30) -> Dict[str, Any]:
+    expires_at = now_ts() + max(1, int(days)) * 86400
+    row_id = f"vip_{phone}_{now_ts()}"
+    conn = get_conn()
+    cur = conn.cursor()
+    cur.execute("""
+      INSERT INTO vip_drivers (id, phone, active, expires_at, created_at)
+      VALUES (?,?,?,?,?)
+    """, (row_id, phone, 1, expires_at, now_ts()))
+    conn.commit()
+    conn.close()
+    return {"id": row_id, "phone": phone, "expires_at": expires_at}
+
+
+def boost_ad(ad_id: str, phone: str, days: int = 7) -> Dict[str, Any]:
+    expires_at = now_ts() + max(1, int(days)) * 86400
+    row_id = f"boost_{ad_id}_{now_ts()}"
+    conn = get_conn()
+    cur = conn.cursor()
+    cur.execute("""
+      INSERT INTO boosts (id, ad_id, phone, active, expires_at, created_at)
+      VALUES (?,?,?,?,?,?)
+    """, (row_id, ad_id, phone, 1, expires_at, now_ts()))
+    conn.commit()
+    conn.close()
+    return {"id": row_id, "ad_id": ad_id, "phone": phone, "expires_at": expires_at}
+
+
+def create_promo(code: str, discount_percent: int, max_uses: int = 1) -> Dict[str, Any]:
+    conn = get_conn()
+    cur = conn.cursor()
+    cur.execute("""
+      INSERT OR REPLACE INTO promo_codes (code, discount_percent, max_uses, used_count, active, created_at)
+      VALUES (?,?,?,?,?,?)
+    """, (code.upper().strip(), int(discount_percent), int(max_uses), 0, 1, now_ts()))
+    conn.commit()
+    conn.close()
+    return {"code": code.upper().strip(), "discount_percent": int(discount_percent), "max_uses": int(max_uses)}
+
+
+def apply_promo(code: str) -> Optional[Dict[str, Any]]:
+    conn = get_conn()
+    cur = conn.cursor()
+    c = code.upper().strip()
+    row = cur.execute("SELECT * FROM promo_codes WHERE code=? AND active=1", (c,)).fetchone()
+    if not row:
+        conn.close()
+        return None
+
+    if int(row["used_count"]) >= int(row["max_uses"]):
+        conn.close()
+        return None
+
+    cur.execute("UPDATE promo_codes SET used_count = used_count + 1 WHERE code=?", (c,))
+    conn.commit()
+    out = {
+        "code": c,
+        "discount_percent": int(row["discount_percent"]),
+        "used_count": int(row["used_count"]) + 1,
+        "max_uses": int(row["max_uses"])
+    }
+    conn.close()
+    return out
+
+
+def add_donation(phone: str, amount: float) -> Dict[str, Any]:
+    row_id = f"don_{now_ts()}_{abs(hash(phone)) % 100000}"
+    conn = get_conn()
+    cur = conn.cursor()
+    cur.execute("INSERT INTO donations (id, phone, amount, created_at) VALUES (?,?,?,?)", (row_id, phone, float(amount), now_ts()))
+    conn.commit()
+    conn.close()
+    return {"id": row_id, "phone": phone, "amount": float(amount)}
+
+
+def set_daily_deal(title: str, body: str) -> Dict[str, Any]:
+    conn = get_conn()
+    cur = conn.cursor()
+    cur.execute("UPDATE daily_deals SET active=0 WHERE active=1")
+    row_id = f"deal_{now_ts()}"
+    cur.execute("INSERT INTO daily_deals (id, title, body, active, created_at) VALUES (?,?,?,?,?)", (row_id, title, body, 1, now_ts()))
+    conn.commit()
+    conn.close()
+    return {"id": row_id, "title": title, "body": body}
+
+
+def get_daily_deal() -> Optional[Dict[str, Any]]:
+    conn = get_conn()
+    cur = conn.cursor()
+    row = cur.execute("SELECT * FROM daily_deals WHERE active=1 ORDER BY created_at DESC LIMIT 1").fetchone()
+    conn.close()
+    if not row:
+        return None
+    return {"id": row["id"], "title": row["title"], "body": row["body"], "created_at": row["created_at"]}
+
+
+def get_driver_of_week() -> Optional[Dict[str, Any]]:
+    conn = get_conn()
+    cur = conn.cursor()
+    row = cur.execute("SELECT phone, points, rating FROM user_stats ORDER BY points DESC, rating DESC LIMIT 1").fetchone()
+    conn.close()
+    if not row:
+        return None
+    return {"phone": row["phone"], "points": row["points"], "rating": row["rating"]}
+
+
+def monetization_overview() -> Dict[str, Any]:
+    conn = get_conn()
+    cur = conn.cursor()
+    now = now_ts()
+    vip = cur.execute("SELECT COUNT(*) as c FROM vip_drivers WHERE active=1 AND expires_at>?", (now,)).fetchone()["c"]
+    boosts = cur.execute("SELECT COUNT(*) as c FROM boosts WHERE active=1 AND expires_at>?", (now,)).fetchone()["c"]
+    promo = cur.execute("SELECT COUNT(*) as c FROM promo_codes WHERE active=1").fetchone()["c"]
+    donations = cur.execute("SELECT COALESCE(SUM(amount),0) as s FROM donations").fetchone()["s"]
+    conn.close()
+    return {
+        "vip_active": int(vip),
+        "boost_active": int(boosts),
+        "promo_active": int(promo),
+        "donations_total": float(donations or 0),
+        "driver_of_week": get_driver_of_week(),
+        "daily_deal": get_daily_deal(),
+    }
+
+
+# ---------------- Ride Orders ----------------
+def create_order(data: Dict[str, Any]) -> Dict[str, Any]:
+    order_id = f"ord_{now_ts()}_{abs(hash((data.get('client_phone','') + data.get('from','')))) % 100000}"
+    now = now_ts()
+    conn = get_conn()
+    cur = conn.cursor()
+    cur.execute("""
+      INSERT INTO ride_orders (
+        id, client_phone, client_name, from_place, to_place, ride_time,
+        people_count, note, status, driver_phone, offer_price,
+        cancel_reason, canceled_by, created_at, updated_at
+      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
+    """, (
+      order_id,
+      str(data.get("client_phone", "")),
+      str(data.get("client_name", "")),
+      str(data.get("from", "")),
+      str(data.get("to", "")),
+      str(data.get("ride_time", "")),
+      int(data.get("people_count", 1)),
+      str(data.get("note", "")),
+      "pending",
+      "",
+      "",
+      "",
+      "",
+      now,
+      now
+    ))
+    cur.execute("INSERT INTO order_events (order_id, event_type, actor_phone, payload, created_at) VALUES (?,?,?,?,?)",
+                (order_id, "created", str(data.get("client_phone", "")), "", now))
+    conn.commit()
+    conn.close()
+    return get_order(order_id)
+
+
+def _row_to_order(row: Any) -> Dict[str, Any]:
+    return {
+      "id": row["id"],
+      "client_phone": row["client_phone"],
+      "client_name": row["client_name"],
+      "from": row["from_place"],
+      "to": row["to_place"],
+      "ride_time": row["ride_time"],
+      "people_count": row["people_count"],
+      "note": row["note"],
+      "status": row["status"],
+      "driver_phone": row["driver_phone"],
+      "offer_price": row["offer_price"],
+      "cancel_reason": row["cancel_reason"],
+      "canceled_by": row["canceled_by"],
+      "created_at": row["created_at"],
+      "updated_at": row["updated_at"],
+    }
+
+
+def get_order(order_id: str) -> Optional[Dict[str, Any]]:
+    conn = get_conn()
+    cur = conn.cursor()
+    row = cur.execute("SELECT * FROM ride_orders WHERE id=?", (order_id,)).fetchone()
+    conn.close()
+    if not row:
+        return None
+    return _row_to_order(row)
+
+
+def list_orders(phone: str = "", role: str = "") -> List[Dict[str, Any]]:
+    conn = get_conn()
+    cur = conn.cursor()
+    q = "SELECT * FROM ride_orders"
+    params = []
+    if role == "client" and phone:
+        q += " WHERE client_phone=?"
+        params.append(phone)
+    elif role == "driver" and phone:
+        q += " WHERE (driver_phone=? OR status='pending')"
+        params.append(phone)
+    elif phone:
+        q += " WHERE client_phone=? OR driver_phone=?"
+        params.extend([phone, phone])
+    q += " ORDER BY created_at DESC"
+    rows = cur.execute(q, tuple(params)).fetchall()
+    conn.close()
+    return [_row_to_order(r) for r in rows]
+
+
+def respond_order(order_id: str, driver_phone: str, action: str, offer_price: str = "", reason: str = "") -> Optional[Dict[str, Any]]:
+    order = get_order(order_id)
+    if not order:
+        return None
+    if order["status"] != "pending":
+        return order
+
+    now = now_ts()
+    conn = get_conn()
+    cur = conn.cursor()
+    if action == "accept":
+        cur.execute("UPDATE ride_orders SET status='accepted', driver_phone=?, offer_price=?, updated_at=? WHERE id=?", (driver_phone, offer_price, now, order_id))
+        payload = json_dumps({"offer_price": offer_price})
+        ev = "accepted"
+    else:
+        cur.execute("UPDATE ride_orders SET status='pending', updated_at=? WHERE id=?", (now, order_id))
+        payload = json_dumps({"reason": reason})
+        ev = "rejected"
+    cur.execute("INSERT INTO order_events (order_id, event_type, actor_phone, payload, created_at) VALUES (?,?,?,?,?)", (order_id, ev, driver_phone, payload, now))
+    conn.commit(); conn.close()
+    return get_order(order_id)
+
+
+def update_order_status(order_id: str, status: str, actor_phone: str) -> Optional[Dict[str, Any]]:
+    allowed = {"accepted", "on_the_way", "done"}
+    if status not in allowed:
+        return None
+    order = get_order(order_id)
+    if not order:
+        return None
+    now = now_ts()
+    conn = get_conn(); cur = conn.cursor()
+    cur.execute("UPDATE ride_orders SET status=?, updated_at=? WHERE id=?", (status, now, order_id))
+    cur.execute("INSERT INTO order_events (order_id, event_type, actor_phone, payload, created_at) VALUES (?,?,?,?,?)", (order_id, status, actor_phone, "", now))
+    conn.commit(); conn.close()
+    return get_order(order_id)
+
+
+def cancel_order(order_id: str, actor_phone: str, reason: str) -> Optional[Dict[str, Any]]:
+    order = get_order(order_id)
+    if not order:
+        return None
+    now = now_ts()
+    conn = get_conn(); cur = conn.cursor()
+    cur.execute("UPDATE ride_orders SET status='canceled', canceled_by=?, cancel_reason=?, updated_at=? WHERE id=?", (actor_phone, reason, now, order_id))
+    cur.execute("INSERT INTO order_events (order_id, event_type, actor_phone, payload, created_at) VALUES (?,?,?,?,?)", (order_id, "canceled", actor_phone, json_dumps({"reason": reason}), now))
+    conn.commit(); conn.close()
+    return get_order(order_id)
+
+
+def order_stats() -> Dict[str, Any]:
+    conn = get_conn(); cur = conn.cursor()
+    total = cur.execute("SELECT COUNT(*) c FROM ride_orders").fetchone()["c"]
+    pending = cur.execute("SELECT COUNT(*) c FROM ride_orders WHERE status='pending'").fetchone()["c"]
+    accepted = cur.execute("SELECT COUNT(*) c FROM ride_orders WHERE status='accepted'").fetchone()["c"]
+    on_the_way = cur.execute("SELECT COUNT(*) c FROM ride_orders WHERE status='on_the_way'").fetchone()["c"]
+    done = cur.execute("SELECT COUNT(*) c FROM ride_orders WHERE status='done'").fetchone()["c"]
+    canceled = cur.execute("SELECT COUNT(*) c FROM ride_orders WHERE status='canceled'").fetchone()["c"]
+    reasons_rows = cur.execute("SELECT cancel_reason, COUNT(*) c FROM ride_orders WHERE status='canceled' GROUP BY cancel_reason ORDER BY c DESC").fetchall()
+    conn.close()
+    return {
+      "total": int(total), "pending": int(pending), "accepted": int(accepted),
+      "on_the_way": int(on_the_way), "done": int(done), "canceled": int(canceled),
+      "cancel_reasons": [{"reason": r["cancel_reason"] or "unknown", "count": int(r["c"])} for r in reasons_rows]
+    }
+
+
+def json_dumps(obj: Any) -> str:
+    try:
+        return json.dumps(obj, ensure_ascii=False)
+    except Exception:
+        return "{}"
+
+
+# ---------------- Drivers / Reviews / Trust ----------------
+def ensure_driver_profile(phone: str) -> None:
+    conn = get_conn(); cur = conn.cursor()
+    cur.execute("INSERT OR IGNORE INTO driver_profiles (phone, updated_at) VALUES (?,?)", (phone, now_ts()))
+    conn.commit(); conn.close()
+
+
+def set_driver_verified(phone: str, verified: int) -> Dict[str, Any]:
+    ensure_driver_profile(phone)
+    conn = get_conn(); cur = conn.cursor()
+    cur.execute("UPDATE driver_profiles SET verified=?, updated_at=? WHERE phone=?", (1 if verified else 0, now_ts(), phone))
+    conn.commit(); conn.close()
+    return get_driver_profile(phone)
+
+
+def set_driver_busy(phone: str, busy: int) -> Dict[str, Any]:
+    ensure_driver_profile(phone)
+    conn = get_conn(); cur = conn.cursor()
+    available = 0 if busy else 1
+    cur.execute("UPDATE driver_profiles SET busy=?, available=?, updated_at=? WHERE phone=?", (1 if busy else 0, available, now_ts(), phone))
+    conn.commit(); conn.close()
+    return get_driver_profile(phone)
+
+
+def pin_driver(phone: str, pinned: int) -> Dict[str, Any]:
+    ensure_driver_profile(phone)
+    conn = get_conn(); cur = conn.cursor()
+    cur.execute("UPDATE driver_profiles SET pinned=?, updated_at=? WHERE phone=?", (1 if pinned else 0, now_ts(), phone))
+    conn.commit(); conn.close()
+    return get_driver_profile(phone)
+
+
+def get_driver_profile(phone: str) -> Dict[str, Any]:
+    ensure_driver_profile(phone)
+    conn = get_conn(); cur = conn.cursor()
+    r = cur.execute("SELECT * FROM driver_profiles WHERE phone=?", (phone,)).fetchone()
+    conn.close()
+    return {
+      "phone": r["phone"], "level": int(r["level"]), "trust_score": float(r["trust_score"]),
+      "verified": int(r["verified"]), "busy": int(r["busy"]), "available": int(r["available"]), "pinned": int(r["pinned"])
+    }
+
+
+def recalc_driver_level_and_trust(phone: str) -> Dict[str, Any]:
+    ensure_driver_profile(phone)
+    st = get_user_stats(phone)
+    conn = get_conn(); cur = conn.cursor()
+    rev = cur.execute("SELECT COALESCE(AVG(rating),0) a, COUNT(*) c FROM reviews WHERE driver_phone=?", (phone,)).fetchone()
+    avg_rating = float(rev["a"] or 0)
+    review_count = int(rev["c"] or 0)
+    level = 1 + min(9, st["points"] // 20)
+    trust = min(100.0, max(0.0, 40 + avg_rating * 10 + min(30, review_count) * 0.5 + min(20, st["points"]/10)))
+    cur.execute("UPDATE driver_profiles SET level=?, trust_score=?, updated_at=? WHERE phone=?", (int(level), float(trust), now_ts(), phone))
+    conn.commit(); conn.close()
+    return get_driver_profile(phone)
+
+
+def add_review(driver_phone: str, reviewer_phone: str, rating: int, comment: str = "") -> Dict[str, Any]:
+    rid = f"rev_{now_ts()}_{abs(hash(driver_phone+reviewer_phone))%100000}"
+    conn = get_conn(); cur = conn.cursor()
+    cur.execute("INSERT INTO reviews (id, driver_phone, reviewer_phone, rating, comment, created_at) VALUES (?,?,?,?,?,?)",
+                (rid, driver_phone, reviewer_phone, max(1, min(5, int(rating))), comment, now_ts()))
+    conn.commit(); conn.close()
+    prof = recalc_driver_level_and_trust(driver_phone)
+    return {"id": rid, "profile": prof}
+
+
+def list_reviews(driver_phone: str) -> List[Dict[str, Any]]:
+    conn = get_conn(); cur = conn.cursor()
+    rows = cur.execute("SELECT * FROM reviews WHERE driver_phone=? ORDER BY created_at DESC", (driver_phone,)).fetchall()
+    conn.close()
+    return [{"id":r["id"],"driver_phone":r["driver_phone"],"reviewer_phone":r["reviewer_phone"],"rating":r["rating"],"comment":r["comment"],"created_at":r["created_at"]} for r in rows]
+
+
+def top_drivers(limit: int = 10) -> List[Dict[str, Any]]:
+    conn = get_conn(); cur = conn.cursor()
+    rows = cur.execute("SELECT * FROM driver_profiles ORDER BY pinned DESC, verified DESC, trust_score DESC, level DESC LIMIT ?", (int(limit),)).fetchall()
+    conn.close()
+    return [{"phone":r["phone"],"level":r["level"],"trust_score":r["trust_score"],"verified":r["verified"],"busy":r["busy"],"available":r["available"],"pinned":r["pinned"]} for r in rows]
+
+
+# ---------------- Favorites / News / Reports / Notifications ----------------
+def toggle_favorite(user_phone: str, driver_phone: str) -> Dict[str, Any]:
+    conn = get_conn(); cur = conn.cursor()
+    ex = cur.execute("SELECT id FROM favorites WHERE user_phone=? AND driver_phone=?", (user_phone, driver_phone)).fetchone()
+    if ex:
+        cur.execute("DELETE FROM favorites WHERE id=?", (ex["id"],))
+        fav = False
+    else:
+        cur.execute("INSERT INTO favorites (user_phone, driver_phone, created_at) VALUES (?,?,?)", (user_phone, driver_phone, now_ts()))
+        fav = True
+    conn.commit(); conn.close()
+    return {"favorite": fav}
+
+
+def list_favorites(user_phone: str) -> List[Dict[str, Any]]:
+    conn = get_conn(); cur = conn.cursor()
+    rows = cur.execute("SELECT driver_phone, created_at FROM favorites WHERE user_phone=? ORDER BY created_at DESC", (user_phone,)).fetchall()
+    conn.close()
+    return [{"driver_phone":r["driver_phone"],"created_at":r["created_at"]} for r in rows]
+
+
+def add_report(ad_id: str, reporter_phone: str, reason: str) -> Dict[str, Any]:
+    rid = f"rep_{now_ts()}_{abs(hash(reporter_phone+reason))%100000}"
+    conn = get_conn(); cur = conn.cursor()
+    cur.execute("INSERT INTO reports (id, ad_id, reporter_phone, reason, created_at) VALUES (?,?,?,?,?)", (rid, ad_id, reporter_phone, reason, now_ts()))
+    conn.commit(); conn.close()
+    add_moderation_flag(reporter_phone, "report", 2, reason)
+    auto = maybe_auto_hide_ad(ad_id, threshold=3)
+    return {"id": rid, "auto_hide": auto}
+
+
+def list_reports() -> List[Dict[str, Any]]:
+    conn = get_conn(); cur = conn.cursor()
+    rows = cur.execute("SELECT * FROM reports ORDER BY created_at DESC").fetchall()
+    conn.close()
+    return [{"id":r["id"],"ad_id":r["ad_id"],"reporter_phone":r["reporter_phone"],"reason":r["reason"],"created_at":r["created_at"]} for r in rows]
+
+
+def add_news(title: str, body: str, image: str = "") -> Dict[str, Any]:
+    nid = f"news_{now_ts()}"
+    conn = get_conn(); cur = conn.cursor()
+    cur.execute("INSERT INTO news (id, title, body, image, created_at) VALUES (?,?,?,?,?)", (nid, title, body, image, now_ts()))
+    conn.commit(); conn.close()
+    return {"id": nid, "title": title, "body": body, "image": image}
+
+
+def list_news() -> List[Dict[str, Any]]:
+    conn = get_conn(); cur = conn.cursor()
+    rows = cur.execute("SELECT * FROM news ORDER BY created_at DESC").fetchall()
+    conn.close()
+    return [{"id":r["id"],"title":r["title"],"body":r["body"],"image":r["image"],"created_at":r["created_at"]} for r in rows]
+
+
+def push_notification(user_phone: str, title: str, body: str) -> Dict[str, Any]:
+    nid = f"ntf_{now_ts()}_{abs(hash(user_phone+title))%100000}"
+    conn = get_conn(); cur = conn.cursor()
+    cur.execute("INSERT INTO notifications (id, user_phone, title, body, read, created_at) VALUES (?,?,?,?,0,?)", (nid, user_phone, title, body, now_ts()))
+    conn.commit(); conn.close()
+    return {"id": nid}
+
+
+def list_notifications(user_phone: str) -> List[Dict[str, Any]]:
+    conn = get_conn(); cur = conn.cursor()
+    rows = cur.execute("SELECT * FROM notifications WHERE user_phone=? ORDER BY created_at DESC", (user_phone,)).fetchall()
+    conn.close()
+    return [{"id":r["id"],"title":r["title"],"body":r["body"],"read":r["read"],"created_at":r["created_at"]} for r in rows]
+
+
+# ---------------- Booking / Route Subscription / Moderation ----------------
+def create_booking(ad_id: str, client_phone: str, driver_phone: str, booking_time: str, seats: int) -> Dict[str, Any]:
+    bid = f"book_{now_ts()}_{abs(hash(client_phone+booking_time))%100000}"
+    conn = get_conn(); cur = conn.cursor()
+    cur.execute("INSERT INTO bookings (id, ad_id, client_phone, driver_phone, booking_time, seats, status, created_at) VALUES (?,?,?,?,?,?,?,?)",
+                (bid, ad_id, client_phone, driver_phone, booking_time, int(seats), "pending", now_ts()))
+    conn.commit(); conn.close()
+    return {"id": bid}
+
+
+def add_route_subscription(user_phone: str, from_place: str, to_place: str) -> Dict[str, Any]:
+    sid = f"sub_{now_ts()}_{abs(hash(user_phone+from_place+to_place))%100000}"
+    conn = get_conn(); cur = conn.cursor()
+    cur.execute("INSERT INTO route_subscriptions (id, user_phone, from_place, to_place, active, created_at) VALUES (?,?,?,?,1,?)",
+                (sid, user_phone, from_place, to_place, now_ts()))
+    conn.commit(); conn.close()
+    return {"id": sid}
+
+
+def list_route_subscriptions(user_phone: str) -> List[Dict[str, Any]]:
+    conn = get_conn(); cur = conn.cursor()
+    rows = cur.execute("SELECT * FROM route_subscriptions WHERE user_phone=? AND active=1 ORDER BY created_at DESC", (user_phone,)).fetchall()
+    conn.close()
+    return [{"id":r["id"],"from":r["from_place"],"to":r["to_place"],"created_at":r["created_at"]} for r in rows]
+
+
+def add_moderation_flag(actor_phone: str, kind: str, score: int, note: str = "") -> Dict[str, Any]:
+    mid = f"mod_{now_ts()}_{abs(hash(actor_phone+kind+note))%100000}"
+    conn = get_conn(); cur = conn.cursor()
+    cur.execute("INSERT INTO moderation_flags (id, actor_phone, kind, score, note, created_at) VALUES (?,?,?,?,?,?)",
+                (mid, actor_phone, kind, int(score), note, now_ts()))
+    conn.commit(); conn.close()
+    return {"id": mid}
+
+
+def anti_spam_score(actor_phone: str, window_seconds: int = 3600) -> Dict[str, Any]:
+    cutoff = now_ts() - int(window_seconds)
+    conn = get_conn(); cur = conn.cursor()
+    rows = cur.execute("SELECT COALESCE(SUM(score),0) s, COUNT(*) c FROM moderation_flags WHERE actor_phone=? AND created_at>?", (actor_phone, cutoff)).fetchone()
+    conn.close()
+    s = int(rows["s"] or 0); c = int(rows["c"] or 0)
+    level = "ok" if s < 8 else "warn" if s < 20 else "block"
+    return {"actor_phone": actor_phone, "score": s, "events": c, "level": level}
+
+
+
+def list_bookings(client_phone: str = "", driver_phone: str = "") -> List[Dict[str, Any]]:
+    conn = get_conn(); cur = conn.cursor()
+    q = "SELECT * FROM bookings"
+    params = []
+    if client_phone and driver_phone:
+        q += " WHERE client_phone=? OR driver_phone=?"
+        params += [client_phone, driver_phone]
+    elif client_phone:
+        q += " WHERE client_phone=?"
+        params += [client_phone]
+    elif driver_phone:
+        q += " WHERE driver_phone=?"
+        params += [driver_phone]
+    q += " ORDER BY created_at DESC"
+    rows = cur.execute(q, tuple(params)).fetchall()
+    conn.close()
+    return [{"id":r["id"],"ad_id":r["ad_id"],"client_phone":r["client_phone"],"driver_phone":r["driver_phone"],"booking_time":r["booking_time"],"seats":r["seats"],"status":r["status"],"created_at":r["created_at"]} for r in rows]
+
+
+def driver_calendar(driver_phone: str) -> List[Dict[str, Any]]:
+    conn = get_conn(); cur = conn.cursor()
+    rows = cur.execute("SELECT id, booking_time, seats, status, client_phone FROM bookings WHERE driver_phone=? AND status!='canceled' ORDER BY booking_time ASC", (driver_phone,)).fetchall()
+    conn.close()
+    return [{"id":r["id"],"booking_time":r["booking_time"],"seats":r["seats"],"status":r["status"],"client_phone":r["client_phone"]} for r in rows]
+
+
+def due_booking_reminders(within_minutes: int = 30) -> List[Dict[str, Any]]:
+    # expects booking_time in ISO-like "YYYY-MM-DDTHH:MM" or similar parseable by datetime.fromisoformat
+    import datetime
+    now = datetime.datetime.utcnow()
+    end = now + datetime.timedelta(minutes=int(within_minutes))
+    rows = list_bookings()
+    due = []
+    for b in rows:
+        t = str(b.get("booking_time", "")).strip().replace(" ", "T")
+        try:
+            bt = datetime.datetime.fromisoformat(t)
+        except Exception:
+            continue
+        if now <= bt <= end and b.get("status") in {"pending", "accepted"}:
+            due.append(b)
+    return due
+
+
+
+def maybe_auto_hide_ad(ad_id: str, threshold: int = 3) -> Dict[str, Any]:
+    if not ad_id:
+        return {"hidden": False, "reports": 0}
+    conn = get_conn(); cur = conn.cursor()
+    c = cur.execute("SELECT COUNT(*) c FROM reports WHERE ad_id=?", (ad_id,)).fetchone()["c"]
+    hidden = cur.execute("SELECT ad_id FROM hidden_ads WHERE ad_id=?", (ad_id,)).fetchone()
+    if int(c) >= int(threshold) and not hidden:
+        cur.execute("INSERT INTO hidden_ads (ad_id, reason, created_at) VALUES (?,?,?)", (ad_id, f"auto_flag_{c}", now_ts()))
+        conn.commit()
+        hidden = True
+    conn.close()
+    return {"hidden": bool(hidden), "reports": int(c)}
+
+
+def create_ticket(user_phone: str, subject: str, message: str) -> Dict[str, Any]:
+    tid = f"tic_{now_ts()}_{abs(hash(user_phone+subject))%100000}"
+    conn = get_conn(); cur = conn.cursor()
+    cur.execute("INSERT INTO support_tickets (id, user_phone, subject, message, status, admin_reply, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)",
+                (tid, user_phone, subject, message, "open", "", now_ts(), now_ts()))
+    conn.commit(); conn.close()
+    return {"id": tid}
+
+
+def list_tickets(user_phone: str = "") -> List[Dict[str, Any]]:
+    conn = get_conn(); cur = conn.cursor()
+    if user_phone:
+        rows = cur.execute("SELECT * FROM support_tickets WHERE user_phone=? ORDER BY created_at DESC", (user_phone,)).fetchall()
+    else:
+        rows = cur.execute("SELECT * FROM support_tickets ORDER BY created_at DESC").fetchall()
+    conn.close()
+    return [{"id":r["id"],"user_phone":r["user_phone"],"subject":r["subject"],"message":r["message"],"status":r["status"],"admin_reply":r["admin_reply"],"created_at":r["created_at"],"updated_at":r["updated_at"]} for r in rows]
+
+
+def reply_ticket(ticket_id: str, admin_reply: str, status: str = "answered") -> Optional[Dict[str, Any]]:
+    conn = get_conn(); cur = conn.cursor()
+    cur.execute("UPDATE support_tickets SET admin_reply=?, status=?, updated_at=? WHERE id=?", (admin_reply, status, now_ts(), ticket_id))
+    conn.commit()
+    row = cur.execute("SELECT * FROM support_tickets WHERE id=?", (ticket_id,)).fetchone()
+    conn.close()
+    if not row: return None
+    return {"id":row["id"],"status":row["status"],"admin_reply":row["admin_reply"]}
+
+
+def ops_analytics() -> Dict[str, Any]:
+    conn = get_conn(); cur = conn.cursor()
+    top_routes = cur.execute("SELECT from_place, to_place, COUNT(*) c FROM ads GROUP BY from_place, to_place ORDER BY c DESC LIMIT 10").fetchall()
+    top_dr = cur.execute("SELECT phone, points FROM user_stats ORDER BY points DESC LIMIT 10").fetchall()
+    total_orders = cur.execute("SELECT COUNT(*) c FROM ride_orders").fetchone()["c"]
+    canceled = cur.execute("SELECT COUNT(*) c FROM ride_orders WHERE status='canceled'").fetchone()["c"]
+    cancellation_rate = (float(canceled)/float(total_orders)*100.0) if total_orders else 0.0
+    hidden_ads = cur.execute("SELECT COUNT(*) c FROM hidden_ads").fetchone()["c"]
+    open_tickets = cur.execute("SELECT COUNT(*) c FROM support_tickets WHERE status='open'").fetchone()["c"]
+    conn.close()
+    return {
+      "top_routes": [{"from":r["from_place"],"to":r["to_place"],"count":int(r["c"])} for r in top_routes],
+      "top_drivers": [{"phone":r["phone"],"points":int(r["points"])} for r in top_dr],
+      "cancellation_rate": round(cancellation_rate,2),
+      "hidden_ads": int(hidden_ads),
+      "open_tickets": int(open_tickets)
+    }
