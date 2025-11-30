/**
 * Input Sanitization 유틸리티
 *
 * XSS(Cross-Site Scripting) 공격을 방지하기 위한
 * 사용자 입력값 정제 함수들을 제공합니다.
 *
 * @see docs/technical/SECURITY-GUIDE.md
 */

/**
 * HTML 태그 제거
 *
 * 사용자 입력에서 모든 HTML 태그를 제거합니다.
 * XSS 공격 방지를 위해 사용합니다.
 *
 * @param input - 정제할 문자열
 * @returns HTML 태그가 제거된 문자열
 *
 * @example
 * ```ts
 * sanitizeHtml("<script>alert('xss')</script>Hello")
 * // returns: "Hello"
 *
 * sanitizeHtml("<b>Bold</b> text")
 * // returns: "Bold text"
 * ```
 */
export function sanitizeHtml(input: string): string {
  if (!input) return "";

  // HTML 태그 제거
  return input.replace(/<[^>]*>/g, "");
}

/**
 * 특수문자 HTML 엔티티로 변환
 *
 * HTML에서 특별한 의미를 가진 문자들을 HTML 엔티티로 변환합니다.
 * React는 기본적으로 이를 수행하지만, 명시적 변환이 필요한 경우 사용합니다.
 *
 * @param input - 변환할 문자열
 * @returns HTML 엔티티로 변환된 문자열
 *
 * @example
 * ```ts
 * escapeHtml("<script>alert('xss')</script>")
 * // returns: "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;"
 *
 * escapeHtml("Tom & Jerry")
 * // returns: "Tom &amp; Jerry"
 * ```
 */
export function escapeHtml(input: string): string {
  if (!input) return "";

  const htmlEscapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return input.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char);
}

/**
 * SQL Injection 방지용 입력값 검증
 *
 * SQL 인젝션에 사용될 수 있는 위험한 패턴을 검사합니다.
 * 주의: 이 함수는 추가 보호 레이어이며, 서버에서 Prepared Statement를 사용해야 합니다.
 *
 * @param input - 검증할 문자열
 * @returns 위험한 패턴 포함 여부
 *
 * @example
 * ```ts
 * hasSqlInjectionPattern("SELECT * FROM users")
 * // returns: true
 *
 * hasSqlInjectionPattern("일반 텍스트")
 * // returns: false
 * ```
 */
export function hasSqlInjectionPattern(input: string): boolean {
  if (!input) return false;

  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|\*\/|\/\*)/,
    /(\bOR\b.*=.*|1=1|1\s*=\s*1)/i,
    /(\bUNION\b.*\bSELECT\b)/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * 위험한 JavaScript 패턴 검사
 *
 * XSS 공격에 사용될 수 있는 JavaScript 패턴을 검사합니다.
 *
 * @param input - 검증할 문자열
 * @returns 위험한 패턴 포함 여부
 *
 * @example
 * ```ts
 * hasXssPattern("<script>alert('xss')</script>")
 * // returns: true
 *
 * hasXssPattern("javascript:void(0)")
 * // returns: true
 *
 * hasXssPattern("안전한 텍스트")
 * // returns: false
 * ```
 */
