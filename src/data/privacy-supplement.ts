import type { Locale } from "@/i18n/routing";
import { COMPANY } from "@/data/company";

export type CompanyForPrivacy = {
  legalName: string;
  legalNameShort: string;
  postalCode: string;
  city: string;
  streetAddress: string;
  companyRegistryNumber: string;
  taxId: string;
  email: string;
  phone: string;
};

export type PrivacySection = {
  id?: string;
  title: string;
  paragraphs: string[];
};

export type PrivacySupplement = {
  lastUpdated: string;
  intro: string;
  sections: PrivacySection[];
};

function controllerHu(company: CompanyForPrivacy) {
  return `${company.legalName} (rövidített név: ${company.legalNameShort}), székhely: ${company.postalCode} ${company.city}, ${company.streetAddress}, cégjegyzékszám: ${company.companyRegistryNumber}, adószám: ${company.taxId}.`;
}

function contactHu(company: CompanyForPrivacy) {
  return `Kapcsolat adatvédelmi ügyekben: ${company.email}, telefon: ${company.phone}. Postai cím: ${company.postalCode} ${company.city}, ${company.streetAddress}.`;
}

function controllerEn(company: CompanyForPrivacy) {
  return `${company.legalName} (short name: ${company.legalNameShort}), registered office: ${company.streetAddress}, ${company.postalCode} ${company.city}, Hungary, company registration number: ${company.companyRegistryNumber}, tax number: ${company.taxId}.`;
}

function contactEn(company: CompanyForPrivacy) {
  return `Privacy contact: ${company.email}, phone: ${company.phone}. Postal address: ${company.streetAddress}, ${company.postalCode} ${company.city}, Hungary.`;
}

