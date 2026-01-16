import json
import time
from pathlib import Path

DB_FILE = Path("db.json")

def _load():
    if not DB_FILE.exists():
        DB_FILE.write_text(json.dumps({"ads": [], "likes": {}}, ensure_ascii=False), encoding="utf-8")
    return json.loads(DB_FILE.read_text(encoding="utf-8"))

def _save(data):
    DB_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

def init_db():
    _load()

def cleanup_ads(max_age_ms: int):
    data = _load()
    now = int(time.time() * 1000)
    before = len(data["ads"])
    data["ads"] = [a for a in data["ads"] if now - int(a.get("created_at", 0)) < max_age_ms]
    if len(data["ads"]) != before:
        _save(data)

def add_ad(ad: dict):
    data = _load()
    data["ads"].append(ad)
    _save(data)

def get_ads():
    data = _load()
    # newest first
    return sorted(data["ads"], key=lambda x: x.get("created_at", 0), reverse=True)

def like_phone(phone: str) -> int:
    data = _load()
    likes = data["likes"].get(phone, 0) + 1
    data["likes"][phone] = likes
    _save(data)
    return likes

def get_points(phone: str) -> int:
    data = _load()
    return int(data["likes"].get(phone, 0))

def top_list(limit: int = 20):
    data = _load()
    items = [{"phone": p, "likes": int(v)} for p, v in data["likes"].items()]
    items.sort(key=lambda x: x["likes"], reverse=True)
    return items[:limit]

