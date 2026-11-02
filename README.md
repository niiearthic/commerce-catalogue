# Forma Market — Full-Stack E-Commerce Catalogue (Part 1)

A responsive product listing site using **HTML/CSS/vanilla JavaScript**, a **Flask REST API**, and a **SQLite relational database**. The frontend retrieves all product data through the backend API; it never accesses the database directly.

## Features
- Product listing with image, name, description, category, price, and stock
- Product details modal fetched from the REST API
- Search, category filtering, and price/name sorting
- Validated API query parameters, parameterized SQL, and HTTP status codes
- SQL schema and twelve seeded sample products across five categories
- Responsive layout and keyboard support (Enter/Space, Escape, Ctrl/Cmd+K)

## Prerequisites
- Python 3.10+
- pip
- Modern browser
- Internet connection for product photography and Google Fonts (the app/database run locally)

## Run locally
From the repository root:

**Windows PowerShell**
```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python database/init_db.py
python app.py
```

**macOS/Linux**
```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python database/init_db.py
python app.py
```

Open http://127.0.0.1:5000. Keep the terminal running while using the site. Re-running `python database/init_db.py` resets the sample database.

## Architecture
```text
Browser (frontend/index.html, styles.css, app.js)
       | HTTP + JSON fetch
       v
Flask REST API (app.py)
       | parameterized SQL
       v
SQLite (database/catalogue.db)
```
- **Frontend:** listing, search/filter/sort, and product details view.
- **Backend:** serves frontend assets and API endpoints.
- **Database:** a `products` table with indexes on category and price.

## API endpoints
Base URL: `http://127.0.0.1:5000`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check (`200`) |
| GET | `/api/categories` | Distinct category names (`200`) |
| GET | `/api/products` | Product list, optional filters (`200`) |
| GET | `/api/products/<id>` | Single product (`200`, `400` for invalid ID, `404` if absent) |

List query parameters:
- `q`: substring search in product name and description
- `category`: exact category
- `min_price`, `max_price`: non-negative numeric price bounds
- `limit`: 1–100 (default 100)
- `offset`: non-negative (default 0)

Example: `/api/products?q=headphones&category=Electronics&min_price=500&max_price=5000&limit=20&offset=0`

Invalid query values return `400 Bad Request`; a missing product returns `404 Not Found`. Product list JSON contains `items`, `total`, `limit`, and `offset`.

## Database
`database/schema.sql` creates `products(id, name, description, price, image_url, category, stock, created_at)`, with constraints and indexes. `database/seed.sql` inserts twelve sample products across Fashion, Electronics, Home & Living, Beauty, and Lifestyle. `database/init_db.py` initializes `database/catalogue.db`.

## Screenshots
Run the application and capture the live product listing and product-details modal in your browser for submission evidence. The screenshots should show the current redesigned interface.

## Git repository submission
```bash
git init
git add .
git commit -m "Build full-stack product catalogue"
```
Create an empty GitHub/GitLab repository, then:
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```
Replace the placeholder URL with your own repository URL.

## Project structure
```text
commerce_catalogue/
├── app.py
├── requirements.txt
├── README.md
├── .gitignore
├── frontend/ (index.html, styles.css, app.js)
├── database/ (schema.sql, seed.sql, init_db.py, catalogue.db)
├── backend/README.md
└── screenshots/ (add your live application screenshots here)
```

**Scope:** This is Part 1 only. Shopping cart, authentication/authorization, migrations, logging, and monitoring are later-stage additions and are not claimed as implemented.


## Product photography
The catalogue uses the five category image URLs supplied for this project, plus supporting product photographs from Unsplash. Images are loaded from their original hosts, so an internet connection is required to display them. If an external image host changes or blocks an image, replace that product's `image_url` value in `database/seed.sql` and rerun `python database/init_db.py`.

The catalogue categories are Fashion, Electronics, Home & Living, Beauty, and Lifestyle. Product names, descriptions, prices, and stock levels are sample data and can be edited in `database/seed.sql`.
