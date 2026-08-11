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
| `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_SITE_URL` | HTTPS, trailing slash nélkül |
| `BETTER_AUTH_URL` | Ugyanaz, mint az app URL |
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
| `SENTRY_*` | Opcionális |

**Ne commitolj** `.env` fájlt. Backup: titkosított jelszókezelő / VPS secret store.

## 3. Admin belépő

1. Production seed (egyszer):

```bash
docker compose exec app npx tsx prisma/seed.ts
# vagy PM2 környezetben: npm run db:seed
```

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

## 6. Üzemeltetés

| Teendő | Gyakoriság |
|---|---|
| `docker compose logs -f app` / Sentry | Hibák figyelése |
| Postgres backup (`pg_dump`) | Napi / heti |
| `uploads` volume backup | A DB-vel együtt |
| Stripe Dashboard + webhook retry | Fizetési incidensnél |
| szamlazz.hu ÁFA / EUR árfolyam | Könyvelő szerint |
| Domain TLS (Certbot renew) | Automatikus, ellenőrizd |

Rate limit: alkalmazás szintű IP throttle (űrlapok 5/perc, auth 30/perc). Több app példánynál egészítsd ki nginx `limit_req`-pel.

## 7. Átadási checklist (ügyfél)

- [ ] Domain + TLS él
- [ ] Env-ek kitöltve, seed admin jelszó cserélve
- [ ] Stripe live + webhook OK (teszt foglalás)
- [ ] Resend domain verified, contact/apply e-mail megérkezik
- [ ] Admin: út szerkesztés, kép feltöltés, foglalás, számla gomb
- [ ] Privacy + travel-contract oldalak aktuálisak
- [ ] Smoke checklist OK
- [ ] Hozzáférések (VPS, Stripe, Resend, szamlazz, DNS) ügyfélnél
