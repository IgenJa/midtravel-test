"use server";

import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/prisma";
import { getSession, isAdminRole } from "@/lib/session";
import { revalidateTeam } from "@/lib/content/cache";

export type TeamMemberSaveInput = {
  id?: string;
  name: string;
  positionHu: string;
  positionEn: string;
  descriptionHu: string;
  descriptionEn: string;
  photo: string;
  linkedin?: string;
  instagram?: string;
  email?: string;
  sortOrder: number;
  published: boolean;
};

export type AdminTeamResult =
  | { ok: true; id: string }
  | {
      ok: false;
      code: "UNAUTHORIZED" | "VALIDATION" | "NOT_FOUND" | "SAVE_FAILED";
    };

async function requireAdmin() {
  const session = await getSession();
  return Boolean(session && isAdminRole(session.user.role));
}

export async function saveTeamMember(
  input: TeamMemberSaveInput
): Promise<AdminTeamResult> {
  if (!(await requireAdmin())) return { ok: false, code: "UNAUTHORIZED" };

  const name = input.name.trim();
  const positionHu = input.positionHu.trim();
  const positionEn = input.positionEn.trim();
  const descriptionHu = input.descriptionHu.trim();
  const descriptionEn = input.descriptionEn.trim();
  const photo = input.photo.trim();

  if (
    !name ||
    !positionHu ||
    !positionEn ||
    !descriptionHu ||
    !descriptionEn ||
    !photo
  ) {
    return { ok: false, code: "VALIDATION" };
  }

  const data = {
    name,
    positionHu,
    positionEn,
    descriptionHu,
    descriptionEn,
    photo,
    linkedin: input.linkedin?.trim() || null,
    instagram: input.instagram?.trim() || null,
    email: input.email?.trim() || null,
    sortOrder: Number.isFinite(input.sortOrder) ? Math.round(input.sortOrder) : 0,
    published: Boolean(input.published),
  };

  try {
    if (input.id) {
      const existing = await prisma.teamMember.findUnique({
        where: { id: input.id },
        select: { id: true },
      });
      if (!existing) return { ok: false, code: "NOT_FOUND" };

      await prisma.teamMember.update({ where: { id: input.id }, data });
      revalidateTeam();
      return { ok: true, id: input.id };
    }

    const created = await prisma.teamMember.create({
      data,
      select: { id: true },
    });
    revalidateTeam();
    return { ok: true, id: created.id };
  } catch (error) {
    Sentry.captureException(error);
    return { ok: false, code: "SAVE_FAILED" };
  }
}

export async function deleteTeamMember(id: string): Promise<AdminTeamResult> {
  if (!(await requireAdmin())) return { ok: false, code: "UNAUTHORIZED" };

  try {
    await prisma.teamMember.delete({ where: { id } });
    revalidateTeam();
    return { ok: true, id };
  } catch (error) {
    Sentry.captureException(error);
    return { ok: false, code: "SAVE_FAILED" };
  }
}
