"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { Profile } from "@/entities/profile";
import {
  useDeletePhotoMutation,
  useProfileQuery,
  useUpdateProfileMutation,
  useUploadPhotoMutation,
} from "@/entities/profile/hooks";
import { useAuthStatusQuery } from "@/features/auth/hooks";
import AppShell from "@/widgets/app-shell";

export default function ProfilePage() {
  const router = useRouter();
  const [editedProfile, setEditedProfile] = useState({
    name: "",
    height: "",
    age: "",
    location: "",
  });
  const [editing, setEditing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
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

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync(editedProfile);
      setEditing(false);
      setActionError(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "프로필 저장에 실패했습니다.");
    }
  };

  const handleStartEditing = () => {
    setEditedProfile({
      name: profile?.name ?? "",
      height: profile?.height ?? "",
      age: profile?.age ?? "",
      location: profile?.location ?? "",
    });
    setEditing(true);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      await uploadPhotoMutation.mutateAsync(file);
      setActionError(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "사진 업로드에 실패했습니다.");
    }
  };

  const handleDelete = async (index: number) => {
    try {
      await deletePhotoMutation.mutateAsync(index);
      setActionError(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "사진 삭제에 실패했습니다.");
    }
  };

  const profile: Profile | null = profileQuery.data?.profile ?? null;
  const error =
    actionError ??
    (profileQuery.error instanceof Error
      ? profileQuery.error.message
      : profileQuery.error
        ? "프로필을 불러오지 못했습니다."
        : null);

  return (
    <AppShell trust={profile?.hearts ?? 0}>
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="surface-panel">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="section-kicker">프로필</p>
                <h1 className="section-title">기본 정보 관리</h1>
              </div>
              <button
                type="button"
                onClick={() => (editing ? void handleSave() : handleStartEditing())}
                className="btn-primary"
              >
                {editing ? "저장" : "수정"}
              </button>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <label className="label-text md:col-span-2">
                이름
                <input
                  className="input-field"
                  value={editing ? editedProfile.name : profile?.name ?? ""}
                  onChange={(event) => setEditedProfile((prev) => ({ ...prev, name: event.target.value }))}
                  disabled={!editing}
                />
              </label>
              <label className="label-text">
                키
                <input
                  className="input-field"
                  value={editing ? editedProfile.height : profile?.height ?? ""}
                  onChange={(event) => setEditedProfile((prev) => ({ ...prev, height: event.target.value }))}
                  disabled={!editing}
                />
              </label>
              <label className="label-text">
                나이
                <input
                  className="input-field"
                  value={editing ? editedProfile.age : profile?.age ?? ""}
                  onChange={(event) => setEditedProfile((prev) => ({ ...prev, age: event.target.value }))}
                  disabled={!editing}
                />
              </label>
              <label className="label-text md:col-span-2">
                지역
                <input
                  className="input-field"
                  value={editing ? editedProfile.location : profile?.location ?? ""}
                  onChange={(event) => setEditedProfile((prev) => ({ ...prev, location: event.target.value }))}
                  disabled={!editing}
                />
              </label>
            </div>
          </div>

          <div className="surface-panel">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="section-kicker">사진</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">프로필 사진 관리</h2>
              </div>
              <label className="btn-secondary cursor-pointer text-center">
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploadPhotoMutation.isPending} />
                {uploadPhotoMutation.isPending ? "업로드 중..." : "사진 추가"}
              </label>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(profile?.photos ?? []).map((photo, index) => (
                <div key={`${photo}-${index}`} className="surface-panel-soft overflow-hidden p-0">
                  <img src={photo} alt={`프로필 사진 ${index + 1}`} className="aspect-square w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleDelete(index)}
                    className="w-full border-t border-white/8 px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-white/5"
                  >
                    삭제
                  </button>
                </div>
              ))}
              {(profile?.photos?.length ?? 0) === 0 && (
                <div className="surface-panel-soft border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-400">
                  등록된 사진이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="surface-panel">
            <p className="section-kicker">상태</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">현재 사용 현황</h2>
            <dl className="mt-6 space-y-4 text-sm text-zinc-300">
              <div className="surface-panel-soft flex items-center justify-between">
                <dt>보유 신뢰</dt>
                <dd className="font-semibold text-red-300">{profile?.hearts ?? 0}</dd>
              </div>
              <div className="surface-panel-soft flex items-center justify-between">
                <dt>활성 매칭</dt>
                <dd className="font-semibold text-white">{profile?.hasActiveMatch ? "있음" : "없음"}</dd>
              </div>
            </dl>
          </div>

          {error && (
            <div className="alert-error">
              {error}
            </div>
          )}
          {profileQuery.isPending && (
            <div className="surface-panel text-sm text-zinc-400">
              프로필을 불러오는 중입니다...
            </div>
          )}
        </aside>
      </section>
    </AppShell>
  );
}
