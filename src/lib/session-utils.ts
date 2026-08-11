/** Client-safe session helpers (no next/headers). */

export function isAdminRole(role: string | null | undefined): boolean {
  if (!role) return false;
  return role.split(",").map((r) => r.trim()).includes("admin");
}

export function getUserDisplayName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}
