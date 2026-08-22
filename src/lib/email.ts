import { Resend } from "resend";
import * as Sentry from "@sentry/nextjs";
import type { EmailSendStatus } from "@/generated/prisma";
import type { Locale } from "@/i18n/routing";

function getResendApiKey() {
  return process.env.RESEND_API_KEY;
}

function getFromEmail() {
  const configured =
    process.env.RESEND_FROM_EMAIL ?? "MidTravel <hello@midtravel.hu>";
  // Resend rejects example.com (not a test domain). Stale exported env can
  // also beat a corrected .env — Next does not override existing process env.
  if (configured.includes("@example.com")) {
    return "MidTravel <onboarding@resend.dev>";
  }
  return configured;
}

function getResend(): Resend | null {
  const key = getResendApiKey();
  if (!key) return null;
  return new Resend(key);
}

export function getNotifyEmail() {
  return process.env.CONTACT_NOTIFY_EMAIL ?? "midtravel2019@gmail.com";
}

export function isEmailConfigured() {
  return Boolean(getResendApiKey());
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
    const from = getFromEmail();
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `${subjectPrefix}${input.subject}`,
      html: input.html,
      replyTo: input.replyTo,
    });

    if (error) {
      console.error("[email] Resend rejected send:", {
        subject: input.subject,
        from,
        to,
        status: error.statusCode,
        name: error.name,
        message: error.message,
      });
      Sentry.captureException(error, { extra: { subject: input.subject } });
      return false;
    }

    return true;
  } catch (error) {
    Sentry.captureException(error, { extra: { subject: input.subject } });
    return false;
  }
}

export function emailStatusFromOk(ok: boolean): EmailSendStatus {
  return ok ? "sent" : "failed";
}

