/**
 * 로그인 플로우 통합 테스트
 *
 * 사용자 시나리오:
 * 1. 로그인 페이지 방문
 * 2. 이메일/비밀번호 입력
 * 3. 로그인 버튼 클릭
 * 4. 성공 시 홈페이지로 리다이렉트
 * 5. 헤더에 사용자 정보 표시
 */

import LoginPage from "@/app/auth/login/page";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/auth/login",
}));

// Mock authApi
vi.mock("@/lib/api/auth", () => ({
  authApi: {
    login: vi.fn(),
    me: vi.fn(),
    logout: vi.fn(),
  },
}));

describe("로그인 플로우 통합 테스트", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const renderLoginPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </QueryClientProvider>
    );
  };

  it("사용자가 이메일과 비밀번호를 입력하고 로그인할 수 있다", async () => {
    const user = userEvent.setup();

    // Mock API 응답
    const { authApi } = await import("@/lib/api/auth");
    vi.mocked(authApi.login).mockResolvedValue({
      success: true,
      data: {
        accessToken: "mock-token",
        expiresIn: 3600,
        userId: 1,
        email: "test@example.com",
        name: "테스트 사용자",
        role: "USER",
      },
      timestamp: new Date().toISOString(),
    });

    renderLoginPage();

    // 로그인 폼 요소 확인
    const emailInput = screen.getByLabelText(/이메일/i);
    const passwordInput = screen.getByLabelText(/비밀번호/i);
    const loginButton = screen.getByRole("button", { name: /로그인/i });

    // 사용자 입력 시뮬레이션
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(loginButton);

    // API 호출 확인
    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    // 홈페이지로 리다이렉트 확인
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("잘못된 자격 증명으로 로그인 시 에러 메시지를 표시한다", async () => {
    const user = userEvent.setup();

    // Mock API 에러 응답
    const { authApi } = await import("@/lib/api/auth");
    vi.mocked(authApi.login).mockRejectedValue(
      new Error("이메일 또는 비밀번호가 올바르지 않습니다.")
    );

    renderLoginPage();

    const emailInput = screen.getByLabelText(/이메일/i);
    const passwordInput = screen.getByLabelText(/비밀번호/i);
    const loginButton = screen.getByRole("button", { name: /로그인/i });

    await user.type(emailInput, "wrong@example.com");
    await user.type(passwordInput, "wrongpassword");
    await user.click(loginButton);

    // 에러 메시지 표시 확인
    await waitFor(() => {
      expect(
        screen.getByText(/이메일 또는 비밀번호가 올바르지 않습니다/i)
      ).toBeInTheDocument();
    });

    // 리다이렉트되지 않음 확인
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("필수 입력 필드가 비어있으면 로그인 버튼이 비활성화된다", () => {
    renderLoginPage();

    const loginButton = screen.getByRole("button", { name: /로그인/i });

    // 초기 상태에서 버튼 비활성화 확인
    expect(loginButton).toBeDisabled();
  });

  it("이메일 형식이 올바르지 않으면 검증 에러를 표시한다", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const emailInput = screen.getByLabelText(/이메일/i);
    const passwordInput = screen.getByLabelText(/비밀번호/i);

    await user.type(emailInput, "invalid-email");
    await user.type(passwordInput, "password123");
    await user.tab(); // blur 이벤트 발생

    // 이메일 형식 에러 메시지 확인
    await waitFor(() => {
      expect(
        screen.getByText(/올바른 이메일 형식을 입력해주세요/i)
      ).toBeInTheDocument();
    });
  });
});
