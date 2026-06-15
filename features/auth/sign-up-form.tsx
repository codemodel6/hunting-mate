"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useSignUpMutation } from "@/features/auth/hooks";
import AlertModal from "@/shared/ui/alert-modal";

export default function SignUpForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    height: "",
    age: "",
    location: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const signUpMutation = useSignUpMutation();

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setApprovalModalOpen(false);

    try {
      await signUpMutation.mutateAsync(formData);
      setApprovalModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입 실패");
    }
  };

  return (
    <>
      <div className="app-frame flex min-h-screen items-center justify-center p-4">
        <div className="surface-panel w-full max-w-xl">
          <p className="section-kicker">조각</p>
          <h1 className="section-title">회원가입</h1>
          <p className="section-copy">기본 프로필을 입력하고 바로 시작해 보세요.</p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="label-text md:col-span-2">
                이메일
                <input
                  className="input-field"
                  type="email"
                  value={formData.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  required
                />
              </label>
              <label className="label-text md:col-span-2">
                비밀번호
                <input
                  className="input-field"
                  type="password"
                  value={formData.password}
                  onChange={(event) => handleChange("password", event.target.value)}
                  required
                />
              </label>
              <label className="label-text md:col-span-2">
                이름
                <input
                  className="input-field"
                  value={formData.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  required
                />
              </label>
              <label className="label-text">
                키
                <input
                  className="input-field"
                  value={formData.height}
                  onChange={(event) => handleChange("height", event.target.value)}
                  placeholder="170"
                />
              </label>
              <label className="label-text">
                나이
                <input
                  className="input-field"
                  value={formData.age}
                  onChange={(event) => handleChange("age", event.target.value)}
                  placeholder="25"
                />
              </label>
              <label className="label-text md:col-span-2">
                지역
                <input
                  className="input-field"
                  value={formData.location}
                  onChange={(event) => handleChange("location", event.target.value)}
                  placeholder="서울 강남구"
                />
              </label>
            </div>

            {error && <div className="alert-error">{error}</div>}

            <button
              type="submit"
              disabled={signUpMutation.isPending}
              className="btn-primary w-full"
            >
              {signUpMutation.isPending ? "가입 중..." : "회원가입"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            이미 계정이 있나요?{" "}
            <Link href="/login" className="font-medium text-red-300 hover:text-red-200">
              로그인
            </Link>
          </p>
        </div>
      </div>
      <AlertModal
        open={approvalModalOpen}
        title="승인 메일을 보냈습니다"
        description="입력한 이메일로 승인 요청 메일이 전송되었습니다. 메일을 확인해 승인한 뒤 로그인해 주세요."
        confirmLabel="로그인으로 이동"
        onConfirm={() => {
          setApprovalModalOpen(false);
          router.push("/login");
        }}
      />
    </>
  );
}
