"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { setAuthToken, setUserId, signin } from "../utils/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await signin(email, password);
      setAuthToken(response.accessToken);
      setUserId(response.userId);
      router.push("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-100 via-white to-orange-100 p-4">
      <div className="w-full max-w-md rounded-[2rem] border border-white bg-white p-8 shadow-xl">
        <p className="text-sm font-medium text-rose-500">Hunting Mate</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">로그인</h1>
        <p className="mt-2 text-sm text-slate-500">계정으로 로그인하고 서비스를 이어서 사용하세요.</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            이메일
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            비밀번호
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </label>

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-rose-500 px-4 py-3 font-medium text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          아직 계정이 없나요?{" "}
          <Link href="/signup" className="font-medium text-rose-600 hover:text-rose-700">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
