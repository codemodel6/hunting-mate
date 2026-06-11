"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useSignInMutation } from "@/features/auth/hooks";

export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const signInMutation = useSignInMutation();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      await signInMutation.mutateAsync({ email, password });
      router.push("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인 실패");
    }
  };

  return (
    <div className="app-frame flex min-h-screen items-center justify-center p-4">
      <div className="surface-panel w-full max-w-md">
        <p className="section-kicker">Hunting Mate</p>
        <h1 className="section-title">로그인</h1>
        <p className="section-copy">계정으로 로그인하고 서비스를 계속 이용해 보세요.</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="label-text">
            이메일
            <input
              className="input-field"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="label-text">
            비밀번호
            <input
              className="input-field"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호를 입력해 주세요"
              required
            />
          </label>

          {error && <div className="alert-error">{error}</div>}

          <button
            type="submit"
            disabled={signInMutation.isPending}
            className="btn-primary w-full"
          >
            {signInMutation.isPending ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          아직 계정이 없나요?{" "}
          <Link href="/signup" className="font-medium text-red-300 hover:text-red-200">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
