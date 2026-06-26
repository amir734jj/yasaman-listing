# Yasaman Listing

A full-stack marketplace/listing app: **C# (ASP.NET Core) backend** + **React + TypeScript frontend**.
The frontend calls the backend through a **TypeScript client generated from the backend's Swagger/OpenAPI document**.

## Features

- **Backend**: ASP.NET Core (.NET 10), EF Core with the `SimpleEfCoreRepository` package (entity profiles + `IEfRepository`), PostgreSQL.
- **Auth**: ASP.NET Core Identity with **email as username**, JWT bearer tokens, **Admin / User** roles. The **first user to sign up becomes the Admin**; everyone after is a regular User.
- **Listings**: name, description, location, price, and **photos + videos**.
  - Owner can **mark a listing as sold**. A sold listing stays visible for **7 days**, then a background job automatically flips it to **Unavailable**.
  - **Search** by text and **sort by most recent** (or price).
- **Storage**: listing photos and videos are stored in **Amazon S3** (or any S3-compatible service such as DigitalOcean Spaces / Cloudflare R2). Uploads are stored with public-read access and served directly from the bucket.
- **Frontend**: React + TypeScript + Vite.
  - **Zustand** stores for auth, theme, and language.
  - **Dark mode** toggle (persisted).
  - **Language pack** — every label has English and **Farsi (RTL)** translations.
  - API calls go through the **generated Swagger client**.

## Project layout

```
api/
  Models/   entities, enums, role constants
  Data/     DbContext, entity profiles, EF migrations
  Logic/    DTOs, services (account, listing, JWT, storage), background expiry job
  Api/      controllers, Program.cs, swagger + auth setup
ui/
  src/api/generated/   Swagger-generated TypeScript client (npm run generate:api)
  src/store/           zustand stores (auth, theme, language)
  src/i18n/            en/fa language packs
  src/pages/           listings, detail, create/edit, login, register
```

## Getting started

### 1. Provide PostgreSQL & S3

The app needs a **PostgreSQL** database and an **S3 bucket** (AWS S3, or any S3-compatible service such as DigitalOcean Spaces / Cloudflare R2). Point the app at them with the `DATABASE_URL` and `SPACES_*` environment variables (see [Configuration](#configuration-environment-variables) below), or use the `appsettings.json` fallbacks.

The dev launch profile (`api/Api/Properties/launchSettings.json`) defaults to a local Postgres at `localhost:5432` and an S3 endpoint at `localhost:9000` — adjust those to match wherever you run them.

### 2. Run the backend

```powershell
cd api/Api
dotnet run
```

The API listens on `http://localhost:5000`. Swagger UI: `http://localhost:5000/swagger`.
Migrations are applied on first run. The **first account you register becomes the Admin**.

### 3. Run the frontend

```powershell
cd ui
npm install
npm run dev
```

Open `http://localhost:5173`. The dev server proxies `/api` to the backend.

### Regenerating the API client

With the backend running:

```powershell
cd ui
npm run generate:api
```

This reads `http://localhost:5000/swagger/v1/swagger.json` and regenerates `src/api/generated/Api.ts`.

## Configuration (environment variables)

The app follows the standard `DATABASE_URL` + object-storage env-var convention, with `appsettings.json` as a local fallback.

### Database

- **`DATABASE_URL`** — a Postgres URL, e.g. `postgres://user:password@host:5432/dbname?sslmode=require`. It is parsed into an Npgsql connection string (`?sslmode=require` enables TLS with `TrustServerCertificate`). If unset, the app falls back to `ConnectionStrings:Postgres` in `appsettings.json`.

### S3 / object storage

Media is stored in an S3 bucket. Configure it with environment variables (these override the `S3` appsettings section):

| Env var | Purpose |
| --- | --- |
| `SPACES_KEY` | Access key |
| `SPACES_SECRET` | Secret key |
| `SPACES_ENDPOINT` | Service URL for S3-compatible providers (DigitalOcean Spaces, Cloudflare R2). Leave unset for AWS S3 + `SPACES_REGION`. |
| `SPACES_BUCKET` | Bucket name |
| `SPACES_REGION` | AWS region (when not using `SPACES_ENDPOINT`) |

Equivalent `appsettings.json` fallback:

```json
"S3": {
  "BucketName": "your-bucket",
  "Region": "us-east-1",
  "ServiceUrl": "",
  "AccessKey": "...",
  "SecretKey": "..."
}
```

- For **AWS S3**, set the region and leave the endpoint empty.
- For an **S3-compatible** service (DigitalOcean Spaces, Cloudflare R2), set the endpoint.
- The bucket can stay private — media is streamed to clients through the `api/files` proxy endpoint rather than via raw bucket URLs.
