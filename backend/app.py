diff --git a/backend/app.py b/backend/app.py
index 3654b951feef4dd430c3e0b19e1cc569dab3e87f..cac2d32af0e2c56be87e0c00f12a5ebe7beb10e0 100644
--- a/backend/app.py
+++ b/backend/app.py
@@ -1,52 +1,115 @@
 import os
 import time
 import uuid
+import json
+import hmac
+import hashlib
+from urllib.parse import parse_qsl
 from flask import Flask, request, jsonify
 from flask_cors import CORS
 
 import db
 
 app = Flask(__name__)
 
 # CORS
 CORS(app, resources={r"/api/*": {"origins": "*"}})
 
 # Init DB
 db.init_db()
 
+
+def verify_telegram_init_data(init_data: str, bot_token: str, max_age_seconds: int = 86400):
+    pairs = dict(parse_qsl(init_data, keep_blank_values=True))
+    received_hash = pairs.pop("hash", None)
+    if not received_hash:
+        return False, "missing_hash", None
+
+    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(pairs.items()))
+    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
+    computed_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
+
+    if not hmac.compare_digest(computed_hash, received_hash):
+        return False, "invalid_hash", None
+
+    auth_date = int(pairs.get("auth_date", "0") or 0)
+    if auth_date <= 0:
+        return False, "invalid_auth_date", None
+
+    now = int(time.time())
+    if now - auth_date > max_age_seconds:
+        return False, "stale_auth_data", None
+
+    raw_user = pairs.get("user")
+    if not raw_user:
+        return False, "missing_user", None
+
+    try:
+        user = json.loads(raw_user)
+    except Exception:
+        return False, "invalid_user_json", None
+
+    return True, "ok", {"user": user, "auth_date": auth_date}
+
+
 # ---------------- BASIC ----------------
 @app.get("/")
 def root():
     return jsonify({"ok": True, "service": "711 TAXI BACKEND", "time": int(time.time())})
 
 
 @app.get("/api/health")
 def health():
     return jsonify({"ok": True})
 
 
