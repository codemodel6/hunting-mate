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
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#fb7185,_#f97316_55%,_#0f172a)] px-6 text-white">
      <div className="w-full max-w-2xl rounded-[2rem] border border-white/20 bg-white/10 p-10 text-center shadow-2xl backdrop-blur">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-2xl font-bold">
          HM
        </div>
        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Hunting Mate</h1>
        <p className="mt-4 text-base text-white/85 md:text-lg">
          Figma Make 산출물을 Next.js App Router 구조로 다시 연결하는 중입니다.
        </p>
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-white/80">
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
          <span>서비스로 이동 중...</span>
        </div>
      </div>
    </div>
  );
}
