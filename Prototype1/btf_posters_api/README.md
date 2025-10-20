# BTF Posters API (Django + DRF)

## Setup
```
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python3 manage.py runserver
```

## Env
- `ADMIN_KEY` protects write operations via `X-Admin-Key` header.
- `DEBUG` optional `True|False`.
- `ALLOWED_ORIGINS` comma-separated list of allowed CORS origins.

## Endpoints
- `GET   /api/posters/` list (hidden excluded)
- `POST  /api/posters/` create (requires `X-Admin-Key`)
- `GET   /api/posters/<id>/` retrieve
- `PATCH /api/posters/<id>/` update (requires `X-Admin-Key`)
- `DELETE /api/posters/<id>/` delete (requires `X-Admin-Key`)

Fields (multipart/form-data):
- title (str), year (int), award (str?), type (str?), area (str?), description (str?)
- image (file, required), pdf (file, optional), hidden (bool?)

Response includes `image_url` and `pdf_url` absolute URLs.

## Dev origins
Vite defaults:
- http://localhost:5173
- http://127.0.0.1:5173

## Example curl
```
curl -X POST http://localhost:8000/api/posters/   -H "X-Admin-Key: biotech"   -F title="Example" -F year=2024   -F image=@poster.jpg   -F pdf=@poster.pdf
```
