"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export type ProfileUpdateInput = {
  fullName: string;
  phone: string;
};

export type ProfileUpdateResult =
  | { ok: true; user: { id: string; name: string; email: string; phone: string | null; role: string; createdAt: Date } }
  | { ok: false; code: "NOT_AUTHENTICATED" | "UPDATE_FAILED" };

export async function updateUserProfile(
  input: ProfileUpdateInput
): Promise<ProfileUpdateResult> {
  const session = await getSession();
  if (!session) {
    return { ok: false, code: "NOT_AUTHENTICATED" };
  }

  const fullName = input.fullName.trim();
  const phone = input.phone.trim() || null;

  if (!fullName) {
    return { ok: false, code: "UPDATE_FAILED" };
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: fullName,
        phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return { ok: true, user };
  } catch {
    return { ok: false, code: "UPDATE_FAILED" };
  }
}
