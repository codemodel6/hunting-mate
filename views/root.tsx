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
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(135deg,#8b5cf6,#4f46e5)] text-2xl font-bold shadow-[0_0_36px_rgba(139,92,246,0.32)]">
          TM
        </div>
        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">TrustMate</h1>
        <p className="mt-4 text-base text-zinc-300 md:text-lg">
          신뢰 기반 실시간 만남 경험으로 홈과 전반적인 화면 디자인을 새롭게 연결하고 있습니다.
        </p>
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-zinc-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
          <span>서비스로 이동 중...</span>
        </div>
      </div>
    </div>
  );
}
