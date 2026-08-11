import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TeamMemberForm } from "@/components/admin/TeamMemberForm";
import { getTeamMemberByIdForAdmin } from "@/lib/content/team";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function AdminEditTeamMemberPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const member = await getTeamMemberByIdForAdmin(id);
  if (!member) notFound();

  return (
    <>
      <SectionHeading
        eyebrow={t("navTeam")}
        title={t("editTeamMember")}
        align="left"
      />
      <div className="mt-8">
        <TeamMemberForm
          initial={{
            id: member.id,
            name: member.name,
            positionHu: member.positionHu,
            positionEn: member.positionEn,
            descriptionHu: member.descriptionHu,
            descriptionEn: member.descriptionEn,
            photo: member.photo,
            linkedin: member.linkedin ?? "",
            instagram: member.instagram ?? "",
            email: member.email ?? "",
            sortOrder: member.sortOrder,
            published: member.published,
          }}
        />
      </div>
    </>
  );
}