function buildHu(company: CompanyForPrivacy): PrivacySupplement {
  return {
  lastUpdated:
    "Kiegészítés hatályos: 2026. augusztus 22. · Hivatalos adatkezelési tájékoztató: 2024. január 1.",
  intro:
    "Ez a kiegészítés a Mid Travel Bt. 2024. január 1-jei Adatkezelési tájékoztatóját egészíti ki. A 2024-es tájékoztató és a 2025-ös utazási szerződés változtatás nélkül, hivatalos PDF-ként is elérhető ezen az oldalon. A kiegészítés azt írja le, hogyan kezeli az adatkezelő a személyes adatokat ezen a weboldalon: fiók, kapcsolatfelvétel, utazási jelentkezés, foglalás, fizetés és számlázás.",
  sections: [
    {
      title: "1. Adatkezelő",
      paragraphs: [
        `Az adatkezelő a ${controllerHu(company)}`,
        contactHu(company),
      ],
    },
    {
      title: "2. Milyen adatokat kezelünk ezen a weboldalon",
      paragraphs: [
        "Fiók és belépés: név, e-mail cím, telefonszám (ha megadod), jelszó (titkosítva tárolva), munkamenet-azonosító, a belépéshez kapcsolódó IP-cím és böngészőazonosító.",
        "Kapcsolatfelvételi űrlap: név, e-mail cím, tárgy, üzenet.",
        "Utazási jelentkezés: név, e-mail cím, telefonszám, utasok száma, választott út, üzenet, utasbiztosítás iránti érdeklődés (jelölőnégyzet), valamint opcionálisan az utastárs neve és telefonszáma (egymás melletti ültetéshez).",
        "Foglalás és fizetés: a jelentkezés adatai, a foglalás összege és pénzneme, a fizetés státusza, a Stripe által kiadott fizetési azonosítók, valamint — számla kiállításához — számlázási név, e-mail, telefon, adószám és számlázási cím.",
        "Technikai adatok: a visszaélések megelőzéséhez használt IP-cím (átmeneti korlátozás), valamint — ha a hibakövetés be van kapcsolva — a hibaelhárításhoz szükséges technikai napló, amely tartalmazhatja a kérés idejét, az oldalt és ritkán az űrlapon megadott adat egy részét.",
        "Ezen a weboldalon jelenleg nincs hírlevél-feliratkozás és nincs törzsutas-program. Marketing- vagy analitikai sütiket (Google Analytics, Facebook Pixel) nem helyezünk el.",
      ],
    },
    {
      title: "3. Az adatkezelés célja és jogalapja",
      paragraphs: [
        "Szerződés teljesítése (GDPR 6. cikk (1) bekezdés b) pont): fiók létrehozása és kezelése, jelentkezés és foglalás, előlegfizetés, utazási szerződés teljesítése, kapcsolattartás az utazással összefüggésben.",
        "Jogi kötelezettség (GDPR 6. cikk (1) bekezdés c) pont): számla kiállítása és a számviteli, adózási megőrzés a számvitelről szóló 2000. évi C. törvény szerint.",
        "Jogos érdek (GDPR 6. cikk (1) bekezdés f) pont): a weboldal biztonságos működése, a visszaélések és túlterhelés megelőzése, a hibák javítása. Jogos érdekünk, hogy a szolgáltatást megbízhatóan tudjuk nyújtani; ez nem írja felül az érintett magánszférához fűződő érdekeit aránytalan mértékben.",
        "Hozzájárulás (GDPR 6. cikk (1) bekezdés a) pont): az adatkezelési tájékoztató elfogadása az űrlapokon, valamint — ha a Sentry hibakövetés be van kapcsolva — a böngészőből küldött hibajelentés. A hozzájárulás visszavonása nem érinti a visszavonás előtti adatkezelés jogszerűségét, és nem szünteti meg a szerződés teljesítéséhez vagy jogi kötelezettséghez szükséges kezelést.",
      ],
    },
    {
      title: "4. Adatfeldolgozók és címzettek",
      paragraphs: [
        "A weboldal működtetéséhez az adatkezelő a következő adatfeldolgozókat veszi igénybe. Személyes adatot csak a szükséges mértékben továbbítunk.",
        "Stripe (Stripe Payments Europe Limited, illetve a fizetéshez kapcsolódó Stripe-csoporttagok): kártyás előlegfizetés a Stripe Checkout felületén. A kártyaadatokat az adatkezelő nem tárolja; azokat a Stripe kezeli.",
        "Resend: a foglaláshoz, jelentkezéshez, kapcsolatfelvételhez, jelszó-visszaállításhoz és e-mail-cím megerősítéséhez kapcsolódó e-mailek kézbesítése.",
        "szamlazz.hu (KBOSS.hu Kft.): számla (ideértve az előlegszámlát) kiállítása a vevő nevére, adószámára és címére.",
        "Hibakövetés: ha a Sentry szolgáltatás be van kapcsolva, a szerveroldali működési hibák elhárításához technikai adatot továbbíthatunk a Sentry üzemeltetőjének. A böngésződből csak akkor küldünk hibajelentést, ha ehhez a süti-sávon hozzájárultál.",
        "Tárhely és adatbázis: a weboldalt és az adatokat az adatkezelő által üzemeltetett vagy megbízott szerveren tároljuk. A 2024-es tájékoztatóban szereplő Tárhelypark Kft. erre a weboldalra nem adatfeldolgozó.",
        "Az utazás teljesítéséhez — a 2024-es tájékoztatóval összhangban — adatot továbbíthatunk szállásadónak, személyszállítónak, helyi partnernek vagy hatóságnak, ha ez a szerződéshez vagy jogszabályhoz szükséges. Az EGT-n kívüli úti cél esetén az adat harmadik országba is eljuthat.",
      ],
    },
    {
      title: "5. Megőrzési idő",
      paragraphs: [
        "Kapcsolatfelvételi üzenetek: a megkeresés megválaszolásáig, utána legfeljebb 2 évig, kivéve ha hosszabb megőrzést jogi igény vagy jogszabály indokol.",
        "Fiókadatok: a fiók törléséig. Törlés után a szerződéssel és számlázással összefüggő adatokat a jogszabályi megőrzés miatt tovább tárolhatjuk.",
        "Jelentkezés, foglalás, fizetés és számla: a számviteli bizonylatokra vonatkozó 8 év (Számv. tv. 169. §), illetve a 2024-es tájékoztatóban az utazási szerződéses adatokra meghatározott idő.",
        "Munkamenet-süti: a munkamenet lejártáig, kijelentkezésig, vagy — ha nem jelölöd be az „Emlékezz rám” opciót — a böngésző bezárásáig.",
        "Biztonsági és hibakezelési naplók: a célhoz szükséges, jellemzően rövid ideig.",
      ],
    },
    {
      title: "6. Harmadik országba továbbítás",
      paragraphs: [
        "A Stripe, a Resend és — ha be van kapcsolva — a Sentry az Európai Gazdasági Térségen kívül (jellemzően az Egyesült Államokban) is kezelhet adatot. Ilyen esetben a továbbítás a GDPR V. fejezete szerinti megfelelő garanciákon alapul (például az Európai Bizottság megfelelőségi határozata vagy általános szerződési klauzulák).",
        "Az utazás úti céljától függően a szerződés teljesítéséhez szükséges adat az EGT-n kívülre is továbbítható. Erről a 2024-es tájékoztató 4.3. pontja is rendelkezik.",
      ],
    },
    {
      id: "sutik",
      title: "7. Sütik",
      paragraphs: [
        "A belépéshez és a bejelentkezve maradáshoz elengedhetetlen munkamenet-sütit használunk. Ha bejelölöd az „Emlékezz rám” opciót, a süti a munkamenet lejártáig megmarad; ha nem, a böngésző bezárásakor törlődik. Ezek nélkül a fiók és a foglalás nem működik.",
        "Marketing-, reklám- vagy webanalitikai sütit ez a weboldal jelenleg nem használ. A Facebook-oldalra mutató hivatkozás csak akkor visz a Facebookra, ha arra rákattintasz; a weboldalunkon Facebook-követőkódot nem futtatunk.",
        "Ha a Sentry hibakövetés be van kapcsolva, a böngészőből csak a süti-sávon adott hozzájárulás után küldünk hibajelentést. Hozzájárulás nélkül a Sentry a böngésződből nem kap adatot. A szerveroldali hibák javításához a Sentryt a weboldal működtetéséhez szükséges, jogos érdeken alapuló módon használhatjuk. A választásodat a lábléc „Sütibeállítások” linkjén bármikor módosíthatod.",
      ],
    },
    {
      title: "8. Az érintettet megillető jogok",
      paragraphs: [
        "Kérhetsz hozzáférést a rád vonatkozó adatokhoz, kérheted azok helyesbítését, törlését vagy az adatkezelés korlátozását, tiltakozhatsz a jogos érdeken alapuló kezelés ellen, és — ha a kezelés hozzájáruláson vagy szerződésen alapul és automatizált — élhetsz az adathordozhatóság jogával. A jogok részletes leírását a 2024-es Adatkezelési tájékoztató 5. pontja tartalmazza.",
        "Kérelmedet a fenti e-mail-címen vagy postai címen tudod eljuttatni hozzánk. Jogellenes adatkezelés esetén panaszt tehetsz a Nemzeti Adatvédelmi és Információszabadság Hatóságnál (NAIH), 1055 Budapest, Falk Miksa utca 9-11., ugyfelszolgalat@naih.hu, https://www.naih.hu, vagy bírósághoz fordulhatsz.",
      ],
    },
    {
      title: "9. A hivatalos dokumentumokhoz való viszony",
      paragraphs: [
        "A 2024. január 1-jei Adatkezelési tájékoztató hatályban marad. Ez a kiegészítés a jelen weboldal technikai működését (fiók, Stripe, Resend, szamlazz.hu, tárhely, sütik) írja le. Ha a kiegészítés és a 2024-es tájékoztató ugyanarra a, ezen a weboldalon végzett adatkezelésre eltérően rendelkezik, erre a weboldalra a kiegészítés az irányadó.",
        "Az utazási szerződés és az általános utazási feltételek a 2025-ös hivatalos dokumentumban szerepelnek. A foglalás ezekhez a feltételekhez köti a feleket.",
      ],
    },
  ],
  };
}

