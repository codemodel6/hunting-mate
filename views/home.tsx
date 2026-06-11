"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useRequestChatMutation } from "@/entities/chat/hooks";
import type { Post } from "@/entities/post";
import { usePostsQuery } from "@/entities/post/hooks";
import { useProfileQuery } from "@/entities/profile/hooks";
import { useAuthStatusQuery } from "@/features/auth/hooks";
import AppShell from "@/widgets/app-shell";

export default function HomePage() {
  const router = useRouter();
  const [actionError, setActionError] = useState<string | null>(null);
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

  const handleChatRequest = async (postUserId: string) => {
    try {
      const response = await requestChatMutation.mutateAsync(postUserId);
      router.push(`/chat/${response.chatId}`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "채팅 요청에 실패했습니다.");
    }
  };

  const posts: Post[] = postsQuery.data?.posts ?? [];
  const trust = profileQuery.data?.profile?.hearts ?? 0;
  const currentUserId = profileQuery.data?.profile?.userId ?? "";
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

  return (
    <AppShell trust={trust}>
      <section className="space-y-6">
        <div className="surface-panel">
          <p className="section-kicker">둘러보기</p>
          <h1 className="section-title">지금 올라온 소개글</h1>
          <p className="section-copy">채팅 요청은 Next.js 라우터 경로로 바로 연결됩니다.</p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {loading ? (
          <div className="surface-panel text-sm text-zinc-400">데이터를 불러오는 중입니다...</div>
        ) : posts.length === 0 ? (
          <div className="surface-panel text-sm text-zinc-400">등록된 소개글이 없습니다. 첫 글을 작성해 보세요.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <article key={post.postId} className="surface-panel-compact surface-hover flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{post.userName}</p>
                    <p className="text-xs text-zinc-500">{new Date(post.createdAt).toLocaleString("ko-KR")}</p>
                  </div>
                  {post.userId === currentUserId && <span className="badge-muted">내 글</span>}
                </div>
                <h2 className="mt-4 text-xl font-semibold text-white">{post.title}</h2>
                <p className="mt-3 flex-1 whitespace-pre-wrap text-sm leading-6 text-zinc-400">{post.content}</p>
                <button
                  type="button"
                  disabled={post.userId === currentUserId || requestChatMutation.isPending}
                  onClick={() => handleChatRequest(post.userId)}
                  className="btn-primary mt-6 disabled:bg-zinc-700 disabled:text-zinc-400"
                >
                  {post.userId === currentUserId ? "내 게시글입니다" : "채팅 요청하기"}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
