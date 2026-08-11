import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TeamMemberForm } from "@/components/admin/TeamMemberForm";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminNewTeamMemberPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  return (
    <>
      <SectionHeading
        eyebrow={t("navTeam")}
        title={t("newTeamMember")}
        align="left"
      />
      <div className="mt-8">
        <TeamMemberForm />
      </div>
    </>
  );
}
