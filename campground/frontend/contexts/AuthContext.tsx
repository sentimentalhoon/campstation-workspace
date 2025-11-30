/**
 * AuthContext
 * 인증 상태 관리를 위한 Context
 */

"use client";

import { authApi } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import { ROUTES } from "@/lib/constants";
import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from "@/lib/utils/storage";
import type {
  LoginCredentials,
  RegisterData,
  User,
  UserRole,
} from "@/types/domain";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * JWT Authentication Response Type
 * Returned from login, register, and refresh endpoints
 */
interface JwtResponse {
  userId: number;
  email: string;
  name: string;
  role: string;
  profileImage?: string;
  expiresAt?: number;
}

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

const TOKEN_EXPIRES_AT_KEY = "auth_expires_at";

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  // 초기 로드 시 사용자 정보 확인
  useEffect(() => {
    const initAuth = async () => {
      try {
        // ✅ HttpOnly 쿠키는 JavaScript에서 읽을 수 없으므로
        // 무조건 /auth/me를 호출하여 쿠키가 자동 전송되도록 함
        // ⚠️ 로그인 안 한 상태에서 401 에러는 정상 동작 (Network 탭에 표시됨)
        const response = await authApi.me();

        // ✅ API 응답이 JwtResponse 형식 (userId)으로 오므로 User 타입 (id)으로 변환
        const data = response as unknown as JwtResponse;

        const user: Partial<User> &
          Pick<User, "id" | "email" | "name" | "role"> = {
          id: data.userId,
          email: data.email,
          name: data.name,
          role: data.role as UserRole,
          thumbnailUrl: data.profileImage || null,
          originalUrl: data.profileImage || null,
        };

        setUser(user as User);

        // ✅ API 응답에서 expiresAt 사용 (우선순위 1)
        if (data.expiresAt) {
          setTokenExpiresAt(data.expiresAt);
          setLocalStorage(TOKEN_EXPIRES_AT_KEY, data.expiresAt);
        } else {
          // ✅ localStorage에서 expiresAt 복원 (fallback)
          const savedExpiresAt = getLocalStorage<number>(TOKEN_EXPIRES_AT_KEY, 0);
          if (savedExpiresAt) {
            // 아직 만료되지 않았으면 복원
            if (savedExpiresAt > Date.now()) {
              setTokenExpiresAt(savedExpiresAt);
            } else {
              // 이미 만료되었으면 제거
              removeLocalStorage(TOKEN_EXPIRES_AT_KEY);
            }
          }
        }
      } catch (error) {
        // 인증 실패 시 로그인 안 한 상태로 처리 (조용히 처리)
        // - 401: 인증되지 않음 (정상적인 비로그인 상태) ✅
        // - 403: 권한 없음
        // - 500: 서버 에러 (인증 토큰이 없거나 잘못된 경우 발생 가능)
        // 모두 로그인 안 한 상태로 간주하여 사용자 경험 저하 방지
        setUser(null);
        setTokenExpiresAt(null);
        removeLocalStorage(TOKEN_EXPIRES_AT_KEY);

        // 개발 환경에서만 디버그 로그 출력 (401은 정상이므로 에러로 표시하지 않음)
        if (process.env.NODE_ENV === "development") {
          if (error instanceof ApiError && error.status === 401) {
            // 401은 로그인 안 한 상태이므로 debug 레벨로만 출력
            console.debug("[AuthContext] Not authenticated (expected)");
          } else {
            // 다른 에러는 확인이 필요할 수 있으므로 출력
            console.debug("[AuthContext] Auth check failed:", error);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // 토큰 자동 갱신 (로그인된 사용자만)
  useEffect(() => {
    // ✅ 로그인되지 않은 경우 갱신 안 함
    if (!user) return;

    const checkAndRefresh = async () => {
      const now = Date.now();

      // tokenExpiresAt이 있으면 만료 시간 기준 체크
      if (tokenExpiresAt) {
        const timeUntilExpiry = tokenExpiresAt - now;
        const twoMinutes = 2 * 60 * 1000; // 2분 (밀리초)

        // 2분 이하 남았으면 갱신
        if (timeUntilExpiry <= twoMinutes && timeUntilExpiry > 0) {
          try {
            const response = await authApi.refresh();
            const data = response as JwtResponse;
            if (data.expiresAt) {
              setTokenExpiresAt(data.expiresAt);
              // ✅ localStorage에 새 만료 시간 저장
              setLocalStorage(TOKEN_EXPIRES_AT_KEY, data.expiresAt);
            }
            console.log("Token refreshed successfully (scheduled)");
          } catch (error) {
            console.error("Token refresh failed:", error);
            // 갱신 실패 시 로그아웃
            setUser(null);
            setTokenExpiresAt(null);
            removeLocalStorage(TOKEN_EXPIRES_AT_KEY);
            router.push(ROUTES.AUTH.LOGIN);
          }
        }
      } else {
        // ✅ tokenExpiresAt이 없는 경우에도 주기적으로 갱신 시도
        // (초기 로드 시 localStorage에서 복원 실패한 경우)
        try {
          const response = await authApi.refresh();
          const data = response as JwtResponse;
          if (data.expiresAt) {
            setTokenExpiresAt(data.expiresAt);
            // ✅ localStorage에 새 만료 시간 저장
            setLocalStorage(TOKEN_EXPIRES_AT_KEY, data.expiresAt);
            console.log("Token refreshed successfully (fallback)");
          }
        } catch (error) {
          // 갱신 실패는 조용히 처리 (다음 주기에 재시도)
          if (process.env.NODE_ENV === "development") {
            console.debug("Token refresh failed (will retry):", error);
          }
        }
      }
    };

    // ✅ 1분마다 체크 (10분 만료 토큰에 대해 2분 전 갱신 보장)
    const interval = setInterval(checkAndRefresh, 60 * 1000);

    // 초기 체크 (30초 후 - 빠른 첫 체크)
    const initialTimeout = setTimeout(checkAndRefresh, 30 * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [user, tokenExpiresAt, router]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const response = await authApi.login(credentials);
        // ✅ HttpOnly 쿠키로 토큰이 자동 저장되므로 localStorage 사용 안 함
        // ✅ API 클라이언트가 CommonResponse.data를 unwrap하므로 response는 JwtResponse 객체
        const data = response as JwtResponse;

        // ✅ 이전 사용자의 캐시 초기화 (다른 계정으로 로그인 시)
        queryClient.clear();

        // 토큰 만료 시각 저장 (state & localStorage)
        if (data.expiresAt) {
          setTokenExpiresAt(data.expiresAt);
          setLocalStorage(TOKEN_EXPIRES_AT_KEY, data.expiresAt);
        }

        // JwtResponse의 개별 필드로 User 객체 생성 (부분 정보만 사용)
        const user: Partial<User> &
          Pick<User, "id" | "email" | "name" | "role"> = {
          id: data.userId,
          email: data.email,
          name: data.name,
          role: data.role as UserRole,
          thumbnailUrl: data.profileImage || null,
          originalUrl: data.profileImage || null,
        };

        setUser(user as User);
        router.push(ROUTES.HOME);
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },
    [router, queryClient]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      try {
        const response = await authApi.register(data);
        // ✅ HttpOnly 쿠키로 토큰이 자동 저장되므로 localStorage 사용 안 함
        // ✅ API 클라이언트가 CommonResponse.data를 unwrap하므로 response는 JwtResponse 객체
        const responseData = response as JwtResponse;

        // ✅ 이전 캐시 초기화 (새 계정 등록 시)
        queryClient.clear();

        // 토큰 만료 시각 저장 (state & localStorage)
        if (responseData.expiresAt) {
          setTokenExpiresAt(responseData.expiresAt);
          setLocalStorage(TOKEN_EXPIRES_AT_KEY, responseData.expiresAt);
        }

        // JwtResponse의 개별 필드로 User 객체 생성
        const user: Partial<User> &
          Pick<User, "id" | "email" | "name" | "role"> = {
          id: responseData.userId,
          email: responseData.email,
          name: responseData.name,
          role: responseData.role as UserRole,
          thumbnailUrl: responseData.profileImage || null,
          originalUrl: responseData.profileImage || null,
        };

        setUser(user as User);
        router.push(ROUTES.HOME);
      } catch (error) {
        console.error("Registration failed:", error);
        throw error;
      }
    },
    [router, queryClient]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // ✅ React Query 캐시 초기화 (다른 사용자 정보 방지)
      queryClient.clear();

      // ✅ 쿠키는 백엔드에서 삭제됨 (Set-Cookie로 maxAge=0)
      setUser(null);
      setTokenExpiresAt(null);
      removeLocalStorage(TOKEN_EXPIRES_AT_KEY);
      router.push(ROUTES.HOME);
    }
  }, [router, queryClient]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
