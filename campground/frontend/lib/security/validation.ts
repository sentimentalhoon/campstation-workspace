/**
 * XSS 방지 검증 함수
 *
 * XSS(Cross-Site Scripting) 공격을 방지하기 위한
 * 고급 검증 함수들을 제공합니다.
 *
 * @see docs/technical/SECURITY-GUIDE.md
 */

import { hasXssPattern } from "./sanitize";

/**
 * 허용된 HTML 태그 목록
 */
const ALLOWED_TAGS = ["b", "i", "em", "strong", "br", "p"] as const;

/**
 * 허용된 URL 스킴
 */
const ALLOWED_URL_SCHEMES = ["http:", "https:", "mailto:"] as const;

/**
 * 안전한 HTML 태그만 허용
 *
 * 허용된 HTML 태그만 남기고 나머지는 제거합니다.
 * 리치 텍스트 에디터 등에서 사용할 수 있습니다.
 *
 * @param html - 검증할 HTML 문자열
 * @returns 안전한 HTML 태그만 포함된 문자열
 *
 * @example
 * ```ts
 * sanitizeAllowedHtml("<b>Bold</b> <script>alert('xss')</script>")
 * // returns: "<b>Bold</b> "
 * ```
 */
export function sanitizeAllowedHtml(html: string): string {
  if (!html) return "";

  // 허용된 태그 패턴 생성
  const allowedPattern = ALLOWED_TAGS.map((tag) => tag).join("|");
  const tagRegex = new RegExp(`<(?!\\/?(${allowedPattern})\\b)[^>]+>`, "gi");

  // 허용되지 않은 태그 제거
  return html.replace(tagRegex, "");
}

/**
 * URL 안전성 검증 (고급)
 *
 * URL이 안전한지 더 엄격하게 검증합니다.
 *
 * @param url - 검증할 URL
 * @param allowedDomains - 허용된 도메인 목록 (선택)
 * @returns 검증 결과
 *
 * @example
 * ```ts
 * validateUrlSafety("https://example.com/page")
 * // returns: { isValid: true, message: "" }
 *
 * validateUrlSafety("javascript:alert('xss')")
 * // returns: { isValid: false, message: "허용되지 않는 URL 스킴입니다" }
 *
 * validateUrlSafety("https://evil.com", ["example.com"])
 * // returns: { isValid: false, message: "허용되지 않는 도메인입니다" }
 * ```
 */
export function validateUrlSafety(
  url: string,
  allowedDomains?: string[]
): {
  isValid: boolean;
  message: string;
} {
  if (!url) {
    return { isValid: false, message: "URL이 비어있습니다" };
  }

  try {
    const parsedUrl = new URL(url);

    // 위험한 프로토콜 체크
    if (
      !ALLOWED_URL_SCHEMES.includes(
        parsedUrl.protocol as (typeof ALLOWED_URL_SCHEMES)[number]
      )
    ) {
      return {
        isValid: false,
        message: "허용되지 않는 URL 스킴입니다",
      };
    }

    // 특정 도메인만 허용하는 경우
    if (allowedDomains && allowedDomains.length > 0) {
      const isAllowedDomain = allowedDomains.some((domain) =>
        parsedUrl.hostname.endsWith(domain)
      );

      if (!isAllowedDomain) {
        return {
          isValid: false,
          message: "허용되지 않는 도메인입니다",
        };
      }
    }

    // XSS 패턴 체크
    if (hasXssPattern(url)) {
      return {
        isValid: false,
        message: "위험한 패턴이 포함되어 있습니다",
      };
    }

    return { isValid: true, message: "" };
  } catch {
    return {
      isValid: false,
      message: "올바르지 않은 URL 형식입니다",
    };
  }
}

/**
 * 리치 텍스트 검증
 *
 * 리치 텍스트 에디터의 출력값을 검증합니다.
 *
 * @param content - 검증할 리치 텍스트
 * @param maxLength - 최대 길이 (선택)
 * @returns 검증 결과
 *
 * @example
 * ```ts
 * validateRichText("<b>Bold</b> text")
 * // returns: { isValid: true, message: "", sanitized: "<b>Bold</b> text" }
 *
 * validateRichText("<script>alert('xss')</script>")
 * // returns: { isValid: false, message: "위험한 콘텐츠가 포함되어 있습니다", sanitized: "" }
 * ```
 */
export function validateRichText(
  content: string,
  maxLength?: number
): {
  isValid: boolean;
  message: string;
  sanitized: string;
} {
  if (!content) {
    return { isValid: true, message: "", sanitized: "" };
  }

  // XSS 패턴 체크
  if (hasXssPattern(content)) {
    return {
      isValid: false,
      message: "위험한 콘텐츠가 포함되어 있습니다",
      sanitized: "",
    };
  }

  // 허용된 태그만 남김
  const sanitized = sanitizeAllowedHtml(content);

  // 길이 체크
  if (maxLength) {
    const textOnly = sanitized.replace(/<[^>]*>/g, "");
    if (textOnly.length > maxLength) {
      return {
        isValid: false,
        message: `최대 ${maxLength}자까지 입력 가능합니다`,
        sanitized,
      };
    }
  }

  return { isValid: true, message: "", sanitized };
}

