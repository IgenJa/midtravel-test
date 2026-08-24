# MidTravel — átadási csomag

Rövid üzemeltetési és átadási útmutató a production rendszerhez (VPS + Docker / PM2).

## 1. Fiókok és tulajdonjog

Minden külső szolgáltatás **az ügyfél neve / cége alatt** legyen (nem a fejlesztő személyes fiókjában):

| Szolgáltatás | Cél | Átadás előtt |
|---|---|---|
| Domain + DNS | `midtravel.hu` (vagy végleges domain) | A rekord az ügyfél DNS-énél |
| VPS (pl. Rackhost) | App + Postgres | Root/SSH + számlázás ügyfélnél |
| Stripe | Előleg Checkout + webhook | Live kulcsok, webhook endpoint |
| Resend | Tranzakciós e-mailek | Domain verify (SPF/DKIM) |
| szamlazz.hu | Admin „Számla kiállítása” | Számla Agent kulcs, ÁFA egyeztetve |
| Sentry (opcionális) | Production hibák | Org/project átadva |

> Hírlevél (Brevo) jelenleg nincs a kódban — ha később kell, külön fázis.

## 2. Környezeti változók

Teljes sablon: [`.env.example`](../.env.example). Kötelező production értékek:

| Változó | Megjegyzés |
|---|---|
| `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_SITE_URL` | HTTPS, trailing slash nélkül — kanonikus apex (`https://midtravel.hu`) |
| `BETTER_AUTH_URL` | Ugyanaz, mint az app URL. A www pár automatikusan trusted origin. |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Opcionális, vesszővel elválasztott extra originök (pl. staging) |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `DATABASE_URL` / `DIRECT_URL` | Postgres connection string |
| `POSTGRES_*` | Compose esetén |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Első admin — **első belépés után cseréld** |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | From domain verified |
| `CONTACT_NOTIFY_EMAIL` | Irodai értesítések |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Live mód |
| `STRIPE_DEPOSIT_PERCENT` | Alapértelmezett `30` (utazási szerződés) |
| `SZAMLAZZ_AGENT_KEY` / `SZAMLAZZ_VAT_PERCENT` / `SZAMLAZZ_EUR_HUF_RATE` | Könyvelővel egyeztetve |
| `UPLOAD_DIR` | Persistált volume a VPS-en |
| `SENTRY_*` | Opcionális. Kliens SDK csak süti-hozzájárulás után küld. |

**Ne commitolj** `.env` fájlt. Backup: titkosított jelszókezelő / VPS secret store.

## 3. Admin belépő

1. Production seed (egyszer, később is biztonságos újrafuttatni):

```bash
docker compose exec app npx tsx prisma/seed.ts
# vagy PM2 környezetben: npm run db:seed
```

A seed **nem írja felül** az adminban szerkesztett utakat, cégadatokat, és **nem törli** a csapatot / véleményeket. Csak a hiányzó admin felhasználót, hiányzó slugú utakat, hiányzó `SiteSetting` cégadat-kulcsokat, és üres táblákat tölti. Teljes reset csak explicit `--force` (local/staging): `npm run db:seed:force` — a cégadatokat a `--force` sem írja felül.

A 20 seed út **szándékosan demo** (kitalált útvonal, ár, program + helyi stock kép). Az ügyfél a VPS után, az adminból cseréli valós tartalomra — ehhez nem kell új seed.

2. Belépés: `https://<domain>/hu/login` → admin e-mail + jelszó.
3. Admin: `https://<domain>/hu/admin`
4. **Azonnal** cseréld a seed jelszót (profil / Better Auth change password).
5. Extra admin felhasználók: Better Auth admin plugin / DB `role = admin` (csak megbízható személyeknek).

## 4. Staging (előnézet élesítés előtt)

Ajánlott: külön staging aldomain (pl. `staging.midtravel.hu`) és külön Postgres + Stripe **test** kulcsok.

Checklist stagingre:

- [ ] DNS `A` → staging VPS / ugyanaz a gép, külön Compose project (`COMPOSE_PROJECT_NAME=midtravel-staging`)
- [ ] `.env` staging URL-ekkel (`NEXT_PUBLIC_*`, `BETTER_AUTH_URL`)
- [ ] Stripe **test** kulcsok + webhook a staging URL-re (`/api/stripe/webhook`)
- [ ] Resend: teszt címzett vagy staging from domain
- [ ] `robots.txt` stagingen: `Disallow: /` (ha indexelést el akarjátok kerülni) — vagy HTTP Basic Auth az nginx-ben
- [ ] Smoke checklist végigfuttatva: [`docs/SMOKE_CHECKLIST.md`](./SMOKE_CHECKLIST.md)
- [ ] `GET /api/health` 200, `docker compose ps` app = healthy
- [ ] Stagingről productionre csak migráció + env live kulcsokkal

## 5. Production deploy (rövid)

Docker (ajánlott): lásd [README](../README.md).

```bash
git pull
docker compose up -d --build
# migráció: deploy/docker-entrypoint.sh futtatja
```

Stripe webhook (élő):

- URL: `https://<domain>/api/stripe/webhook`
- Esemény: legalább `checkout.session.completed`

SEO ellenőrzés élesítés után:

- `https://<domain>/robots.txt`
- `https://<domain>/sitemap.xml`
- Főoldal / út: `application/ld+json` (Organization / TouristTrip) a page source-ban
- OG: `https://<domain>/opengraph-image`

### Domain: www + apex

A session cookie **host-only**: `www.midtravel.hu` és `midtravel.hu` nem osztozik rajta. Ha mindkét host ugyanazt az appot szolgálja átirányítás nélkül, a belépés elhasalhat.

