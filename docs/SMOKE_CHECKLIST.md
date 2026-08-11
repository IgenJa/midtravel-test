# E2E smoke checklist

Futtasd stagingen, majd productionön (Stripe-nál staging = test mode).

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

- [ ] Regisztráció → session → profil
- [ ] Logout / login
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
- [ ] Foglalás részlet: számlázási adatok mentése
- [ ] „Számla kiállítása” (stagingen szamlazz teszt / sandbox ha van)
- [ ] Dupla kiállítás védelem

## Hardening

- [ ] HTTPS redirect (nginx)
- [ ] Feltöltött képek `/api/uploads/...` vagy Blob URL működik
- [ ] Sentry (ha be van kapcsolva): teszt hiba megjelenik
- [ ] Mobile: home + trip + apply használható
