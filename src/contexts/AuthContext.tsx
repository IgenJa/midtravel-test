"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useLocale } from "next-intl";
import { updateUserProfile } from "@/app/actions/profile";
import { authClient } from "@/lib/auth-client";
import { normalizeEmail } from "@/lib/form-validation";
import { getUserDisplayName, isAdminRole } from "@/lib/session-utils";
import type { Locale } from "@/i18n/routing";
import type { AccountRegistrationFormData, AppUser } from "@/types";

export type ProfileSaveResult = {
  user: AppUser;
  emailChangePending: boolean;
};

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<AppUser>;
  register: (data: AccountRegistrationFormData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: {
    fullName: string;
    email: string;
    phone: string;
    currentPassword?: string;
    password?: string;
  }) => Promise<ProfileSaveResult>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(user: {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role?: string | null;
  createdAt: Date | string;
}): AppUser {
  return {
    id: user.id,
    fullName: user.name,
    email: user.email,
    phone: user.phone ?? "",
    role: user.role ?? "user",
    createdAt:
      typeof user.createdAt === "string"
        ? user.createdAt
        : user.createdAt.toISOString(),
  };
}

function getErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  if ("code" in error && typeof error.code === "string") return error.code;
  if ("message" in error && typeof error.message === "string") return error.message;
  return undefined;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const locale = useLocale() as Locale;
  const { data: session, isPending, refetch } = authClient.useSession();

  const user = session?.user ? mapUser(session.user) : null;

  const refreshUser = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const login = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      const { data, error } = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
        rememberMe,
      });

      if (error || !data?.user) {
        const code = getErrorCode(error);
        if (
          code === "EMAIL_NOT_VERIFIED" ||
          code?.toLowerCase().includes("email not verified")
        ) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }
        throw new Error("INVALID_CREDENTIALS");
      }

      await refetch();
      return mapUser(data.user);
    },
    [refetch]
  );

  const register = useCallback(
    async (data: AccountRegistrationFormData) => {
      const { error } = await authClient.signUp.email({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        name: data.fullName.trim(),
        phone: data.phone.trim() || undefined,
        callbackURL: `/${locale}/verify-email`,
      });

      if (error) {
        throw new Error("REGISTER_FAILED");
      }
    },
    [locale]
  );

  const logout = useCallback(async () => {
    await authClient.signOut();
    await refetch();
  }, [refetch]);

  const updateProfile = useCallback(
    async (updates: {
      fullName: string;
      email: string;
      phone: string;
      currentPassword?: string;
      password?: string;
    }) => {
      if (!user) throw new Error("NOT_AUTHENTICATED");

      if (updates.password) {
        if (!updates.currentPassword) {
          throw new Error("CURRENT_PASSWORD_REQUIRED");
        }
        const { error: passwordError } = await authClient.changePassword({
          currentPassword: updates.currentPassword,
          newPassword: updates.password,
        });
        if (passwordError) {
          throw new Error("INVALID_CURRENT_PASSWORD");
        }
      }

      const nextEmail = normalizeEmail(updates.email);
      const emailChanged = nextEmail !== normalizeEmail(user.email);
      let emailChangePending = false;

      if (emailChanged) {
        const { error: emailError } = await authClient.changeEmail({
          newEmail: nextEmail,
          callbackURL: `/${locale}/profile`,
        });
        if (emailError) {
          const code = getErrorCode(emailError);
          if (
            code === "USER_ALREADY_EXISTS" ||
            code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" ||
            code?.toLowerCase().includes("already exists")
          ) {
            throw new Error("EMAIL_EXISTS");
          }
          throw new Error("EMAIL_CHANGE_FAILED");
        }
        emailChangePending = true;
      }

      const result = await updateUserProfile({
        fullName: updates.fullName,
        phone: updates.phone,
      });

      if (!result.ok) {
        throw new Error(result.code);
      }

      await refetch();
      return { user: mapUser(result.user), emailChangePending };
    },
    [user, refetch, locale]
  );

  const value = useMemo(
    () => ({
      user,
      isLoading: isPending,
      isAuthenticated: !!user,
      isAdmin: isAdminRole(user?.role),
      login,
      register,
      logout,
      updateProfile,
      refreshUser,
    }),
    [user, isPending, login, register, logout, updateProfile, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export { getUserDisplayName };