- DNS: `A` rekord az apexre **és** a `www`-re (ugyanaz az IP).
- nginx: `www` → `https://midtravel.hu` (lásd [`deploy/nginx.conf`](../deploy/nginx.conf)).
- Better Auth: `BETTER_AUTH_URL` az apex; a www origin automatikusan trusted, plusz `BETTER_AUTH_TRUSTED_ORIGINS` ha kell.

## 6. Üzemeltetés

| Teendő | Gyakoriság |
|---|---|
| `docker compose logs -f app` / Sentry | Hibák figyelése |
| `GET /api/health` (Docker healthcheck + UptimeRobot) | Folyamatos |
| Postgres + uploads backup (`deploy/backup.sh`) | Napi cron |
| Stripe Dashboard + webhook retry | Fizetési incidensnél |
| szamlazz.hu ÁFA / EUR árfolyam | Könyvelő szerint |
| Domain TLS (Certbot renew) | Automatikus, ellenőrizd |

Rate limit: alkalmazás szintű IP throttle (űrlapok 5/perc, auth 30/perc) + nginx `limit_req` (`deploy/nginx-http.conf` + `deploy/nginx.conf`). Security headerek (HSTS, CSP, X-Frame-Options, nosniff, Referrer-Policy) a Next.js válaszokon és az nginx HTTPS serveren.

Postgres **nincs kitéve a hoston** (`5432` nincs a `docker-compose.yml` `ports` listájában). Az app a belső `db:5432` címen kapcsolódik. Dump/restore és ad-hoc SQL: `docker compose exec db …` (lásd backup lent). Host-ról `localhost:5432` csak local devben él (`npm run docker:db`).

### Healthcheck

`GET /api/health` — 200 ha az app + Postgres él (`SELECT 1`), 503 ha a DB nem elérhető. Nincs auth, nincs cache. A Docker image és a Compose `app` service ezt hívja 30 másodpercenként (`deploy/healthcheck.mjs`). Külső monitor (UptimeRobot / Better Stack): `https://<domain>/api/health`.

```bash
curl -fsS https://midtravel.hu/api/health
# docker compose ps   # app = healthy, ha a probe 200
```

### Backup + restore

A script a repo gyökeréből (Compose `db` fut → automatikus compose mód; különben local `pg_dump`):

```bash
./deploy/backup.sh
# vagy: npm run backup
# VPS ajánlott cél: BACKUP_DIR=/var/backups/midtravel BACKUP_RETENTION_DAYS=14 ./deploy/backup.sh
```

Minden futás egy UTC bélyeges mappa: `db.dump` (pg_dump custom format), `uploads.tar.gz`, `SHA256SUMS`. 14 napnál régebbi mappák törlődnek.

Napi cron (VPS, app könyvtár abszolút úttal):

```cron
15 3 * * * /var/www/midtravel/deploy/backup.sh >> /var/log/midtravel-backup.log 2>&1
```

Visszaállítás (destruktív — előtte állítsd le az appot, ellenőrizd a dumpot):

```bash
# Compose
docker compose stop app
docker compose exec -T db pg_restore --clean --if-exists --no-owner --no-acl \
  -U "$POSTGRES_USER" -d "$POSTGRES_DB" < backups/<stamp>/db.dump
docker compose exec -T app sh -c 'rm -rf /app/uploads/*'
docker compose exec -T app tar -C /app/uploads -xzf - < backups/<stamp>/uploads.tar.gz
docker compose start app
```

## 7. Átadási checklist (ügyfél)

- [ ] Domain + TLS él (apex kanonikus; `www` 301 ide)
- [ ] HTTP security headerek (HSTS, CSP, X-Frame-Options, nosniff, Referrer-Policy)
- [ ] Env-ek kitöltve, seed admin jelszó cserélve
- [ ] Stripe live + webhook OK (teszt foglalás)
- [ ] Resend domain verified, contact/apply e-mail megérkezik
- [ ] Admin: út szerkesztés, kép feltöltés, foglalás, számla gomb
- [ ] Admin: cégadatok (e-mail, telefon, cím) a `/hu/admin/settings` oldalon — a seed csak hiányzó kulcsokat tölt, meglévő admin értéket nem ír felül
- [ ] Privacy + travel-contract oldalak aktuálisak (új szerződés = új fájl, a régit hagyd meg)
- [ ] Smoke checklist OK (automatikus: GitHub Action `CI` — lint / unit / HTTP smoke)
- [ ] `/api/health` 200 (külső monitor beállítva)
- [ ] Napi `deploy/backup.sh` cron + egy próba-restore stagingen
- [ ] Hozzáférések (VPS, Stripe, Resend, szamlazz, DNS) ügyfélnél
- [ ] *(VPS után, ügyfél)* Demo utak cseréje valós útvonalra, árra, programra az adminból

### Jogi PDF-ek cseréje

Új utazási szerződés vagy adatkezelési tájékoztató **új fájl**. A régit **ne töröld és ne írd felül** — a régi foglalások hash alapján azt a PDF-et kell tudniuk megnyitni.

1. Tedd fel az új PDF-et új névvel, pl. `public/docs/utazasi_szerzodes_2026.pdf`. A `utazasi_szerzodes_2025.pdf` marad.
2. `src/data/legal-docs.ts`: a 2025-ös bejegyzést tedd a `LEGAL_DOCUMENT_ARCHIVE.contract` tömbbe; a `LEGAL_DOCUMENTS.contract` legyen a 2026-os fájl + verzió + SHA-256 (`shasum -a 256 public/docs/…`).
3. Deploy után az új jelentkezések/foglalások az új verziót tárolják. Ugyanez a szabály az adatkezelési tájékoztatóra.

Ugyanannak a fájlnak a felülírása elrontja az audit trailt, és a unit teszt / mentés hash mismatch miatt elhasal.
