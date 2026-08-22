# MidTravel

Next.js travel agency site — **self-hosted on a VPS** (e.g. Rackhost) with Postgres, Better Auth, and Resend.

## Stack

| Layer | Choice |
|---|---|
| App | Next.js 16 (`output: "standalone"`) |
| Hosting | VPS + Docker Compose **or** Node + PM2 + nginx |
| DB | PostgreSQL on the same VPS (Compose service) |
| Auth | Better Auth |
| Email | Resend |
| Errors | Sentry (optional; browser SDK only after cookie consent) |

## Local development

```bash
cp .env.example .env
# Edit DATABASE_URL / secrets

# Option A: Postgres via Docker only (publishes 5432 on localhost)
npm run docker:db

npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production on VPS (recommended: Docker)

1. Point DNS `A` records for the apex **and** `www` to the VPS IP (`www` 301s to the apex).
2. Install Docker + Compose on the server.
3. Clone the repo, create `.env` from `.env.example` (strong `POSTGRES_PASSWORD`, `BETTER_AUTH_SECRET`, Resend keys, public HTTPS URLs).
4. Start:

```bash
docker compose up -d --build
```

5. Install nginx using [`deploy/nginx.conf`](deploy/nginx.conf) (plus `deploy/nginx-http.conf` → `/etc/nginx/conf.d/` and `deploy/nginx-security-headers.conf` → `/etc/nginx/snippets/`), then TLS with Certbot.
6. Seed admin once (safe to re-run — existing trips / team / testimonials are kept):

```bash
docker compose exec app npx tsx prisma/seed.ts
```

App listens on `127.0.0.1:3000` (or `APP_PORT`); nginx terminates HTTPS.

### Updates

```bash
git pull
docker compose up -d --build
```

Migrations run automatically on container start (`deploy/docker-entrypoint.sh`).

## Production without Docker (PM2)

```bash
# On the VPS, with Node 22+, Postgres, nginx, PM2 installed
cp .env.example .env   # configure DATABASE_URL to local Postgres
chmod +x deploy/pm2-deploy.sh
./deploy/pm2-deploy.sh
```

Point nginx to `127.0.0.1:3000` using `deploy/nginx.conf`.

## Useful scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Local Next.js |
| `npm run build` | Prisma generate + production build |
| `npm run start` | Run production build |
| `npm run db:migrate` | Dev migrations |
| `npm run db:migrate:deploy` | Production migrations |
| `npm run db:seed` | Safe seed: create missing admin / trips / team; never overwrite admin edits |
| `npm run db:seed:force` | Destructive reset of catalog content from seed files |
| `npm run docker:up` | `docker compose up -d --build` (production: Postgres is not published on the host) |
| `npm run docker:db` | Local Postgres only, with `5432` on localhost (`docker-compose.dev.yml`) |
| `npm run docker:down` | Stop Compose stack |
| `npm run backup` | Postgres `pg_dump` + uploads tarball (`deploy/backup.sh`) |
| `npm test` | Vitest unit tests (no server / DB) |
| `npm run typecheck` | `next typegen` + `tsc --noEmit` |
| `npm run smoke:http` | GET smoke against a running app (`SMOKE_BASE_URL`, default `:3000`) |
| `npm run smoke:db` | Optional Prisma inserts (does **not** hit HTTP) |

## Tests + CI

Push and pull requests run [`.github/workflows/ci.yml`](.github/workflows/ci.yml):

1. **quality** — `typecheck`, `vitest`
2. **http-smoke** — Postgres service, migrate + seed, production build, then `scripts/http-smoke.ts` (health, `/hu` `/en`, trips/contact, robots/sitemap, unauthenticated `/hu/admin` redirect)

Locally, after `npm run dev` or `npm run start`:

```bash
npm test
npm run smoke:http
```

The manual staging/production checklist is still [`docs/SMOKE_CHECKLIST.md`](docs/SMOKE_CHECKLIST.md).

## Healthcheck

`GET /api/health` returns `200` when the app and Postgres respond (`SELECT 1`), otherwise `503`. Docker HEALTHCHECK and Compose use `deploy/healthcheck.mjs` against `http://127.0.0.1:3000/api/health`.

## Backup

```bash
./deploy/backup.sh
# BACKUP_DIR=/var/backups/midtravel BACKUP_RETENTION_DAYS=14 ./deploy/backup.sh
```

Writes `backups/<UTC-stamp>/{db.dump,uploads.tar.gz,SHA256SUMS}`. Restore steps: [`docs/HANDOFF.md`](docs/HANDOFF.md).

## Uploads

Trip/admin images will use `UPLOAD_DIR` (default `./uploads`, Compose volume `uploads_data`). Persist this path on the VPS.

## SEO

- `https://<domain>/sitemap.xml` — localized public pages + published trips
- `https://<domain>/robots.txt` — blocks admin/profile/auth surfaces
- JSON-LD: Organization on every locale page, TouristTrip on trip detail
- Default Open Graph image: `/opengraph-image`

## Handoff / staging

- Client handoff pack (env, accounts, admin, ops): [`docs/HANDOFF.md`](docs/HANDOFF.md)
- Pre-launch smoke checklist: [`docs/SMOKE_CHECKLIST.md`](docs/SMOKE_CHECKLIST.md)
