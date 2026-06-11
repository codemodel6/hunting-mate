"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import type { ChatSummary as Chat } from "@/entities/chat";
import { useChatsQuery } from "@/entities/chat/hooks";
import { useProfileQuery } from "@/entities/profile/hooks";
import { useAuthStatusQuery } from "@/features/auth/hooks";
import AppShell from "@/widgets/app-shell";

export default function ChatsPage() {
  const router = useRouter();
  const { data: isAuthenticated } = useAuthStatusQuery();
  const queryEnabled = isAuthenticated === true;
  const chatsQuery = useChatsQuery(queryEnabled);
  const profileQuery = useProfileQuery(queryEnabled);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  const chats: Chat[] = chatsQuery.data?.chats ?? [];
  const trust = profileQuery.data?.profile?.hearts ?? 0;
  const loading =
    isAuthenticated === undefined || chatsQuery.isPending || profileQuery.isPending;
  const queryError = chatsQuery.error ?? profileQuery.error;
  const error =
    queryError instanceof Error
      ? queryError.message
      : queryError
        ? "채팅 목록을 불러오지 못했습니다."
        : null;

  return (
    <AppShell trust={trust}>
      <section className="space-y-6">
        <div className="surface-panel">
          <p className="section-kicker">채팅</p>
          <h1 className="section-title">대화 목록</h1>
          <p className="section-copy">현재 매칭 상태와 함께 대화방으로 이동할 수 있습니다.</p>
        </div>

        {error && <div className="alert-error">{error}</div>}
        {loading ? (
          <div className="surface-panel text-sm text-zinc-400">채팅 목록을 불러오는 중입니다...</div>
        ) : chats.length === 0 ? (
          <div className="surface-panel text-sm text-zinc-400">아직 생성된 채팅방이 없습니다.</div>
        ) : (
          <div className="grid gap-4">
            {chats.map((chat) => (
              <button key={chat.chatId} type="button" onClick={() => router.push(`/chat/${chat.chatId}`)} className="surface-panel-compact surface-hover flex items-center gap-4 text-left">
                <div className="h-16 w-16 overflow-hidden rounded-full bg-zinc-900">
                  {chat.otherUser.photos?.[0] ? (
                    <img src={chat.otherUser.photos[0]} alt={chat.otherUser.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-zinc-400">{chat.otherUser.name?.slice(0, 1) ?? "?"}</div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-white">{chat.otherUser.name}</p>
                  <p className="mt-1 text-sm text-zinc-400">상태: {chat.matchStatus}</p>
                </div>
                <span className="badge-accent">입장</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
