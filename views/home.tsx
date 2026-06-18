"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiBell,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiHome,
  FiMenu,
  FiMessageCircle,
  FiMoreHorizontal,
  FiShield,
  FiStar,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { PiDiamondLight } from "react-icons/pi";

import { useRequestChatMutation } from "@/entities/chat/hooks";
import type { Post } from "@/entities/post";
import { usePostsQuery } from "@/entities/post/hooks";
import { useProfileQuery } from "@/entities/profile/hooks";
import { useAuthStatusQuery } from "@/features/auth/hooks";

type MatchCard = {
  id: string;
  name: string;
  age: string;
  location: string;
  summary: string;
  tags: string[];
  online?: boolean;
};

const desktopCards: MatchCard[] = [
  {
    id: "lee-jihae",
    name: "이지혜",
    age: "24세",
    location: "서울",
    summary: "차분한 대화 좋아해요",
    tags: ["#독서", "#전시회"],
    online: true,
  },
  {
    id: "kim-taejun",
    name: "김태준",
    age: "27세",
    location: "경기",
    summary: "산책과 카페 투어",
    tags: ["#운동", "#등산"],
    online: true,
  },
  {
    id: "park-soyeon",
    name: "박소연",
    age: "25세",
    location: "인천",
    summary: "여행 메이트 찾는 중",
    tags: ["#카페", "#여행"],
    online: true,
  },
  {
    id: "choi-minwoo",
    name: "최민우",
    age: "26세",
    location: "서울",
    summary: "영화 보고 이야기하는 시간",
    tags: ["#게임", "#영화"],
    online: true,
  },
];

const mobileFeature: MatchCard = {
  id: "mobile-feature",
  name: "지금 이 사람과 매칭해보세요!",
  age: "26세",
  location: "서울",
  summary: "영화, 여행 좋아해요",
  tags: ["#진솔한대화", "#여행메이트"],
  online: true,
};

const systemItems = [
  {
    icon: FiShield,
    title: "신원 인증 완료",
    description: "더 안전한 만남",
  },
  {
    icon: FiStar,
    title: "상호 평가 문화",
    description: "신뢰를 쌓아가요",
  },
  {
    icon: PiDiamondLight,
    title: "신뢰 포인트",
    description: "좋은 만남의 가치",
  },
];

const desktopStats = [
  { icon: FiUsers, label: "현재 접속 중", value: "128명", color: "text-violet-400" },
  { icon: FiHeart, label: "오늘 매칭 성공", value: "24건", color: "text-violet-400" },
  { icon: FiStar, label: "누적 매칭 성공", value: "1,248건", color: "text-amber-400" },
];

const desktopNotices = [
  { title: "신뢰 포인트 적립 이벤트 안내", date: "11.29", isNew: true },
  { title: "안전한 만남을 위한 가이드 업데이트", date: "11.28" },
  { title: "주말 실시간 매칭 운영 시간 안내", date: "11.27" },
  { title: "실시간 카드 노출 기준 변경 안내", date: "11.26" },
  { title: "매칭 시스템 개선 사항 안내", date: "11.25" },
];

const mobileTabs = [
  { label: "홈", icon: FiHome, active: true },
  { label: "매칭", icon: FiHeart },
  { label: "채팅", icon: FiMessageCircle },
  { label: "포인트", icon: PiDiamondLight },
  { label: "마이", icon: FiUser },
];

