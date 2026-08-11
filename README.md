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
| Errors | Sentry (optional) |

## Local development

```bash
cp .env.example .env
# Edit DATABASE_URL / secrets

# Option A: Postgres via Docker only
docker compose up -d db

npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production on VPS (recommended: Docker)

1. Point DNS `A` record to the VPS IP.
2. Install Docker + Compose on the server.
3. Clone the repo, create `.env` from `.env.example` (strong `POSTGRES_PASSWORD`, `BETTER_AUTH_SECRET`, Resend keys, public HTTPS URLs).
4. Start:

```bash
docker compose up -d --build
```

5. Install nginx using [`deploy/nginx.conf`](deploy/nginx.conf), then TLS with Certbot.
6. Seed admin once:

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
| `npm run db:seed` | Create/update admin user |
| `npm run docker:up` | `docker compose up -d --build` |
| `npm run docker:down` | Stop Compose stack |

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
