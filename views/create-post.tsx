"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useCreatePostMutation } from "@/entities/post/hooks";
import { useProfileQuery } from "@/entities/profile/hooks";
import { useAuthStatusQuery } from "@/features/auth/hooks";
import AppShell from "@/widgets/app-shell";

export default function CreatePostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const { data: isAuthenticated } = useAuthStatusQuery();
  const queryEnabled = isAuthenticated === true;
  const profileQuery = useProfileQuery(queryEnabled);
  const createPostMutation = useCreatePostMutation();

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      setActionError("제목과 내용을 모두 입력해 주세요.");
      return;
    }

    setActionError(null);

    try {
      await createPostMutation.mutateAsync({ title, content });
      router.push("/home");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "게시글 작성에 실패했습니다.");
    }
  };

  const trust = profileQuery.data?.profile?.hearts ?? 0;
  const error =
    actionError ??
    (profileQuery.error instanceof Error
      ? profileQuery.error.message
      : profileQuery.error
        ? "프로필을 불러오지 못했습니다."
        : null);

  return (
    <AppShell trust={trust}>
      <section className="mx-auto max-w-3xl space-y-6">
        <div className="surface-panel">
          <p className="section-kicker">글 작성</p>
          <h1 className="section-title">매칭 글 올리기</h1>
        </div>

        <form onSubmit={handleSubmit} className="surface-panel">
          <div className="space-y-4">
            <label className="label-text">
              제목
              <input
                className="input-field"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={100}
                placeholder="한 줄로 소개를 적어 주세요"
              />
            </label>
            <label className="label-text">
              내용
              <textarea
                className="textarea-field"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                maxLength={1000}
                placeholder="어떤 만남을 원하시는지 자세히 적어 주세요"
              />
            </label>
          </div>

          <div className="mt-3 text-right text-xs text-zinc-500">{content.length} / 1000</div>
          {error && (
            <div className="alert-error mt-4">
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/home")}
              className="btn-secondary flex-1"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={createPostMutation.isPending}
              className="btn-primary flex-1"
            >
              {createPostMutation.isPending ? "작성 중..." : "등록"}
            </button>
          </div>
        </form>
      </section>
    </AppShell>
  );
}
