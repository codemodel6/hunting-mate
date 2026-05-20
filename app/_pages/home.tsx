"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import * as api from "@/entities/api";
import type { Post } from "@/entities/post";
import AppShell from "@/widgets/app-shell";

export default function HomePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [hearts, setHearts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authenticated = await api.isAuthenticated();

        if (!authenticated) {
          router.replace("/login");
          return;
        }

        const [postsResponse, profileResponse] = await Promise.all([
          api.getPosts(),
          api.getProfile(),
        ]);

        setPosts(postsResponse.posts ?? []);
        setHearts(profileResponse.profile?.hearts ?? 0);
        setCurrentUserId(profileResponse.profile?.userId ?? "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [router]);

  const handleChatRequest = async (postUserId: string) => {
    try {
      const response = await api.requestChat(postUserId);
      router.push(`/chat/${response.chatId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "채팅 요청에 실패했습니다.");
    }
  };

  return (
    <AppShell hearts={hearts}>
      <section className="space-y-6">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-rose-100">
          <p className="text-sm font-medium text-rose-500">둘러보기</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">지금 올라온 소개글</h1>
          <p className="mt-2 text-slate-500">채팅 요청은 Next.js 라우터 경로로 바로 연결됩니다.</p>
        </div>

        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        {loading ? (
          <div className="rounded-[2rem] bg-white p-8 text-sm text-slate-500 shadow-sm ring-1 ring-rose-100">데이터를 불러오는 중입니다...</div>
        ) : posts.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-8 text-sm text-slate-500 shadow-sm ring-1 ring-rose-100">등록된 소개글이 없습니다. 첫 글을 작성해 보세요.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <article key={post.postId} className="flex h-full flex-col rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-rose-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{post.userName}</p>
                    <p className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleString("ko-KR")}</p>
                  </div>
                  {post.userId === currentUserId && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">내 글</span>}
                </div>
                <h2 className="mt-4 text-xl font-semibold text-slate-900">{post.title}</h2>
                <p className="mt-3 flex-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">{post.content}</p>
                <button
                  type="button"
                  disabled={post.userId === currentUserId}
                  onClick={() => handleChatRequest(post.userId)}
                  className="mt-6 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
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
