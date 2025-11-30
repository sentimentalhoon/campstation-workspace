"use client";

import { ToastContext } from "@/contexts/ToastContext";
import { useContext } from "react";

/**
 * useToast Hook
 *
 * Toast 알림을 표시하기 위한 Hook입니다.
 * ToastProvider 내부에서만 사용할 수 있습니다.
 *
 * @returns Toast 함수들
 *
 * @throws {Error} ToastProvider 외부에서 호출 시
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const toast = useToast();
 *
 *   const handleSubmit = async () => {
 *     try {
 *       await saveData();
 *       toast.success("저장되었습니다");
 *     } catch (error) {
 *       if (error instanceof ApiError) {
 *         toast.error(error.data.message);
 *       } else {
 *         toast.error("알 수 없는 오류가 발생했습니다");
 *       }
 *     }
 *   };
 * }
 * ```
 *
 * @see docs/technical/UX-IMPROVEMENTS.md - Phase 1: Toast 알림 시스템
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