export async function sendGuestAndOfficeEmails(input: {
  guest: SendEmailInput;
  office: SendEmailInput;
}): Promise<{ guest: EmailSendStatus; office: EmailSendStatus }> {
  const [guestOk, officeOk] = await Promise.all([
    sendEmail(input.guest),
    sendEmail(input.office),
  ]);

  return {
    guest: emailStatusFromOk(guestOk),
    office: emailStatusFromOk(officeOk),
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function contactConfirmationSubject(locale: Locale) {
  return locale === "en"
    ? "We received your message — MidTravel"
    : "Megkaptuk az üzenetedet — MidTravel";
}

export function contactConfirmationHtml(data: { name: string; locale: Locale }) {
  const name = escapeHtml(data.name);

  if (data.locale === "en") {
    return `
      <p>Hi ${name}!</p>
      <p>Thank you for your message — the MidTravel team will get back to you soon.</p>
      <p>Best regards,<br/>MidTravel</p>
    `;
  }

  return `
    <p>Kedves ${name}!</p>
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

export function applicationConfirmationSubject(locale: Locale, tripTitle: string) {
  return locale === "en"
    ? `We received your application — ${tripTitle}`
    : `Jelentkezésed megérkezett — ${tripTitle}`;
}

export function applicationConfirmationHtml(data: {
  name: string;
  tripTitle: string;
  locale: Locale;
}) {
  const name = escapeHtml(data.name);
  const tripTitle = escapeHtml(data.tripTitle);

  if (data.locale === "en") {
    return `
      <p>Hi ${name}!</p>
      <p>We have received your application for: <strong>${tripTitle}</strong>.</p>
      <p>We will contact you within 24 hours.</p>
      <p>Best regards,<br/>MidTravel</p>
    `;
  }

  return `
    <p>Kedves ${name}!</p>
    <p>Jelentkezésedet megkaptuk az alábbi útra: <strong>${tripTitle}</strong>.</p>
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
  companionName?: string | null;
  companionPhone?: string | null;
}) {
  const companionLine = data.companionName
    ? `<p><strong>Társ (ülőhely):</strong> ${escapeHtml(data.companionName)}${
        data.companionPhone ? ` · ${escapeHtml(data.companionPhone)}` : ""
      }</p>`
    : `<p><strong>Társ (ülőhely):</strong> Nincs megadva</p>`;

  return `
    <h2>Új útjelentkezés</h2>
    <p><strong>Név:</strong> ${escapeHtml(data.fullName)}</p>
    <p><strong>E-mail:</strong> ${escapeHtml(data.email)}</p>
    <p><strong>Telefon:</strong> ${escapeHtml(data.phone)}</p>
    <p><strong>Résztvevők:</strong> ${data.participants}</p>
    <p><strong>Út:</strong> ${escapeHtml(data.tripTitle)} (${escapeHtml(data.tripSlug)})</p>
    <p><strong>Biztosítás:</strong> ${data.requestInsurance ? "Igen" : "Nem"}</p>
    ${companionLine}
    ${
      data.message
        ? `<p><strong>Üzenet:</strong></p><p>${escapeHtml(data.message).replaceAll("\n", "<br/>")}</p>`
        : ""
    }
  `;
}

export function bookingConfirmationSubject(locale: Locale, tripTitle: string) {
  return locale === "en"
    ? `Booking confirmed — ${tripTitle}`
    : `Foglalás megerősítve — ${tripTitle}`;
}

export function bookingConfirmationHtml(data: {
  name: string;
  tripTitle: string;
  participants: number;
  totalAmount: number;
  depositAmount: number;
  currency: string;
  bookingId: string;
  locale: Locale;
}) {
  const currency = data.currency.toUpperCase();
  const name = escapeHtml(data.name);
  const tripTitle = escapeHtml(data.tripTitle);
  const bookingId = escapeHtml(data.bookingId);

  if (data.locale === "en") {
    return `
      <p>Hi ${name}!</p>
      <p>We have received your booking and deposit for:</p>
      <p><strong>${tripTitle}</strong></p>
      <ul>
        <li>Booking ID: ${bookingId}</li>
        <li>Participants: ${data.participants}</li>
        <li>Total price: ${data.totalAmount} ${currency}</li>
        <li>Deposit paid: ${data.depositAmount} ${currency}</li>
      </ul>
      <p>We will contact you shortly about the remaining balance and next steps.</p>
      <p>Best regards,<br/>MidTravel</p>
    `;
  }

  return `
    <p>Kedves ${name}!</p>
    <p>Foglalásodat és előlegfizetésedet megkaptuk az alábbi útra:</p>
    <p><strong>${tripTitle}</strong></p>
    <ul>
      <li>Foglalás azonosító: ${bookingId}</li>
      <li>Résztvevők: ${data.participants}</li>
      <li>Teljes ár: ${data.totalAmount} ${currency}</li>
      <li>Fizetett előleg: ${data.depositAmount} ${currency}</li>
    </ul>
    <p>A fennmaradó összegről és a további teendőkről hamarosan értesítünk.</p>
    <p>Üdvözlettel,<br/>MidTravel</p>
  `;
}

export function passwordResetSubject(locale: "hu" | "en") {
  return locale === "en"
    ? "Reset your password — MidTravel"
    : "Jelszó visszaállítása — MidTravel";
}

export function emailChangeVerificationSubject(locale: "hu" | "en") {
  return locale === "en"
    ? "Confirm your new email — MidTravel"
    : "Új e-mail cím megerősítése — MidTravel";
}

export function emailVerificationSubject(locale: "hu" | "en") {
  return locale === "en"
    ? "Verify your email — MidTravel"
    : "E-mail cím megerősítése — MidTravel";
}

export function emailVerificationHtml(data: {
  name: string;
  url: string;
  locale: "hu" | "en";
}) {
  const name = escapeHtml(data.name);
  const url = escapeHtml(data.url);

  if (data.locale === "en") {
    return `
      <p>Hi ${name}!</p>
      <p>Please confirm your MidTravel account email. The link below is valid for 1 hour:</p>
      <p><a href="${url}">Verify email address</a></p>
      <p>If you did not create this account, you can ignore this email.</p>
      <p>Best regards,<br/>MidTravel</p>
    `;
  }

  return `
    <p>Kedves ${name}!</p>
    <p>Erősítsd meg a MidTravel fiókod e-mail címét. Az alábbi link 1 órán át érvényes:</p>
    <p><a href="${url}">E-mail cím megerősítése</a></p>
    <p>Ha nem te hoztad létre ezt a fiókot, hagyd figyelmen kívül ezt a levelet.</p>
    <p>Üdvözlettel,<br/>MidTravel</p>
  `;
}

export function emailChangeVerificationHtml(data: {
  name: string;
  url: string;
  locale: "hu" | "en";
}) {
  const name = escapeHtml(data.name);
  const url = escapeHtml(data.url);

  if (data.locale === "en") {
    return `
      <p>Hi ${name}!</p>
      <p>You requested a new email address for your MidTravel account. The address will change only after you click the link below. The link is valid for 1 hour:</p>
      <p><a href="${url}">Confirm new email address</a></p>
      <p>If you did not request this, you can ignore this email — your current address will stay the same.</p>
      <p>Best regards,<br/>MidTravel</p>
    `;
  }

  return `
    <p>Kedves ${name}!</p>
    <p>Új e-mail címet kértél a MidTravel fiókodhoz. A cím csak az alábbi linkre kattintás után cserélődik. A link 1 órán át érvényes:</p>
    <p><a href="${url}">Új e-mail cím megerősítése</a></p>
    <p>Ha nem te kérted, hagyd figyelmen kívül ezt a levelet — a jelenlegi címed nem változik.</p>
    <p>Üdvözlettel,<br/>MidTravel</p>
  `;
}

export function passwordResetHtml(data: {
  name: string;
  url: string;
  locale: "hu" | "en";
}) {
  const name = escapeHtml(data.name);
  const url = escapeHtml(data.url);

  if (data.locale === "en") {
    return `
      <p>Hi ${name}!</p>
      <p>We received a request to reset your MidTravel password. The link below is valid for 1 hour:</p>
      <p><a href="${url}">Reset password</a></p>
      <p>If you did not request this, you can ignore this email — your password will stay the same.</p>
      <p>Best regards,<br/>MidTravel</p>
    `;
  }

  return `
    <p>Kedves ${name}!</p>
    <p>Jelszó-visszaállítási kérést kaptunk a MidTravel fiókodhoz. Az alábbi link 1 órán át érvényes:</p>
    <p><a href="${url}">Jelszó visszaállítása</a></p>
    <p>Ha nem te kérted, hagyd figyelmen kívül ezt a levelet — a jelszavad nem változik.</p>
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
  companionName?: string | null;
  companionPhone?: string | null;
}) {
  const currency = data.currency.toUpperCase();
  const companionLine = data.companionName
    ? `<p><strong>Társ (ülőhely):</strong> ${escapeHtml(data.companionName)}${
        data.companionPhone ? ` · ${escapeHtml(data.companionPhone)}` : ""
      }</p>`
    : `<p><strong>Társ (ülőhely):</strong> Nincs megadva</p>`;

  return `
    <h2>Új fizetett foglalás</h2>
    <p><strong>Foglalás ID:</strong> ${escapeHtml(data.bookingId)}</p>
    <p><strong>Név:</strong> ${escapeHtml(data.name)}</p>
    <p><strong>E-mail:</strong> ${escapeHtml(data.email)}</p>
    <p><strong>Út:</strong> ${escapeHtml(data.tripTitle)} (${escapeHtml(data.tripSlug)})</p>
    <p><strong>Résztvevők:</strong> ${data.participants}</p>
    <p><strong>Teljes ár:</strong> ${data.totalAmount} ${currency}</p>
    <p><strong>Fizetett előleg:</strong> ${data.depositAmount} ${currency}</p>
    ${companionLine}
  `;
}
