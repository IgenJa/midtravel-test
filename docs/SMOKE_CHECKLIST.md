# E2E smoke checklist

Futtasd stagingen, majd productionön (Stripe-nál staging = test mode).

A publikus GET-ek egy része automatikus: GitHub Action `CI` → `npm run smoke:http` (`/api/health`, `/hu`, `/en`, trips/contact, robots/sitemap, `/hu/admin` redirect). A lenti lista a kézi, böngészős ellenőrzés.

## Publikus SEO / alap

- [ ] `/hu` és `/en` betölt, nyelvváltó működik
- [ ] `/robots.txt` — admin/profile/api tiltva, sitemap URL helyes
- [ ] `/sitemap.xml` — locale oldalak + publikált trip URL-ek
- [ ] `/opengraph-image` — 1200×630 PNG
- [ ] Főoldal source: Organization / TravelAgency JSON-LD
- [ ] Egy trip oldal source: TouristTrip JSON-LD

## Tartalom

- [ ] `/hu/trips` listázza a publikált utakat
- [ ] Trip detail: galéria, program, FAQ, ár
- [ ] `/hu/team`, `/hu/about`, `/hu/contact` rendben
- [ ] Privacy + travel-contract elérhető a footerben

## Auth

- [ ] Regisztráció → megerősítő e-mail → `/hu/verify-email` → session → profil
- [ ] Megerősítés nélkül belépés: hiba + újraküldés
- [ ] Logout / login
- [ ] Remember me: bepipálva session cookie Max-Age-dzsel, nélküle session cookie (böngészőzárásig)
- [ ] Elfelejtett jelszó: `/hu/forgot-password` → Resend e-mail → `/hu/reset-password?token=` → belépés
- [ ] Nem-admin nem fér `/hu/admin`-hoz
- [ ] Auth spam: gyors POST-ok → 429 (opcionális)

## Űrlapok + e-mail

- [ ] Kapcsolat űrlap → DB + Resend (ügyfél + iroda)
- [ ] GDPR checkbox nélkül nem megy
- [ ] Jelentkezés (inquire) → DB + e-mailek
- [ ] Rate limit: 6. submit 1 percen belül hibaüzenetet ad

## Foglalás + Stripe

- [ ] Bejelentkezve: Book & pay → Stripe Checkout
- [ ] Sikeres fizetés → `/booking/success`, booking `paid`
- [ ] Webhook: Payment rekord frissül
- [ ] Profil: „saját foglalások” megjelenik
- [ ] Cancel path: `/booking/cancel`

## Admin

- [ ] Utak CRUD (HU/EN), publish, featured, kép feltöltés
- [ ] Csapat + vélemények CRUD
- [ ] Cégadatok: `/hu/admin/settings` — e-mail / telefon / cím mentés után megjelenik a footerben, kapcsolaton, impresszumban
- [ ] Foglalás részlet: számlázási adatok mentése
- [ ] „Számla kiállítása” (stagingen szamlazz teszt / sandbox ha van)
- [ ] Dupla kiállítás védelem
- [ ] Beérkező: kapcsolatüzenetek és jelentkezések listája, részlet, olvasott jelölés
- [ ] Olvasatlan számláló frissül a dashboardon és a navon
- [ ] Sikertelen Resend: admin dashboard piros figyelmeztetés, inbound/foglalás badge, újraküldés gomb

## Ops / health

- [ ] `GET /api/health` → 200, `checks.database` = `ok` (DB leállítva: 503)
- [ ] `docker compose ps` — `app` és `db` healthy
- [ ] Hoston a `5432` nincs publikálva (Compose `db` service-nek nincs `ports` mappingje; `ss -lnt | grep 5432` üres)
- [ ] `./deploy/backup.sh` létrehoz nem üres `db.dump` + `uploads.tar.gz`

## Hardening

- [ ] HTTPS redirect (nginx)
- [ ] `www.` → 301/308 a kanonikus apexre; belépés után a session megmarad (ne éljen mindkét host külön)
- [ ] Security headerek: `Strict-Transport-Security`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Content-Security-Policy` (főoldal + `/hu/contact` Maps iframe + privacy PDF iframe)
- [ ] Feltöltött képek `/api/uploads/...` vagy Blob URL működik
- [ ] Sentry (ha be van kapcsolva): süti-sáv megjelenik; Elutasítom után nincs böngésző-event; Elfogadom után teszt hiba megjelenik
- [ ] Sentry nélkül: nincs süti-sáv, a láblécben nincs „Sütibeállítások”
- [ ] Mobile: home + trip + apply használható
