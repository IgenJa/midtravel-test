import {
  formatBillingAddress,
  type BillingAddress,
} from "@/lib/billing-address";

const SZAMLAZZ_URL = "https://www.szamlazz.hu/szamla/";

export type SzamlazzInvoiceRequest = {
  orderNumber: string;
  buyer: {
    name: string;
    email: string;
    phone?: string | null;
    taxId: string;
    address: BillingAddress;
  };
  item: {
    name: string;
    comment?: string;
    /** Gross amount in major currency units (e.g. EUR). */
    grossAmount: number;
    quantity?: number;
  };
  /** When true, issues a deposit / előlegszámla. */
  prepayment?: boolean;
  comment?: string;
  paid?: boolean;
  paymentMethod?: string;
  currency?: string;
  language?: "hu" | "en";
  issueDate?: Date;
};

export type SzamlazzInvoiceSuccess = {
  ok: true;
  invoiceNumber: string;
  netAmount: number | null;
  grossAmount: number | null;
  pdfBase64: string | null;
  customerAccountUrl: string | null;
};

export type SzamlazzInvoiceFailure = {
  ok: false;
  code: string;
  message: string;
};

export type SzamlazzInvoiceResult =
  | SzamlazzInvoiceSuccess
  | SzamlazzInvoiceFailure;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function isSzamlazzConfigured() {
  return Boolean(process.env.SZAMLAZZ_AGENT_KEY?.trim());
}

export function getSzamlazzVatKey(): string {
  const raw = process.env.SZAMLAZZ_VAT_PERCENT?.trim() || "27";
  return raw;
}

export function getSzamlazzEurHufRate(): number | null {
  const raw = Number(process.env.SZAMLAZZ_EUR_HUF_RATE ?? "");
  if (!Number.isFinite(raw) || raw <= 0) return null;
  return raw;
}

function getEInvoiceEnabled() {
  const raw = process.env.SZAMLAZZ_E_INVOICE?.trim().toLowerCase();
  if (!raw) return true;
  return raw === "1" || raw === "true" || raw === "yes";
}

function countryLabel(code: string): string {
  if (code.toUpperCase() === "HU") return "Magyarország";
  return code;
}

/** Split a gross amount into net + VAT using the configured ÁFA kulcs. */
export function splitGrossByVat(
  gross: number,
  vatKey = getSzamlazzVatKey()
): { net: number; vat: number; gross: number; vatKey: string } {
  const numeric = Number(vatKey);
  if (Number.isFinite(numeric) && numeric > 0) {
    const net = roundMoney(gross / (1 + numeric / 100));
    const vat = roundMoney(gross - net);
    return { net, vat, gross: roundMoney(gross), vatKey };
  }

  // Non-numeric keys (TAM, AAM, EU, 0, …): treat amount as net=gross, VAT=0
  const amount = roundMoney(gross);
  return { net: amount, vat: 0, gross: amount, vatKey };
}

function buildInvoiceXml(
  agentKey: string,
  input: SzamlazzInvoiceRequest
): string {
  const issueDate = input.issueDate ?? new Date();
  const date = formatDate(issueDate);
  const currency = (input.currency ?? "EUR").toUpperCase();
  const quantity = input.item.quantity ?? 1;
  const { net, vat, gross, vatKey } = splitGrossByVat(input.item.grossAmount);
  const unitNet = roundMoney(net / quantity);
  const exchangeRate =
    currency === "HUF" || currency === "Ft" ? null : getSzamlazzEurHufRate();

  const buyerAddress = input.buyer.address;

  return `<?xml version="1.0" encoding="UTF-8"?>
<xmlszamla xmlns="http://www.szamlazz.hu/xmlszamla" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.szamlazz.hu/xmlszamla https://www.szamlazz.hu/szamla/docs/xsds/agent/xmlszamla.xsd">
  <beallitasok>
    <szamlaagentkulcs>${escapeXml(agentKey)}</szamlaagentkulcs>
    <eszamla>${getEInvoiceEnabled() ? "true" : "false"}</eszamla>
    <szamlaLetoltes>true</szamlaLetoltes>
    <valaszVerzio>2</valaszVerzio>
  </beallitasok>
  <fejlec>
    <keltDatum>${date}</keltDatum>
    <teljesitesDatum>${date}</teljesitesDatum>
    <fizetesiHataridoDatum>${date}</fizetesiHataridoDatum>
    <fizmod>${escapeXml(input.paymentMethod ?? "bankkártya")}</fizmod>
    <penznem>${escapeXml(currency)}</penznem>
    <szamlaNyelve>${input.language ?? "hu"}</szamlaNyelve>
    <megjegyzes>${escapeXml(input.comment ?? "")}</megjegyzes>
    <arfolyamBank>${exchangeRate ? "MNB" : ""}</arfolyamBank>
    <arfolyam>${exchangeRate ?? ""}</arfolyam>
    <rendelesSzam>${escapeXml(input.orderNumber)}</rendelesSzam>
    <elolegszamla>${input.prepayment ? "true" : "false"}</elolegszamla>
    <vegszamla>false</vegszamla>
    <dijbekero>false</dijbekero>
    <szamlaszamElotag></szamlaszamElotag>
    <fizetve>${input.paid === false ? "false" : "true"}</fizetve>
  </fejlec>
  <elado>
    <bank></bank>
    <bankszamlaszam></bankszamlaszam>
    <emailReplyto></emailReplyto>
    <emailTargy></emailTargy>
    <emailSzoveg></emailSzoveg>
  </elado>
  <vevo>
    <nev>${escapeXml(input.buyer.name)}</nev>
    <orszag>${escapeXml(countryLabel(buyerAddress.country))}</orszag>
    <irsz>${escapeXml(buyerAddress.zip)}</irsz>
    <telepules>${escapeXml(buyerAddress.city)}</telepules>
    <cim>${escapeXml(buyerAddress.street)}</cim>
    <email>${escapeXml(input.buyer.email)}</email>
    <sendEmail>false</sendEmail>
    <adoalany>1</adoalany>
    <adoszam>${escapeXml(input.buyer.taxId)}</adoszam>
    <telefonszam>${escapeXml(input.buyer.phone ?? "")}</telefonszam>
    <megjegyzes>${escapeXml(formatBillingAddress(buyerAddress))}</megjegyzes>
  </vevo>
  <tetelek>
    <tetel>
      <megnevezes>${escapeXml(input.item.name)}</megnevezes>
      <mennyiseg>${quantity}</mennyiseg>
      <mennyisegiEgyseg>db</mennyisegiEgyseg>
      <nettoEgysegar>${unitNet}</nettoEgysegar>
      <afakulcs>${escapeXml(vatKey)}</afakulcs>
      <nettoErtek>${net}</nettoErtek>
      <afaErtek>${vat}</afaErtek>
      <bruttoErtek>${gross}</bruttoErtek>
      <megjegyzes>${escapeXml(input.item.comment ?? "")}</megjegyzes>
    </tetel>
  </tetelek>
</xmlszamla>`;
}