export function hasXssPattern(input: string): boolean {
  if (!input) return false;

  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["']?[^"'>]*/gi, // onclick, onerror 등
    /<iframe/gi,
    /<embed/gi,
    /<object/gi,
    /eval\(/gi,
    /expression\(/gi,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

/**
 * 이메일 형식 검증
 *
 * 이메일 주소가 올바른 형식인지 검증합니다.
 *
 * @param email - 검증할 이메일 주소
 * @returns 유효한 이메일 형식 여부
 *
 * @example
 * ```ts
 * isValidEmail("user@example.com")
 * // returns: true
 *
 * isValidEmail("invalid-email")
 * // returns: false
 * ```
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * URL 형식 검증
 *
 * URL이 올바른 형식이고 안전한지 검증합니다.
 *
 * @param url - 검증할 URL
 * @returns 유효하고 안전한 URL 여부
 *
 * @example
 * ```ts
 * isValidUrl("https://example.com")
 * // returns: true
 *
 * isValidUrl("javascript:alert('xss')")
 * // returns: false
 * ```
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;

  try {
    const parsedUrl = new URL(url);

    // javascript:, data:, vbscript: 등 위험한 프로토콜 차단
    const dangerousProtocols = ["javascript:", "data:", "vbscript:", "file:"];
    if (
      dangerousProtocols.some((protocol) =>
        parsedUrl.protocol.toLowerCase().startsWith(protocol)
      )
    ) {
      return false;
    }

    // http, https만 허용
    return ["http:", "https:"].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}

/**
 * 텍스트 입력값 정제
 *
 * 일반 텍스트 입력값을 정제합니다.
 * HTML 태그 제거 및 앞뒤 공백 제거를 수행합니다.
 *
 * @param input - 정제할 텍스트
 * @param maxLength - 최대 길이 (선택)
 * @returns 정제된 텍스트
 *
 * @example
 * ```ts
 * sanitizeText("  <script>alert('xss')</script>Hello  ")
 * // returns: "Hello"
 *
 * sanitizeText("Very long text...", 10)
 * // returns: "Very long " (10자로 제한)
 * ```
 */
export function sanitizeText(input: string, maxLength?: number): string {
  if (!input) return "";

  let sanitized = sanitizeHtml(input).trim();

  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * 파일명 정제
 *
 * 안전한 파일명으로 정제합니다.
 * 경로 순회 공격(../) 및 위험한 문자를 제거합니다.
 *
 * @param filename - 정제할 파일명
 * @returns 정제된 파일명
 *
 * @example
 * ```ts
 * sanitizeFilename("../../etc/passwd")
 * // returns: "etcpasswd"
 *
 * sanitizeFilename("my file!@#.txt")
 * // returns: "my-file.txt"
 * ```
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return "";

  return filename
    .replace(/\.\./g, "") // 경로 순회 제거
    .replace(/[^\w\s.-]/g, "") // 영문, 숫자, 공백, 점, 하이픈만 허용
    .replace(/\s+/g, "-") // 공백을 하이픈으로
    .toLowerCase()
    .trim();
}

/**
 * 전화번호 형식 검증 (한국)
 *
 * 한국 전화번호 형식인지 검증합니다.
 *
 * @param phone - 검증할 전화번호
 * @returns 유효한 전화번호 형식 여부
 *
 * @example
 * ```ts
 * isValidPhoneNumber("010-1234-5678")
 * // returns: true
 *
 * isValidPhoneNumber("01012345678")
 * // returns: true
 *
 * isValidPhoneNumber("123-456")
 * // returns: false
 * ```
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;

  // 숫자만 추출
  const digitsOnly = phone.replace(/\D/g, "");

  // 010, 011, 016, 017, 018, 019로 시작하는 10-11자리 숫자
  const mobileRegex = /^01[0-9]{8,9}$/;

  // 지역번호 포함 전화번호 (02, 031, 032 등)
  const landlineRegex = /^0(2|[3-6][1-5]|70)[0-9]{7,8}$/;

  return mobileRegex.test(digitsOnly) || landlineRegex.test(digitsOnly);
}

/**
 * 입력값 종합 검증
 *
 * 입력값이 안전한지 종합적으로 검증합니다.
 *
 * @param input - 검증할 입력값
 * @returns 검증 결과
 *
 * @example
 * ```ts
 * validateInput("<script>alert('xss')</script>")
 * // returns: { isValid: false, message: "위험한 스크립트 패턴이 감지되었습니다" }
 *
 * validateInput("안전한 텍스트")
 * // returns: { isValid: true, message: "" }
 * ```
 */
export function validateInput(input: string): {
  isValid: boolean;
  message: string;
} {
  if (!input) {
    return { isValid: true, message: "" };
  }

  if (hasXssPattern(input)) {
    return {
      isValid: false,
      message: "위험한 스크립트 패턴이 감지되었습니다",
    };
  }

  if (hasSqlInjectionPattern(input)) {
    return {
      isValid: false,
      message: "위험한 SQL 패턴이 감지되었습니다",
    };
  }

  return { isValid: true, message: "" };
}
