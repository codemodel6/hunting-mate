"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { deletePhoto, getProfile, updateProfile, uploadPhoto } from "@/entities/profile/api/profile-api";
import type { Profile } from "@/entities/profile/model/profile";
import { isAuthenticated } from "@/entities/session/api/session-api";
import AppShell from "@/widgets/app-shell/ui/app-shell";

export default function Page() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editedProfile, setEditedProfile] = useState({
    name: "",
    height: "",
    age: "",
    location: "",
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const authenticated = await isAuthenticated();

        if (!authenticated) {
          router.replace("/login");
          return;
        }

        const response = await getProfile();
        const nextProfile = response.profile ?? {};
        setProfile(nextProfile);
        setEditedProfile({
          name: nextProfile.name ?? "",
          height: nextProfile.height ?? "",
          age: nextProfile.age ?? "",
          location: nextProfile.location ?? "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "프로필을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    void fetchProfile();
  }, [router]);

  const handleSave = async () => {
    try {
      const response = await updateProfile(editedProfile);
      setProfile(response.profile ?? profile);
      setEditing(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "프로필 저장에 실패했습니다.");
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    try {
      const response = await uploadPhoto(file);
      setProfile((prev) => ({ ...prev, photos: response.photos ?? prev?.photos ?? [] }));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "사진 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (index: number) => {
    try {
      const response = await deletePhoto(index);
      setProfile((prev) => ({ ...prev, photos: response.photos ?? prev?.photos ?? [] }));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "사진 삭제에 실패했습니다.");
    }
  };

  return (
    <AppShell hearts={profile?.hearts ?? 0}>
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-rose-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-rose-500">프로필</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                  기본 정보 관리
                </h1>
              </div>
              <button
                type="button"
                onClick={() => (editing ? void handleSave() : setEditing(true))}
                className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-600"
              >
                {editing ? "저장" : "수정"}
              </button>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-700 md:col-span-2">
                이름
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400 disabled:bg-slate-50"
                  value={editing ? editedProfile.name : profile?.name ?? ""}
                  onChange={(event) =>
                    setEditedProfile((prev) => ({ ...prev, name: event.target.value }))
                  }
                  disabled={!editing}
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                키
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400 disabled:bg-slate-50"
                  value={editing ? editedProfile.height : profile?.height ?? ""}
                  onChange={(event) =>
                    setEditedProfile((prev) => ({ ...prev, height: event.target.value }))
                  }
                  disabled={!editing}
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                나이
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400 disabled:bg-slate-50"
                  value={editing ? editedProfile.age : profile?.age ?? ""}
                  onChange={(event) =>
                    setEditedProfile((prev) => ({ ...prev, age: event.target.value }))
                  }
                  disabled={!editing}
                />
              </label>
              <label className="text-sm font-medium text-slate-700 md:col-span-2">
                지역
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400 disabled:bg-slate-50"
                  value={editing ? editedProfile.location : profile?.location ?? ""}
                  onChange={(event) =>
                    setEditedProfile((prev) => ({ ...prev, location: event.target.value }))
                  }
                  disabled={!editing}
                />
              </label>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-rose-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-rose-500">사진</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  프로필 사진 관리
                </h2>
              </div>
              <label className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
                {uploading ? "업로드 중..." : "사진 추가"}
              </label>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(profile?.photos ?? []).map((photo, index) => (
                <div
                  key={`${photo}-${index}`}
                  className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50"
                >
                  <img
                    src={photo}
                    alt={`프로필 사진 ${index + 1}`}
                    className="aspect-square w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleDelete(index)}
                    className="w-full border-t border-slate-200 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50"
                  >
                    삭제
                  </button>
                </div>
              ))}
              {(profile?.photos?.length ?? 0) === 0 && (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
                  등록된 사진이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-rose-100">
            <p className="text-sm font-medium text-rose-500">상태</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              현재 사용 현황
            </h2>
            <dl className="mt-6 space-y-4 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <dt>보유 하트</dt>
                <dd className="font-semibold text-rose-600">{profile?.hearts ?? 0}</dd>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <dt>활성 매칭</dt>
                <dd className="font-semibold text-slate-900">
                  {profile?.hasActiveMatch ? "있음" : "없음"}
                </dd>
              </div>
            </dl>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
          {loading && (
            <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm ring-1 ring-rose-100">
              프로필을 불러오는 중입니다...
            </div>
          )}
        </aside>
      </section>
    </AppShell>
  );
}
