"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { ChatDetail as Chat, ChatMessage as Message } from "@/entities/chat";
import {
  useAcceptMatchMutation,
  useChatDetailQuery,
  useMarkMeetSuccessMutation,
  useRequestMatchMutation,
  useUnlockAdditionalMatchMutation,
} from "@/entities/chat/hooks";
import { useLocationQuery, useShareLocationMutation } from "@/entities/location/hooks";
import { useMessagesQuery, useSendMessageMutation } from "@/entities/message/hooks";
import { useProfileQuery } from "@/entities/profile/hooks";
import { useAuthStatusQuery, useCurrentUserIdQuery } from "@/features/auth/hooks";
import AppShell from "@/widgets/app-shell";

export default function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = use(params);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const { data: isAuthenticated } = useAuthStatusQuery();
  const queryEnabled = isAuthenticated === true;
  const currentUserIdQuery = useCurrentUserIdQuery(queryEnabled);
  const profileQuery = useProfileQuery(queryEnabled);
  const chatQuery = useChatDetailQuery(chatId, queryEnabled);
  const messagesQuery = useMessagesQuery(chatId, queryEnabled);
  const sendMessageMutation = useSendMessageMutation();
  const requestMatchMutation = useRequestMatchMutation(chatId);
  const acceptMatchMutation = useAcceptMatchMutation(chatId);
  const markMeetSuccessMutation = useMarkMeetSuccessMutation(chatId);
  const unlockAdditionalMatchMutation = useUnlockAdditionalMatchMutation(chatId);
  const shareLocationMutation = useShareLocationMutation();
  const locationQuery = useLocationQuery(
    chatId,
    chatQuery.data?.chat.otherUser.userId ?? "",
    false,
  );

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  const messages: Message[] = messagesQuery.data?.messages ?? [];
  const chat: Chat | null = chatQuery.data?.chat ?? null;
  const hearts = profileQuery.data?.profile?.hearts ?? 0;
  const currentUserId = currentUserIdQuery.data ?? "";
  const loading =
    isAuthenticated === undefined ||
    chatQuery.isPending ||
    messagesQuery.isPending ||
    profileQuery.isPending ||
    currentUserIdQuery.isPending;
  const queryError =
    chatQuery.error ??
    messagesQuery.error ??
    profileQuery.error ??
    currentUserIdQuery.error ??
    locationQuery.error;
  const error =
    actionError ??
    (queryError instanceof Error
      ? queryError.message
      : queryError
        ? "채팅 정보를 불러오지 못했습니다."
        : null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newMessage.trim()) {
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({ chatId, message: newMessage.trim() });
      setNewMessage("");
      setActionError(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "메시지 전송에 실패했습니다.");
    }
  };

  const runAction = async (action: () => Promise<unknown>, successMessage: string) => {
    try {
      await action();
      setNotice(successMessage);
      setActionError(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "요청 처리에 실패했습니다.");
    }
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      setActionError("이 브라우저는 위치 공유를 지원하지 않습니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await shareLocationMutation.mutateAsync({
            chatId,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setNotice("현재 위치를 공유했습니다.");
          setActionError(null);
        } catch (err) {
          setActionError(err instanceof Error ? err.message : "위치 공유에 실패했습니다.");
        }
      },
      () => setActionError("위치 권한이 없어서 현재 위치를 가져오지 못했습니다."),
    );
  };

  const handleViewLocation = async () => {
    if (!chat) {
      return;
    }

    try {
      const response = await locationQuery.refetch();
      const location = response.data?.location;

      if (!location) {
        throw new Error("상대 위치를 불러오지 못했습니다.");
      }

      window.open(
        `https://www.google.com/maps?q=${location.lat},${location.lng}`,
        "_blank",
        "noopener,noreferrer",
      );
      setNotice("상대 위치를 지도에서 열었습니다.");
      setActionError(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "상대 위치를 불러오지 못했습니다.");
    }
  };

  const isMatched = chat?.matchStatus === "matched";
  const canAccept = chat?.matchStatus === "requested" && chat.matchRequester !== currentUserId;
  const canRequest = chat?.matchStatus === "none";

  return (
    <AppShell hearts={hearts}>
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <aside className="space-y-6">
          <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-rose-100">
            <button
              type="button"
              onClick={() => router.push("/chats")}
              className="text-sm font-medium text-rose-600 hover:text-rose-700"
            >
              채팅 목록으로 돌아가기
            </button>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900">{chat?.otherUser.name ?? "대화 상대"}</h1>
            <p className="mt-2 text-sm text-slate-500">상태: {chat?.matchStatus ?? "로딩 중"}</p>

            {chat?.otherUser.photos?.[0] && (
              <img src={chat.otherUser.photos[0]} alt={chat.otherUser.name} className="mt-6 aspect-[4/3] w-full rounded-[1.5rem] object-cover" />
            )}

            <dl className="mt-6 space-y-3 text-sm text-slate-600">
              {chat?.otherUser.age && (
                <div className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <dt>나이</dt>
                  <dd>{chat.otherUser.age}</dd>
                </div>
              )}
              {chat?.otherUser.height && (
                <div className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <dt>키</dt>
                  <dd>{chat.otherUser.height}</dd>
                </div>
              )}
              {chat?.otherUser.location && (
                <div className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <dt>지역</dt>
                  <dd>{chat.otherUser.location}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-rose-100">
            <h2 className="text-xl font-semibold text-slate-900">액션</h2>
            <div className="mt-4 grid gap-3">
              {canRequest && (
                <button
                  type="button"
                  onClick={() => void runAction(() => requestMatchMutation.mutateAsync(), "매칭 요청을 보냈습니다.")}
                  className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-600"
                >
                  매칭 요청
                </button>
              )}
              {canAccept && (
                <button
                  type="button"
                  onClick={() => void runAction(() => acceptMatchMutation.mutateAsync(), "매칭을 수락했습니다.")}
                  className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-600"
                >
                  매칭 수락
                </button>
              )}
              {isMatched && (
                <button
                  type="button"
                  onClick={() => void runAction(() => markMeetSuccessMutation.mutateAsync(), "만남 성공을 기록했습니다.")}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  만남 성공 표시
                </button>
              )}
              {isMatched && (
                <button
                  type="button"
                  onClick={handleShareLocation}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  현재 위치 공유
                </button>
              )}
              {isMatched && (
                <button
                  type="button"
                  onClick={() => void handleViewLocation()}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  상대 위치 보기
                </button>
              )}
              {isMatched && (
                <button
                  type="button"
                  onClick={() => void runAction(() => unlockAdditionalMatchMutation.mutateAsync(), "추가 매칭을 열었습니다.")}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  추가 매칭 열기
                </button>
              )}
            </div>
          </div>

          {notice && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}
          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          {loading && <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm ring-1 ring-rose-100">채팅 정보를 불러오는 중입니다...</div>}
        </aside>

        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-rose-100">
          <div className="flex h-[70vh] flex-col">
            <div className="border-b border-slate-100 px-2 pb-4">
              <h2 className="text-xl font-semibold text-slate-900">메시지</h2>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-2 py-6">
              {messages.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  아직 대화가 없습니다. 첫 메시지를 보내 보세요.
                </div>
              ) : (
                messages.map((message) => {
                  const mine = message.userId === currentUserId;

                  return (
                    <div key={message.messageId} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-[1.5rem] px-4 py-3 text-sm shadow-sm ${mine ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-800"}`}>
                        {!mine && <p className="mb-1 text-xs font-medium opacity-70">{message.userName}</p>}
                        <p className="whitespace-pre-wrap break-words">{message.message}</p>
                        <p className={`mt-2 text-[11px] ${mine ? "text-white/75" : "text-slate-500"}`}>
                          {new Date(message.timestamp).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="border-t border-slate-100 pt-4">
              <div className="flex gap-3">
                <input
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  placeholder="메시지를 입력해 주세요"
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400"
                />
                <button
                  type="submit"
                  disabled={sendMessageMutation.isPending}
                  className="rounded-2xl bg-rose-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  보내기
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
