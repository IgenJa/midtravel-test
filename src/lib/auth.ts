import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";
import {
  emailChangeVerificationHtml,
  emailChangeVerificationSubject,
  emailVerificationHtml,
  emailVerificationSubject,
  passwordResetHtml,
  passwordResetSubject,
  sendEmail,
} from "@/lib/email";
import { getAuthBaseUrl, getTrustedOrigins } from "@/lib/auth-origins";
import {
  localeFromAuthCallbackUrl,
  verificationEmailUrl,
} from "@/lib/auth-email-urls";

const appUrl = getAuthBaseUrl();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: appUrl,
  trustedOrigins: getTrustedOrigins(),
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const { locale, url: verifyUrl, emailChange } = verificationEmailUrl(url);
      await sendEmail({
        to: user.email,
        subject: emailChange
          ? emailChangeVerificationSubject(locale)
          : emailVerificationSubject(locale),
        html: emailChange
          ? emailChangeVerificationHtml({
              name: user.name,
              url: verifyUrl,
              locale,
            })
          : emailVerificationHtml({
              name: user.name,
              url: verifyUrl,
              locale,
            }),
      });
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    customSyntheticUser: ({ coreFields, additionalFields, id }) => ({
      ...coreFields,
      role: "user",
      banned: false,
      banReason: null,
      banExpires: null,
      ...additionalFields,
      id,
    }),
    sendResetPassword: async ({ user, url }) => {
      const locale = localeFromAuthCallbackUrl(url);
      await sendEmail({
        to: user.email,
        subject: passwordResetSubject(locale),
        html: passwordResetHtml({
          name: user.name,
          url,
          locale,
        }),
      });
    },
  },
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
        input: true,
      },
    },
    changeEmail: {
      enabled: true,
    },
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;
