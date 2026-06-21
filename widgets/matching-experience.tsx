"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiBell,
  FiBookmark,
  FiChevronDown,
  FiChevronRight,
  FiHeart,
  FiHome,
  FiMenu,
  FiMessageCircle,
  FiSearch,
  FiShield,
  FiSliders,
  FiStar,
  FiUser,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import { PiDiamondLight } from "react-icons/pi";

import { useRequestChatMutation, useChatsQuery } from "@/entities/chat/hooks";
import type { Post } from "@/entities/post";
import { usePostsQuery } from "@/entities/post/hooks";
import { useProfileQuery } from "@/entities/profile/hooks";
import { useAuthStatusQuery } from "@/features/auth/hooks";

type MatchExperienceProps = {
  mobileView?: "list";
};

type MatchMeta = {
  title: string;
  tags: string[];
  age: string;
  district: string;
  job: string;
  height: string;
  mbti: string;
  region: string;
  ageGroup: string;
  type: string;
};

type MatchCardData = {
  postId: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  createdAt: string;
  isFallback?: boolean;
};

const matchTabs = [
  { key: "all", label: "전체" },
  { key: "new", label: "새로운 글" },
  { key: "popular", label: "인기 글" },
  { key: "saved", label: "내가 찜한 글" },
  { key: "requested", label: "내가 요청한 글" },
  { key: "chatting", label: "대화 중", badge: 2 },
] as const;

const filterDefaults = {
  gender: "전체",
  region: "서울 전체",
  age: "20대 - 30대",
  time: "전체",
  type: "전체",
};

const desktopNav = [
  { label: "홈", icon: FiHome, href: "/home" },
  { label: "매칭", icon: FiHeart, href: "/matching", active: true },
  { label: "채팅", icon: FiMessageCircle, href: "/chats", badge: 3 },
  { label: "포인트", icon: PiDiamondLight, href: "/profile" },
  { label: "내 정보", icon: FiUser, href: "/profile" },
  { label: "알림", icon: FiBell, href: "/chats", badge: 2 },
] as const;

const mobileTabs = [
  { label: "홈", icon: FiHome, href: "/home" },
  { label: "매칭", icon: FiHeart, href: "/matching", active: true },
  { label: "채팅", icon: FiMessageCircle, href: "/chats", badge: 3 },
  { label: "포인트", icon: PiDiamondLight, href: "/profile" },
  { label: "마이", icon: FiUser, href: "/profile" },
] as const;

const matchMetaByName: Record<string, MatchMeta> = {
  이지혜: {
    title: "영화 보면서 이야기 나눌 분 찾습니다 🎬",
    tags: ["영화", "카페", "여행"],
    age: "26세",
    district: "서울 강남구",
    job: "교사",
    height: "162cm",
    mbti: "INFP",
    region: "서울 전체",
    ageGroup: "20대 - 30대",
    type: "취미",
  },
  김태준: {
    title: "퇴근 후 가볍게 맛집 탐방 할 사람!",
    tags: ["맛집", "산책", "드라이브"],
    age: "28세",
    district: "서울 마포구",
    job: "엔지니어",
    height: "178cm",
    mbti: "ESTP",
    region: "서울 전체",
    ageGroup: "20대 - 30대",
    type: "맛집",
  },
  박소연: {
    title: "주말에 전시회나 브런치 즐겨요 ☕",
    tags: ["전시회", "브런치", "사진"],
    age: "25세",
    district: "서울 송파구",
    job: "마케터",
    height: "163cm",
    mbti: "INFJ",
    region: "서울 전체",
    ageGroup: "20대 - 30대",
    type: "문화",
  },
  최민우: {
    title: "등산 같이 다니면서 힐링하실 분 ⛰️",
    tags: ["등산", "캠핑", "운동"],
    age: "27세",
    district: "경기 성남시",
    job: "회사원",
    height: "175cm",
    mbti: "ENFP",
    region: "경기 전체",
    ageGroup: "20대 - 30대",
    type: "액티브",
  },
  이수민: {
    title: "여행 좋아해서 같이 계획 세울 분!",
    tags: ["여행", "해외", "자연"],
    age: "24세",
    district: "서울 서초구",
    job: "대학원생",
    height: "160cm",
    mbti: "ENFJ",
    region: "서울 전체",
    ageGroup: "20대 - 30대",
    type: "여행",
  },
};

