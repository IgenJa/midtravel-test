import { revalidatePath } from "next/cache";

export function revalidateTrips() {
  revalidatePath("/", "layout");
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/trips", "layout");
  revalidatePath("/[locale]/apply", "layout");
  revalidatePath("/[locale]/admin", "layout");
}

export function revalidateTeam() {
  revalidatePath("/[locale]/team", "layout");
  revalidatePath("/[locale]/admin", "layout");
}

export function revalidateTestimonials() {
  revalidatePath("/", "layout");
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/admin", "layout");
}

export function revalidateCompany() {
  revalidatePath("/", "layout");
  revalidatePath("/[locale]", "layout");
  revalidatePath("/[locale]/contact", "page");
  revalidatePath("/[locale]/impressum", "page");
  revalidatePath("/[locale]/privacy-policy", "page");
  revalidatePath("/[locale]/admin", "layout");
}
