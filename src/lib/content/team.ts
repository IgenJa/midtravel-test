import { prisma } from "@/lib/prisma";
import type { Locale } from "@/i18n/routing";
import type { TeamMember } from "@/types";
import type { TeamMember as DbTeamMember } from "@/generated/prisma";

export function mapTeamMember(
  member: DbTeamMember,
  locale: Locale
): TeamMember {
  return {
    id: member.id,
    name: member.name,
    position: locale === "hu" ? member.positionHu : member.positionEn,
    description:
      locale === "hu" ? member.descriptionHu : member.descriptionEn,
    photo: member.photo,
    social: {
      linkedin: member.linkedin ?? undefined,
      instagram: member.instagram ?? undefined,
      email: member.email ?? undefined,
    },
  };
}

export async function getTeamMembers(locale: Locale): Promise<TeamMember[]> {
  const rows = await prisma.teamMember.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return rows.map((member) => mapTeamMember(member, locale));
}

export async function getAllTeamMembersForAdmin(): Promise<DbTeamMember[]> {
  return prisma.teamMember.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getTeamMemberByIdForAdmin(
  id: string
): Promise<DbTeamMember | null> {
  return prisma.teamMember.findUnique({ where: { id } });
}