const fallbackPosts: MatchCardData[] = [
  {
    postId: "fallback-1",
    userId: "",
    userName: "이지혜",
    title: matchMetaByName.이지혜.title,
    content: "영화와 카페를 좋아해요.",
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    isFallback: true,
  },
  {
    postId: "fallback-2",
    userId: "",
    userName: "김태준",
    title: matchMetaByName.김태준.title,
    content: "퇴근 후 가볍게 만날 사람을 찾아요.",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    isFallback: true,
  },
  {
    postId: "fallback-3",
    userId: "",
    userName: "박소연",
    title: matchMetaByName.박소연.title,
    content: "전시와 브런치를 좋아해요.",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isFallback: true,
  },
  {
    postId: "fallback-4",
    userId: "",
    userName: "최민우",
    title: matchMetaByName.최민우.title,
    content: "주말에 산과 자연을 즐겨요.",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    isFallback: true,
  },
  {
    postId: "fallback-5",
    userId: "",
    userName: "이수민",
    title: matchMetaByName.이수민.title,
    content: "여행 계획을 함께 세워요.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isFallback: true,
  },
];

const guideItems = [
  {
    icon: FiBookmark,
    title: "프로필 작성 팁",
    description: "더 좋은 만남이 가능해요.",
  },
  {
    icon: FiMessageCircle,
    title: "관심 있는 글에 대화 요청하기",
    description: "자연스럽게 이야기를 시작해보세요.",
  },
  {
    icon: FiHeart,
    title: "매너 있는 대화가",
    description: "신뢰를 쌓는 첫걸음이에요.",
  },
];

const trustItems = [
  {
    icon: FiShield,
    title: "신원 인증 완료",
    description: "더 안전한 만남",
    color: "text-zinc-100",
  },
  {
    icon: FiStar,
    title: "상호 평가 문화",
    description: "신뢰를 쌓아가요",
    color: "text-amber-400",
  },
  {
    icon: PiDiamondLight,
    title: "신뢰 포인트",
    description: "좋은 만남의 가치",
    color: "text-sky-400",
  },
] as const;

const stats = [
  { icon: FiUsers, label: "현재 접속 중", value: "128명", color: "text-violet-400" },
  { icon: FiHeart, label: "오늘 매칭 성공", value: "24건", color: "text-violet-400" },
  { icon: FiStar, label: "누적 매칭 성공", value: "1,248건", color: "text-amber-400" },
];

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getMeta(name: string): MatchMeta {
  return (
    matchMetaByName[name] ?? {
      title: "함께 이야기 나눌 분을 찾고 있어요.",
      tags: ["대화", "산책", "카페"],
      age: "25세",
      district: "서울 강남구",
      job: "직장인",
      height: "168cm",
      mbti: "ISFP",
      region: "서울 전체",
      ageGroup: "20대 - 30대",
      type: "일상",
    }
  );
}

