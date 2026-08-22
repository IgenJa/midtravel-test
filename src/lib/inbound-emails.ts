import { prisma } from "@/lib/prisma";
import {
  applicationConfirmationHtml,
  applicationConfirmationSubject,
  applicationNotificationHtml,
  contactConfirmationHtml,
  contactConfirmationSubject,
  contactNotificationHtml,
  getNotifyEmail,
  sendGuestAndOfficeEmails,
} from "@/lib/email";
import { parseLocale, pickLocalizedTitle } from "@/lib/locale";

export async function deliverContactEmails(id: string): Promise<boolean> {
  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) return false;

  const locale = parseLocale(message.locale);

  const status = await sendGuestAndOfficeEmails({
    guest: {
      to: message.email,
      subject: contactConfirmationSubject(locale),
      html: contactConfirmationHtml({ name: message.name, locale }),
    },
    office: {
      to: getNotifyEmail(),
      subject: `Kapcsolat: ${message.subject}`,
      html: contactNotificationHtml({
        name: message.name,
        email: message.email,
        subject: message.subject,
        message: message.message,
      }),
      replyTo: message.email,
    },
  });

  await prisma.contactMessage.update({
    where: { id: message.id },
    data: {
      guestEmailStatus: status.guest,
      officeEmailStatus: status.office,
    },
  });

  return status.guest === "sent" && status.office === "sent";
}

export async function deliverApplicationEmails(
  id: string,
  tripTitleHint?: string
): Promise<boolean> {
  const application = await prisma.tripApplication.findUnique({
    where: { id },
    include: {
      trip: {
        include: {
          translations: { select: { locale: true, title: true } },
        },
      },
    },
  });
  if (!application) return false;

  const locale = parseLocale(application.locale);
  const translations = application.trip?.translations ?? [];
  const guestTitle =
    tripTitleHint ??
    pickLocalizedTitle(translations, locale, application.tripSlug);
  const officeTitle = pickLocalizedTitle(
    translations,
    "hu",
    application.tripSlug
  );

  const status = await sendGuestAndOfficeEmails({
    guest: {
      to: application.email,
      subject: applicationConfirmationSubject(locale, guestTitle),
      html: applicationConfirmationHtml({
        name: application.fullName,
        tripTitle: guestTitle,
        locale,
      }),
    },
    office: {
      to: getNotifyEmail(),
      subject: `Új jelentkezés: ${officeTitle}`,
      html: applicationNotificationHtml({
        fullName: application.fullName,
        email: application.email,
        phone: application.phone,
        participants: application.participants,
        tripSlug: application.tripSlug,
        tripTitle: officeTitle,
        message: application.message,
        requestInsurance: application.requestInsurance,
        companionName: application.companionName,
        companionPhone: application.companionPhone,
      }),
      replyTo: application.email,
    },
  });

  await prisma.tripApplication.update({
    where: { id: application.id },
    data: {
      guestEmailStatus: status.guest,
      officeEmailStatus: status.office,
    },
  });

  return status.guest === "sent" && status.office === "sent";
}
