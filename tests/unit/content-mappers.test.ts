import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {},
}));

import { mapTeamMember } from "@/lib/content/team";
import { mapTestimonial } from "@/lib/content/testimonials";
import type { TeamMember, Testimonial } from "@/generated/prisma";

function teamRow(overrides: Partial<TeamMember> = {}): TeamMember {
  return {
    id: "m1",
    name: "Anna Kovács",
    positionHu: "Idegenvezető",
    positionEn: "Guide",
    descriptionHu: "HU leírás",
    descriptionEn: "EN bio",
    photo: "/team/anna.jpg",
    linkedin: "https://linkedin.com/in/anna",
    instagram: null,
    email: "anna@midtravel.hu",
    sortOrder: 0,
    published: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function testimonialRow(overrides: Partial<Testimonial> = {}): Testimonial {
  return {
    id: "t1",
    name: "Béla",
    locationHu: "Szeged",
    locationEn: "Szeged, Hungary",
    textHu: "Szuper út",
    textEn: "Great trip",
    rating: 5,
    avatar: "/avatars/bela.jpg",
    sortOrder: 0,
    published: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

describe("mapTeamMember", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("picks HU / EN fields and drops null social links", () => {
    expect(mapTeamMember(teamRow(), "hu")).toMatchObject({
      name: "Anna Kovács",
      position: "Idegenvezető",
      description: "HU leírás",
      social: {
        linkedin: "https://linkedin.com/in/anna",
        instagram: undefined,
        email: "anna@midtravel.hu",
      },
    });
    expect(mapTeamMember(teamRow(), "en").position).toBe("Guide");
  });
});

describe("mapTestimonial", () => {
  it("localizes location and quote", () => {
    expect(mapTestimonial(testimonialRow(), "hu")).toMatchObject({
      location: "Szeged",
      text: "Szuper út",
      rating: 5,
    });
    expect(mapTestimonial(testimonialRow(), "en")).toMatchObject({
      location: "Szeged, Hungary",
      text: "Great trip",
    });
  });
});
