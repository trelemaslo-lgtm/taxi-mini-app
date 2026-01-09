from flask import Flask, request, jsonify
import time

app = Flask(__name__)
ads = []  # временное хранилище

@app.route("/")
def home():
    return "Backend is working"

@app.route("/api/ads", methods=["GET"])
def get_ads():
    now = time.time()
    global ads
    ads = [a for a in ads if now - a["created_at"] < 1800]  # 30 мин
    return jsonify(ads)

@app.route("/api/ads", methods=["POST"])
def create_ad():
    data = request.json
    ad = {
        "role": data.get("role"),          # client / driver
        "route": data.get("route"),
        "time": data.get("time"),          # now / 20min / custom
        "price": data.get("price"),
        "seats": data.get("seats"),        # full / free
        "phone": data.get("phone"),
        "created_at": time.time()
    }
    ads.append(ad)
    return jsonify({"status": "ok"})

application = app

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)

