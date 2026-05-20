"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import * as api from "@/entities/api";
import type { ChatSummary as Chat } from "@/entities/chat";
import AppShell from "@/widgets/app-shell";

export default function ChatsPage() {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [hearts, setHearts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authenticated = await api.isAuthenticated();

        if (!authenticated) {
          router.replace("/login");
          return;
        }

        const [chatsResponse, profileResponse] = await Promise.all([
          api.getChats(),
          api.getProfile(),
        ]);

        setChats(chatsResponse.chats ?? []);
        setHearts(profileResponse.profile?.hearts ?? 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "채팅 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [router]);

  return (
    <AppShell hearts={hearts}>
      <section className="space-y-6">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-rose-100">
          <p className="text-sm font-medium text-rose-500">채팅</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">대화 목록</h1>
          <p className="mt-2 text-slate-500">현재 매칭 상태와 함께 대화방으로 이동할 수 있습니다.</p>
        </div>

        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        {loading ? (
          <div className="rounded-[2rem] bg-white p-8 text-sm text-slate-500 shadow-sm ring-1 ring-rose-100">채팅 목록을 불러오는 중입니다...</div>
        ) : chats.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-8 text-sm text-slate-500 shadow-sm ring-1 ring-rose-100">아직 생성된 채팅방이 없습니다.</div>
        ) : (
          <div className="grid gap-4">
            {chats.map((chat) => (
              <button key={chat.chatId} type="button" onClick={() => router.push(`/chat/${chat.chatId}`)} className="flex items-center gap-4 rounded-[2rem] bg-white p-5 text-left shadow-sm ring-1 ring-rose-100 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-100">
                  {chat.otherUser.photos?.[0] ? (
                    <img src={chat.otherUser.photos[0]} alt={chat.otherUser.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-500">{chat.otherUser.name?.slice(0, 1) ?? "?"}</div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-slate-900">{chat.otherUser.name}</p>
                  <p className="mt-1 text-sm text-slate-500">상태: {chat.matchStatus}</p>
                </div>
                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600">입장</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
