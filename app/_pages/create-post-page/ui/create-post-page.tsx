"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createPost } from "@/entities/post/api/post-api";
import { getProfile } from "@/entities/profile/api/profile-api";
import { isAuthenticated } from "@/entities/session/api/session-api";
import AppShell from "@/widgets/app-shell/ui/app-shell";

export default function Page() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hearts, setHearts] = useState(0);
  const [loading, setLoading] = useState(false);
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
        setHearts(response.profile?.hearts ?? 0);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "프로필을 불러오지 못했습니다.",
        );
      }
    };

    void fetchProfile();
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 모두 입력해 주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createPost(title, content);
      router.push("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "게시글 작성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell hearts={hearts}>
      <section className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-rose-100">
          <p className="text-sm font-medium text-rose-500">글 작성</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            매칭 글 올리기
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-rose-100"
        >
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              제목
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={100}
                placeholder="한 줄로 소개를 적어 주세요"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              내용
              <textarea
                className="mt-2 min-h-56 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                maxLength={1000}
                placeholder="어떤 만남을 원하시는지 자세히 적어 주세요"
              />
            </label>
          </div>

          <div className="mt-3 text-right text-xs text-slate-400">
            {content.length} / 1000
          </div>
          {error && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/home")}
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "작성 중..." : "등록"}
            </button>
          </div>
        </form>
      </section>
    </AppShell>
  );
}
