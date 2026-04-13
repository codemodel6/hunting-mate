"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { signup } from "../utils/api";

export default function Page() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    height: "",
    age: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signup(formData);
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-100 via-white to-orange-100 p-4">
      <div className="w-full max-w-xl rounded-[2rem] border border-white bg-white p-8 shadow-xl">
        <p className="text-sm font-medium text-rose-500">Hunting Mate</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          회원가입
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          기본 프로필을 입력하고 바로 시작해 보세요.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700 md:col-span-2">
              이메일
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400"
                type="email"
                value={formData.email}
                onChange={(event) => handleChange("email", event.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700 md:col-span-2">
              비밀번호
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400"
                type="password"
                value={formData.password}
                onChange={(event) =>
                  handleChange("password", event.target.value)
                }
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700 md:col-span-2">
              이름
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400"
                value={formData.name}
                onChange={(event) => handleChange("name", event.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              키
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400"
                value={formData.height}
                onChange={(event) => handleChange("height", event.target.value)}
                placeholder="170"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              나이
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400"
                value={formData.age}
                onChange={(event) => handleChange("age", event.target.value)}
                placeholder="25"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700 md:col-span-2">
              지역
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400"
                value={formData.location}
                onChange={(event) =>
                  handleChange("location", event.target.value)
                }
                placeholder="서울 강남구"
              />
            </label>
          </div>

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
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          이미 계정이 있나요?{" "}
          <Link
            href="/login"
            className="font-medium text-rose-600 hover:text-rose-700"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
