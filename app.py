from pathlib import Path
import sqlite3
from flask import Flask, jsonify, request, send_from_directory

ROOT = Path(__file__).resolve().parent
DB = ROOT / "database" / "catalogue.db"
FRONTEND = ROOT / "frontend"
app = Flask(__name__, static_folder=str(FRONTEND), static_url_path="")

def connect():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def as_dict(row):
    return {k: row[k] for k in row.keys()}

@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})

@app.get("/api/categories")
def categories():
    with connect() as db:
        rows = db.execute("SELECT DISTINCT category FROM products ORDER BY category").fetchall()
    return jsonify([r["category"] for r in rows])

@app.get("/api/products")
def products():
    q = request.args.get("q", "").strip()
    category = request.args.get("category", "").strip()
    try:
        low = request.args.get("min_price", type=float)
        high = request.args.get("max_price", type=float)
        limit = request.args.get("limit", default=100, type=int)
        offset = request.args.get("offset", default=0, type=int)
    except ValueError:
        return jsonify({"error": "Invalid numeric query parameter"}), 400
    if limit is None or not 1 <= limit <= 100 or offset is None or offset < 0:
        return jsonify({"error": "limit must be 1-100 and offset >= 0"}), 400
    if low is not None and low < 0 or high is not None and high < 0:
        return jsonify({"error": "Prices must be non-negative"}), 400
    if low is not None and high is not None and low > high:
        return jsonify({"error": "min_price cannot exceed max_price"}), 400
    where, args = ["1=1"], []
    if q:
        where.append("(name LIKE ? OR description LIKE ?)")
        args += [f"%{q}%", f"%{q}%"]
    if category:
        where.append("category = ?"); args.append(category)
    if low is not None:
        where.append("price >= ?"); args.append(low)
    if high is not None:
        where.append("price <= ?"); args.append(high)
    clause = " AND ".join(where)
    with connect() as db:
        rows = db.execute(f"SELECT * FROM products WHERE {clause} ORDER BY id LIMIT ? OFFSET ?", args + [limit, offset]).fetchall()
        total = db.execute(f"SELECT COUNT(*) FROM products WHERE {clause}", args).fetchone()[0]
    return jsonify({"items": [as_dict(r) for r in rows], "total": total, "limit": limit, "offset": offset})

@app.get("/api/products/<int:product_id>")
def product_detail(product_id):
    if product_id < 1:
        return jsonify({"error": "Product id must be positive"}), 400
    with connect() as db:
        row = db.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    if row is None:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(as_dict(row))

@app.get("/")
def home():
    return send_from_directory(FRONTEND, "index.html")

@app.get("/<path:path>")
def frontend(path):
    return send_from_directory(FRONTEND, path)

if __name__ == "__main__":
    if not DB.exists():
        raise SystemExit("Run `python database/init_db.py` first.")
    app.run(host="127.0.0.1", port=5000, debug=True)
