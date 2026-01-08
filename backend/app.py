from flask import Flask, request, jsonify
import hmac, hashlib, urllib.parse, os, time

app = Flask(__name__)

BOT_TOKEN = os.environ.get("BOT_TOKEN")

ads = []  # временное хранилище объявлений

# --- Telegram auth ---
def verify_telegram_auth(init_data: str):
    parsed = dict(urllib.parse.parse_qsl(init_data))
    hash_from_tg = parsed.pop("hash", None)
    if not hash_from_tg:
        return None

    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(parsed.items()))
    secret_key = hashlib.sha256(BOT_TOKEN.encode()).digest()
    calculated_hash = hmac.new(
        secret_key, data_check_string.encode(), hashlib.sha256
    ).hexdigest()

    if calculated_hash != hash_from_tg:
        return None

    if "user" in parsed:
        parsed["user"] = urllib.parse.unquote(parsed["user"])

    return parsed


@app.route("/")
def home():
    return "Backend is working"


@app.route("/api/ads", methods=["GET"])
def get_ads():
    # автоудаление объявлений старше 30 минут
    now = time.time()
    global ads
    ads = [a for a in ads if now - a["created_at"] < 1800]
    return jsonify(ads)


@app.route("/api/ads", methods=["POST"])
def create_ad():
    data = request.json
    verified = verify_telegram_auth(data.get("initData"))
    if not verified:
        return jsonify({"error": "Auth failed"}), 403

    user = eval(verified["user"])

    ad = {
        "author_id": user["id"],
        "name": user.get("first_name", ""),
        "role": data.get("role"),            # client / driver
        "route": data.get("route"),
        "time": data.get("time"),
        "price": data.get("price"),
        "phone": data.get("phone"),
        "created_at": time.time()
    }

    ads.append(ad)
    return jsonify({"status": "ok"})


application = app

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
