export const ROBOTS_PRIVATE_PREFIXES = [
  "/admin",
  "/profile",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/booking",
] as const;

export function getRobotsDisallowPaths(locales: readonly string[]): string[] {
  return [
    "/api/",
    "/uploads/",
    ...locales.flatMap((locale) =>
      ROBOTS_PRIVATE_PREFIXES.map((prefix) => `/${locale}${prefix}`)
    ),
  ];
}
