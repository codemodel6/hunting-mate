"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, ComponentType } from "react";
import { useRouter } from "next/navigation";
import {
  FiBell,
  FiCamera,
  FiChevronDown,
  FiChevronRight,
  FiEdit3,
  FiFlag,
  FiHeart,
  FiHome,
  FiLock,
  FiMapPin,
  FiMenu,
  FiMessageCircle,
  FiMoreHorizontal,
  FiSettings,
  FiShield,
  FiStar,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { PiDiamondLight } from "react-icons/pi";

import type { Profile } from "@/entities/profile";
import {
  useDeletePhotoMutation,
  useProfileQuery,
  useUpdateProfileMutation,
  useUploadPhotoMutation,
} from "@/entities/profile/hooks";
import { useAuthStatusQuery } from "@/features/auth/hooks";

type EditableProfile = {
  name: string;
  age: string;
  location: string;
  height: string;
};

type ProfileRow = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
};

type StatCard = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accentClassName: string;
};

type ActivityItem = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  date: string;
  accentClassName: string;
};

type SettingItem = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  action: "edit" | "notifications" | "block" | "account";
};

const desktopNav = [
  { label: "홈", icon: FiHome, href: "/home" },
  { label: "매칭", icon: FiHeart, href: "/matching" },
  { label: "채팅", icon: FiMessageCircle, href: "/chats", badge: "3" },
  { label: "포인트", icon: PiDiamondLight },
  { label: "내 정보", icon: FiUser, href: "/profile", active: true },
  { label: "알림", icon: FiBell, badge: "2" },
];

const mobileTabs = [
  { label: "홈", icon: FiHome, href: "/home" },
  { label: "매칭", icon: FiHeart, href: "/matching" },
  { label: "채팅", icon: FiMessageCircle, href: "/chats", badge: "3" },
  { label: "포인트", icon: PiDiamondLight, href: "/profile" },
  { label: "마이", icon: FiUser, href: "/profile", active: true },
];

const statCards: StatCard[] = [
  { icon: FiUsers, label: "매칭 성공", value: "24건", accentClassName: "text-violet-400" },
  { icon: FiMessageCircle, label: "받은 후기", value: "18개", accentClassName: "text-violet-400" },
  { icon: FiMoreHorizontal, label: "응답률", value: "92%", accentClassName: "text-indigo-400" },
  { icon: FiStar, label: "평균 평점", value: "4.8 / 5.0", accentClassName: "text-amber-400" },
];

const activityItems: ActivityItem[] = [
  {
    icon: FiHome,
    title: "영화 보면서 이야기 나눌 분 찾습니다",
    description: "대화 요청을 받았습니다.",
    date: "05.21",
    accentClassName: "bg-violet-500/16 text-violet-300",
  },
  {
    icon: FiUsers,
    title: "퇴근 후 가볍게 맛집 탐방 할 사람!",
    description: "상대방과 매칭이 성사되었습니다.",
    date: "05.20",
    accentClassName: "bg-emerald-500/16 text-emerald-300",
  },
  {
    icon: FiCamera,
    title: "주말에 전시회나 브런치 즐겨요",
    description: "대화에 참여했습니다.",
    date: "05.19",
    accentClassName: "bg-indigo-500/16 text-indigo-200",
  },
];

const settingItems: SettingItem[] = [
  { icon: FiEdit3, label: "프로필 수정", action: "edit" },
  { icon: FiBell, label: "알림 설정", action: "notifications" },
  { icon: FiLock, label: "차단 관리", action: "block" },
  { icon: FiSettings, label: "계정 설정", action: "account" },
];

const trustChecks = [
  { label: "본인 인증 완료", value: "완료", valueClassName: "text-emerald-400" },
  { label: "평가 완료 횟수", value: "24회", valueClassName: "text-zinc-200" },
  { label: "신고 이력", value: "없음", valueClassName: "text-lime-200" },
  { label: "이용 규칙 위반", value: "없음", valueClassName: "text-lime-200" },
];

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getInitials(name: string) {
  return name.slice(0, 2);
}

function createEditableProfile(profile: Profile | null): EditableProfile {
  return {
    name: profile?.name ?? "",
    age: profile?.age ?? "",
    location: profile?.location ?? "",
    height: profile?.height ?? "",
  };
}