/**
 * JSON 안전성 검증
 *
 * JSON 문자열이 안전한지 검증하고 파싱합니다.
 *
 * @param jsonString - 검증할 JSON 문자열
 * @returns 검증 결과 및 파싱된 객체
 *
 * @example
 * ```ts
 * validateJsonSafety('{"name": "John"}')
 * // returns: { isValid: true, message: "", data: { name: "John" } }
 *
 * validateJsonSafety('invalid json')
 * // returns: { isValid: false, message: "올바르지 않은 JSON 형식입니다", data: null }
 * ```
 */
export function validateJsonSafety<T = unknown>(
  jsonString: string
): {
  isValid: boolean;
  message: string;
  data: T | null;
} {
  if (!jsonString) {
    return {
      isValid: false,
      message: "JSON 문자열이 비어있습니다",
      data: null,
    };
  }

  try {
    const data = JSON.parse(jsonString) as T;

    // 프로토타입 오염 방지 체크
    if (
      typeof data === "object" &&
      data !== null &&
      ("__proto__" in data || "constructor" in data || "prototype" in data)
    ) {
      return {
        isValid: false,
        message: "위험한 속성이 포함되어 있습니다",
        data: null,
      };
    }

    return { isValid: true, message: "", data };
  } catch {
    return {
      isValid: false,
      message: "올바르지 않은 JSON 형식입니다",
      data: null,
    };
  }
}

/**
 * 파일 업로드 검증
 *
 * 업로드된 파일이 안전한지 검증합니다.
 *
 * @param file - 검증할 파일
 * @param options - 검증 옵션
 * @returns 검증 결과
 *
 * @example
 * ```ts
 * validateFileUpload(file, {
 *   allowedTypes: ['image/jpeg', 'image/png'],
 *   maxSize: 5 * 1024 * 1024, // 5MB
 * })
 * ```
 */
export function validateFileUpload(
  file: File,
  options: {
    allowedTypes?: string[];
    maxSize?: number;
    allowedExtensions?: string[];
  } = {}
): {
  isValid: boolean;
  message: string;
} {
  const { allowedTypes, maxSize, allowedExtensions } = options;

  // 파일 타입 체크
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      message: `허용되지 않는 파일 형식입니다. 허용: ${allowedTypes.join(", ")}`,
    };
  }

  // 파일 크기 체크
  if (maxSize && file.size > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
    return {
      isValid: false,
      message: `파일 크기가 너무 큽니다. 최대: ${maxSizeMB}MB`,
    };
  }

  // 파일 확장자 체크
  if (allowedExtensions) {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        isValid: false,
        message: `허용되지 않는 파일 확장자입니다. 허용: ${allowedExtensions.join(", ")}`,
      };
    }
  }

  return { isValid: true, message: "" };
}

/**
 * CSRF 토큰 생성
 *
 * CSRF(Cross-Site Request Forgery) 공격 방지를 위한 토큰을 생성합니다.
 * 주의: 실제 프로덕션에서는 서버에서 생성하고 검증해야 합니다.
 *
 * @returns CSRF 토큰
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

/**
 * 민감한 데이터 마스킹
 *
 * 이메일, 전화번호 등 민감한 정보를 마스킹합니다.
 *
 * @param value - 마스킹할 값
 * @param type - 데이터 타입
 * @returns 마스킹된 값
 *
 * @example
 * ```ts
 * maskSensitiveData("user@example.com", "email")
 * // returns: "u***@example.com"
 *
 * maskSensitiveData("010-1234-5678", "phone")
 * // returns: "010-****-5678"
 * ```
 */
export function maskSensitiveData(
  value: string,
  type: "email" | "phone" | "name" | "custom"
): string {
  if (!value) return "";

  switch (type) {
    case "email": {
      const [local, domain] = value.split("@");
      if (!local || !domain) return value;
      const maskedLocal =
        local.charAt(0) + "***" + (local.length > 1 ? local.slice(-1) : "");
      return `${maskedLocal}@${domain}`;
    }

    case "phone": {
      const digits = value.replace(/\D/g, "");
      if (digits.length === 11) {
        return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
      }
      return value.replace(/\d(?=\d{4})/g, "*");
    }

    case "name": {
      if (value.length <= 2) {
        return value.charAt(0) + "*";
      }
      return value.charAt(0) + "*".repeat(value.length - 2) + value.slice(-1);
    }

    case "custom": {
      const visibleChars = Math.ceil(value.length * 0.3);
      return (
        value.slice(0, visibleChars) +
        "*".repeat(value.length - visibleChars * 2) +
        value.slice(-visibleChars)
      );
    }

    default:
      return value;
  }
}
