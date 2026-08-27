"use client";

import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const links: {
  href:
    | "/admin"
    | "/admin/trips"
    | "/admin/team"
    | "/admin/testimonials"
    | "/admin/bookings"
    | "/admin/inbound"
    | "/admin/settings";
  key:
    | "navOverview"
    | "navTrips"
    | "navTeam"
    | "navTestimonials"
    | "navBookings"
    | "navInbound"
    | "navSettings";
  exact?: boolean;
}[] = [
  { href: "/admin", key: "navOverview", exact: true },
  { href: "/admin/trips", key: "navTrips" },
  { href: "/admin/bookings", key: "navBookings" },
  { href: "/admin/inbound", key: "navInbound" },
  { href: "/admin/team", key: "navTeam" },
  { href: "/admin/testimonials", key: "navTestimonials" },
  { href: "/admin/settings", key: "navSettings" },
];

type Props = {
  unreadInbound?: number;
  unreadBookings?: number;
};

export function AdminNav({ unreadInbound = 0, unreadBookings = 0 }: Props) {
  const pathname = usePathname();
  const t = useTranslations("admin");

  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`);
        const badgeCount =
          link.href === "/admin/inbound"
            ? unreadInbound
            : link.href === "/admin/bookings"
              ? unreadBookings
              : 0;
        const showBadge = badgeCount > 0;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              active
                ? "bg-teal-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
          >
            {t(link.key)}
            {showBadge ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs font-bold leading-none",
                  active ? "bg-white/25 text-white" : "bg-teal-600 text-white"
                )}
              >
                {badgeCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