function ProfileAvatar({
  name,
  photo,
  sizeClassName,
}: {
  name: string;
  photo?: string;
  sizeClassName: string;
}) {
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt={`${name} 프로필 사진`}
        className={cx("rounded-full border border-white/10 object-cover", sizeClassName)}
      />
    );
  }

  return (
    <div
      className={cx(
        "flex items-center justify-center rounded-full border border-white/10 bg-[linear-gradient(135deg,#2b3154,#171b32)] text-white shadow-[0_18px_40px_rgba(0,0,0,0.22)]",
        sizeClassName,
      )}
    >
      <span className="text-[1.4rem] font-semibold tracking-[-0.04em]">{getInitials(name)}</span>
    </div>
  );
}

function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[1.15rem] font-semibold text-white md:text-[1.3rem]">{title}</h2>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="flex items-center gap-1 text-sm font-medium text-violet-300 transition hover:text-violet-200"
        >
          {actionLabel}
          <FiChevronRight className="text-base" />
        </button>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<EditableProfile>({
    name: "",
    age: "",
    location: "",
    height: "",
  });
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: isAuthenticated } = useAuthStatusQuery();
  const queryEnabled = isAuthenticated === true;
  const profileQuery = useProfileQuery(queryEnabled);
  const updateProfileMutation = useUpdateProfileMutation();
  const uploadPhotoMutation = useUploadPhotoMutation();
  const deletePhotoMutation = useDeletePhotoMutation();

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  const profile = profileQuery.data?.profile ?? null;

  useEffect(() => {
    if (!editing) {
      setEditedProfile(createEditableProfile(profile));
    }
  }, [editing, profile]);

  const displayName = (profile?.name ?? "").trim() || "김신뢰";
  const displayAge = (profile?.age ?? "").trim() || "28";
  const displayLocation = (profile?.location ?? "").trim() || "서울 강남구";
  const displayHeight = (profile?.height ?? "").trim() || "165cm";
  const displayPhoto = profile?.photos?.[0];
  const trustPoints = profile?.hearts ?? 1240;
  const trustScore = Math.max(70, Math.min(99, Math.round(trustPoints / 14)));
  const trustScoreRatio = Math.min(100, trustScore);
  const pointRatio = Math.min(100, Math.round((trustPoints / 2000) * 100));

  const profileRows: ProfileRow[] = [
    { icon: FiMapPin, label: "거주지", value: displayLocation },
    { icon: FiBriefcasePlaceholder, label: "직업", value: "마케터" },
    { icon: FiSmilePlaceholder, label: "MBTI", value: "INFJ" },
    { icon: FiHeart, label: "관심사", value: "여행, 영화, 카페투어, 독서, 요가" },
    {
      icon: FiEdit3,
      label: "자기소개",
      value: "따뜻하고 긍정적인 사람입니다. 서로의 가치를 존중하며 함께 성장할 수 있는 인연을 찾고 있어요. 🙂",
    },
  ];

  const queryError =
    profileQuery.error instanceof Error
      ? profileQuery.error.message
      : profileQuery.error
        ? "내 정보를 불러오지 못했습니다."
        : null;
  const error = actionError ?? queryError;

  const handleStartEditing = () => {
    setEditedProfile(createEditableProfile(profile));
    setSuccessMessage(null);
    setActionError(null);
    setEditing(true);
  };

  const handleCancelEditing = () => {
    setEditedProfile(createEditableProfile(profile));
    setActionError(null);
    setEditing(false);
  };

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync(editedProfile);
      setEditing(false);
      setActionError(null);
      setSuccessMessage("프로필 정보를 저장했습니다.");
    } catch (err) {
      setSuccessMessage(null);
      setActionError(err instanceof Error ? err.message : "프로필 저장에 실패했습니다.");
    }
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      await uploadPhotoMutation.mutateAsync(file);
      setSuccessMessage("프로필 사진을 업데이트했습니다.");
      setActionError(null);
    } catch (err) {
      setSuccessMessage(null);
      setActionError(err instanceof Error ? err.message : "사진 업로드에 실패했습니다.");
    } finally {
      event.target.value = "";
    }
  };

  const handleDeletePhoto = async () => {
    if (!profile?.photos?.length) {
      return;
    }

    try {
      await deletePhotoMutation.mutateAsync(0);
      setSuccessMessage("프로필 사진을 삭제했습니다.");
      setActionError(null);
    } catch (err) {
      setSuccessMessage(null);
      setActionError(err instanceof Error ? err.message : "사진 삭제에 실패했습니다.");
    }
  };

  const handleSettingAction = (action: SettingItem["action"]) => {
    if (action === "edit") {
      handleStartEditing();
      return;
    }

    setSuccessMessage(null);
    setActionError("이 메뉴는 아직 준비 중입니다.");
  };

  if (profileQuery.isPending && !profile) {
    return (
      <div className="app-frame flex min-h-screen items-center justify-center px-5">
        <div className="surface-panel w-full max-w-2xl text-center">
          <h1 className="section-title">내 정보를 불러오는 중입니다</h1>
          <p className="section-copy">잠시만 기다려 주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(74,51,181,0.24),transparent_22%),radial-gradient(circle_at_top_right,rgba(41,16,109,0.14),transparent_18%),linear-gradient(180deg,#070b1c,#040814)] text-white">
      <div className="desktop-screen">
        <aside className="desktop-sidebar">
          <div className="desktop-brand">
            <div className="desktop-brand-badge">
              <FiShield className="text-[1.1rem]" />
            </div>
            <p className="desktop-brand-text">TrustMate</p>
          </div>

          <nav className="desktop-nav">
            {desktopNav.map((item) => {
              const Icon = item.icon;
              const content = (
                <div
                  className={cx(
                    "desktop-nav-item justify-between",
                    item.active && "desktop-nav-item-active",
                  )}
                >
                  <span className="flex items-center gap-4">
                    <Icon className="desktop-nav-icon" />
                    <span>{item.label}</span>
                  </span>
                  {item.badge && (
                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#ff3b46] px-1 text-[0.75rem] font-semibold text-white">
                      {item.badge}
                    </span>
                  )}
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

          <div className="mt-6 rounded-[18px] border border-white/7 bg-[linear-gradient(180deg,rgba(19,24,48,0.96),rgba(13,17,35,0.96))] px-5 py-5 shadow-[0_20px_44px_rgba(0,0,0,0.24)]">
            <p className="text-[0.92rem] text-zinc-300">내 신뢰 포인트</p>
            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#5d4bff,#5136d8)] text-white">
                <FiShield className="text-[1.25rem]" />
              </div>
              <div>
                <p className="text-[1.8rem] font-semibold leading-none tracking-[-0.04em] text-white">
                  {trustPoints.toLocaleString()}P
                </p>
              </div>
            </div>
            <p className="mt-3 text-[0.88rem] leading-6 text-zinc-400">
              신뢰는 더 좋은 만남을 만듭니다.
            </p>
            <button type="button" className="mt-5 flex w-full items-center justify-center gap-2 rounded-[14px] bg-[rgba(109,89,255,0.16)] px-4 py-2.5 text-[0.9rem] font-medium text-white transition hover:bg-[rgba(109,89,255,0.24)]">
              포인트 내역
              <FiChevronRight />
            </button>
          </div>

          <div className="mt-auto flex items-center gap-3 px-2 pt-6">
            <ProfileAvatar name={displayName} photo={displayPhoto} sizeClassName="h-12 w-12" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[1rem] font-medium text-white">{displayName}</p>
              <p className="text-[0.84rem] text-zinc-400">프로필 보기</p>
            </div>
            <FiChevronRight className="text-zinc-400" />
          </div>
        </aside>

        <div className="desktop-content">
          <header className="desktop-header">
            <div>
              <h1 className="desktop-header-title">내 정보</h1>
              <p className="desktop-header-copy">회원님의 정보를 확인하고 관리하세요.</p>
            </div>
            <div className="desktop-header-actions">
              <div className="relative">
                <FiBell className="text-[1.45rem] text-white" />
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6f56ff] px-1 text-[0.68rem] font-semibold text-white">
                  3
                </span>
              </div>
              <div className="desktop-header-avatar">
                <ProfileAvatar name={displayName} photo={displayPhoto} sizeClassName="h-11 w-11" />
                <span className="desktop-header-avatar-name">{displayName}</span>
                <FiChevronDown className="text-[1.2rem] text-zinc-300" />
              </div>
            </div>
          </header>

          {(error || successMessage) && (
            <div className="px-2 pt-3">
              {error && <div className="alert-error">{error}</div>}
              {!error && successMessage && <div className="alert-success">{successMessage}</div>}
            </div>
          )}

          <main className="desktop-main space-y-5">
            <section className="grid gap-5 2xl:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)]">
              <div className="surface-panel overflow-hidden p-0">
                <div className="grid gap-4 px-6 py-5 lg:grid-cols-[auto_minmax(0,1fr)_190px]">
                  <div className="relative w-fit">
                    <ProfileAvatar name={displayName} photo={displayPhoto} sizeClassName="h-28 w-28" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[rgba(16,20,40,0.9)] text-white shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition hover:bg-white/10"
                      aria-label="프로필 사진 업로드"
                    >
                      <FiCamera className="text-lg" />
                    </button>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-[1.95rem] font-semibold leading-none tracking-[-0.04em] text-white">
                        {editing ? editedProfile.name || "이름을 입력하세요" : displayName}
                      </h2>
                      <span className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,rgba(105,73,255,0.36),rgba(82,56,184,0.32))] px-3 py-1.5 text-[0.82rem] font-medium text-violet-100">
                        <FiStar className="text-sm" />
                        Premium
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.95rem] text-zinc-200">
                      <span>{editing ? editedProfile.age || "나이" : `${displayAge}세`}</span>
                      <span className="text-zinc-500">·</span>
                      <span className="flex items-center gap-2">
                        {editing ? editedProfile.location || "지역" : displayLocation}
                        <FiMapPin className="text-zinc-400" />
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="badge-accent border-0 bg-[rgba(98,64,255,0.18)] text-violet-100">본인 인증</span>
                      <span className="badge-accent border-0 bg-[rgba(31,163,92,0.18)] text-emerald-200">휴대폰 인증</span>
                      <span className="badge-accent border-0 bg-[rgba(44,119,226,0.18)] text-sky-100">이메일 인증</span>
                    </div>

                    {editing ? (
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <label className="label-text">
                          이름
                          <input
                            className="input-field"
                            value={editedProfile.name}
                            onChange={(event) =>
                              setEditedProfile((prev) => ({ ...prev, name: event.target.value }))
                            }
                          />
                        </label>
                        <label className="label-text">
                          나이
                          <input
                            className="input-field"
                            value={editedProfile.age}
                            onChange={(event) =>
                              setEditedProfile((prev) => ({ ...prev, age: event.target.value }))
                            }
                          />
                        </label>
                        <label className="label-text">
                          지역
                          <input
                            className="input-field"
                            value={editedProfile.location}
                            onChange={(event) =>
                              setEditedProfile((prev) => ({ ...prev, location: event.target.value }))
                            }
                          />
                        </label>
                        <label className="label-text">
                          키
                          <input
                            className="input-field"
                            value={editedProfile.height}
                            onChange={(event) =>
                              setEditedProfile((prev) => ({ ...prev, height: event.target.value }))
                            }
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-1 text-[0.98rem] leading-7 text-zinc-200">
                        <p>진실한 만남을 찾고 있어요.</p>
                        <p>좋은 인연을 만나고 싶습니다.</p>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2.5">
                      {editing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => void handleSave()}
                            disabled={updateProfileMutation.isPending}
                            className="btn-primary"
                          >
                            {updateProfileMutation.isPending ? "저장 중..." : "저장하기"}
                          </button>
                          <button type="button" onClick={handleCancelEditing} className="btn-secondary">
                            취소
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={handleStartEditing} className="btn-primary">
                            프로필 수정
                          </button>
                          {displayPhoto && (
                            <button
                              type="button"
                              onClick={() => void handleDeletePhoto()}
                              disabled={deletePhotoMutation.isPending}
                              className="btn-secondary"
                            >
                              {deletePhotoMutation.isPending ? "삭제 중..." : "사진 삭제"}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-white/8 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                    <p className="text-[0.95rem] text-zinc-300">신뢰 등급</p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,rgba(111,82,18,0.92),rgba(58,37,6,0.94))] shadow-[0_20px_36px_rgba(44,29,5,0.24)]">
                        <FiStar className="text-[1.55rem] text-amber-300" />
                      </div>
                      <div>
                        <p className="text-[1.55rem] font-semibold tracking-[-0.04em] text-amber-300">GOLD</p>
                        <p className="mt-2 text-[0.95rem] text-zinc-200">상위 23%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-1">
                <div className="surface-panel">
                  <p className="text-[0.95rem] text-zinc-300">신뢰 점수</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#5f4dff,#4837cf)] text-white shadow-[0_18px_34px_rgba(79,61,221,0.28)]">
                      <FiShield className="text-[1.35rem]" />
                    </div>
                    <div>
                      <p className="text-[2.35rem] font-semibold leading-none tracking-[-0.05em] text-white">
                        {trustScore}
                        <span className="ml-1 text-[1.2rem]">점</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 inline-flex rounded-full bg-[rgba(110,92,255,0.16)] px-3 py-1.5 text-[0.82rem] font-medium text-violet-200">
                    상위 15%
                  </div>
                  <p className="mt-3 text-[0.95rem] text-zinc-200">다음 등급까지 8점 남았어요!</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#7d55ff,#8156f4,#5940d8)]"
                      style={{ width: `${trustScoreRatio}%` }}
                    />
                  </div>
                  <p className="mt-2 text-right text-[0.86rem] text-zinc-400">{trustScore} / 100</p>
                </div>

                <div className="surface-panel">
                  <p className="text-[0.95rem] text-zinc-300">신뢰 포인트</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#6e5dff,#4b34d8)] text-white shadow-[0_18px_34px_rgba(79,61,221,0.28)]">
                      <PiDiamondLight className="text-[1.4rem]" />
                    </div>
                    <div>
                      <p className="text-[2.35rem] font-semibold leading-none tracking-[-0.05em] text-white">
                        {trustPoints.toLocaleString()}P
                      </p>
                    </div>
                  </div>
                  <p className="mt-9 text-[0.95rem] text-zinc-200">다음 등급까지 760P</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#7d55ff,#8156f4,#5940d8)]"
                      style={{ width: `${pointRatio}%` }}
                    />
                  </div>
                  <p className="mt-2 text-right text-[0.86rem] text-zinc-400">
                    {trustPoints.toLocaleString()} / 2,000P
                  </p>
                </div>
              </div>
            </section>

            <section className="grid gap-5 2xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.68fr)_minmax(0,0.64fr)]">
              <div className="surface-panel">
                <SectionHeader
                  title="프로필 정보"
                  actionLabel={editing ? undefined : "수정하기"}
                  onAction={editing ? undefined : handleStartEditing}
                />
                <div className="mt-5 space-y-3">
                  {profileRows.map((row, index) => {
                    const Icon = row.icon;

                    return (
                      <div
                        key={row.label}
                        className={cx(
                          "grid gap-2 border-white/8 pb-3 md:grid-cols-[132px_minmax(0,1fr)]",
                          index < profileRows.length - 1 && "border-b",
                        )}
                      >
                        <div className="flex items-center gap-4 text-zinc-200">
                          <Icon className="text-[1.15rem] text-violet-400" />
                          <span className="text-[0.95rem]">{row.label}</span>
                        </div>
                        <p className="text-[0.95rem] leading-6 text-zinc-100">
                          {row.label === "거주지" && editing ? editedProfile.location || row.value : row.value}
                          {row.label === "자기소개" && (
                            <span className="block text-[0.82rem] text-zinc-400">
                              키 {editing ? editedProfile.height || displayHeight : displayHeight}
                            </span>
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="surface-panel">
                <SectionHeader title="활동 통계" />
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {statCards.map((stat) => {
                    const Icon = stat.icon;

                    return (
                      <div key={stat.label} className="surface-panel-soft px-4 py-4 text-center">
                        <Icon className={cx("mx-auto text-[1.35rem]", stat.accentClassName)} />
                        <p className="mt-2 text-[0.86rem] text-zinc-300">{stat.label}</p>
                        <p className="mt-2 text-[1.6rem] font-semibold leading-none tracking-[-0.04em] text-white">
                          {stat.value}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <button type="button" className="mt-4 flex w-full items-center justify-center gap-2 text-[0.82rem] font-medium text-violet-300 transition hover:text-violet-200">
                  활동 내역 더보기
                  <FiChevronRight />
                </button>
              </div>

              <div className="surface-panel">
                <SectionHeader title="신뢰 시스템" />
                <div className="mt-5 space-y-3">
                  {trustChecks.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 text-zinc-200">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(109,89,255,0.16)] text-violet-300">
                          <FiShield className="text-[0.9rem]" />
                        </div>
                        <span className="text-[0.9rem]">{item.label}</span>
                      </div>
                      <span className={cx("text-[0.88rem] font-medium", item.valueClassName)}>{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 border-t border-white/8 pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[0.95rem] font-medium text-white">신뢰 배지</p>
                    <button type="button" className="flex items-center gap-1 text-[0.82rem] font-medium text-violet-300 transition hover:text-violet-200">
                      더 보기
                      <FiChevronRight />
                    </button>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#5e4eff,#302788)] text-white">
                      <FiShield className="text-[1.15rem]" />
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6b4d13,#3c2808)] text-amber-300">
                      <FiStar className="text-[1.15rem]" />
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f4d8f,#0a2544)] text-sky-300">
                      <PiDiamondLight className="text-[1.15rem]" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-5 2xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.52fr)]">
              <div className="surface-panel">
                <SectionHeader title="나의 최근 활동" />
                <div className="mt-5 space-y-3">
                  {activityItems.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className={cx(
                          "flex items-start justify-between gap-4 border-white/8 pb-3",
                          index < activityItems.length - 1 && "border-b",
                        )}
                      >
                        <div className="flex min-w-0 gap-4">
                          <div className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", item.accentClassName)}>
                            <Icon className="text-[1rem]" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[0.95rem] font-medium text-white">{item.title}</p>
                            <p className="mt-1 text-[0.84rem] text-zinc-400">{item.description}</p>
                          </div>
                        </div>
                        <span className="shrink-0 text-[0.84rem] text-zinc-500">{item.date}</span>
                      </div>
                    );
                  })}
                </div>
                <button type="button" className="mt-4 flex w-full items-center justify-end gap-2 text-[0.82rem] font-medium text-violet-300 transition hover:text-violet-200">
                  모든 활동 내역 보기
                  <FiChevronRight />
                </button>
              </div>

              <div className="surface-panel">
                <SectionHeader title="설정 메뉴" />
                <div className="mt-5">
                  {settingItems.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleSettingAction(item.action)}
                        className={cx(
                          "flex w-full items-center justify-between gap-4 border-white/8 py-3 text-left transition hover:text-violet-200",
                          index < settingItems.length - 1 && "border-b",
                        )}
                      >
                        <span className="flex items-center gap-4">
                          <Icon className="text-[1.1rem] text-violet-300" />
                          <span className="text-[0.95rem] text-zinc-100">{item.label}</span>
                        </span>
                        <FiChevronRight className="text-zinc-500" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={uploadPhotoMutation.isPending}
            />
          </main>
        </div>
      </div>

      <div className="xl:hidden">
        <header className="flex items-start justify-between px-5 pb-4 pt-6">
          <div>
            <h1 className="text-[2.4rem] font-semibold leading-none tracking-[-0.05em] text-white">내 정보</h1>
            <p className="mt-3 text-[1rem] text-zinc-300">회원님의 정보를 확인하고 관리하세요.</p>
          </div>
          <div className="flex items-center gap-6 pt-1">
            <div className="relative">
              <FiBell className="text-[1.85rem] text-white" />
              <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#7b5cf6] px-1 text-[0.75rem] font-semibold text-white">
                3
              </span>
            </div>
            <FiMenu className="text-[2rem] text-white" />
          </div>
        </header>

        <main className="space-y-4 px-4 pb-32">
          {(error || successMessage) && (
            <>
              {error && <div className="alert-error">{error}</div>}
              {!error && successMessage && <div className="alert-success">{successMessage}</div>}
            </>
          )}

          <section className="surface-panel overflow-hidden px-0 py-0">
            <div className="px-5 pb-5 pt-6">
              <div className="flex gap-4">
                <div className="relative shrink-0">
                  <ProfileAvatar name={displayName} photo={displayPhoto} sizeClassName="h-28 w-28" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[rgba(16,20,40,0.92)] text-white shadow-[0_10px_24px_rgba(0,0,0,0.28)]"
                    aria-label="프로필 사진 업로드"
                  >
                    <FiCamera className="text-lg" />
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[2rem] font-semibold leading-none tracking-[-0.04em] text-white">{displayName}</h2>
                    <span className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,rgba(105,73,255,0.36),rgba(82,56,184,0.32))] px-3 py-1.5 text-[0.88rem] font-medium text-violet-100">
                      <FiStar className="text-sm" />
                      Premium
                    </span>
                  </div>
                  <p className="mt-4 text-[1rem] text-zinc-200">
                    {displayAge}세 · {displayLocation}
                    <FiMapPin className="ml-2 inline text-zinc-400" />
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="badge-accent border-0 bg-[rgba(98,64,255,0.18)] text-violet-100">본인 인증</span>
                    <span className="badge-accent border-0 bg-[rgba(31,163,92,0.18)] text-emerald-200">휴대폰 인증</span>
                    <span className="badge-accent border-0 bg-[rgba(44,119,226,0.18)] text-sky-100">이메일 인증</span>
                  </div>
                  <p className="mt-5 text-[1.05rem] leading-8 text-zinc-200">
                    진실한 만남을 찾고 있어요.
                    <br />
                    좋은 인연을 만나고 싶습니다.
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-white/8 pt-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="sm:border-r sm:border-white/8 sm:pr-6">
                    <p className="text-[1rem] text-zinc-300">신뢰 점수</p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#5f4dff,#4837cf)] text-white">
                        <FiShield className="text-[1.45rem]" />
                      </div>
                      <p className="text-[2.8rem] font-semibold leading-none tracking-[-0.05em] text-white">
                        {trustScore}
                        <span className="ml-1 text-[1.4rem]">점</span>
                      </p>
                    </div>
                    <div className="mt-4 inline-flex rounded-full bg-[rgba(110,92,255,0.16)] px-4 py-2 text-sm font-medium text-violet-200">
                      상위 15%
                    </div>
                    <p className="mt-4 text-[1rem] text-zinc-200">다음 등급까지 8점 남았어요!</p>
                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#7d55ff,#8156f4,#5940d8)]"
                        style={{ width: `${trustScoreRatio}%` }}
                      />
                    </div>
                    <p className="mt-3 text-right text-[0.95rem] text-zinc-400">{trustScore} / 100</p>
                  </div>

                  <div className="sm:pl-2">
                    <p className="text-[1rem] text-zinc-300">신뢰 포인트</p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#6e5dff,#4b34d8)] text-white">
                        <PiDiamondLight className="text-[1.55rem]" />
                      </div>
                      <p className="text-[2.8rem] font-semibold leading-none tracking-[-0.05em] text-white">
                        {trustPoints.toLocaleString()}P
                      </p>
                    </div>
                    <p className="mt-12 text-[1rem] text-zinc-200">다음 등급까지 760P</p>
                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#7d55ff,#8156f4,#5940d8)]"
                        style={{ width: `${pointRatio}%` }}
                      />
                    </div>
                    <p className="mt-3 text-right text-[0.95rem] text-zinc-400">
                      {trustPoints.toLocaleString()} / 2,000P
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            {statCards.map((stat) => {
              const Icon = stat.icon;

              return (
                <div key={stat.label} className="surface-panel-soft px-4 py-5 text-center">
                  <Icon className={cx("mx-auto text-[1.55rem]", stat.accentClassName)} />
                  <p className="mt-3 text-[0.95rem] text-zinc-300">{stat.label}</p>
                  <p className="mt-3 text-[1.95rem] font-semibold leading-none tracking-[-0.04em] text-white">
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </section>

          <section className="surface-panel">
            <SectionHeader
              title="프로필 정보"
              actionLabel={editing ? "저장하기" : "수정하기"}
              onAction={editing ? () => void handleSave() : handleStartEditing}
            />
            {editing && (
              <div className="mt-5 grid gap-4">
                <label className="label-text">
                  이름
                  <input
                    className="input-field"
                    value={editedProfile.name}
                    onChange={(event) =>
                      setEditedProfile((prev) => ({ ...prev, name: event.target.value }))
                    }
                  />
                </label>
                <label className="label-text">
                  나이
                  <input
                    className="input-field"
                    value={editedProfile.age}
                    onChange={(event) =>
                      setEditedProfile((prev) => ({ ...prev, age: event.target.value }))
                    }
                  />
                </label>
                <label className="label-text">
                  지역
                  <input
                    className="input-field"
                    value={editedProfile.location}
                    onChange={(event) =>
                      setEditedProfile((prev) => ({ ...prev, location: event.target.value }))
                    }
                  />
                </label>
                <label className="label-text">
                  키
                  <input
                    className="input-field"
                    value={editedProfile.height}
                    onChange={(event) =>
                      setEditedProfile((prev) => ({ ...prev, height: event.target.value }))
                    }
                  />
                </label>
                <button type="button" onClick={handleCancelEditing} className="btn-secondary">
                  취소
                </button>
              </div>
            )}
            <div className="mt-6 space-y-5">
              {profileRows.map((row, index) => {
                const Icon = row.icon;

                return (
                  <div
                    key={row.label}
                    className={cx("border-white/8 pb-5", index < profileRows.length - 1 && "border-b")}
                  >
                    <div className="grid gap-3 grid-cols-[28px_minmax(0,1fr)]">
                      <Icon className="mt-1 text-[1.35rem] text-violet-400" />
                      <div>
                        <p className="text-[1rem] text-zinc-300">{row.label}</p>
                        <p className="mt-2 text-[1.08rem] leading-8 text-zinc-100">
                          {row.label === "거주지" && editing ? editedProfile.location || row.value : row.value}
                        </p>
                        {row.label === "자기소개" && (
                          <p className="mt-2 text-[0.95rem] text-zinc-400">
                            키 {editing ? editedProfile.height || displayHeight : displayHeight}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="surface-panel">
              <SectionHeader title="신뢰 시스템" actionLabel="더보기" onAction={() => setActionError("이 메뉴는 아직 준비 중입니다.")} />
              <div className="mt-6 space-y-4">
                {trustChecks.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(109,89,255,0.16)] text-violet-300">
                        <FiShield className="text-[1rem]" />
                      </div>
                      <span className="text-[1rem] text-zinc-100">{item.label}</span>
                    </div>
                    <span className={cx("text-[0.98rem] font-medium", item.valueClassName)}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-white/8 pt-5">
                <div className="flex items-center justify-between">
                  <p className="text-[1rem] font-medium text-white">신뢰 배지</p>
                  <button type="button" className="flex items-center gap-1 text-sm font-medium text-violet-300">
                    더보기
                    <FiChevronRight />
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#5e4eff,#302788)] text-white">
                    <FiShield className="text-[1.35rem]" />
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6b4d13,#3c2808)] text-amber-300">
                    <FiStar className="text-[1.35rem]" />
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f4d8f,#0a2544)] text-sky-300">
                    <PiDiamondLight className="text-[1.35rem]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-panel">
              <SectionHeader title="나의 최근 활동" actionLabel="더보기" onAction={() => setActionError("이 메뉴는 아직 준비 중입니다.")} />
              <div className="mt-6 space-y-5">
                {activityItems.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className={cx("border-white/8 pb-5", index < activityItems.length - 1 && "border-b")}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cx("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", item.accentClassName)}>
                          <Icon className="text-[1.2rem]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-[1.05rem] font-medium leading-7 text-white">{item.title}</p>
                            <span className="shrink-0 text-[0.95rem] text-zinc-500">{item.date}</span>
                          </div>
                          <p className="mt-1 text-[0.95rem] text-zinc-400">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="surface-panel">
            <SectionHeader title="설정 메뉴" />
            <div className="mt-6 grid gap-2 md:grid-cols-2">
              {settingItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleSettingAction(item.action)}
                    className="flex items-center justify-between rounded-[18px] border border-white/8 bg-white/[0.02] px-4 py-4 text-left transition hover:bg-white/[0.05]"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="text-[1.3rem] text-violet-300" />
                      <span className="text-[1rem] text-zinc-100">{item.label}</span>
                    </span>
                    <FiChevronRight className="text-zinc-500" />
                  </button>
                );
              })}
            </div>
          </section>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploadPhotoMutation.isPending}
          />
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-[90] border-t border-white/8 bg-[linear-gradient(180deg,rgba(9,13,29,0.98),rgba(7,10,22,1))] px-3 py-1.5 backdrop-blur-xl">
          <div className="grid grid-cols-5 gap-2">
            {mobileTabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <Link key={tab.label} href={tab.href} className="block">
                  <div
                    className={cx(
                      "relative flex flex-col items-center justify-center gap-1 rounded-[16px] py-1 font-medium",
                      tab.active ? "text-[#8a5dff]" : "text-zinc-400",
                    )}
                  >
                    <Icon className={cx("text-[1.2rem]", tab.active && "fill-current")} />
                    <span className="text-[0.84rem]">{tab.label}</span>
                    {tab.badge && (
                      <span className="absolute right-[22%] top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff3b46] px-1 text-[0.68rem] font-semibold text-white">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

function FiBriefcasePlaceholder({ className }: { className?: string }) {
  return <FiLock className={className} />;
}

function FiSmilePlaceholder({ className }: { className?: string }) {
  return <FiFlag className={className} />;
}
