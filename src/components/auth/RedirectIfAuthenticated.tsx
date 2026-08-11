"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuth } from "@/contexts/AuthContext";

export function RedirectIfAuthenticated({
  children,
  nextPath = "/profile",
}: {
  children: React.ReactNode;
  nextPath?: string;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(nextPath);
    }
  }, [user, isLoading, router, nextPath]);

  if (isLoading || user) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
