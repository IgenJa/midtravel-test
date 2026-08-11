import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { TeamRowActions } from "@/components/admin/TeamRowActions";
import { getAllTeamMembersForAdmin } from "@/lib/content/team";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminTeamPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const members = await getAllTeamMembersForAdmin();

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          eyebrow={t("navTeam")}
          title={t("teamTitle")}
          description={t("teamDescription")}
          align="left"
        />
        <Button href="/admin/team/new">{t("newTeamMember")}</Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">{t("fieldName")}</th>
              <th className="px-4 py-3 font-semibold">{t("fieldPositionHu")}</th>
              <th className="px-4 py-3 font-semibold">{t("fieldSortOrder")}</th>
              <th className="px-4 py-3 font-semibold">{t("status")}</th>
              <th className="px-4 py-3 font-semibold">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {member.name}
                </td>
                <td className="px-4 py-3 text-slate-600">{member.positionHu}</td>
                <td className="px-4 py-3 text-slate-600">{member.sortOrder}</td>
                <td className="px-4 py-3">
                  {member.published ? t("published") : t("draft")}
                </td>
                <td className="px-4 py-3">
                  <TeamRowActions id={member.id} />
                </td>
              </tr>
            ))}
            {members.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  {t("emptyTeam")}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
