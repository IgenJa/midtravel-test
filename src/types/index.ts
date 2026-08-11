export interface TripDay {
  day: number;
  title: string;
  description: string;
}

export interface TripFaq {
  question: string;
  answer: string;
}

export interface Trip {
  id: string;
  slug: string;
  title: string;
  country: string;
  price: number;
  duration: number;
  shortDescription: string;
  description: string;
  heroImage: string;
  gallery: string[];
  program: TripDay[];
  included: string[];
  notIncluded: string[];
  departureDates: string[];
  meetingPoint: string;
  difficulty: "Easy" | "Moderate" | "Challenging";
  faq: TripFaq[];
  featured?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  description: string;
  photo: string;
  social: {
    linkedin?: string;
    instagram?: string;
    email?: string;
  };
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  text: string;
  rating: number;
  avatar: string;
}

export interface TripApplicationFormData {
  fullName: string;
  email: string;
  phone: string;
  participants: number;
  tripSlug: string;
  message: string;
  requestInsurance: boolean;
  acceptPrivacy: boolean;
}

export interface AccountRegistrationFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  acceptTerms: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

/** Authenticated app user (never includes password). */
export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

/** @deprecated Use AppUser */
export type User = AppUser;

export interface UserProfileUpdate {
  fullName: string;
  email: string;
  phone: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  acceptPrivacy: boolean;
}