const desktopNav = [
  { label: "홈", icon: FiHome, active: true },
  { label: "매칭", icon: FiHeart },
  { label: "채팅", icon: FiMessageCircle, href: "/chats" },
  { label: "포인트", icon: PiDiamondLight },
  { label: "내 정보", icon: FiUser, href: "/profile" },
  { label: "알림", icon: FiBell },
];

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export default function HomePage() {
  const router = useRouter();
  const [actionError, setActionError] = useState<string | null>(null);
  const [desktopIndex, setDesktopIndex] = useState(0);
  const { data: isAuthenticated } = useAuthStatusQuery();
  const queryEnabled = isAuthenticated === true;
  const postsQuery = usePostsQuery(queryEnabled);
  const profileQuery = useProfileQuery(queryEnabled);
  const requestChatMutation = useRequestChatMutation();

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  const posts: Post[] = postsQuery.data?.posts ?? [];
  const profile = profileQuery.data?.profile;
  const trust = profile?.hearts ?? 1240;
  const profileName = profile?.name?.trim() || "김신뢰";
  const currentUserId = profile?.userId ?? "";
  const loading =
    isAuthenticated === undefined || postsQuery.isPending || profileQuery.isPending;
  const queryError = postsQuery.error ?? profileQuery.error;
  const error =
    actionError ??
    (queryError instanceof Error
      ? queryError.message
      : queryError
        ? "데이터를 불러오지 못했습니다."
        : null);

  const availablePosts = posts.filter((post) => post.userId && post.userId !== currentUserId);

  const handleRequestChat = async () => {
    if (availablePosts.length === 0) {
      router.push("/create-post");
      return;
    }

    try {
      const response = await requestChatMutation.mutateAsync(availablePosts[0].userId);
      setActionError(null);
      router.push(`/chat/${response.chatId}`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "채팅 요청에 실패했습니다.");
    }
  };

  const nextDesktopCard = () => {
    setDesktopIndex((prev) => (prev + 1) % desktopCards.length);
  };

  const prevDesktopCard = () => {
    setDesktopIndex((prev) => (prev - 1 + desktopCards.length) % desktopCards.length);
  };

  const desktopVisibleCards = desktopCards.map((_, index) => {
    return desktopCards[(desktopIndex + index) % desktopCards.length];
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(74,51,181,0.24),transparent_22%),radial-gradient(circle_at_top_right,rgba(41,16,109,0.14),transparent_18%),linear-gradient(180deg,#070b1c,#040814)] text-white">
      <div className="mx-auto hidden h-screen max-w-[1920px] grid-cols-[220px_minmax(0,1fr)] overflow-hidden xl:grid">
        <aside className="border-r border-white/7 bg-[linear-gradient(180deg,rgba(9,13,31,0.98),rgba(7,10,24,0.98))] px-4 py-5">
          <div className="flex items-center gap-3 px-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#6d4dff,#4f46e5)] text-white shadow-[0_10px_26px_rgba(95,66,255,0.32)]">
              <FiShield className="text-[1.1rem]" />
            </div>
            <div>
              <p className="text-[1.15rem] font-semibold leading-none text-white">TrustMate</p>
            </div>
          </div>

          <nav className="mt-7 space-y-2">
            {desktopNav.map((item) => {
              const Icon = item.icon;
              const content = (
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
              );

              if (item.href) {
                return (
                  <Link key={item.label} href={item.href}>
                    {content}
                  </Link>
                );
              }

              return (
                <button key={item.label} type="button" className="block w-full text-left">
                  {content}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="h-screen overflow-hidden px-5 py-4">
          <header className="flex items-center justify-between border-b border-white/6 px-3 pb-4">
            <div className="flex items-center gap-5">
              <h1 className="text-[1.8rem] font-semibold leading-none text-white">홈</h1>
              <p className="pt-1 text-[0.95rem] text-zinc-300">신뢰 기반 실시간 만남</p>
            </div>
            <div className="flex items-center gap-5">
              <div className="relative">
                <FiBell className="text-[1.45rem] text-white" />
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6f56ff] px-1 text-[0.68rem] font-semibold text-white">
                  3
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 overflow-hidden rounded-full border border-white/10 bg-[linear-gradient(135deg,#3c2e7f,#171c35)]">
                  <img alt="" src="" className="h-full w-full object-cover opacity-0" />
                </div>
                <span className="text-[1.25rem] font-medium text-white">{profileName}</span>
                <FiChevronDown className="text-[1.2rem] text-zinc-300" />
              </div>
            </div>
          </header>

          <div className="grid h-[calc(100vh-88px)] gap-5 pt-5 2xl:grid-cols-[minmax(0,1.62fr)_440px]">
            <div className="flex min-h-0 flex-col gap-5">
              <section className="overflow-hidden rounded-[20px] border border-white/7 bg-[linear-gradient(135deg,rgba(14,23,43,0.98),rgba(10,14,30,0.96))] shadow-[0_26px_70px_rgba(0,0,0,0.3)]">
                <div className="relative grid h-[304px] grid-cols-[1.02fr_0.98fr]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent_38%),linear-gradient(90deg,rgba(5,9,21,0.82),rgba(5,9,21,0.18)_52%,rgba(5,9,21,0.46))]" />
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#182132,#0c1226)]" />
                  <div className="absolute inset-0 opacity-60 [background:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_6%),radial-gradient(circle_at_28%_36%,rgba(255,226,186,0.18),transparent_5%),radial-gradient(circle_at_42%_26%,rgba(199,225,255,0.15),transparent_4%),radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.16),transparent_4%),radial-gradient(circle_at_84%_44%,rgba(255,218,173,0.14),transparent_5%),radial-gradient(circle_at_66%_64%,rgba(255,255,255,0.12),transparent_4%),linear-gradient(135deg,#202a37,#0f1220_58%,#151b2b)]" />
                  <div className="absolute bottom-0 right-0 top-0 w-[44%]">
                    <img alt="" src="" className="h-full w-full object-cover opacity-0" />
                  </div>

                  <div className="relative z-10 flex flex-col justify-between px-10 py-7">
                    <div>
                      <h2 className="max-w-[16rem] text-[2.35rem] font-semibold leading-[1.15] tracking-[-0.04em] text-white">
                        지금 이 사람과
                        <br />
                        매칭해보세요!
                      </h2>
                      <p className="mt-3.5 text-[0.88rem] text-zinc-200">
                        26세 · 서울 · 영화, 여행 좋아해요
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-3 text-[0.82rem] text-zinc-100">
                        <span>#진솔한대화</span>
                        <span>#여행메이트</span>
                        <span>#취미공유</span>
                      </div>
                    </div>

                    <div className="mt-5 flex max-w-[28rem] gap-4">
                      <button
                        type="button"
                        onClick={nextDesktopCard}
                        className="flex h-[54px] flex-1 items-center justify-center gap-3 rounded-[16px] border border-[#2b3559] bg-[rgba(10,15,30,0.68)] text-[0.96rem] font-medium text-zinc-100 transition hover:border-[#3d4771] hover:bg-white/6"
                      >
                        <FiX className="text-[1.4rem]" />
                        다음 사람
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleRequestChat()}
                        disabled={requestChatMutation.isPending || loading}
                        className="flex h-[54px] flex-1 items-center justify-center gap-3 rounded-[16px] bg-[linear-gradient(135deg,#6f56ff,#7b50f3)] text-[0.96rem] font-semibold text-white shadow-[0_18px_34px_rgba(94,63,225,0.34)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <FiHeart className="text-[1.2rem] fill-current" />
                        매칭하기
                      </button>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <div className="absolute right-6 top-6 rounded-full bg-[#23c96c] px-4 py-2 text-[0.84rem] font-semibold text-white">
                      ONLINE
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[20px] border border-white/7 bg-[linear-gradient(180deg,rgba(10,15,31,0.98),rgba(8,12,26,0.96))] px-6 py-5 shadow-[0_24px_56px_rgba(0,0,0,0.25)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="text-[1rem] font-semibold text-white">실시간 매칭 카드</h3>
                    <div className="flex items-center gap-2 text-[0.9rem] text-zinc-300">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      현재 접속 중 128명
                    </div>
                  </div>
                  <button type="button" className="flex items-center gap-2 text-[0.9rem] text-zinc-300">
                    더보기
                    <FiChevronRight />
                  </button>
                </div>

                <div className="relative mt-5">
                  <button
                    type="button"
                    onClick={prevDesktopCard}
                    className="absolute left-[-26px] top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[rgba(8,13,28,0.92)] text-white shadow-[0_14px_28px_rgba(0,0,0,0.28)]"
                  >
                    <FiChevronLeft className="text-[1.25rem]" />
                  </button>
                  <button
                    type="button"
                    onClick={nextDesktopCard}
                    className="absolute right-[-26px] top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[rgba(8,13,28,0.92)] text-white shadow-[0_14px_28px_rgba(0,0,0,0.28)]"
                  >
                    <FiChevronRight className="text-[1.25rem]" />
                  </button>

                  <div className="grid grid-cols-4 gap-4">
                    {desktopVisibleCards.map((card) => (
                      <article
                        key={card.id}
                        className="rounded-[18px] border border-white/6 bg-[linear-gradient(180deg,rgba(18,25,49,0.95),rgba(12,17,34,0.94))] px-4 py-4 text-center"
                      >
                        <div className="mx-auto h-20 w-20 overflow-hidden rounded-full border border-white/10 bg-[linear-gradient(135deg,#3d4a6d,#182033)]">
                          <img alt="" src="" className="h-full w-full object-cover opacity-0" />
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center justify-center gap-2">
                            <p className="text-[0.96rem] font-medium text-white">{card.name}</p>
                            {card.online && <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />}
                          </div>
                          <p className="mt-2 text-[0.9rem] text-zinc-300">
                            {card.age} · {card.location}
                          </p>
                          <div className="mt-2 space-y-1 text-[0.85rem] text-zinc-400">
                            {card.tags.map((tag) => (
                              <p key={tag}>{tag}</p>
                            ))}
                          </div>
                        </div>
                        <div className="mt-4 inline-flex rounded-full bg-[linear-gradient(135deg,#5f47ee,#4933c7)] px-4 py-1.5 text-[0.82rem] font-medium text-white">
                          ONLINE
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-[20px] border border-white/7 bg-[linear-gradient(180deg,rgba(10,15,31,0.98),rgba(8,12,26,0.96))] px-6 py-5 shadow-[0_24px_56px_rgba(0,0,0,0.25)]">
                <h3 className="text-[1rem] font-semibold text-white">신뢰 시스템 안내</h3>
                <div className="mt-5 grid grid-cols-3 divide-x divide-white/8 overflow-hidden rounded-[16px]">
                  {systemItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.title} className="flex items-center gap-4 px-5 py-1">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[rgba(98,79,255,0.12)]">
                          <Icon
                            className={cx(
                              "text-[1.6rem]",
                              item.title === "상호 평가 문화" && "text-amber-400",
                              item.title === "신뢰 포인트" && "text-sky-400",
                              item.title === "신원 인증 완료" && "text-zinc-100",
                            )}
                          />
                        </div>
                        <div>
                          <p className="text-[0.95rem] font-medium text-white">{item.title}</p>
                          <p className="mt-1 text-[0.88rem] text-zinc-400">{item.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <p className="px-2 text-[0.85rem] text-zinc-500">© 2024 TrustMate. All rights reserved.</p>
            </div>

            <aside className="flex min-h-0 flex-col gap-5">
              <section className="rounded-[18px] border border-white/7 bg-[linear-gradient(180deg,rgba(14,19,38,0.98),rgba(11,16,31,0.96))] px-6 py-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[1.35rem] font-semibold text-white">오늘 남은 매칭 기회</h3>
                  <span className="text-[1rem] text-white">3 / 5</span>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full w-[72%] rounded-full bg-[linear-gradient(90deg,#6a49f3,#5a38ea,#7b5cf5)]" />
                </div>
              </section>

              <section className="grid grid-cols-3 gap-3">
                {desktopStats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className="rounded-[18px] border border-white/7 bg-[linear-gradient(180deg,rgba(14,19,38,0.98),rgba(11,16,31,0.96))] px-4 py-5 text-center"
                    >
                      <Icon className={cx("mx-auto text-[1.7rem]", stat.color)} />
                      <p className="mt-4 text-[0.92rem] text-zinc-300">{stat.label}</p>
                      <p className="mt-3 text-[1.05rem] font-semibold text-white">{stat.value}</p>
                    </div>
                  );
                })}
              </section>

              <section className="rounded-[18px] border border-white/7 bg-[linear-gradient(135deg,rgba(67,39,147,0.78),rgba(39,23,84,0.82))] px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[1.35rem] font-semibold text-white">오늘의 한마디</h3>
                    <p className="mt-4 text-[1rem] text-white/95">
                      “진짜 만남은 신뢰에서 시작됩니다.”
                    </p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(116,69,255,0.28)] text-white/90">
                    <FiMoreHorizontal className="text-[1.8rem]" />
                  </div>
                </div>
              </section>

              <section className="rounded-[18px] border border-white/7 bg-[linear-gradient(180deg,rgba(14,19,38,0.98),rgba(11,16,31,0.96))] px-6 py-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[1.35rem] font-semibold text-white">공지사항</h3>
                  <button type="button" className="flex items-center gap-2 text-[0.9rem] text-zinc-300">
                    더보기
                    <FiChevronRight />
                  </button>
                </div>
                <div className="mt-5 space-y-4">
                  {desktopNotices.map((notice) => (
                    <div key={notice.title} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-violet-400" />
                        <p className="text-[0.92rem] text-zinc-200">{notice.title}</p>
                        {notice.isNew && (
                          <span className="rounded-md bg-[#8f522c] px-2 py-0.5 text-[0.72rem] font-semibold text-orange-100">
                            NEW
                          </span>
                        )}
                      </div>
                      <span className="shrink-0 text-[0.88rem] text-zinc-500">{notice.date}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[18px] border border-white/7 bg-[linear-gradient(135deg,rgba(66,42,171,0.92),rgba(35,24,84,0.92))] px-6 py-5">
                <h3 className="text-[1.35rem] font-semibold text-white">내 신뢰 포인트</h3>
                <div className="mt-5 flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#5f50ff,#5640f0)]">
                    <FiShield className="text-[1.75rem] text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[2rem] font-semibold leading-none tracking-[-0.04em] text-[#f1b8ff]">
                      {trust.toLocaleString()}P
                    </p>
                    <p className="mt-2 text-[0.88rem] text-white/88">신뢰는 더 좋은 만남을 만듭니다.</p>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 rounded-[16px] bg-[rgba(255,255,255,0.12)] px-5 py-3 text-[0.92rem] font-medium text-white"
                  >
                    포인트 내역
                  </button>
                </div>
              </section>

              <footer className="mt-auto flex items-center justify-end gap-8 px-1 text-[0.85rem] text-zinc-500">
                <span>이용약관</span>
                <span>개인정보처리방침</span>
                <span>고객센터</span>
              </footer>
            </aside>
          </div>
        </div>
      </div>

      <div className="xl:hidden">
        <header className="flex items-center justify-between px-8 pb-6 pt-12">
          <h1 className="text-[2.4rem] font-semibold tracking-[-0.04em] text-white">TrustMate</h1>
          <div className="flex items-center gap-6">
            <div className="relative">
              <FiBell className="text-[2rem] text-white" />
              <span className="absolute -right-1 top-0 h-3.5 w-3.5 rounded-full bg-[#8b5cf6]" />
            </div>
            <FiMenu className="text-[2.2rem] text-white" />
          </div>
        </header>

        <main className="space-y-7 px-8 pb-36">
          <section className="rounded-[28px] border border-white/7 bg-[linear-gradient(135deg,rgba(87,60,216,0.92),rgba(25,20,74,0.94))] px-8 py-9 shadow-[0_28px_60px_rgba(29,20,84,0.4)]">
            <div className="flex items-center justify-between gap-5">
              <div className="flex items-center gap-5">
                <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#5660ff,#5b4eff)]">
                  <FiShield className="text-[2.55rem] text-white" />
                </div>
                <div>
                  <p className="text-[1rem] text-white/90">내 신뢰 포인트</p>
                  <p className="mt-2 text-[3.5rem] font-semibold leading-none tracking-[-0.05em] text-white">
                    {trust.toLocaleString()}P
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="hidden rounded-full bg-[rgba(255,255,255,0.12)] px-7 py-5 text-[1.05rem] font-medium text-white sm:block"
              >
                포인트 내역
              </button>
            </div>
            <button
              type="button"
              className="mt-6 rounded-full bg-[rgba(255,255,255,0.12)] px-6 py-3 text-[1rem] font-medium text-white sm:hidden"
            >
              포인트 내역
            </button>
            <p className="mt-6 text-[1.05rem] text-white/88">신뢰는 더 좋은 만남을 만듭니다.</p>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-[2.2rem] font-semibold tracking-[-0.04em] text-white">실시간 매칭</h2>
                <div className="flex items-center gap-2 text-[1rem] text-zinc-300">
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  현재 접속 중 128명
                </div>
              </div>
              <button type="button" className="flex items-center gap-2 text-[1rem] text-zinc-300">
                더보기
                <FiChevronRight className="text-[1.2rem]" />
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-[28px] border border-white/7 bg-[linear-gradient(180deg,rgba(11,15,31,0.98),rgba(9,12,25,0.98))] p-6 shadow-[0_24px_56px_rgba(0,0,0,0.3)]">
              <div className="relative min-h-[540px] overflow-hidden rounded-[24px]">
                <div className="absolute inset-0 [background:radial-gradient(circle_at_16%_18%,rgba(255,255,255,0.14),transparent_6%),radial-gradient(circle_at_33%_18%,rgba(255,224,185,0.16),transparent_5%),radial-gradient(circle_at_53%_25%,rgba(182,228,255,0.16),transparent_4%),radial-gradient(circle_at_80%_14%,rgba(255,255,255,0.14),transparent_4%),radial-gradient(circle_at_72%_54%,rgba(255,227,205,0.15),transparent_5%),linear-gradient(135deg,#384034,#151a1f_38%,#0b1020_68%,#182030)]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,17,0.04),rgba(7,9,17,0.76))]" />
                <div className="absolute inset-0">
                  <img alt="" src="" className="h-full w-full object-cover opacity-0" />
                </div>
                <div className="absolute right-7 top-7 rounded-full bg-[#23c96c] px-4 py-2 text-[1.05rem] font-semibold text-white">
                  ONLINE
                </div>

                <div className="relative z-10 flex h-full flex-col justify-end p-10">
                  <h3 className="text-[2.55rem] font-semibold leading-tight tracking-[-0.04em] text-white">
                    {mobileFeature.name}
                  </h3>
                  <p className="mt-5 text-[1.05rem] text-zinc-100">
                    {mobileFeature.age} · {mobileFeature.location} · {mobileFeature.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3 text-[1rem] text-zinc-100">
                    {mobileFeature.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>

                  <div className="mt-10 grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      className="flex h-[72px] items-center justify-center gap-3 rounded-[20px] border border-[#31395c] bg-[rgba(10,15,30,0.56)] text-[1.05rem] font-medium text-zinc-100"
                    >
                      <FiX className="text-[1.65rem]" />
                      다음 사람
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleRequestChat()}
                      disabled={requestChatMutation.isPending || loading}
                      className="flex h-[72px] items-center justify-center gap-3 rounded-[20px] bg-[linear-gradient(135deg,#6f56ff,#7a53f5)] text-[1.05rem] font-semibold text-white shadow-[0_18px_36px_rgba(93,61,221,0.35)] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <FiHeart className="fill-current text-[1.35rem]" />
                      매칭하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-white/7 bg-[linear-gradient(180deg,rgba(15,19,36,0.98),rgba(10,13,25,0.98))] px-8 py-7">
            <div className="flex items-center gap-4 text-[1.1rem] text-white">
              <span>오늘 남은 매칭 기회</span>
              <span className="font-semibold">3/5</span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[64%] rounded-full bg-[linear-gradient(90deg,#7d55ff,#8156f4,#5940d8)]" />
            </div>
          </section>

          <section>
            <h2 className="text-[2rem] font-semibold tracking-[-0.04em] text-white">신뢰 시스템</h2>
            <div className="mt-5 rounded-[24px] border border-white/7 bg-[linear-gradient(180deg,rgba(15,19,36,0.98),rgba(10,13,25,0.98))] px-4 py-6">
              <div className="grid grid-cols-3 divide-x divide-white/8">
                {systemItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.title} className="px-3 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(90,82,160,0.18)]">
                        <Icon
                          className={cx(
                            "text-[1.9rem]",
                            item.title === "상호 평가 문화" && "text-amber-400",
                            item.title === "신뢰 포인트" && "text-sky-400",
                            item.title === "신원 인증 완료" && "text-zinc-100",
                          )}
                        />
                      </div>
                      <p className="mt-5 text-[1rem] font-medium text-white">{item.title}</p>
                      <p className="mt-2 text-[0.95rem] leading-6 text-zinc-400">{item.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-white/7 bg-[linear-gradient(135deg,rgba(68,40,156,0.84),rgba(35,22,80,0.88))] px-8 py-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[1.95rem] font-semibold text-white">오늘의 한마디</h2>
                <p className="mt-5 text-[1.05rem] text-white/92">“진짜 만남은 신뢰에서 시작됩니다.”</p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(122,72,255,0.26)] text-white/90">
                <FiMoreHorizontal className="text-[2rem]" />
              </div>
            </div>
          </section>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 border-t border-white/8 bg-[linear-gradient(180deg,rgba(9,13,29,0.94),rgba(7,10,22,0.98))] px-6 py-4 backdrop-blur-xl">
          <div className="grid grid-cols-5 gap-2">
            {mobileTabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.label}
                  type="button"
                  className={cx(
                    "flex flex-col items-center justify-center gap-2 rounded-[18px] py-3 text-[0.95rem] font-medium",
                    tab.active ? "text-[#8a5dff]" : "text-zinc-400",
                  )}
                >
                  <Icon className={cx("text-[1.9rem]", tab.active && "fill-current")} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {error && (
        <div className="fixed right-4 top-4 z-50 rounded-2xl border border-rose-400/20 bg-rose-950/80 px-4 py-3 text-sm text-rose-100 shadow-xl">
          {error}
        </div>
      )}
    </div>
  );
}
