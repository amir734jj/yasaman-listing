# Yasaman Listing

A free classifieds site for Iran — think a small, local Craigslist. People can post things for sale with photos and a price, browse by city, and just list and find stuff. It speaks both Farsi (RTL) and English, and works fine on a slow connection.

🔗 **Live:** https://yasaman-listing.coolify.hesamian.com/

![Yasaman Listing](docs/screenshot.png)

## What it does

- Post a listing with photos/videos, a price, tags, and a city.
- Browse and search listings, or view them on a map of Iran.
- Mark something as sold — it stays up for a week, then drops off automatically.
- Dark mode, Farsi/English toggle, and the whole thing is RTL-aware.
- The first person to sign up is the admin; everyone else is a regular user.

## Built with

- **Backend:** ASP.NET Core (.NET 10), EF Core + PostgreSQL, Identity with JWT.
- **Frontend:** React + TypeScript + Vite, Zustand for state.
- **Media:** stored in S3 (or any S3-compatible bucket) and served through the API.

## Running it locally

You'll need PostgreSQL and an S3 bucket. Point the app at them with `DATABASE_URL` and the
`SPACES_*` environment variables (there are `appsettings.json` fallbacks for local dev).

```powershell
# backend  → http://localhost:5000 (Swagger at /swagger)
cd api/Api
dotnet run

# frontend → http://localhost:5173
cd ui
npm install
npm run dev
```

The first account you register becomes the admin.

## Configuration

| Variable | What it's for |
| --- | --- |
| `DATABASE_URL` | Postgres connection, e.g. `postgres://user:pass@host:5432/db?sslmode=require` |
| `SPACES_KEY` / `SPACES_SECRET` | S3 credentials |
| `SPACES_BUCKET` | Bucket name |
| `SPACES_ENDPOINT` | Set for S3-compatible providers (Spaces, R2); leave empty for AWS + `SPACES_REGION` |
| `SPACES_REGION` | AWS region when not using an endpoint |
| `JWT_SECRET` | Signing key for auth tokens |

The frontend talks to the backend through a TypeScript client generated from Swagger. After
changing the API, regenerate it with `npm run generate:api` (backend must be running).
