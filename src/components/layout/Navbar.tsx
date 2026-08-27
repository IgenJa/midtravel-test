"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useAuth, getUserDisplayName } from "@/contexts/AuthContext";
import { getCompany } from "@/data/company";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", key: "home" as const },
  { href: "/about", key: "about" as const },
  { href: "/trips", key: "trips" as const },
  { href: "/team", key: "team" as const },
  { href: "/contact", key: "contact" as const },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const company = getCompany(locale);
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();

  const displayName = user ? getUserDisplayName(user.fullName) : "";

  const desktopLinkClass = (href: string) =>
    cn(
      "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
      isActivePath(pathname, href)
        ? "bg-teal-600 font-semibold text-white"
        : "text-slate-900 hover:bg-white/50 hover:text-teal-700"
    );

  const mobileLinkClass = (href: string) =>
    cn(
      "block rounded-lg px-4 py-3 text-base font-medium transition-colors",
      isActivePath(pathname, href)
        ? "bg-teal-600 text-white"
        : "text-slate-800 hover:bg-white/60 hover:text-teal-700"
    );

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav
        className="border-b border-teal-300/45 bg-[#f4efd8]/88 backdrop-blur-xl"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt={company.name}
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-teal-300/50"
              priority
            />
            <span className="font-display text-xl font-bold text-slate-900">
              {company.name}
            </span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={desktopLinkClass(link.href)}
                aria-current={isActivePath(pathname, link.href) ? "page" : undefined}
              >
                {t(link.key)}
              </Link>
            ))}
            <LanguageSwitcher />

            {!isLoading && isAuthenticated && user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className={desktopLinkClass("/admin")}
                    aria-current={isActivePath(pathname, "/admin") ? "page" : undefined}
                  >
                    {t("admin")}
                  </Link>
                )}
                <Link
                  href="/profile"
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    isActivePath(pathname, "/profile")
                      ? "bg-teal-600 text-white"
                      : "bg-white/70 text-teal-800 hover:bg-white"
                  )}
                  aria-current={isActivePath(pathname, "/profile") ? "page" : undefined}
                >
                  <User className="h-4 w-4" />
                  {displayName}
                </Link>
              </>
            ) : (
              !isLoading && (
                <>
                  <Link
                    href="/login"
                    className={desktopLinkClass("/login")}
                    aria-current={isActivePath(pathname, "/login") ? "page" : undefined}
                  >
                    {t("signIn")}
                  </Link>
                  <Link
                    href="/register"
                    className={desktopLinkClass("/register")}
                    aria-current={isActivePath(pathname, "/register") ? "page" : undefined}
                  >
                    {t("signUp")}
                  </Link>
                </>
              )
            )}
          </div>

          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-800 hover:bg-white/60"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label={t("toggleMenu")}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-teal-600/20 bg-teal-50 md:hidden"
            >
              <div className="space-y-1 px-4 py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={mobileLinkClass(link.href)}
                    aria-current={isActivePath(pathname, link.href) ? "page" : undefined}
                  >
                    {t(link.key)}
                  </Link>
                ))}

                {!isLoading && !isAuthenticated && (
                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      href="/login"
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsOpen(false)}
                    >
                      {t("signIn")}
                    </Button>
                    <Button
                      href="/register"
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsOpen(false)}
                    >
                      {t("signUp")}
                    </Button>
                  </div>
                )}

                {!isLoading && isAuthenticated && user && (
                  <div className="flex flex-col items-center gap-2 border-t border-slate-100 pt-2">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className={mobileLinkClass("/admin")}
                        aria-current={isActivePath(pathname, "/admin") ? "page" : undefined}
                      >
                        {t("admin")}
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-semibold",
                        isActivePath(pathname, "/profile")
                          ? "bg-teal-600 text-white"
                          : "bg-white text-teal-800 hover:bg-teal-100"
                      )}
                      aria-current={isActivePath(pathname, "/profile") ? "page" : undefined}
                    >
                      <User className="h-4 w-4" />
                      {displayName}
                    </Link>
                  </div>
                )}

                <div className="flex justify-center pt-3">
                  <LanguageSwitcher />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
