/**
 * 세션 관리 유틸리티
 *
 * 익명 사용자를 구분하기 위한 세션 ID 생성 및 관리
 */

const SESSION_ID_KEY = "campstation_session_id";
const SESSION_EXPIRY_DAYS = 365; // 1년

/**
 * UUID v4 생성 함수
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 쿠키에서 값 가져오기
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }

  return null;
}

/**
 * 쿠키에 값 설정
 */
function setCookie(name: string, value: string, days: number): void {
  if (typeof document === "undefined") return;

  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;

  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
}

/**
 * 세션 ID 가져오기 (없으면 생성)
 *
 * @returns 세션 ID
 *
 * @example
 * ```ts
 * const sessionId = getOrCreateSessionId();
 * console.log(sessionId); // "abc-123-def-456"
 * ```
 */
export function getOrCreateSessionId(): string {
  // 1. 쿠키에서 기존 세션 ID 조회
  let sessionId = getCookie(SESSION_ID_KEY);

  // 2. 없으면 새로 생성
  if (!sessionId) {
    sessionId = generateUUID();
    setCookie(SESSION_ID_KEY, sessionId, SESSION_EXPIRY_DAYS);
  }

  return sessionId;
}

/**
 * 세션 ID 초기화 (테스트용)
 */
export function clearSessionId(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_ID_KEY}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}