function extractTag(xml: string, tag: string): string | null {
  const match = xml.match(
    new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i")
  );
  if (!match?.[1]) return null;
  return match[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .trim();
}

function parseXmlResponse(body: string): SzamlazzInvoiceResult {
  const success = extractTag(body, "sikeres");
  if (success?.toLowerCase() === "true") {
    const invoiceNumber = extractTag(body, "szamlaszam");
    if (!invoiceNumber) {
      return {
        ok: false,
        code: "MISSING_INVOICE_NUMBER",
        message: "szamlazz.hu nem adott vissza számlaszámot.",
      };
    }

    const netRaw = extractTag(body, "szamlanetto");
    const grossRaw = extractTag(body, "szamlabrutto");

    return {
      ok: true,
      invoiceNumber,
      netAmount: netRaw ? Number(netRaw) : null,
      grossAmount: grossRaw ? Number(grossRaw) : null,
      pdfBase64: extractTag(body, "pdf"),
      customerAccountUrl: extractTag(body, "vevoifiokurl"),
    };
  }

  const code = extractTag(body, "hibakod") ?? "UNKNOWN";
  const message =
    extractTag(body, "hibauzenet") ??
    "Ismeretlen szamlazz.hu hiba.";

  return { ok: false, code, message };
}

function parseHeaderFallback(
  headers: Headers,
  body: string
): SzamlazzInvoiceResult {
  const errorCode = headers.get("szlahu_error_code");
  const errorMessage = headers.get("szlahu_error");
  if (errorCode || errorMessage) {
    return {
      ok: false,
      code: errorCode ?? "HEADER_ERROR",
      message: errorMessage
        ? decodeURIComponent(errorMessage.replace(/\+/g, " "))
        : "szamlazz.hu hiba",
    };
  }

  const invoiceNumberHeader = headers.get("szlahu_szamlaszam");
  if (invoiceNumberHeader) {
    return {
      ok: true,
      invoiceNumber: decodeURIComponent(invoiceNumberHeader),
      netAmount: null,
      grossAmount: null,
      pdfBase64: null,
      customerAccountUrl: null,
    };
  }

  if (body.includes("[ERR]")) {
    return {
      ok: false,
      code: "AGENT_ERROR",
      message: body.slice(0, 500),
    };
  }

  return {
    ok: false,
    code: "UNPARSEABLE_RESPONSE",
    message: "Nem értelmezhető szamlazz.hu válasz.",
  };
}

export async function issueSzamlazzInvoice(
  input: SzamlazzInvoiceRequest
): Promise<SzamlazzInvoiceResult> {
  const agentKey = process.env.SZAMLAZZ_AGENT_KEY?.trim();
  if (!agentKey) {
    return {
      ok: false,
      code: "NOT_CONFIGURED",
      message: "SZAMLAZZ_AGENT_KEY nincs beállítva.",
    };
  }

  const currency = (input.currency ?? "EUR").toUpperCase();
  if (currency !== "HUF" && currency !== "Ft" && !getSzamlazzEurHufRate()) {
    return {
      ok: false,
      code: "MISSING_EXCHANGE_RATE",
      message:
        "EUR számla kiállításához add meg a SZAMLAZZ_EUR_HUF_RATE környezeti változót (MNB árfolyam).",
    };
  }

  const xml = buildInvoiceXml(agentKey, input);
  const form = new FormData();
  form.append(
    "action-xmlagentxmlfile",
    new File([xml], "invoice.xml", { type: "text/xml; charset=UTF-8" })
  );

  const response = await fetch(SZAMLAZZ_URL, {
    method: "POST",
    body: form,
  });

  const body = await response.text();

  if (body.includes("<xmlszamlavalasz") || body.includes("<sikeres>")) {
    return parseXmlResponse(body);
  }

  return parseHeaderFallback(response.headers, body);
}
