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
    | "/admin/bookings";
  key:
    | "navOverview"
    | "navTrips"
    | "navTeam"
    | "navTestimonials"
    | "navBookings";
  exact?: boolean;
}[] = [
  { href: "/admin", key: "navOverview", exact: true },
  { href: "/admin/trips", key: "navTrips" },
  { href: "/admin/bookings", key: "navBookings" },
  { href: "/admin/team", key: "navTeam" },
  { href: "/admin/testimonials", key: "navTestimonials" },
];

export function AdminNav() {
  const pathname = usePathname();
  const t = useTranslations("admin");

  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              active
                ? "bg-teal-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
          >
            {t(link.key)}
          </Link>
        );
      })}
    </nav>
  );
}
