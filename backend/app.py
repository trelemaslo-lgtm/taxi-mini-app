from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/", methods=["GET"])
def home():
    return "Backend is working"

@app.route("/api/test", methods=["GET"])
def test():
    return jsonify({"status": "ok"})

# ⚠️ ВАЖНО: для gunicorn
application = app

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
