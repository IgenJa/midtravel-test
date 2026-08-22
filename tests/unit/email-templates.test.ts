import { describe, expect, it } from "vitest";
import {
  applicationConfirmationHtml,
  applicationConfirmationSubject,
  applicationNotificationHtml,
  bookingConfirmationHtml,
  bookingConfirmationSubject,
  contactConfirmationHtml,
  contactConfirmationSubject,
  contactNotificationHtml,
  emailChangeVerificationHtml,
  emailChangeVerificationSubject,
  emailVerificationHtml,
  emailVerificationSubject,
  getNotifyEmail,
  passwordResetHtml,
  passwordResetSubject,
} from "@/lib/email";

describe("email subjects", () => {
  it("switches HU / EN copy", () => {
    expect(contactConfirmationSubject("hu")).toContain("Megkaptuk");
    expect(contactConfirmationSubject("en")).toContain("We received");
    expect(applicationConfirmationSubject("hu", "Izland")).toContain("Izland");
    expect(bookingConfirmationSubject("en", "Iceland")).toContain("Iceland");
    expect(passwordResetSubject("hu")).toContain("Jelszó");
    expect(emailVerificationSubject("en")).toContain("Verify");
    expect(emailChangeVerificationSubject("hu")).toContain("Új e-mail");
    expect(emailChangeVerificationSubject("en")).toContain("new email");
  });
});

describe("HTML escaping", () => {
  it("escapes guest-controlled fields so markup cannot land in the office mail", () => {
    const contact = contactNotificationHtml({
      name: `<img src=x onerror=alert(1)>`,
      email: `a@b.com"><script>`,
      subject: `Hello & goodbye`,
      message: `line1\n<script>alert(1)</script>`,
    });

    expect(contact).not.toContain("<script>");
    expect(contact).not.toContain("<img");
    expect(contact).toContain("&lt;img");
    expect(contact).toContain("&amp;");
    expect(contact).toContain("<br/>");

    const apply = applicationNotificationHtml({
      fullName: `<b>Hack</b>`,
      email: "x@y.com",
      phone: "1234567",
      participants: 2,
      tripSlug: `iceland"><img`,
      tripTitle: `Izland & Fjords`,
      message: "Kérdés",
      requestInsurance: true,
      companionName: `<b>Társ</b>`,
      companionPhone: "+36301112233",
    });
    expect(apply).toContain("&lt;b&gt;");
    expect(apply).toContain("&amp;");
    expect(apply).toContain("Igen");
    expect(apply).toContain("Társ (ülőhely)");
    expect(apply).toContain("+36301112233");
    expect(apply).not.toContain("<b>Hack</b>");
    expect(apply).not.toContain("<b>Társ</b>");
  });

  it("escapes names and URLs in guest-facing templates", () => {
    const reset = passwordResetHtml({
      name: `<Evil>`,
      url: `https://midtravel.hu/reset"><script>`,
      locale: "hu",
    });
    expect(reset).toContain("&lt;Evil&gt;");
    expect(reset).toContain("&quot;");
    expect(reset).not.toContain("<Evil>");

    const verify = emailVerificationHtml({
      name: "Anna",
      url: "https://midtravel.hu/verify",
      locale: "en",
    });
    expect(verify).toContain('href="https://midtravel.hu/verify"');
    expect(verify).toContain("Verify email");

    const change = emailChangeVerificationHtml({
      name: `<Evil>`,
      url: `https://midtravel.hu/verify"><script>`,
      locale: "hu",
    });
    expect(change).toContain("&lt;Evil&gt;");
    expect(change).toContain("&quot;");
    expect(change).toContain("csak az alábbi linkre kattintás után");
    expect(change).not.toContain("<Evil>");

    const confirm = contactConfirmationHtml({
      name: "Béla",
      locale: "hu",
    });
    expect(confirm).toContain("Kedves Béla");
  });

  it("includes booking amounts and escaped ids", () => {
    const html = bookingConfirmationHtml({
      name: "Anna",
      tripTitle: "Izland",
      participants: 2,
      totalAmount: 2000,
      depositAmount: 600,
      currency: "eur",
      bookingId: `id"><x`,
      locale: "hu",
    });
    expect(html).toContain("2000 EUR");
    expect(html).toContain("600 EUR");
    expect(html).toContain("&quot;");
  });
});

describe("email config helpers", () => {
  it("exposes a notify inbox for office copies", () => {
    expect(getNotifyEmail()).toMatch(/@/);
  });
});
