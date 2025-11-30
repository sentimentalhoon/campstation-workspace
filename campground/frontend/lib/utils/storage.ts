/**
 * localStorage 유틸리티
 * 타입 안전성과 에러 처리 포함
 */

import { logError } from "@/lib/errors/logger";

/**
 * localStorage에 값 저장
 */
export function setLocalStorage<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    logError(error, {
      location: "setLocalStorage",
      key,
    });
  }
}

/**
 * localStorage에서 값 가져오기
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (error) {
    logError(error, {
      location: "getLocalStorage",
      key,
    });
    return defaultValue;
  }
}

/**
 * localStorage에서 값 제거
 */
export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    logError(error, {
      location: "removeLocalStorage",
      key,
    });
  }
}

/**
 * localStorage 전체 초기화
 */
export function clearLocalStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    logError(error, {
      location: "clearLocalStorage",
    });
  }
}
