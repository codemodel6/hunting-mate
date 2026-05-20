"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { clearAuth } from "@/entities/session/api/session-api";

type LayoutProps = {
  children: ReactNode;
  hearts?: number;
};

const navItems = [
  { href: "/home", label: "홈" },
  { href: "/create-post", label: "글쓰기" },
  { href: "/chats", label: "채팅" },
  { href: "/profile", label: "프로필" },
];

export default function Layout({ children, hearts }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await clearAuth();
    } finally {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-rose-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/home" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-sm font-bold text-white">
              HM
            </div>
            <div>
              <p className="text-lg font-semibold text-rose-600">Hunting Mate</p>
              <p className="text-xs text-slate-500">가벼운 만남부터 진지한 대화까지</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {typeof hearts === "number" && (
              <div className="rounded-full bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600">
                하트 {hearts}
              </div>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100vh-144px)] max-w-6xl px-4 py-6">
        {children}
      </main>

      <nav className="sticky bottom-0 z-40 border-t border-rose-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-around gap-2 px-2 py-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-rose-500 text-white"
                    : "text-slate-600 hover:bg-rose-50 hover:text-rose-600"
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
