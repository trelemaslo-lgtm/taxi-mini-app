from flask import Flask, request, jsonify
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

ads = []

@app.route("/")
def home():
    return "Backend is working"

@app.route("/api/ads", methods=["GET", "POST", "OPTIONS"])
def ads_handler():
    global ads

    if request.method == "OPTIONS":
        return "", 200

    if request.method == "GET":
        now = time.time()
        ads = [a for a in ads if now - a["created_at"] < 1800]
        return jsonify(ads)

    if request.method == "POST":
        try:
            data = request.get_json(force=True)

            ad = {
                "role": data.get("role"),
                "route": data.get("route"),
                "time": data.get("time"),
                "seats": data.get("seats"),
                "price": data.get("price"),
                "phone": data.get("phone"),
                "created_at": time.time()
            }

            ads.append(ad)
            return jsonify({"status": "ok", "ad": ad})

        except Exception as e:
            return jsonify({"error": str(e)}), 500


application = app

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)

