from flask import Flask, request, jsonify
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)  # 🔥 обязательно для Telegram Mini App

# Временное хранилище объявлений
ads = []

# Проверка, что backend жив
@app.route("/")
def home():
    return "Backend is working"

# Получить все объявления (старше 30 мин удаляются)
@app.route("/api/ads", methods=["GET"])
def get_ads():
    global ads
    now = time.time()
    ads = [a for a in ads if now - a["created_at"] < 1800]  # 30 минут
    return jsonify(ads)

# Создать объявление
@app.route("/api/ads", methods=["POST"])
def create_ad():
    try:
        data = request.get_json(force=True)

        if not data:
            return jsonify({"error": "No data"}), 400

        ad = {
            "role": data.get("role"),        # client / driver
            "route": data.get("route"),
            "time": data.get("time"),        # now / 20min
            "seats": data.get("seats"),      # full / free
            "price": data.get("price"),
            "phone": data.get("phone"),
            "created_at": time.time()
        }

        ads.append(ad)

        return jsonify({
            "status": "ok",
            "ad": ad
        })

    except Exception as e:
        return jsonify({
            "error": "Server error",
            "details": str(e)
        }), 500


# Для gunicorn (Render)
application = app

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
