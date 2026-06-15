"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStatusQuery } from "@/features/auth/hooks";

export default function RootPage() {
  const router = useRouter();
  const { data: isAuthenticated, isError } = useAuthStatusQuery();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (typeof isAuthenticated === "boolean") {
        router.replace(isAuthenticated ? "/home" : "/login");
      } else if (isError) {
        router.replace("/login");
      }
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [isAuthenticated, isError, router]);

  return (
    <div className="app-frame flex min-h-screen items-center justify-center px-6 text-white">
      <div className="surface-panel w-full max-w-2xl p-10 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-600/80 text-2xl font-bold shadow-[0_0_32px_rgba(220,38,38,0.28)]">
          조각
        </div>
        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">조각</h1>
        <p className="mt-4 text-base text-zinc-300 md:text-lg">
          Figma Make 산출물을 Next.js App Router 구조로 다시 연결하는 중입니다.
        </p>
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-zinc-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
          <span>서비스로 이동 중...</span>
        </div>
      </div>
    </div>
  );
}
