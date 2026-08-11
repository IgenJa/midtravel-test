import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, type AuthUser, type Session } from "@/lib/auth";
import { routing } from "@/i18n/routing";
import { isAdminRole } from "@/lib/session-utils";

export { getUserDisplayName, isAdminRole } from "@/lib/session-utils";

export async function getSession(): Promise<Session | null> {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireUser(locale?: string): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect(`/${locale ?? routing.defaultLocale}/login`);
  }
  return session;
}

export async function requireAdmin(locale?: string): Promise<Session> {
  const session = await requireUser(locale);
  if (!isAdminRole(session.user.role)) {
    redirect(`/${locale ?? routing.defaultLocale}/profile`);
  }
  return session;
}
