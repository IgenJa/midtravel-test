"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { updateUserProfile } from "@/app/actions/profile";
import { authClient } from "@/lib/auth-client";
import { getUserDisplayName, isAdminRole } from "@/lib/session-utils";
import type { AccountRegistrationFormData, AppUser } from "@/types";

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<AppUser>;
  register: (data: AccountRegistrationFormData) => Promise<AppUser>;
  logout: () => Promise<void>;
  updateProfile: (updates: {
    fullName: string;
    email: string;
    phone: string;
    currentPassword?: string;
    password?: string;
  }) => Promise<AppUser>;
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
  const { data: session, isPending, refetch } = authClient.useSession();

  const user = session?.user ? mapUser(session.user) : null;

  const refreshUser = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error || !data?.user) {
        throw new Error("INVALID_CREDENTIALS");
      }

      await refetch();
      return mapUser(data.user);
    },
    [refetch]
  );

  const register = useCallback(
    async (data: AccountRegistrationFormData) => {
      const { data: result, error } = await authClient.signUp.email({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        name: data.fullName.trim(),
        phone: data.phone.trim() || undefined,
      });

      if (error || !result?.user) {
        const code = getErrorCode(error);
        if (
          code === "USER_ALREADY_EXISTS" ||
          code?.toLowerCase().includes("already") ||
          code?.toLowerCase().includes("exists")
        ) {
          throw new Error("EMAIL_EXISTS");
        }
        throw new Error("REGISTER_FAILED");
      }

      await refetch();
      return mapUser(result.user);
    },
    [refetch]
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

      const result = await updateUserProfile({
        fullName: updates.fullName,
        email: updates.email,
        phone: updates.phone,
      });

      if (!result.ok) {
        throw new Error(result.code);
      }

      await refetch();
      return mapUser(result.user);
    },
    [user, refetch]
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
