/**
 * 회원가입 페이지
 */

"use client";

import { AppContainer } from "@/components/layout";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/contexts";
import { useSecureForm } from "@/hooks/security/useSecureForm";
import { ApiError } from "@/lib/api/errors";
import { ROUTES } from "@/lib/constants";
import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    values,
    errors: formErrors,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useSecureForm(
    {
      email: "",
      password: "",
      passwordConfirm: "",
      name: "",
      phone: "",
    },
    {
      email: {
        required: true,
        email: true,
        message: "올바른 이메일 형식을 입력하세요",
      },
      password: {
        required: true,
        minLength: 8,
        message: "비밀번호는 영문, 숫자 포함 8자 이상이어야 합니다",
      },
      passwordConfirm: {
        required: true,
        minLength: 8,
        custom: (value) => {
          if (value !== values.password) {
            return "비밀번호가 일치하지 않습니다";
          }
          return undefined;
        },
      },
      name: {
        required: true,
        minLength: 2,
        message: "이름은 최소 2자 이상이어야 합니다",
      },
      phone: {
        required: true,
        message: "전화번호를 입력하세요",
      },
    }
  );

  const onSubmit = handleSubmit(async (data) => {
    setError("");
    setIsLoading(true);

    try {
      await register({
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        name: data.name,
        phone: data.phone,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("회원가입에 실패했습니다");
      }
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <AppContainer>
      <div className="flex min-h-[calc(100vh-14rem)] flex-col justify-center py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">회원가입</h1>
            <p className="text-muted-foreground text-sm">
              CampStation과 함께 특별한 캠핑을 시작하세요
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
                label="이름"
                name="name"
                type="text"
                placeholder="홍길동"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>

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
                label="전화번호"
                name="phone"
                type="tel"
                placeholder="010-0000-0000"
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {formErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
              )}
            </div>

            <div>
              <Input
                label="비밀번호"
                name="password"
                type="password"
                placeholder="8자 이상 입력하세요"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                helperText="영문, 숫자 포함 8자 이상"
                required
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.password}
                </p>
              )}
            </div>

            <div>
              <Input
                label="비밀번호 확인"
                name="passwordConfirm"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={values.passwordConfirm}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {formErrors.passwordConfirm && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.passwordConfirm}
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
              회원가입
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center text-sm">
            <div className="flex items-center justify-center gap-1">
              <span className="text-muted-foreground">
                이미 계정이 있으신가요?
              </span>
              <Link
                href={ROUTES.AUTH.LOGIN}
                className="text-primary font-medium"
              >
                로그인
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppContainer>
  );
}
