@app.route("/api/ads", methods=["POST"])
def api_ads_post():
    cleanup()
    data = request.get_json(force=True) or {}

    if not data.get("phone"):
        return jsonify({"error": "phone required"}), 400
    if not data.get("from") or not data.get("to") or not data.get("price"):
        return jsonify({"error": "from/to/price required"}), 400

    ad = {
        "id": str(uuid.uuid4()),
        "role": data.get("role", "driver"),
        "name": data.get("name", "—"),
        "phone": data.get("phone"),
        "carBrand": data.get("carBrand", ""),
        "carNumber": data.get("carNumber", ""),
        "photo": data.get("photo", ""),
        "from": data.get("from", ""),
        "to": data.get("to", ""),
        "type": data.get("type", "now"),
        "price": str(data.get("price", "")),
        "seats": int(data.get("seats", 0)),
        "comment": data.get("comment", ""),
        "lat": data.get("lat", None),
        "lng": data.get("lng", None),
        "created_at": int(time.time() * 1000)
    }

    add_ad(ad)
    return jsonify({"ok": True, "ad": ad})


@app.route("/api/like", methods=["POST"])
def api_like():
    data = request.get_json(force=True) or {}
    phone = data.get("phone", "")
    if not phone:
        return jsonify({"error": "phone required"}), 400

    likes = like_phone(phone)
    return jsonify({"ok": True, "phone": phone, "likes": likes})
