import { Resend } from "resend";
import * as Sentry from "@sentry/nextjs";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail =
  process.env.RESEND_FROM_EMAIL ?? "MidTravel <hello@midtravel.hu>";
const notifyEmail =
  process.env.CONTACT_NOTIFY_EMAIL ?? "info@midtravel.hu";

function getResend(): Resend | null {
  if (!resendApiKey) return null;
  return new Resend(resendApiKey);
}

export function getNotifyEmail() {
  return notifyEmail;
}

export function isEmailConfigured() {
  return Boolean(resendApiKey);
}

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

function resolveRecipients(to: string | string[]): {
  to: string | string[];
  subjectPrefix: string;
} {
  const override = process.env.EMAIL_OVERRIDE?.trim();
  if (!override) {
    return { to, subjectPrefix: "" };
  }

  const original = Array.isArray(to) ? to.join(", ") : to;
  return {
    to: override,
    subjectPrefix: `[teszt → eredeti: ${original}] `,
  };
}

export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    if (process.env.NODE_ENV === "development") {
      console.info("[email] RESEND_API_KEY missing — skipped send:", input.subject);
    }
    return false;
  }

  const { to, subjectPrefix } = resolveRecipients(input.to);

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: `${subjectPrefix}${input.subject}`,
      html: input.html,
      replyTo: input.replyTo,
    });

    if (error) {
      Sentry.captureException(error, { extra: { subject: input.subject } });
      return false;
    }

    return true;
  } catch (error) {
    Sentry.captureException(error, { extra: { subject: input.subject } });
    return false;
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function contactConfirmationHtml(name: string) {
  return `
    <p>Kedves ${escapeHtml(name)}!</p>
    <p>Köszönjük üzenetedet — a MidTravel csapata hamarosan válaszol.</p>
    <p>Üdvözlettel,<br/>MidTravel</p>
  `;
}

export function contactNotificationHtml(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  return `
    <h2>Új kapcsolati üzenet</h2>
    <p><strong>Név:</strong> ${escapeHtml(data.name)}</p>
    <p><strong>E-mail:</strong> ${escapeHtml(data.email)}</p>
    <p><strong>Tárgy:</strong> ${escapeHtml(data.subject)}</p>
    <p><strong>Üzenet:</strong></p>
    <p>${escapeHtml(data.message).replaceAll("\n", "<br/>")}</p>
  `;
}

export function applicationConfirmationHtml(name: string, tripTitle: string) {
  return `
    <p>Kedves ${escapeHtml(name)}!</p>
    <p>Jelentkezésedet megkaptuk az alábbi útra: <strong>${escapeHtml(tripTitle)}</strong>.</p>
    <p>24 órán belül felvesszük veled a kapcsolatot.</p>
    <p>Üdvözlettel,<br/>MidTravel</p>
  `;
}

export function applicationNotificationHtml(data: {
  fullName: string;
  email: string;
  phone: string;
  participants: number;
  tripSlug: string;
  tripTitle: string;
  message?: string | null;
  requestInsurance: boolean;
}) {
  return `
    <h2>Új útjelentkezés</h2>
    <p><strong>Név:</strong> ${escapeHtml(data.fullName)}</p>
    <p><strong>E-mail:</strong> ${escapeHtml(data.email)}</p>
    <p><strong>Telefon:</strong> ${escapeHtml(data.phone)}</p>
    <p><strong>Résztvevők:</strong> ${data.participants}</p>
    <p><strong>Út:</strong> ${escapeHtml(data.tripTitle)} (${escapeHtml(data.tripSlug)})</p>
    <p><strong>Biztosítás:</strong> ${data.requestInsurance ? "Igen" : "Nem"}</p>
    ${
      data.message
        ? `<p><strong>Üzenet:</strong></p><p>${escapeHtml(data.message).replaceAll("\n", "<br/>")}</p>`
        : ""
    }
  `;
}

export function bookingConfirmationHtml(data: {
  name: string;
  tripTitle: string;
  participants: number;
  totalAmount: number;
  depositAmount: number;
  currency: string;
  bookingId: string;
}) {
  const currency = data.currency.toUpperCase();
  return `
    <p>Kedves ${escapeHtml(data.name)}!</p>
    <p>Foglalásodat és előlegfizetésedet megkaptuk az alábbi útra:</p>
    <p><strong>${escapeHtml(data.tripTitle)}</strong></p>
    <ul>
      <li>Foglalás azonosító: ${escapeHtml(data.bookingId)}</li>
      <li>Résztvevők: ${data.participants}</li>
      <li>Teljes ár: ${data.totalAmount} ${currency}</li>
      <li>Fizetett előleg: ${data.depositAmount} ${currency}</li>
    </ul>
    <p>A fennmaradó összegről és a további teendőkről hamarosan értesítünk.</p>
    <p>Üdvözlettel,<br/>MidTravel</p>
  `;
}

export function bookingNotificationHtml(data: {
  name: string;
  email: string;
  tripTitle: string;
  tripSlug: string;
  participants: number;
  totalAmount: number;
  depositAmount: number;
  currency: string;
  bookingId: string;
}) {
  const currency = data.currency.toUpperCase();
  return `
    <h2>Új fizetett foglalás</h2>
    <p><strong>Foglalás ID:</strong> ${escapeHtml(data.bookingId)}</p>
    <p><strong>Név:</strong> ${escapeHtml(data.name)}</p>
    <p><strong>E-mail:</strong> ${escapeHtml(data.email)}</p>
    <p><strong>Út:</strong> ${escapeHtml(data.tripTitle)} (${escapeHtml(data.tripSlug)})</p>
    <p><strong>Résztvevők:</strong> ${data.participants}</p>
    <p><strong>Teljes ár:</strong> ${data.totalAmount} ${currency}</p>
    <p><strong>Fizetett előleg:</strong> ${data.depositAmount} ${currency}</p>
  `;
}