+
+
+@app.post("/api/auth/telegram")
+def api_auth_telegram():
+    data = request.get_json(force=True) or {}
+    init_data = (data.get("initData") or "").strip()
+    if not init_data:
+        return jsonify({"ok": False, "error": "missing_init_data"}), 400
+
+    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
+    if not bot_token:
+        return jsonify({"ok": False, "error": "missing_bot_token"}), 500
+
+    max_age_seconds = int(os.environ.get("TELEGRAM_INITDATA_MAX_AGE", "86400"))
+    ok, reason, parsed = verify_telegram_init_data(init_data, bot_token, max_age_seconds=max_age_seconds)
+    if not ok:
+        return jsonify({"ok": False, "error": reason}), 401
+
+    user = parsed["user"]
+    auth_date = parsed["auth_date"]
+    saved = db.upsert_telegram_user(user, auth_date)
+
+    return jsonify({"ok": True, "profile": saved})
+
+
 # ---------------- ADS API ----------------
 @app.get("/api/ads")
 def api_ads_list():
     ads = db.list_ads()
     # attach points + views
     for a in ads:
         a["points"] = db.get_user_stats(a["phone"])["points"]
         a["views"] = db.count_views_for_ad(a["id"])
     return jsonify(ads)
 
 
 @app.post("/api/ads")
 def api_ads_create():
     try:
         data = request.get_json(force=True) or {}
         required = ["role", "name", "phone", "from", "to", "type", "price"]
         for k in required:
             if not data.get(k):
                 return jsonify({"ok": False, "error": f"missing_{k}"}), 400
 
         ad_id = str(uuid.uuid4())
         ad = {
             "id": ad_id,
             "role": data.get("role"),
             "name": data.get("name"),
@@ -123,44 +186,476 @@ def api_ads_seats(ad_id):
     if ad["phone"] != phone:
         return jsonify({"ok": False, "error": "not_owner"}), 403
 
     seats = int(seats)
     if seats < 0: seats = 0
     if seats > 6: seats = 6
 
     ok = db.update_seats(ad_id, seats)
     return jsonify({"ok": ok, "seats": seats})
 
 
 @app.delete("/api/ads/<ad_id>")
 def api_ads_delete(ad_id):
     data = request.get_json(force=True) or {}
     phone = data.get("phone")
     if not phone:
         return jsonify({"ok": False, "error": "missing_phone"}), 400
 
     ok = db.delete_ad(ad_id, phone)
     if not ok:
         return jsonify({"ok": False, "error": "not_allowed"}), 403
 
     return jsonify({"ok": True})
 
 
+
+
+# ---------------- ORDERS (Ride Request) ----------------
+@app.post("/api/orders")
+def api_orders_create():
+    data = request.get_json(force=True) or {}
+    required = ["client_phone", "from", "to", "ride_time", "people_count"]
+    for k in required:
+        if not data.get(k):
+            return jsonify({"ok": False, "error": f"missing_{k}"}), 400
+
+    order = db.create_order({
+        "client_phone": str(data.get("client_phone", "")).strip(),
+        "client_name": str(data.get("client_name", "")).strip(),
+        "from": str(data.get("from", "")).strip(),
+        "to": str(data.get("to", "")).strip(),
+        "ride_time": str(data.get("ride_time", "")).strip(),
+        "people_count": int(data.get("people_count", 1)),
+        "note": str(data.get("note", "")).strip(),
+    })
+    return jsonify({"ok": True, "order": order})
+
+
+@app.get("/api/orders")
+def api_orders_list():
+    phone = str(request.args.get("phone", "")).strip()
+    role = str(request.args.get("role", "")).strip()
+    return jsonify(db.list_orders(phone=phone, role=role))
+
+
+@app.get("/api/orders/stats")
+def api_orders_stats():
+    return jsonify({"ok": True, "stats": db.order_stats()})
+
+
+@app.post("/api/orders/<order_id>/respond")
+def api_orders_respond(order_id):
+    data = request.get_json(force=True) or {}
+    driver_phone = str(data.get("driver_phone", "")).strip()
+    action = str(data.get("action", "")).strip()  # accept|reject
+    offer_price = str(data.get("offer_price", "")).strip()
+    reason = str(data.get("reason", "")).strip()
+
+    if not driver_phone:
+        return jsonify({"ok": False, "error": "missing_driver_phone"}), 400
+    if action not in {"accept", "reject"}:
+        return jsonify({"ok": False, "error": "invalid_action"}), 400
+
+    order = db.respond_order(order_id, driver_phone=driver_phone, action=action, offer_price=offer_price, reason=reason)
+    if not order:
+        return jsonify({"ok": False, "error": "not_found"}), 404
+    return jsonify({"ok": True, "order": order})
+
+
+@app.post("/api/orders/<order_id>/status")
+def api_orders_status(order_id):
+    data = request.get_json(force=True) or {}
+    status = str(data.get("status", "")).strip()  # accepted|on_the_way|done
+    actor_phone = str(data.get("actor_phone", "")).strip()
+    if not actor_phone:
+        return jsonify({"ok": False, "error": "missing_actor_phone"}), 400
+
+    order = db.update_order_status(order_id, status=status, actor_phone=actor_phone)
+    if not order:
+        return jsonify({"ok": False, "error": "not_found_or_invalid_status"}), 404
+    return jsonify({"ok": True, "order": order})
+
+
+@app.post("/api/orders/<order_id>/cancel")
+def api_orders_cancel(order_id):
+    data = request.get_json(force=True) or {}
+    actor_phone = str(data.get("actor_phone", "")).strip()
+    reason = str(data.get("reason", "")).strip()
+    if not actor_phone:
+        return jsonify({"ok": False, "error": "missing_actor_phone"}), 400
+    if not reason:
+        return jsonify({"ok": False, "error": "missing_reason"}), 400
+
+    order = db.cancel_order(order_id, actor_phone=actor_phone, reason=reason)
+    if not order:
+        return jsonify({"ok": False, "error": "not_found"}), 404
+    return jsonify({"ok": True, "order": order})
+
+
 # ---------------- USERS STATS ----------------
 @app.get("/api/users/<path:phone>/stats")
 def api_user_stats(phone):
     st = db.get_user_stats(phone)
     return jsonify(st)
 
 
 # ---------------- ADMIN ----------------
 @app.get("/api/admin/analytics")
 def api_admin_analytics():
     # later secure by ADMIN_TELEGRAM_ID + initData validation
     return jsonify(db.analytics())
 
 
+
+
+@app.get("/api/admin/monetization")
+def api_admin_monetization():
+    return jsonify(db.monetization_overview())
+
+
+@app.post("/api/admin/vip/grant")
+def api_admin_vip_grant():
+    data = request.get_json(force=True) or {}
+    phone = str(data.get("phone", "")).strip()
+    days = int(data.get("days", 30))
+    if not phone:
+        return jsonify({"ok": False, "error": "missing_phone"}), 400
+    row = db.grant_vip(phone, days)
+    return jsonify({"ok": True, "vip": row})
+
+
+@app.post("/api/admin/boost")
+def api_admin_boost():
+    data = request.get_json(force=True) or {}
+    ad_id = str(data.get("ad_id", "")).strip()
+    days = int(data.get("days", 7))
+    ad = db.get_ad(ad_id)
+    if not ad:
+        return jsonify({"ok": False, "error": "ad_not_found"}), 404
+    row = db.boost_ad(ad_id, ad.get("phone", ""), days)
+    return jsonify({"ok": True, "boost": row})
+
+
+@app.post("/api/admin/promo")
+def api_admin_promo_create():
+    data = request.get_json(force=True) or {}
+    code = str(data.get("code", "")).strip()
+    discount = int(data.get("discount_percent", 10))
+    max_uses = int(data.get("max_uses", 1))
+    if not code:
+        return jsonify({"ok": False, "error": "missing_code"}), 400
+    row = db.create_promo(code, discount, max_uses)
+    return jsonify({"ok": True, "promo": row})
+
+
+@app.post("/api/promo/apply")
+def api_promo_apply():
+    data = request.get_json(force=True) or {}
+    code = str(data.get("code", "")).strip()
+    if not code:
+        return jsonify({"ok": False, "error": "missing_code"}), 400
+    row = db.apply_promo(code)
+    if not row:
+        return jsonify({"ok": False, "error": "invalid_or_exhausted"}), 400
+    return jsonify({"ok": True, "promo": row})
+
+
+@app.post("/api/donate")
+def api_donate():
+    data = request.get_json(force=True) or {}
+    phone = str(data.get("phone", "")).strip()
+    amount = float(data.get("amount", 0) or 0)
+    if amount <= 0:
+        return jsonify({"ok": False, "error": "invalid_amount"}), 400
+    row = db.add_donation(phone, amount)
+    return jsonify({"ok": True, "donation": row})
+
+
+@app.get("/api/driver-of-week")
+def api_driver_of_week():
+    return jsonify({"ok": True, "driver": db.get_driver_of_week()})
+
+
+@app.get("/api/daily-deal")
+def api_daily_deal_get():
+    return jsonify({"ok": True, "deal": db.get_daily_deal()})
+
+
+@app.post("/api/admin/daily-deal")
+def api_daily_deal_set():
+    data = request.get_json(force=True) or {}
+    title = str(data.get("title", "")).strip()
+    body = str(data.get("body", "")).strip()
+    if not title or not body:
+        return jsonify({"ok": False, "error": "missing_fields"}), 400
+    row = db.set_daily_deal(title, body)
+    return jsonify({"ok": True, "deal": row})
+
+
+
+# ---------------- SOCIAL / TRUST / REVIEWS ----------------
+@app.get("/api/drivers/top")
+def api_top_drivers():
+    limit = int(request.args.get("limit", "10"))
+    return jsonify({"ok": True, "drivers": db.top_drivers(limit=limit)})
+
+
+@app.get("/api/drivers/<path:phone>/profile")
+def api_driver_profile(phone):
+    return jsonify({"ok": True, "profile": db.get_driver_profile(phone)})
+
+
+@app.post("/api/drivers/<path:phone>/review")
+def api_driver_review(phone):
+    data = request.get_json(force=True) or {}
+    reviewer_phone = str(data.get("reviewer_phone", "")).strip()
+    rating = int(data.get("rating", 0))
+    comment = str(data.get("comment", "")).strip()
+    if not reviewer_phone or not rating:
+      return jsonify({"ok": False, "error": "missing_fields"}), 400
+    row = db.add_review(phone, reviewer_phone, rating, comment)
+    return jsonify({"ok": True, "review": row})
+
+
+@app.get("/api/drivers/<path:phone>/reviews")
+def api_driver_reviews(phone):
+    return jsonify({"ok": True, "reviews": db.list_reviews(phone)})
+
+
+@app.post("/api/admin/drivers/<path:phone>/verify")
+def api_admin_verify_driver(phone):
+    data = request.get_json(force=True) or {}
+    verified = int(data.get("verified", 1))
+    return jsonify({"ok": True, "profile": db.set_driver_verified(phone, verified)})
+
+
+@app.post("/api/admin/drivers/<path:phone>/pin")
+def api_admin_pin_driver(phone):
+    data = request.get_json(force=True) or {}
+    pinned = int(data.get("pinned", 1))
+    return jsonify({"ok": True, "profile": db.pin_driver(phone, pinned)})
+
+
+@app.post("/api/drivers/<path:phone>/availability")
+def api_driver_availability(phone):
+    data = request.get_json(force=True) or {}
+    busy = int(data.get("busy", 0))
+    return jsonify({"ok": True, "profile": db.set_driver_busy(phone, busy)})
+
+
+# ---------------- Favorites / Reports / News ----------------
+@app.post("/api/favorites/toggle")
+def api_favorites_toggle():
+    data = request.get_json(force=True) or {}
+    user_phone = str(data.get("user_phone", "")).strip()
+    driver_phone = str(data.get("driver_phone", "")).strip()
+    if not user_phone or not driver_phone:
+      return jsonify({"ok": False, "error": "missing_fields"}), 400
+    return jsonify({"ok": True, **db.toggle_favorite(user_phone, driver_phone)})
+
+
+@app.get("/api/favorites")
+def api_favorites_list():
+    user_phone = str(request.args.get("user_phone", "")).strip()
+    return jsonify({"ok": True, "favorites": db.list_favorites(user_phone)})
+
+
+@app.post("/api/reports")
+def api_reports_create():
+    data = request.get_json(force=True) or {}
+    ad_id = str(data.get("ad_id", "")).strip()
+    reporter_phone = str(data.get("reporter_phone", "")).strip()
+    reason = str(data.get("reason", "")).strip()
+    if not reporter_phone or not reason:
+      return jsonify({"ok": False, "error": "missing_fields"}), 400
+    return jsonify({"ok": True, "report": db.add_report(ad_id, reporter_phone, reason)})
+
+
+@app.get("/api/admin/reports")
+def api_reports_list():
+    return jsonify({"ok": True, "reports": db.list_reports()})
+
+
+@app.post("/api/admin/news")
+def api_news_create():
+    data = request.get_json(force=True) or {}
+    title = str(data.get("title", "")).strip()
+    body = str(data.get("body", "")).strip()
+    image = str(data.get("image", "")).strip()
+    if not title or not body:
+      return jsonify({"ok": False, "error": "missing_fields"}), 400
+    return jsonify({"ok": True, "news": db.add_news(title, body, image)})
+
+
+@app.get("/api/news")
+def api_news_list():
+    return jsonify({"ok": True, "news": db.list_news()})
+
+
+# ---------------- Notifications / Booking / Subscription / Moderation ----------------
+@app.post("/api/notifications/push")
+def api_notifications_push():
+    data = request.get_json(force=True) or {}
+    user_phone = str(data.get("user_phone", "")).strip()
+    title = str(data.get("title", "")).strip()
+    body = str(data.get("body", "")).strip()
+    if not user_phone or not title:
+      return jsonify({"ok": False, "error": "missing_fields"}), 400
+    return jsonify({"ok": True, "notification": db.push_notification(user_phone, title, body)})
+
+
+@app.get("/api/notifications")
+def api_notifications_list():
+    user_phone = str(request.args.get("user_phone", "")).strip()
+    return jsonify({"ok": True, "notifications": db.list_notifications(user_phone)})
+
+
+@app.post("/api/bookings")
+def api_booking_create():
+    data = request.get_json(force=True) or {}
+    ad_id = str(data.get("ad_id", "")).strip()
+    client_phone = str(data.get("client_phone", "")).strip()
+    driver_phone = str(data.get("driver_phone", "")).strip()
+    booking_time = str(data.get("booking_time", "")).strip()
+    seats = int(data.get("seats", 1))
+    if not client_phone or not booking_time:
+      return jsonify({"ok": False, "error": "missing_fields"}), 400
+    row = db.create_booking(ad_id, client_phone, driver_phone, booking_time, seats)
+    if ad_id and seats > 0:
+      ad = db.get_ad(ad_id)
+      if ad:
+        new_seats = max(0, int(ad.get("seats", 0)) - int(seats))
+        db.update_seats(ad_id, new_seats)
+    return jsonify({"ok": True, "booking": row})
+
+
+
+
+@app.get("/api/bookings")
+def api_bookings_list():
+    client_phone = str(request.args.get("client_phone", "")).strip()
+    driver_phone = str(request.args.get("driver_phone", "")).strip()
+    return jsonify({"ok": True, "bookings": db.list_bookings(client_phone=client_phone, driver_phone=driver_phone)})
+
+
+@app.get("/api/drivers/<path:phone>/calendar")
+def api_driver_calendar(phone):
+    return jsonify({"ok": True, "calendar": db.driver_calendar(phone)})
+
+
+@app.get("/api/bookings/reminders")
+def api_booking_reminders():
+    within = int(request.args.get("within_minutes", "30"))
+    # For bot worker / cron polling: returns bookings that need 30-min reminder ping
+    return jsonify({"ok": True, "reminders": db.due_booking_reminders(within_minutes=within)})
+
+
+@app.post("/api/subscriptions/routes")
+def api_route_subscribe():
+    data = request.get_json(force=True) or {}
+    user_phone = str(data.get("user_phone", "")).strip()
+    from_place = str(data.get("from", "")).strip()
+    to_place = str(data.get("to", "")).strip()
+    if not user_phone or not from_place or not to_place:
+      return jsonify({"ok": False, "error": "missing_fields"}), 400
+    return jsonify({"ok": True, "subscription": db.add_route_subscription(user_phone, from_place, to_place)})
+
+
+@app.get("/api/subscriptions/routes")
+def api_route_subscriptions_list():
+    user_phone = str(request.args.get("user_phone", "")).strip()
+    return jsonify({"ok": True, "subscriptions": db.list_route_subscriptions(user_phone)})
+
+
+@app.get("/api/moderation/score")
+def api_moderation_score():
+    actor_phone = str(request.args.get("actor_phone", "")).strip()
+    if not actor_phone:
+      return jsonify({"ok": False, "error": "missing_actor_phone"}), 400
+    return jsonify({"ok": True, "score": db.anti_spam_score(actor_phone)})
+
+
+
+# ---------------- Moderator / Support Center ----------------
+@app.post("/api/support/tickets")
+def api_support_ticket_create():
+    data = request.get_json(force=True) or {}
+    user_phone = str(data.get("user_phone", "")).strip()
+    subject = str(data.get("subject", "")).strip()
+    message = str(data.get("message", "")).strip()
+    if not user_phone or not subject or not message:
+        return jsonify({"ok": False, "error": "missing_fields"}), 400
+    row = db.create_ticket(user_phone, subject, message)
+    return jsonify({"ok": True, "ticket": row})
+
+
+@app.get("/api/support/tickets")
+def api_support_tickets_list():
+    user_phone = str(request.args.get("user_phone", "")).strip()
+    return jsonify({"ok": True, "tickets": db.list_tickets(user_phone=user_phone)})
+
+
+@app.post("/api/support/tickets/<ticket_id>/reply")
+def api_support_ticket_reply(ticket_id):
+    data = request.get_json(force=True) or {}
+    reply = str(data.get("reply", "")).strip()
+    status = str(data.get("status", "answered")).strip() or "answered"
+    if not reply:
+        return jsonify({"ok": False, "error": "missing_reply"}), 400
+    row = db.reply_ticket(ticket_id, reply, status=status)
+    if not row:
+        return jsonify({"ok": False, "error": "not_found"}), 404
+    return jsonify({"ok": True, "ticket": row})
+
+
+@app.get("/api/admin/ops-analytics")
+def api_admin_ops_analytics():
+    return jsonify({"ok": True, "analytics": db.ops_analytics()})
+
+
+# ---------------- Integrations ----------------
+@app.get("/api/integrations/payments/providers")
+def api_payment_providers():
+    return jsonify({
+        "ok": True,
+        "providers": [
+            {"code": "click", "status": "planned"},
+            {"code": "payme", "status": "planned"}
+        ]
+    })
+
+
+@app.get("/api/maps/deeplink")
+def api_maps_deeplink():
+    lat = str(request.args.get("lat", "")).strip()
+    lng = str(request.args.get("lng", "")).strip()
+    from_place = str(request.args.get("from", "")).strip()
+    to_place = str(request.args.get("to", "")).strip()
+
+    q = f"{from_place} {to_place}".strip()
+    if lat and lng:
+        yandex = f"https://yandex.com/maps/?rtext=~{lat},{lng}"
+        google = f"https://www.google.com/maps/dir/?api=1&destination={lat},{lng}"
+    else:
+        yandex = f"https://yandex.com/maps/?text={q}" if q else "https://yandex.com/maps"
+        google = f"https://www.google.com/maps/search/?api=1&query={q}" if q else "https://www.google.com/maps"
+
+    return jsonify({"ok": True, "yandex": yandex, "google": google})
+
+
+@app.post("/api/integrations/bot/status")
+def api_bot_status_update():
+    data = request.get_json(force=True) or {}
+    user_phone = str(data.get("user_phone", "")).strip()
+    title = str(data.get("title", "Status update")).strip()
+    body = str(data.get("body", "")).strip()
+    if not user_phone:
+        return jsonify({"ok": False, "error": "missing_user_phone"}), 400
+    row = db.push_notification(user_phone, title, body)
+    return jsonify({"ok": True, "queued": row, "note": "Bot sender worker can poll notification history"})
+
 # ---------------- RUN ----------------
 if __name__ == "__main__":
     # Render uses PORT env
     port = int(os.environ.get("PORT", "10000"))
     app.run(host="0.0.0.0", port=port)