function buildEn(company: CompanyForPrivacy): PrivacySupplement {
  return {
  lastUpdated:
    "Supplement effective: 22 August 2026 · Official privacy notice: 1 January 2024",
  intro:
    "This supplement adds to Mid Travel Bt.’s privacy notice dated 1 January 2024. The 2024 notice and the 2025 travel contract are published on this page unchanged as official PDFs. The Hungarian originals are legally binding. This supplement describes how personal data is processed on this website: accounts, contact, trip applications, bookings, payment and invoicing.",
  sections: [
    {
      title: "1. Data controller",
      paragraphs: [
        `The controller is ${controllerEn(company)}`,
        contactEn(company),
      ],
    },
    {
      title: "2. Data we process on this website",
      paragraphs: [
        "Account and sign-in: name, email address, phone number (if provided), password (stored hashed), session identifier, and the IP address and browser identifier linked to sign-in.",
        "Contact form: name, email address, subject, message.",
        "Trip application: name, email address, phone number, number of participants, selected trip, message, interest in travel insurance (checkbox), and optionally a travel companion’s name and phone number (so they can be seated together).",
        "Booking and payment: the application data, booking amount and currency, payment status, Stripe payment identifiers, and — for invoicing — billing name, email, phone, tax number and billing address.",
        "Technical data: IP address used for abuse prevention (temporary rate limiting) and, if error monitoring is enabled, technical logs that may include the time of the request, the page, and rarely part of data submitted in a form.",
        "This website currently has no newsletter sign-up and no loyalty programme. We do not place marketing or analytics cookies (Google Analytics, Facebook Pixel).",
      ],
    },
    {
      title: "3. Purposes and legal bases",
      paragraphs: [
        "Performance of a contract (GDPR Article 6(1)(b)): creating and managing an account, applications and bookings, deposit payment, performing the travel contract, and related communication.",
        "Legal obligation (GDPR Article 6(1)(c)): issuing invoices and retaining accounting and tax records under Act C of 2000 on Accounting.",
        "Legitimate interest (GDPR Article 6(1)(f)): secure operation of the website, preventing abuse and overload, and fixing errors. Our interest is to provide the service reliably; this does not override your privacy interests in a disproportionate way.",
        "Consent (GDPR Article 6(1)(a)): accepting the privacy notice on the forms, and — if Sentry error monitoring is enabled — browser error reports. Withdrawing consent does not affect processing that was lawful before withdrawal, and does not end processing that remains necessary for the contract or a legal obligation.",
      ],
    },
    {
      title: "4. Processors and recipients",
      paragraphs: [
        "To operate the website the controller uses the processors below. Personal data is disclosed only to the extent necessary.",
        "Stripe (Stripe Payments Europe Limited and related Stripe group entities): card deposit payments via Stripe Checkout. The controller does not store card details; Stripe processes them.",
        "Resend: delivery of emails related to bookings, applications, contact messages, password reset and email verification.",
        "szamlazz.hu (KBOSS.hu Kft.): issuing invoices (including deposit invoices) in the buyer’s name, tax number and address.",
        "Error monitoring: if Sentry is enabled, we may send technical data to Sentry’s operator to fix server-side operational errors. We send a browser error report only after you consent on the cookie banner.",
        "Hosting and database: the website and data are stored on a server operated or commissioned by the controller. Tárhelypark Kft., named in the 2024 notice, is not a processor for this website.",
        "To perform a trip — in line with the 2024 notice — we may disclose data to accommodation providers, carriers, local partners or authorities where this is necessary for the contract or by law. For destinations outside the EEA, data may also be transferred to a third country.",
      ],
    },
    {
      title: "5. Retention",
      paragraphs: [
        "Contact messages: until the enquiry is answered, then for up to 2 years, unless a legal claim or statute requires longer retention.",
        "Account data: until the account is deleted. After deletion we may keep data linked to a contract or invoice for statutory retention.",
        "Applications, bookings, payments and invoices: 8 years for accounting records (Section 169 of the Accounting Act), and the period set in the 2024 notice for travel-contract data.",
        "Session cookie: until the session expires, you sign out, or — if you leave “Remember me” unchecked — until you close the browser.",
        "Security and error logs: for as long as needed for that purpose, typically a short period.",
      ],
    },
    {
      title: "6. Transfers outside the EEA",
      paragraphs: [
        "Stripe, Resend and — if enabled — Sentry may also process data outside the European Economic Area (typically in the United States). Such transfers rely on appropriate safeguards under Chapter V of the GDPR (for example an adequacy decision of the European Commission or standard contractual clauses).",
        "Depending on the destination, data needed to perform the contract may also be transferred outside the EEA. Point 4.3 of the 2024 notice also covers this.",
      ],
    },
    {
      id: "cookies",
      title: "7. Cookies",
      paragraphs: [
        "We use an essential session cookie so you can sign in and stay signed in. If you tick “Remember me”, the cookie lasts until the session expires; if you leave it unchecked, it is deleted when you close the browser. The account and booking flows do not work without it.",
        "This website does not currently use marketing, advertising or web-analytics cookies. A Facebook link takes you to Facebook only if you click it; we do not run a Facebook tracking pixel on this site.",
        "If Sentry error monitoring is enabled, we send a browser error report only after you consent on the cookie banner. Without consent, Sentry receives nothing from your browser. We may still use Sentry for server-side errors on the basis of legitimate interest, as needed to run the website. You can change your choice at any time via “Cookie settings” in the footer.",
      ],
    },
    {
      title: "8. Your rights",
      paragraphs: [
        "You may request access to your data, rectification, erasure or restriction of processing, object to processing based on legitimate interest, and — where processing is based on consent or a contract and is automated — exercise data portability. Section 5 of the 2024 privacy notice describes these rights in more detail.",
        "Send requests to the email or postal address above. If you believe processing is unlawful, you may lodge a complaint with the Hungarian National Authority for Data Protection and Freedom of Information (NAIH), 1055 Budapest, Falk Miksa utca 9-11., ugyfelszolgalat@naih.hu, https://www.naih.hu, or go to court.",
      ],
    },
    {
      title: "9. How this relates to the official documents",
      paragraphs: [
        "The privacy notice dated 1 January 2024 remains in force. This supplement describes the technical operation of this website (account, Stripe, Resend, szamlazz.hu, hosting, cookies). If this supplement and the 2024 notice differ on processing carried out on this website, this supplement prevails for this website.",
        "The travel contract and general travel conditions are set out in the official 2025 document. A booking binds the parties to those terms.",
      ],
    },
  ],
  };
}

export function getPrivacySupplement(
  locale: Locale,
  company: CompanyForPrivacy = COMPANY
): PrivacySupplement {
  return locale === "en" ? buildEn(company) : buildHu(company);
}
