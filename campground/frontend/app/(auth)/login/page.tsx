/**
 * 로그인 페이지
 */

"use client";

import { AppContainer } from "@/components/layout";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/contexts";
import { useSecureForm } from "@/hooks/security/useSecureForm";
import { ApiError } from "@/lib/api/errors";
import { oauthUtils } from "@/lib/api/oauth";
import { ROUTES } from "@/lib/constants";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    values,
    errors: formErrors,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useSecureForm(
    { email: "", password: "" },
    {
      email: {
        required: true,
        email: true,
        message: "올바른 이메일 형식을 입력하세요",
      },
      password: {
        required: true,
        minLength: 8,
        message: "비밀번호는 최소 8자 이상이어야 합니다",
      },
    }
  );

  const onSubmit = handleSubmit(async (data) => {
    setError("");
    setIsLoading(true);

    try {
      await login({ email: data.email, password: data.password });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("로그인에 실패했습니다");
      }
    } finally {
      setIsLoading(false);
    }
  });

  /**
   * 카카오 로그인
   */
  const handleKakaoLogin = () => {
    const authUrl = oauthUtils.getKakaoAuthUrl();
    window.location.href = authUrl;
  };

  /**
   * 네이버 로그인
   */
  const handleNaverLogin = () => {
    const authUrl = oauthUtils.getNaverAuthUrl();
    window.location.href = authUrl;
  };

  return (
    <AppContainer>
      {/* Back Button Header */}
      <div className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4">
          <Link
            href="/"
            className="hover:text-primary flex items-center gap-2 text-gray-900 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-14rem)] flex-col justify-center py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">로그인</h1>
            <p className="text-muted-foreground text-sm">
              CampStation에 오신 것을 환영합니다
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="bg-error/10 text-error rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <Input
                label="이메일"
                name="email"
                type="email"
                placeholder="example@email.com"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            <div>
              <Input
                label="비밀번호"
                name="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              로그인
            </Button>
          </form>

          {/* 구분선 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">또는</span>
            </div>
          </div>

          {/* 소셜 로그인 */}
          <div className="space-y-3">
            {/* 카카오 로그인 */}
            <button
              type="button"
              onClick={handleKakaoLogin}
              className="flex w-full items-center justify-center gap-3 rounded-lg px-4 py-3 font-medium transition-opacity active:opacity-80"
              style={{ backgroundColor: "#FEE500", color: "#000000" }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 3C5.589 3 2 5.858 2 9.375c0 2.233 1.486 4.192 3.712 5.29-.157.577-.507 1.863-.576 2.155-.084.354.13.35.274.254.115-.076 1.865-1.256 2.644-1.782.574.081 1.162.124 1.763.124 4.411 0 8-2.858 8-6.375S14.411 3 10 3z"
                  fill="currentColor"
                />
              </svg>
              카카오로 시작하기
            </button>

            {/* 네이버 로그인 */}
            <button
              type="button"
              onClick={handleNaverLogin}
              className="flex w-full items-center justify-center gap-3 rounded-lg px-4 py-3 font-medium text-white transition-opacity active:opacity-80"
              style={{ backgroundColor: "#03C75A" }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.6 10.4L6.4 0H0v20h6.4V9.6L13.6 20H20V0h-6.4v10.4z"
                  fill="currentColor"
                />
              </svg>
              네이버로 시작하기
            </button>
          </div>

          {/* Footer */}
          <div className="space-y-3 text-center text-sm">
            <div className="flex items-center justify-center gap-1">
              <span className="text-muted-foreground">계정이 없으신가요?</span>
              <Link
                href={ROUTES.AUTH.REGISTER}
                className="text-primary font-medium"
              >
                회원가입
              </Link>
            </div>

            <Link
              href="#"
              className="text-muted-foreground active:text-primary block"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>
        </div>
      </div>
    </AppContainer>
  );
}
