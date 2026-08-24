import { requireAdmin } from "@/lib/session";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { AdminNav } from "@/components/admin/AdminNav";
import { prisma } from "@/lib/prisma";
import { setRequestLocale } from "next-intl/server";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin(locale);

  const [unreadContacts, unreadApplications] = await Promise.all([
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.tripApplication.count({
      where: { read: false, status: "open" },
    }),
  ]);

  return (
    <AdminGuard>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminNav unreadInbound={unreadContacts + unreadApplications} />
        {children}
      </div>
    </AdminGuard>
  );
}
