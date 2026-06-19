"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowUpRight,
  FiBell,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiHome,
  FiImage,
  FiMenu,
  FiMessageCircle,
  FiMoreHorizontal,
  FiSearch,
  FiSend,
  FiSettings,
  FiShield,
  FiStar,
  FiUser,
  FiX,
} from "react-icons/fi";
import { PiDiamondLight } from "react-icons/pi";

import type { ChatDetail, ChatMessage, ChatSummary } from "@/entities/chat";
import {
  useAcceptMatchMutation,
  useChatDetailQuery,
  useChatsQuery,
  useMarkMeetSuccessMutation,
  useRequestMatchMutation,
  useUnlockAdditionalMatchMutation,
} from "@/entities/chat/hooks";
import { useLocationQuery, useShareLocationMutation } from "@/entities/location/hooks";
import { useMessagesQuery, useSendMessageMutation } from "@/entities/message/hooks";
import { useProfileQuery } from "@/entities/profile/hooks";
import { useAuthStatusQuery, useCurrentUserIdQuery } from "@/features/auth/hooks";

type ChatExperienceProps = {
  mobileView: "list" | "detail";
  selectedChatId?: string;
};

type ChatUiMeta = {
  preview: string;
  timeLabel: string;
  unreadCount?: number;
  status?: string;
  age: string;
  location: string;
  district: string;
  job: string;
  tags: string[];
  trustPoint: string;
  connectedAt: string;
  talkCount: string;
  online?: boolean;
};

const desktopNav = [
  { label: "홈", icon: FiHome, href: "/home" },
  { label: "매칭", icon: FiHeart, href: "/matching" },
  { label: "채팅", icon: FiMessageCircle, href: "/chats", active: true },
  { label: "포인트", icon: PiDiamondLight, href: "/profile" },
  { label: "내 정보", icon: FiUser, href: "/profile" },
  { label: "알림", icon: FiBell, href: "/chats" },
];

const mobileTabs = [
  { label: "홈", icon: FiHome, href: "/home" },
  { label: "매칭", icon: FiHeart, href: "/matching" },
  { label: "채팅", icon: FiMessageCircle, href: "/chats", active: true },
  { label: "포인트", icon: PiDiamondLight, href: "/profile" },
  { label: "마이", icon: FiUser, href: "/profile" },
];

const listTabs = ["전체", "안읽음", "즐겨찾기", "보관"];

const chatMetaByName: Record<string, ChatUiMeta> = {
  이지혜: {
    preview: "안녕하세요! 저도 영화 보는 거 좋아해요 😊",
    timeLabel: "오후 2:30",
    unreadCount: 2,
    age: "24세",
    location: "서울",
    district: "강남구",
    job: "교사",
    tags: ["#영화", "#여행", "#독서", "#요가", "#카페투어"],
    trustPoint: "1,240P",
    connectedAt: "2024.11.28",
    talkCount: "12회",
    online: true,
  },
  김태준: {
    preview: "이번 주말에 시간 괜찮으세요?",
    timeLabel: "오후 1:45",
    unreadCount: 1,
    age: "27세",
    location: "경기",
    district: "분당",
    job: "디자이너",
    tags: ["#운동", "#등산", "#카페"],
    trustPoint: "980P",
    connectedAt: "2024.11.26",
    talkCount: "8회",
    online: true,
  },
  박소연: {
    preview: "카페 추천해주셔서 감사해요!",
    timeLabel: "오전 11:20",
    age: "25세",
    location: "인천",
    district: "연수구",
    job: "마케터",
    tags: ["#카페", "#여행", "#맛집"],
    trustPoint: "1,050P",
    connectedAt: "2024.11.24",
    talkCount: "6회",
    online: true,
  },
  최민우: {
    preview: "네! 다음에 같이 가봐요",
    timeLabel: "어제",
    status: "muted",
    age: "26세",
    location: "서울",
    district: "성수",
    job: "개발자",
    tags: ["#게임", "#영화", "#사진"],
    trustPoint: "1,180P",
    connectedAt: "2024.11.22",
    talkCount: "10회",
    online: true,
  },
  정한결: {
    preview: "좋은 하루 보내세요!",
    timeLabel: "어제",
    status: "muted",
    age: "25세",
    location: "수원",
    district: "영통",
    job: "기획자",
    tags: ["#전시", "#산책"],
    trustPoint: "910P",
    connectedAt: "2024.11.20",
    talkCount: "5회",
  },
  이수민: {
    preview: "맞아요 그 영화 정말 좋았어요",
    timeLabel: "2일 전",
    age: "24세",
    location: "서울",
    district: "마포",
    job: "콘텐츠 에디터",
    tags: ["#영화", "#독서"],
    trustPoint: "1,120P",
    connectedAt: "2024.11.18",
    talkCount: "9회",
  },
  한지훈: {
    preview: "안녕하세요 반갑습니다!",
    timeLabel: "2일 전",
    age: "27세",
    location: "서울",
    district: "서초",
    job: "연구원",
    tags: ["#운동", "#커피"],
    trustPoint: "870P",
    connectedAt: "2024.11.17",
    talkCount: "4회",
  },
  김민지: {
    preview: "사진 너무 잘 봤어요 😊",
    timeLabel: "3일 전",
    age: "24세",
    location: "서울",
    district: "잠실",
    job: "디자이너",
    tags: ["#여행", "#사진", "#브런치"],
    trustPoint: "1,010P",
    connectedAt: "2024.11.15",
    talkCount: "7회",
  },
};

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getChatUiMeta(name?: string): ChatUiMeta {
  if (name && chatMetaByName[name]) {
    return chatMetaByName[name];
  }

  return {
    preview: "안녕하세요! 반갑습니다.",
    timeLabel: "방금 전",
    age: "24세",
    location: "서울",
    district: "강남구",
    job: "직장인",
    tags: ["#영화", "#산책", "#카페"],
    trustPoint: "980P",
    connectedAt: "2024.11.28",
    talkCount: "6회",
    online: true,
  };
}

function formatMessageTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function Avatar({
  src,
  alt,
  sizeClass,
  fallback,
}: {
  src?: string;
  alt: string;
  sizeClass: string;
  fallback: string;
}) {
  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-full border border-white/10 bg-[linear-gradient(135deg,#39466b,#182033)]",
        sizeClass,
      )}
    >
      {src ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-zinc-300">
          {fallback}
        </div>
      )}
    </div>
  );
}

export default function ChatExperience({ mobileView, selectedChatId }: ChatExperienceProps) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const { data: isAuthenticated } = useAuthStatusQuery();
  const queryEnabled = isAuthenticated === true;
  const chatsQuery = useChatsQuery(queryEnabled);
  const profileQuery = useProfileQuery(queryEnabled);
  const currentUserIdQuery = useCurrentUserIdQuery(queryEnabled);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  const chats: ChatSummary[] = chatsQuery.data?.chats ?? [];
  const activeChatId = selectedChatId ?? chats[0]?.chatId ?? "";
  const chatQuery = useChatDetailQuery(activeChatId, queryEnabled && Boolean(activeChatId));
  const messagesQuery = useMessagesQuery(activeChatId, queryEnabled && Boolean(activeChatId));
  const sendMessageMutation = useSendMessageMutation();
  const requestMatchMutation = useRequestMatchMutation(activeChatId);
  const acceptMatchMutation = useAcceptMatchMutation(activeChatId);
  const markMeetSuccessMutation = useMarkMeetSuccessMutation(activeChatId);
  const unlockAdditionalMatchMutation = useUnlockAdditionalMatchMutation(activeChatId);
  const shareLocationMutation = useShareLocationMutation();
  const locationQuery = useLocationQuery(
    activeChatId,
    chatQuery.data?.chat.otherUser.userId ?? "",
    false,
  );

  const activeChat: ChatDetail | null = chatQuery.data?.chat ?? null;
  const messages: ChatMessage[] = messagesQuery.data?.messages ?? [];
  const currentUserId = currentUserIdQuery.data ?? "";
  const loading =
    isAuthenticated === undefined ||
    chatsQuery.isPending ||
    profileQuery.isPending ||
    currentUserIdQuery.isPending ||
    (activeChatId ? chatQuery.isPending || messagesQuery.isPending : false);
  const queryError =
    chatsQuery.error ??
    profileQuery.error ??
    currentUserIdQuery.error ??
    chatQuery.error ??
    messagesQuery.error ??
    locationQuery.error;
  const error =
    actionError ??
    (queryError instanceof Error
      ? queryError.message
      : queryError
        ? "채팅 정보를 불러오지 못했습니다."
        : null);

  const selectedSummary = chats.find((chat) => chat.chatId === activeChatId) ?? chats[0] ?? null;
  const meta = getChatUiMeta(activeChat?.otherUser.name ?? selectedSummary?.otherUser.name);
  const profileName = profileQuery.data?.profile?.name?.trim() || "김신뢰";
  const otherName = activeChat?.otherUser.name ?? selectedSummary?.otherUser.name ?? "대화 상대";
  const otherPhoto = activeChat?.otherUser.photos?.[0] ?? selectedSummary?.otherUser.photos?.[0];
  const detailAge = activeChat?.otherUser.age ?? meta.age;
  const detailLocation = activeChat?.otherUser.location ?? `${meta.location} ${meta.district}`;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSelectChat = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newMessage.trim() || !activeChatId) {
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({
        chatId: activeChatId,
        message: newMessage.trim(),
      });
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
    if (!navigator.geolocation || !activeChatId) {
      setActionError("위치 공유를 사용할 수 없습니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await shareLocationMutation.mutateAsync({
            chatId: activeChatId,
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
    if (!activeChat) {
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

  const isMatched = activeChat?.matchStatus === "matched";
  const canAccept =
    activeChat?.matchStatus === "requested" &&
    activeChat.matchRequester !== currentUserId;
  const canRequest = activeChat?.matchStatus === "none";

  const actionButtons = (
    <div className="grid gap-2">
      {canRequest && (
        <button
          type="button"
          onClick={() =>
            void runAction(() => requestMatchMutation.mutateAsync(), "매칭 요청을 보냈습니다.")
          }
          className="btn-primary"
        >
          매칭 요청
        </button>
      )}
      {canAccept && (
        <button
          type="button"
          onClick={() =>
            void runAction(() => acceptMatchMutation.mutateAsync(), "매칭을 수락했습니다.")
          }
          className="btn-primary"
        >
          매칭 수락
        </button>
      )}
      {isMatched && (
        <>
          <button
            type="button"
            onClick={() =>
              void runAction(
                () => markMeetSuccessMutation.mutateAsync(),
                "만남 성공을 기록했습니다.",
              )
            }
            className="btn-secondary"
          >
            만남 성공 표시
          </button>
          <button type="button" onClick={handleShareLocation} className="btn-secondary">
            현재 위치 공유
          </button>
          <button type="button" onClick={() => void handleViewLocation()} className="btn-secondary">
            상대 위치 보기
          </button>
          <button
            type="button"
            onClick={() =>
              void runAction(
                () => unlockAdditionalMatchMutation.mutateAsync(),
                "추가 매칭을 열었습니다.",
              )
            }
            className="btn-secondary"
          >
            추가 매칭 열기
          </button>
        </>
      )}
    </div>
  );

  const renderListItem = (chat: ChatSummary) => {
    const itemMeta = getChatUiMeta(chat.otherUser.name);
    const isActive = chat.chatId === activeChatId;

    return (
      <button
        key={chat.chatId}
        type="button"
        onClick={() => handleSelectChat(chat.chatId)}
        className={cx("chat-list-item w-full", isActive && "chat-list-item-active")}
      >
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <Avatar
              src={chat.otherUser.photos?.[0]}
              alt={chat.otherUser.name}
              sizeClass="h-14 w-14"
              fallback={chat.otherUser.name.slice(0, 1)}
            />
            {itemMeta.online && (
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#171d33] bg-emerald-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <p className="chat-name-md font-semibold text-white">{chat.otherUser.name}</p>
                {itemMeta.status === "muted" ? <span className="text-xs text-zinc-500">◌</span> : null}
              </div>
              <span className="chat-meta-text text-zinc-500">{itemMeta.timeLabel}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="chat-body-text line-clamp-1 text-zinc-300">{itemMeta.preview}</p>
              {itemMeta.unreadCount ? (
                <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#5a49ea,#6b4dff)] px-2 text-xs font-semibold text-white">
                  {itemMeta.unreadCount}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </button>
    );
  };

  const renderMessages = () => {
    if (!activeChatId) {
      return (
        <div className="chat-panel-soft flex h-full items-center justify-center p-8 text-sm text-zinc-400">
          선택한 채팅이 없습니다.
        </div>
      );
    }

    if (messages.length === 0) {
      return (
        <div className="chat-panel-soft flex h-full items-center justify-center p-8 text-sm text-zinc-400">
          아직 대화가 없습니다. 첫 메시지를 보내 보세요.
        </div>
      );
    }

    return (
      <>
        <div className="mx-auto mb-6 w-fit rounded-full border border-white/8 px-4 py-2 text-xs text-zinc-400">
          11월 29일 (금)
        </div>
        {messages.map((message) => {
          const mine = message.userId === currentUserId;

          return (
            <div key={message.messageId} className={cx("flex gap-3", mine ? "justify-end" : "justify-start")}>
              {!mine && (
                <Avatar
                  src={otherPhoto}
                  alt={message.userName}
                  sizeClass="mt-1 h-11 w-11 shrink-0"
                  fallback={message.userName.slice(0, 1)}
                />
              )}
              <div className={cx("max-w-[72%]", mine && "order-1")}>
                <div className={mine ? "chat-bubble-mine" : "chat-bubble-other"}>
                  <p className="whitespace-pre-wrap break-words">{message.message}</p>
                </div>
                <div
                  className={cx(
                    "mt-2 flex items-center gap-2 text-xs text-zinc-500",
                    mine ? "justify-end" : "justify-start",
                  )}
                >
                  <span>{formatMessageTime(message.timestamp)}</span>
                  {mine ? <span className="text-violet-300">✓✓</span> : null}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </>
    );
  };

  const profileCard = (
    <>
      <div className="flex flex-col items-center border-b border-white/8 px-6 py-7 text-center">
        <Avatar
          src={otherPhoto}
          alt={otherName}
          sizeClass="h-[5.5rem] w-[5.5rem]"
          fallback={otherName.slice(0, 1)}
        />
        <div className="mt-5 flex items-center gap-3">
          <h3 className="chat-panel-title font-semibold text-white">{otherName}</h3>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-300">
            ONLINE
          </span>
        </div>
        <p className="chat-body-text mt-4 text-zinc-300">
          {detailAge} · {detailLocation} · {meta.job}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {meta.tags.map((tag) => (
            <span key={tag} className="chat-pill">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="border-b border-white/8 px-6 py-6">
        <h4 className="text-xl font-semibold text-white">신뢰 정보</h4>
        <div className="mt-5 space-y-3">
          <div className="chat-panel-soft flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(68,88,196,0.18)] text-sky-300">
                <FiShield className="text-lg" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">신원 인증 완료</p>
                <p className="text-xs text-zinc-400">본인 인증</p>
              </div>
            </div>
            <span className="rounded-full bg-[rgba(98,72,232,0.18)] px-3 py-1 text-xs font-medium text-violet-200">
              VERIFIED
            </span>
          </div>
          <div className="chat-panel-soft flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(24,170,100,0.16)] text-emerald-300">
                <FiStar className="text-lg" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">상호 평가 완료</p>
                <p className="text-xs text-zinc-400">상호 신뢰도 높음</p>
              </div>
            </div>
            <span className="rounded-full bg-[rgba(84,134,75,0.18)] px-3 py-1 text-xs font-medium text-lime-200">
              GOOD
            </span>
          </div>
          <div className="chat-panel-soft flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(207,166,59,0.16)] text-amber-300">
                <PiDiamondLight className="text-lg" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">신뢰 포인트</p>
                <p className="text-xl font-semibold text-violet-300">{meta.trustPoint}</p>
              </div>
            </div>
            <FiChevronRight className="text-zinc-500" />
          </div>
        </div>
      </div>

      <div className="border-b border-white/8 px-6 py-6">
        <h4 className="text-xl font-semibold text-white">함께한 대화</h4>
        <dl className="mt-4 space-y-3 text-sm text-zinc-300">
          <div className="flex items-center justify-between">
            <dt>매칭일</dt>
            <dd>{meta.connectedAt}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt>대화 횟수</dt>
            <dd>{meta.talkCount}</dd>
          </div>
        </dl>
      </div>

      <div className="px-6 py-6">
        {actionButtons}
      </div>
    </>
  );

  return (
    <div className="chat-page-bg">
      <div className="mx-auto hidden h-screen max-w-[1920px] grid-cols-[216px_minmax(0,1fr)] overflow-hidden xl:grid">
        <aside className="flex h-screen flex-col border-r border-white/7 bg-[linear-gradient(180deg,rgba(9,13,31,0.98),rgba(7,10,24,0.98))] px-4 py-6">
          <div className="flex items-center gap-3 px-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#6d4dff,#4f46e5)] text-white shadow-[0_10px_26px_rgba(95,66,255,0.32)]">
              <FiShield className="text-[1.1rem]" />
            </div>
            <div>
              <p className="chat-brand-title font-semibold leading-none text-white">조각</p>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {desktopNav.map((item) => {
              const Icon = item.icon;

              return (
                <Link key={item.label} href={item.href} className="block">
                  <div
                    className={cx(
                      "flex items-center gap-4 rounded-[16px] px-4 py-3 text-[1rem] font-medium transition",
                      item.active
                        ? "bg-[linear-gradient(135deg,rgba(110,76,255,0.92),rgba(76,57,183,0.84))] text-white shadow-[0_16px_28px_rgba(66,41,160,0.28)]"
                        : "text-zinc-300 hover:bg-white/4 hover:text-white",
                    )}
                  >
                    <Icon className="text-[1.35rem]" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-8">
            <div className="chat-panel overflow-hidden px-5 py-5">
              <h3 className="chat-name-md font-semibold text-violet-300">안전한 만남의 시작</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-300">
                신뢰를 쌓고 더 좋은 인연을 만나세요.
              </p>
              <div className="mt-6 flex items-end justify-between">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(88,74,255,0.14)]">
                  <FiShield className="text-[2rem] text-violet-300" />
                </div>
                <FiChevronRight className="text-[1.3rem] text-zinc-400" />
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3 px-3">
              <Avatar src={profileQuery.data?.profile?.photos?.[0]} alt={profileName} sizeClass="h-14 w-14" fallback={profileName.slice(0, 1)} />
              <div className="min-w-0 flex-1">
                <p className="chat-name-md font-medium text-white">{profileName}</p>
                <button type="button" className="mt-1 text-sm text-zinc-400">
                  프로필 보기
                </button>
              </div>
              <FiChevronRight className="text-zinc-500" />
            </div>
          </div>
        </aside>

        <div className="h-screen overflow-hidden px-6 py-5">
          <header className="flex items-center justify-between border-b border-white/6 px-1 pb-5">
            <div className="flex items-center gap-5">
              <h1 className="chat-page-title font-semibold text-white">채팅</h1>
              <p className="chat-body-text text-zinc-300">진짜 만남은 신뢰에서 시작됩니다.</p>
            </div>
            <div className="flex items-center gap-5">
              <div className="relative">
                <FiBell className="text-[1.45rem] text-white" />
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6f56ff] px-1 text-[0.68rem] font-semibold text-white">
                  3
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Avatar
                  src={profileQuery.data?.profile?.photos?.[0]}
                  alt={profileName}
                  sizeClass="h-11 w-11"
                  fallback={profileName.slice(0, 1)}
                />
                <span className="chat-name-md font-medium text-white">{profileName}</span>
                <FiChevronDown className="text-zinc-400" />
              </div>
            </div>
          </header>

          {error && <div className="alert-error mt-4">{error}</div>}
          {notice && <div className="alert-success mt-4">{notice}</div>}

          <div className="grid h-[calc(100vh-114px)] grid-cols-[350px_minmax(0,1fr)_320px] gap-4 pt-4">
            <section className="chat-panel flex min-h-0 flex-col overflow-hidden">
              <div className="border-b border-white/7 px-5 pt-3">
                <div className="flex gap-4">
                  {listTabs.map((tab, index) => (
                    <button
                      key={tab}
                      type="button"
                      className={cx("chat-tab", index === 0 && "chat-tab-active")}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-3">
                {loading && chats.length === 0 ? (
                  <div className="p-4 text-sm text-zinc-400">채팅 목록을 불러오는 중입니다...</div>
                ) : chats.length === 0 ? (
                  <div className="p-4 text-sm text-zinc-400">아직 생성된 채팅방이 없습니다.</div>
                ) : (
                  <div className="space-y-2">{chats.map(renderListItem)}</div>
                )}
              </div>

              <div className="border-t border-white/7 p-4">
                <div className="chat-panel-soft px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="chat-name-md font-semibold text-violet-300">안전한 만남의 시작</h3>
                      <p className="chat-body-text mt-2 text-zinc-300">
                        신뢰를 쌓고 더 좋은 인연을 만나세요.
                      </p>
                    </div>
                    <FiChevronRight className="text-zinc-500" />
                  </div>
                </div>
                <p className="mt-4 text-xs text-zinc-500">© 2024 조각. All rights reserved.</p>
              </div>
            </section>

            <section className="chat-panel flex min-h-0 flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/7 px-5 py-4">
                <div className="flex items-center gap-4">
                  <Avatar src={otherPhoto} alt={otherName} sizeClass="h-14 w-14" fallback={otherName.slice(0, 1)} />
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="chat-panel-title font-semibold text-white">{otherName}</h2>
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-300">
                        ONLINE
                      </span>
                    </div>
                    <p className="chat-body-text mt-1 text-zinc-300">
                      {detailAge} · {meta.location} · {meta.job}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="chat-input-shell flex h-11 items-center gap-3 px-4 text-zinc-400">
                    <FiSearch />
                    <input
                      placeholder="대화방 또는 사람 검색"
                      className="w-56 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                    />
                    <FiSettings className="text-lg" />
                  </div>
                  <button className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[linear-gradient(135deg,#5f49eb,#724bf0)] text-white">
                    <FiArrowUpRight />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">{renderMessages()}</div>

              <form onSubmit={handleSendMessage} className="border-t border-white/7 px-5 py-4">
                <div className="chat-input-shell flex items-center gap-3 px-4 py-3">
                  <input
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    placeholder="메시지를 입력하세요..."
                    className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                  />
                  <button type="button" className="text-zinc-400">
                    <FiMoreHorizontal className="text-xl" />
                  </button>
                  <button type="button" className="text-zinc-400">
                    <FiImage className="text-lg" />
                  </button>
                  <button
                    type="submit"
                    disabled={sendMessageMutation.isPending}
                    className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[linear-gradient(135deg,#5f49eb,#724bf0)] text-white disabled:opacity-60"
                  >
                    <FiSend />
                  </button>
                </div>
              </form>
            </section>

            <aside className="chat-panel min-h-0 overflow-hidden">
              {activeChat ? profileCard : <div className="p-6 text-sm text-zinc-400">대화를 선택해 주세요.</div>}
            </aside>
          </div>
        </div>
      </div>

      <div className="xl:hidden">
        {mobileView === "list" ? (
          <div className="px-4 pb-24 pt-3">
            <div className="chat-panel overflow-hidden rounded-[2rem]">
              <header className="flex items-center justify-between px-5 pb-4 pt-5">
                <p className="chat-brand-title font-semibold text-white">조각</p>
                <div className="flex items-center gap-4">
                  <FiBell className="text-[1.45rem] text-white" />
                  <FiMenu className="text-[1.55rem] text-white" />
                </div>
              </header>

              <div className="px-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="chat-page-title font-semibold text-white">채팅</h1>
                    <p className="chat-body-text mt-1.5 text-zinc-300">진짜 만남은 신뢰에서 시작됩니다.</p>
                  </div>
                  <button className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#5f49eb,#724bf0)] text-white">
                    <FiArrowUpRight className="text-[1rem]" />
                  </button>
                </div>
              </div>

              <div className="mt-4 border-b border-white/7 px-4">
                <div className="flex justify-between gap-2">
                  {listTabs.map((tab, index) => (
                    <button key={tab} type="button" className={cx("chat-tab flex-1 px-0", index === 0 && "chat-tab-active")}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1 px-4 py-3">
                {chats.map((chat) => renderListItem(chat))}
              </div>

              <div className="border-t border-white/7 px-4 py-4">
                <div className="chat-panel-soft flex items-center justify-between px-4 py-4">
                  <div>
                    <h3 className="chat-name-md font-semibold text-violet-300">안전한 만남의 시작</h3>
                    <p className="chat-body-text mt-2 text-zinc-300">
                      신뢰를 쌓고 더 좋은 인연을 만나세요.
                    </p>
                  </div>
                  <FiChevronRight className="text-zinc-400" />
                </div>
              </div>
            </div>

            <nav className="fixed bottom-0 left-0 right-0 z-[90] border-t border-white/8 bg-[linear-gradient(180deg,rgba(9,13,29,0.98),rgba(7,10,22,1))] px-3 py-1.5 backdrop-blur-xl">
              <div className="grid grid-cols-5 gap-2">
                {mobileTabs.map((tab) => {
                  const Icon = tab.icon;

                  return (
                    <Link key={tab.label} href={tab.href} className="block">
                      <div
                        className={cx(
                          "flex flex-col items-center justify-center gap-0.5 rounded-[16px] py-1 font-medium",
                          tab.active ? "text-[#8a5dff]" : "text-zinc-400",
                        )}
                      >
                        <Icon className={cx("text-[1.1rem]", tab.active && "fill-current")} />
                        <span className="text-[0.7rem]">{tab.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        ) : (
          <>
            <div className="px-3 pb-3 pt-2.5">
              <div className="chat-panel overflow-hidden rounded-[2rem]">
                <header className="flex items-center justify-between px-4 py-3.5">
                  <button type="button" onClick={() => router.push("/chats")} className="text-white">
                    <FiChevronLeft className="text-[1.35rem]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileProfileOpen(true)}
                    className="flex items-center gap-2.5"
                  >
                    <Avatar src={otherPhoto} alt={otherName} sizeClass="h-10 w-10" fallback={otherName.slice(0, 1)} />
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <p className="chat-name-md font-semibold text-white">{otherName}</p>
                        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[0.72rem] font-medium text-emerald-300">
                          ONLINE
                        </span>
                      </div>
                      <p className="chat-meta-text mt-0.5 text-zinc-300">
                        {detailAge} · {meta.location} · {meta.job}
                      </p>
                    </div>
                  </button>
                  <button type="button" onClick={() => setMobileProfileOpen(true)} className="text-white">
                    <FiMoreHorizontal className="text-[1.3rem]" />
                  </button>
                </header>

                <div className="border-b border-t border-white/7 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setMobileProfileOpen(true)}
                    className="chat-panel-soft block w-full px-4 py-3.5 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar src={otherPhoto} alt={otherName} sizeClass="h-[4.5rem] w-[4.5rem]" fallback={otherName.slice(0, 1)} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="chat-name-md font-semibold text-white">{otherName}</p>
                          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[0.72rem] font-medium text-emerald-300">
                            ONLINE
                          </span>
                        </div>
                        <p className="chat-meta-text mt-1.5 text-zinc-300">
                          {detailAge} · {detailLocation} · {meta.job}
                        </p>
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {meta.tags.map((tag) => (
                            <span key={tag} className="chat-pill">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>

                  <div className="chat-panel-soft mt-3 flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FiShield className="text-lg text-zinc-100" />
                      <p className="chat-meta-text text-zinc-200">조각은 안전한 대화를 지원합니다.</p>
                    </div>
                    <FiChevronRight className="text-zinc-500" />
                  </div>
                </div>

                <div className="max-h-[50vh] overflow-y-auto px-4 py-3">{renderMessages()}</div>

                <form onSubmit={handleSendMessage} className="border-t border-white/7 px-4 py-3">
                  <div className="chat-input-shell px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <input
                        value={newMessage}
                        onChange={(event) => setNewMessage(event.target.value)}
                        placeholder="메시지를 입력하세요..."
                        className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                      />
                    </div>
                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-zinc-400">
                        <FiMoreHorizontal className="text-xl" />
                        <FiImage className="text-lg" />
                      </div>
                      <button
                        type="submit"
                        disabled={sendMessageMutation.isPending}
                        className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#5f49eb,#724bf0)] text-white disabled:opacity-60"
                      >
                        <FiSend />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {mobileProfileOpen && (
              <div className="fixed inset-0 z-[120] bg-black/55" onClick={() => setMobileProfileOpen(false)}>
                <div
                  className="absolute inset-x-0 bottom-0 rounded-t-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(14,19,38,0.98),rgba(10,14,28,0.98))] px-5 pb-6 pt-4"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-white/20" />
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="chat-panel-title font-semibold text-white">상대방 정보</h3>
                    <button type="button" onClick={() => setMobileProfileOpen(false)} className="text-white">
                      <FiX className="text-[1.3rem]" />
                    </button>
                  </div>
                  <div className="chat-panel-soft overflow-hidden">
                    {profileCard}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {error && (
        <div className="fixed right-4 top-4 z-[130] rounded-2xl border border-rose-400/20 bg-rose-950/80 px-4 py-3 text-sm text-rose-100 shadow-xl">
          {error}
        </div>
      )}
      {notice && (
        <div className="fixed left-1/2 top-4 z-[130] -translate-x-1/2 rounded-2xl border border-emerald-400/20 bg-emerald-950/80 px-4 py-3 text-sm text-emerald-100 shadow-xl">
          {notice}
        </div>
      )}
    </div>
  );
}