function formatRelativeLabel(createdAt: string, now: number) {
  const diff = now - new Date(createdAt).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));

  if (minutes < 60) {
    return `${minutes}분 전`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}시간 전`;
  }

  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

function PlaceholderAvatar({ sizeClass }: { sizeClass: string }) {
  return (
    <div
      className={cx(
        "overflow-hidden rounded-full border border-white/10 bg-[radial-gradient(circle_at_30%_28%,rgba(255,255,255,0.24),transparent_18%),radial-gradient(circle_at_68%_26%,rgba(255,228,196,0.18),transparent_14%),linear-gradient(135deg,#61574a,#1b1f24_45%,#0d1325)]",
        sizeClass,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" src="" className="h-full w-full object-cover opacity-0" />
    </div>
  );
}

export default function MatchingExperience({ mobileView = "list" }: MatchExperienceProps) {
  const router = useRouter();
  void mobileView;
  const [activeTab, setActiveTab] = useState<(typeof matchTabs)[number]["key"]>("all");
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState(filterDefaults.gender);
  const [regionFilter, setRegionFilter] = useState(filterDefaults.region);
  const [ageFilter, setAgeFilter] = useState(filterDefaults.age);
  const [timeFilter, setTimeFilter] = useState(filterDefaults.time);
  const [typeFilter, setTypeFilter] = useState(filterDefaults.type);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [requestedIds, setRequestedIds] = useState<string[]>([]);
  const [matchingEnabled, setMatchingEnabled] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [baseNow] = useState(() => Date.now());
  const { data: isAuthenticated } = useAuthStatusQuery();
  const queryEnabled = isAuthenticated === true;
  const postsQuery = usePostsQuery(queryEnabled);
  const profileQuery = useProfileQuery(queryEnabled);
  const chatsQuery = useChatsQuery(queryEnabled);
  const requestChatMutation = useRequestChatMutation();

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  const posts: Post[] = postsQuery.data?.posts ?? [];
  const chats = chatsQuery.data?.chats ?? [];
  const profile = profileQuery.data?.profile;
  const currentUserId = profile?.userId ?? "";
  const profileName = profile?.name?.trim() || "김신뢰";
  const trust = profile?.hearts ?? 1240;
  const loading =
    isAuthenticated === undefined ||
    postsQuery.isPending ||
    profileQuery.isPending ||
    chatsQuery.isPending;
  const queryError = postsQuery.error ?? profileQuery.error ?? chatsQuery.error;
  const error =
    actionError ??
    (queryError instanceof Error
      ? queryError.message
      : queryError
        ? "매칭 정보를 불러오지 못했습니다."
        : null);

  const myPosts = posts.filter((post) => post.userId === currentUserId);
  const availablePosts = posts.filter((post) => post.userId && post.userId !== currentUserId);
  const sourcePosts: MatchCardData[] =
    availablePosts.length > 0 ? availablePosts : fallbackPosts;
  const activeChatNames = chats.map((chat) => chat.otherUser.name);

  const matchCards = sourcePosts.map((post) => {
    const meta = getMeta(post.userName);
    return {
      ...post,
      meta,
      relativeTime: formatRelativeLabel(post.createdAt, baseNow),
      isNew: baseNow - new Date(post.createdAt).getTime() < 10 * 60 * 1000,
    };
  });

  const filteredCards = matchCards.filter((card, index) => {
    if (
      search &&
      !`${card.title} ${card.userName} ${card.content} ${card.meta.tags.join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase())
    ) {
      return false;
    }

    if (regionFilter !== "전체" && regionFilter !== card.meta.region) {
      return false;
    }

    if (ageFilter !== "전체" && ageFilter !== card.meta.ageGroup) {
      return false;
    }

    if (typeFilter !== "전체" && typeFilter !== card.meta.type) {
      return false;
    }

    if (timeFilter === "1시간 이내" && !card.relativeTime.includes("분 전")) {
      return false;
    }

    if (timeFilter === "오늘" && card.relativeTime.includes("일 전")) {
      return false;
    }

    if (activeTab === "new") {
      return index < 3;
    }

    if (activeTab === "popular") {
      return index < 4;
    }

    if (activeTab === "saved") {
      return bookmarkedIds.includes(card.postId);
    }

    if (activeTab === "requested") {
      return requestedIds.includes(card.postId);
    }

    if (activeTab === "chatting") {
      return activeChatNames.includes(card.userName);
    }

    return true;
  });

  const displayedCards = filteredCards;
  const mobileCards = displayedCards.slice(0, 5);

  const handleResetFilters = () => {
    setGenderFilter(filterDefaults.gender);
    setRegionFilter(filterDefaults.region);
    setAgeFilter(filterDefaults.age);
    setTimeFilter(filterDefaults.time);
    setTypeFilter(filterDefaults.type);
    setSearch("");
    setActiveTab("all");
  };

  const handleBookmark = (postId: string) => {
    setBookmarkedIds((current) =>
      current.includes(postId)
        ? current.filter((id) => id !== postId)
        : [...current, postId],
    );
  };

  const handleRequestChat = async (card: MatchCardData) => {
    if (!card.userId) {
      router.push("/create-post");
      return;
    }

    try {
      const response = await requestChatMutation.mutateAsync(card.userId);
      setRequestedIds((current) =>
        current.includes(card.postId) ? current : [...current, card.postId],
      );
      setActionError(null);
      router.push(`/chat/${response.chatId}`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "대화 요청에 실패했습니다.");
    }
  };

  const handleMatchingActivation = () => {
    if (!matchingEnabled || myPosts.length === 0) {
      router.push("/create-post");
      return;
    }

    setMatchingEnabled((current) => !current);
  };

  return (
    <div className="match-page-bg">
      <div className="mx-auto hidden h-screen max-w-[1920px] grid-cols-[208px_minmax(0,1fr)] overflow-hidden xl:grid">
        <aside className="flex h-screen flex-col border-r border-white/7 bg-[linear-gradient(180deg,rgba(9,13,31,0.98),rgba(7,10,24,0.98))] px-4 py-4">
          <div className="flex items-center gap-3 px-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#6d4dff,#4f46e5)] text-white shadow-[0_10px_26px_rgba(95,66,255,0.32)]">
              <FiShield className="text-[1.1rem]" />
            </div>
            <p className="chat-brand-title font-semibold leading-none text-white">조각</p>
          </div>

          <nav className="mt-6 space-y-1.5">
            {desktopNav.map((item) => {
              const Icon = item.icon;

              return (
                <Link key={item.label} href={item.href} className="block">
                  <div
                    className={cx(
                      "relative flex items-center gap-4 rounded-[16px] px-4 py-2.5 text-[0.95rem] font-medium transition",
                      item.active
                        ? "bg-[linear-gradient(135deg,rgba(110,76,255,0.92),rgba(76,57,183,0.84))] text-white shadow-[0_16px_28px_rgba(66,41,160,0.28)]"
                        : "text-zinc-300 hover:bg-white/4 hover:text-white",
                    )}
                  >
                    <Icon className="text-[1.35rem]" />
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span className="ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-[#ff4a4a] px-1.5 text-[0.72rem] font-semibold text-white">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4">
            <section className="match-soft-panel px-5 py-4">
              <p className="match-meta-text text-zinc-300">내 신뢰 포인트</p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#5f50ff,#5640f0)]">
                  <FiShield className="text-[1.4rem] text-white" />
                </div>
                <div>
                  <p className="text-[1.75rem] font-semibold leading-none tracking-[-0.05em] text-white">
                    {trust.toLocaleString()}P
                  </p>
                  <p className="match-meta-text mt-2 text-zinc-300">
                    신뢰는 더 좋은 만남을 만듭니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="mt-4 w-full rounded-[14px] bg-[rgba(255,255,255,0.08)] px-4 py-2.5 text-[0.9rem] font-medium text-white"
              >
                포인트 내역
              </button>
            </section>

            <div className="flex items-center gap-3 px-3">
              <PlaceholderAvatar sizeClass="h-12 w-12" />
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

        <div className="h-screen overflow-hidden px-4 py-3">
          <header className="flex items-center justify-between border-b border-white/6 px-2 pb-3">
            <div>
              <h1 className="match-page-title font-semibold text-white">매칭</h1>
              <p className="match-copy-text mt-2 text-zinc-300">
                당신과 잘 맞는 사람들의 만남 글을 확인하고, 대화를 요청해보세요.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleMatchingActivation}
                className="flex items-center gap-3 rounded-[16px] border border-white/7 bg-[rgba(16,22,42,0.9)] px-4 py-2.5"
              >
                <span className="text-[1rem] font-medium text-white">매칭 활성화</span>
                <span
                  className={cx(
                    "relative flex h-7 w-11 items-center rounded-full px-1 transition",
                    matchingEnabled ? "bg-[#6f56ff]" : "bg-white/12",
                  )}
                >
                  <span
                    className={cx(
                      "flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#6f56ff] transition",
                      matchingEnabled ? "translate-x-4" : "translate-x-0",
                    )}
                  >
                    <FiHeart className="fill-current text-[0.85rem]" />
                  </span>
                </span>
              </button>

              <div className="relative">
                <FiBell className="text-[1.45rem] text-white" />
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6f56ff] px-1 text-[0.68rem] font-semibold text-white">
                  3
                </span>
              </div>

              <div className="flex items-center gap-3">
                <PlaceholderAvatar sizeClass="h-11 w-11" />
                <span className="chat-name-md font-medium text-white">{profileName}</span>
                <FiChevronDown className="text-zinc-400" />
              </div>
            </div>
          </header>

          <div className="grid h-[calc(100vh-84px)] grid-cols-[minmax(0,1.68fr)_276px] gap-3 pt-3">
            <div className="flex min-h-0 flex-col gap-3">
              <section className="match-panel px-4 py-3">
                <div className="flex items-center justify-between gap-4 border-b border-white/7 px-1 pb-3">
                  <div className="flex items-center gap-4">
                    {matchTabs.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={cx(
                          "match-tab",
                          activeTab === tab.key && "match-tab-active",
                        )}
                      >
                        {tab.label}
                        {tab.badge ? (
                          <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6f56ff] px-1 text-[0.72rem] text-white">
                            {tab.badge}
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>

                  <div className="match-search-shell flex h-10 items-center gap-3 px-3 text-zinc-400">
                    <FiSearch />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="검색어를 입력하세요..."
                      className="w-44 bg-transparent text-[0.88rem] text-white placeholder:text-zinc-500 focus:outline-none"
                    />
                    <FiSearch className="text-lg" />
                  </div>
                </div>

                <div className="grid grid-cols-[repeat(5,minmax(0,1fr))_96px_118px] gap-2.5 px-1 pt-3">
                  <label className="match-filter-box">
                    <span className="match-filter-label">성별</span>
                    <div className="mt-2 flex items-center justify-between">
                      <select
                        value={genderFilter}
                        onChange={(event) => setGenderFilter(event.target.value)}
                        className="w-full appearance-none bg-transparent text-[0.88rem] font-medium text-white focus:outline-none"
                      >
                        <option>전체</option>
                        <option>여성</option>
                        <option>남성</option>
                      </select>
                      <FiChevronDown className="shrink-0 text-zinc-400" />
                    </div>
                  </label>

                  <label className="match-filter-box">
                    <span className="match-filter-label">지역</span>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <select
                        value={regionFilter}
                        onChange={(event) => setRegionFilter(event.target.value)}
                        className="w-full appearance-none bg-transparent text-[0.88rem] font-medium text-white focus:outline-none"
                      >
                        <option>서울 전체</option>
                        <option>경기 전체</option>
                        <option>전체</option>
                      </select>
                      <FiChevronDown className="shrink-0 text-zinc-400" />
                    </div>
                  </label>

                  <label className="match-filter-box">
                    <span className="match-filter-label">나이</span>
                    <div className="mt-2 flex items-center justify-between">
                      <select
                        value={ageFilter}
                        onChange={(event) => setAgeFilter(event.target.value)}
                        className="w-full appearance-none bg-transparent text-[0.88rem] font-medium text-white focus:outline-none"
                      >
                        <option>20대 - 30대</option>
                        <option>20대</option>
                        <option>30대</option>
                        <option>전체</option>
                      </select>
                      <FiChevronDown className="shrink-0 text-zinc-400" />
                    </div>
                  </label>

                  <label className="match-filter-box">
                    <span className="match-filter-label">시간</span>
                    <div className="mt-2 flex items-center justify-between">
                      <select
                        value={timeFilter}
                        onChange={(event) => setTimeFilter(event.target.value)}
                        className="w-full appearance-none bg-transparent text-[0.88rem] font-medium text-white focus:outline-none"
                      >
                        <option>전체</option>
                        <option>1시간 이내</option>
                        <option>오늘</option>
                      </select>
                      <FiChevronDown className="shrink-0 text-zinc-400" />
                    </div>
                  </label>

                  <label className="match-filter-box">
                    <span className="match-filter-label">유형</span>
                    <div className="mt-2 flex items-center justify-between">
                      <select
                        value={typeFilter}
                        onChange={(event) => setTypeFilter(event.target.value)}
                        className="w-full appearance-none bg-transparent text-[0.88rem] font-medium text-white focus:outline-none"
                      >
                        <option>전체</option>
                        <option>취미</option>
                        <option>맛집</option>
                        <option>문화</option>
                        <option>액티브</option>
                        <option>여행</option>
                      </select>
                      <FiChevronDown className="shrink-0 text-zinc-400" />
                    </div>
                  </label>

                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="rounded-[14px] border border-white/8 bg-[rgba(13,19,37,0.94)] px-3 py-3 text-[0.88rem] font-medium text-white"
                  >
                    초기화
                  </button>
                  <button
                    type="button"
                    className="rounded-[14px] bg-[linear-gradient(135deg,#6f56ff,#7b50f3)] px-3 py-3 text-[0.88rem] font-semibold text-white shadow-[0_18px_34px_rgba(94,63,225,0.34)]"
                  >
                    필터 적용
                  </button>
                </div>
              </section>

              <section className="min-h-0 space-y-2 overflow-y-auto pr-1">
                {displayedCards.length === 0 ? (
                  <div className="match-panel px-6 py-10 text-center">
                    <p className="match-card-title font-semibold text-white">조건에 맞는 글이 아직 없어요.</p>
                    <p className="match-copy-text mt-3 text-zinc-400">
                      필터를 초기화하거나 직접 매칭을 활성화해보세요.
                    </p>
                  </div>
                ) : (
                  displayedCards.map((card) => (
                    <article key={card.postId} className="match-panel px-4 py-4">
                      <div className="grid grid-cols-[84px_minmax(0,1fr)_104px_184px] items-center gap-4">
                        <div className="relative">
                          {card.isNew ? (
                            <span className="absolute left-0 top-0 z-10 rounded-full bg-[linear-gradient(135deg,#efe7ff,#8f6dff)] px-2 py-1 text-[0.72rem] font-bold text-[#3f2abb]">
                              NEW
                            </span>
                          ) : null}
                          <PlaceholderAvatar sizeClass="h-20 w-20" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="match-card-title font-semibold text-white">{card.title}</h3>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {card.meta.tags.map((tag) => (
                              <span key={tag} className="match-pill">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <p className="match-body-text mt-3 text-zinc-200">
                            <span className="font-semibold text-white">{card.userName}</span>
                            <span className="mx-3 text-zinc-500">·</span>
                            {card.meta.age}
                            <span className="mx-3 text-zinc-500">·</span>
                            {card.meta.district}
                            <span className="mx-3 text-zinc-500">·</span>
                            {card.meta.job}
                            <span className="mx-3 text-zinc-500">·</span>
                            {card.relativeTime}
                          </p>
                        </div>

                        <div className="space-y-2 text-[0.88rem] text-zinc-300">
                          <div className="flex items-center gap-2">
                            <FiUser className="text-zinc-400" />
                            <span>{card.meta.height}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiHeart className="text-zinc-400" />
                            <span>{card.meta.mbti}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => void handleRequestChat(card)}
                            disabled={requestChatMutation.isPending || loading}
                            className="flex h-10 min-w-[124px] items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,rgba(111,86,255,0.92),rgba(82,58,207,0.92))] px-4 text-[0.84rem] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <FiMessageCircle className="text-[1rem]" />
                            대화 요청
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBookmark(card.postId)}
                            className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-[rgba(10,14,28,0.86)] text-zinc-300"
                          >
                            <FiHeart
                              className={cx(
                                "text-[1.15rem]",
                                bookmarkedIds.includes(card.postId) && "fill-current text-violet-300",
                              )}
                            />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </section>

              <footer className="flex items-center justify-between px-2">
                <p className="text-[0.8rem] text-zinc-500">© 2024 조각. All rights reserved.</p>
                <div className="flex items-center gap-4 text-zinc-400">
                  <button type="button" className="text-sm">1</button>
                  <button type="button" className="text-sm">2</button>
                  <button type="button" className="text-sm">3</button>
                  <button type="button" className="text-sm">4</button>
                  <button type="button" className="text-sm">5</button>
                </div>
              </footer>
            </div>

            <aside className="flex min-h-0 flex-col gap-3">
              <section className="match-panel px-4 py-4">
                <h3 className="chat-name-md font-semibold text-white">오늘의 매칭 현황</h3>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#5c3df0_0deg,#7e5cff_220deg,rgba(255,255,255,0.08)_220deg,rgba(255,255,255,0.08)_360deg)]">
                    <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#11172d] text-[1.3rem] font-semibold text-white">
                      3/5
                    </div>
                  </div>
                  <div>
                    <p className="text-[1.1rem] font-semibold text-white">오늘 남은 매칭 기회</p>
                    <p className="mt-2 flex items-center gap-2 text-[0.8rem] text-zinc-300">
                      <FiShield className="text-emerald-400" />
                      매일 오전 6시에 초기화 돼요.
                    </p>
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-3 gap-2.5">
                {stats.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="match-panel px-3 py-3.5 text-center">
                      <Icon className={cx("mx-auto text-[1.35rem]", item.color)} />
                      <p className="mt-3 text-[0.75rem] text-zinc-300">{item.label}</p>
                      <p className="mt-2 text-[0.92rem] font-semibold text-white">{item.value}</p>
                    </div>
                  );
                })}
              </section>

              <section className="match-panel px-4 py-4">
                <h3 className="chat-name-md font-semibold text-white">핵심 가이드</h3>
                <div className="mt-4 space-y-3">
                  {guideItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(91,79,180,0.16)]">
                          <Icon className="text-[1rem] text-zinc-100" />
                        </div>
                        <div>
                          <p className="text-[0.88rem] font-medium text-white">{item.title}</p>
                          <p className="match-meta-text mt-1.5 text-zinc-400">{item.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button type="button" className="mt-4 flex items-center gap-2 text-[0.84rem] font-medium text-violet-300">
                  더 자세히 보기
                  <FiChevronRight />
                </button>
              </section>

              <section className="match-panel px-4 py-4">
                <h3 className="chat-name-md font-semibold text-white">신뢰 시스템</h3>
                <div className="mt-4 grid grid-cols-3 divide-x divide-white/8">
                  {trustItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="px-3 text-center">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(90,82,160,0.18)]">
                          <Icon className={cx("text-[1.15rem]", item.color)} />
                        </div>
                        <p className="mt-2 text-[0.82rem] font-medium text-white">{item.title}</p>
                        <p className="match-meta-text mt-2 text-zinc-400">{item.description}</p>
                      </div>
                    );
                  })}
                </div>
              </section>

              <footer className="mt-auto flex items-center justify-end gap-5 px-1 text-[0.8rem] text-zinc-500">
                <span>이용약관</span>
                <span>개인정보처리방침</span>
                <span>고객센터</span>
              </footer>
            </aside>
          </div>
        </div>
      </div>

      <div className="xl:hidden">
        <div className="mx-auto min-h-screen max-w-[430px] px-3 pb-24 pt-2">
          <div className="min-h-[calc(100vh-1rem)] rounded-[2.3rem] border border-[#273257] bg-[linear-gradient(180deg,rgba(6,10,23,0.98),rgba(3,7,18,0.98))] p-4 shadow-[0_26px_60px_rgba(0,0,0,0.34)]">
            <header className="flex items-center justify-between px-2 py-2">
              <h1 className="chat-brand-title font-semibold text-white">조각</h1>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <FiBell className="text-[1.45rem] text-white" />
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6f56ff] px-1 text-[0.68rem] font-semibold text-white">
                    3
                  </span>
                </div>
                <PlaceholderAvatar sizeClass="h-10 w-10" />
                <FiMenu className="text-[1.6rem] text-white" />
              </div>
            </header>

            <main className="space-y-5 px-1 pb-4 pt-5">
              <section className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="match-page-title font-semibold text-white">매칭</h2>
                  <p className="match-copy-text mt-3 text-zinc-300">
                    당신과 잘 맞는 사람들의 만남 글을 확인하고,
                    <br />
                    대화를 요청해보세요.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleMatchingActivation}
                  className="match-activation-mobile mt-1 flex shrink-0 items-center gap-3 rounded-[18px] px-5 py-4 text-white"
                >
                  <FiZap className="text-[1.25rem]" />
                  <span className="text-[1rem] font-semibold">매칭 활성화</span>
                  <FiChevronRight className="text-[1.1rem]" />
                </button>
              </section>

              <div className="overflow-x-auto">
                <div className="flex min-w-max gap-6 border-b border-white/8 px-1 pb-2">
                  {matchTabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={cx("match-tab whitespace-nowrap", activeTab === tab.key && "match-tab-active")}
                    >
                      {tab.label}
                      {tab.badge ? (
                        <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6f56ff] px-1 text-[0.72rem] text-white">
                          {tab.badge}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>

              <section className="grid grid-cols-[repeat(5,minmax(0,1fr))_64px] gap-2">
                <label className="match-filter-box min-w-0 px-3 py-3">
                  <span className="match-filter-label">성별</span>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="truncate text-[0.88rem] font-medium text-white">{genderFilter}</span>
                    <FiChevronDown className="shrink-0 text-zinc-400" />
                  </div>
                </label>
                <label className="match-filter-box min-w-0 px-3 py-3">
                  <span className="match-filter-label">지역</span>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="truncate text-[0.88rem] font-medium text-white">{regionFilter}</span>
                    <FiChevronDown className="shrink-0 text-zinc-400" />
                  </div>
                </label>
                <label className="match-filter-box min-w-0 px-3 py-3">
                  <span className="match-filter-label">나이</span>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="truncate text-[0.88rem] font-medium text-white">{ageFilter}</span>
                    <FiChevronDown className="shrink-0 text-zinc-400" />
                  </div>
                </label>
                <label className="match-filter-box min-w-0 px-3 py-3">
                  <span className="match-filter-label">시간</span>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="truncate text-[0.88rem] font-medium text-white">{timeFilter}</span>
                    <FiChevronDown className="shrink-0 text-zinc-400" />
                  </div>
                </label>
                <label className="match-filter-box min-w-0 px-3 py-3">
                  <span className="match-filter-label">유형</span>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="truncate text-[0.88rem] font-medium text-white">{typeFilter}</span>
                    <FiChevronDown className="shrink-0 text-zinc-400" />
                  </div>
                </label>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="match-filter-box flex items-center justify-center"
                >
                  <FiSliders className="text-[1.2rem] text-white" />
                </button>
              </section>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded-[14px] border border-white/10 px-5 py-3 text-[0.95rem] font-medium text-white"
                >
                  초기화
                </button>
                <button
                  type="button"
                  className="rounded-[14px] bg-[linear-gradient(135deg,#6f56ff,#7b50f3)] px-7 py-3 text-[0.95rem] font-semibold text-white"
                >
                  필터 적용
                </button>
              </div>

              <section className="space-y-3">
                {mobileCards.length === 0 ? (
                  <div className="match-panel px-5 py-8 text-center">
                    <p className="match-card-title font-semibold text-white">조건에 맞는 글이 아직 없어요.</p>
                    <p className="match-copy-text mt-3 text-zinc-400">필터를 조정해서 다시 확인해보세요.</p>
                  </div>
                ) : (
                  mobileCards.map((card) => (
                    <article key={card.postId} className="match-panel px-4 py-4">
                      <div className="grid grid-cols-[126px_minmax(0,1fr)_58px] items-center gap-4">
                        <div className="relative">
                          {card.isNew ? (
                            <span className="absolute left-0 top-0 z-10 rounded-full bg-[linear-gradient(135deg,#efe7ff,#8f6dff)] px-2.5 py-1 text-[0.76rem] font-bold text-[#3f2abb]">
                              NEW
                            </span>
                          ) : null}
                          <PlaceholderAvatar sizeClass="h-[126px] w-[126px]" />
                          <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-[#10172d] bg-emerald-400" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="match-card-title font-semibold text-white">{card.title}</h3>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {card.meta.tags.map((tag) => (
                              <span key={tag} className="match-pill">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <p className="match-body-text mt-4 text-zinc-200">
                            <span className="font-semibold text-white">{card.userName}</span>
                            <span className="mx-2 text-zinc-500">·</span>
                            {card.meta.age}
                            <span className="mx-2 text-zinc-500">·</span>
                            {card.meta.district}
                            <span className="mx-2 text-zinc-500">·</span>
                            {card.meta.job}
                          </p>
                          <div className="match-body-text mt-4 flex flex-wrap items-center gap-4 text-zinc-300">
                            <span className="flex items-center gap-2">
                              <FiUser className="text-zinc-400" />
                              {card.meta.height}
                            </span>
                            <span className="flex items-center gap-2">
                              <FiHeart className="text-zinc-400" />
                              {card.meta.mbti}
                            </span>
                            <span className="text-zinc-400">{card.relativeTime}</span>
                          </div>
                        </div>

                        <div className="flex h-full flex-col items-end justify-between">
                          <button
                            type="button"
                            onClick={() => handleBookmark(card.postId)}
                            className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-white/10 bg-[rgba(10,14,28,0.86)] text-zinc-300"
                          >
                            <FiHeart
                              className={cx(
                                "text-[1.15rem]",
                                bookmarkedIds.includes(card.postId) && "fill-current text-violet-300",
                              )}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleRequestChat(card)}
                            disabled={requestChatMutation.isPending || loading}
                            className="mt-6 flex h-12 min-w-[148px] items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,rgba(111,86,255,0.92),rgba(82,58,207,0.92))] px-4 text-[0.92rem] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <FiMessageCircle className="text-[1rem]" />
                            대화 요청
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </section>

              <button
                type="button"
                onClick={handleMatchingActivation}
                className="match-activation-bar flex w-full items-center justify-between rounded-[20px] px-5 py-5 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(255,255,255,0.12)]">
                    <FiZap className="text-[1.35rem] text-white" />
                  </div>
                  <div>
                    <p className="text-[1.1rem] font-semibold text-white">매칭 활성화</p>
                    <p className="match-meta-text mt-1.5 text-white/78">
                      프로필 정보를 바탕으로
                      <br />
                      더 많은 만남 글을 확인하세요.
                    </p>
                  </div>
                </div>
                <FiChevronRight className="text-[1.25rem] text-white/80" />
              </button>
            </main>
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
                      "relative flex flex-col items-center justify-center gap-0.5 rounded-[16px] py-1 font-medium",
                      tab.active ? "text-[#8a5dff]" : "text-zinc-400",
                    )}
                  >
                    <Icon className={cx("text-[1.1rem]", tab.active && "fill-current")} />
                    {tab.badge ? (
                      <span className="absolute right-[1.7rem] top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff4a4a] px-1 text-[0.66rem] font-semibold text-white">
                        {tab.badge}
                      </span>
                    ) : null}
                    <span className="home-tab-text">{tab.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {error && (
        <div className="fixed right-4 top-4 z-[120] rounded-2xl border border-rose-400/20 bg-rose-950/80 px-4 py-3 text-sm text-rose-100 shadow-xl">
          {error}
        </div>
      )}
    </div>
  );
}
