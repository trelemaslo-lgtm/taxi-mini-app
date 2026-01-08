from flask import Flask, jsonify, request
import hmac, hashlib, urllib.parse
import os

app = Flask(__name__)

BOT_TOKEN = os.environ.get("BOT_TOKEN", "PASTE_BOT_TOKEN_HERE")

def verify_telegram_auth(init_data: str) -> dict | None:
    parsed = dict(urllib.parse.parse_qsl(init_data, keep_blank_values=True))
    hash_from_tg = parsed.pop("hash", None)
    if not hash_from_tg:
        return None

    data_check_string = "\n".join(
        f"{k}={v}" for k, v in sorted(parsed.items())
    )

    secret_key = hashlib.sha256(BOT_TOKEN.encode()).digest()
    calculated_hash = hmac.new(
        secret_key,
        data_check_string.encode(),
        hashlib.sha256
    ).hexdigest()

    if calculated_hash != hash_from_tg:
        return None

    if "user" in parsed:
        parsed["user"] = urllib.parse.unquote(parsed["user"])

    return parsed

@app.route("/", methods=["GET"])
def home():
    return "Backend is working"

@app.route("/api/test", methods=["GET"])
def test():
    return jsonify({"status": "ok"})

@app.route("/api/auth", methods=["POST"])
def auth():
    data = request.json
    init_data = data.get("initData")
    if not init_data:
        return jsonify({"error": "No initData"}), 400

    verified = verify_telegram_auth(init_data)
    if not verified:
        return jsonify({"error": "Auth failed"}), 403

    return jsonify({
        "status": "ok",
        "telegram": verified
    })
    ads = []  # временное хранилище объявлений

@app.route("/api/ads", methods=["POST"])
def create_ad():
    data = request.json

    init_data = data.get("initData")
    verified = verify_telegram_auth(init_data)
    if not verified:
        return jsonify({"error": "Auth failed"}), 403

    user = eval(verified.get("user"))  # временно, потом безопасно
    author_id = user.get("id")
    name = user.get("first_name")

    ad = {
        "author_id": author_id,
        "name": name,
        "role": data.get("role"),  # client / driver
        "route": data.get("route"),
        "time": data.get("time"),
        "price": data.get("price")
    }

    ads.append(ad)
    return jsonify({"status": "ok", "ad": ad})


# для gunicorn
application = app

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)

