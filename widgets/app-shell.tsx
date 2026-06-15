"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useSignOutMutation } from "@/features/auth/hooks";

type AppShellProps = {
  children: ReactNode;
  trust?: number;
};

const navItems = [
  { href: "/home", label: "홈" },
  { href: "/create-post", label: "글쓰기" },
  { href: "/chats", label: "채팅" },
  { href: "/profile", label: "프로필" },
];

export default function AppShell({ children, trust }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const signOutMutation = useSignOutMutation();

  const handleLogout = async () => {
    try {
      await signOutMutation.mutateAsync();
    } finally {
      router.push("/login");
    }
  };

  return (
    <div className="app-frame">
      <header className="gradient-divider-bottom sticky top-0 z-40 bg-[linear-gradient(180deg,rgba(8,8,10,0.92),rgba(8,8,10,0.72))] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/home" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white shadow-[0_0_24px_rgba(220,38,38,0.32)]">
              조각
            </div>
            <div>
              <p className="text-lg font-semibold text-white">조각</p>
              <p className="text-xs text-zinc-400">가벼운 만남부터 진지한 대화까지</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {typeof trust === "number" && (
              <div className="badge-accent px-4 py-2 text-sm">
                신뢰 {trust}
              </div>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="btn-ghost"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100vh-144px)] max-w-6xl px-4 py-6">
        {children}
      </main>

      <nav className="gradient-divider-top sticky bottom-0 z-40 bg-[linear-gradient(180deg,rgba(8,8,10,0.76),rgba(8,8,10,0.94))] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-around gap-2 px-2 py-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-red-600 text-white shadow-[0_0_26px_rgba(220,38,38,0.28)]"
                    : "text-zinc-400 hover:bg-white/5 hover:text-red-300"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
