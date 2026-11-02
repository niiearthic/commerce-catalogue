from pathlib import Path
import sqlite3
here = Path(__file__).resolve().parent
db_path = here / "catalogue.db"
if db_path.exists():
    db_path.unlink()
with sqlite3.connect(db_path) as db:
    db.executescript((here / "schema.sql").read_text(encoding="utf-8"))
    db.executescript((here / "seed.sql").read_text(encoding="utf-8"))
print(f"Initialized {db_path}")
