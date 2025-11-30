/**
 * API 에러 클래스
 */

export type ApiErrorData = {
  message: string;
  errors?: Record<string, string[]>;
};

/**
 * API 에러
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public data: ApiErrorData
  ) {
    super(data.message);
    this.name = "ApiError";

    // 프로토타입 체인 유지
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * 특정 상태 코드 확인
   */
  is(status: number): boolean {
    return this.status === status;
  }

  /**
   * 인증 에러 여부 (401, 403)
   */
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /**
   * 검증 에러 여부 (400 + errors 필드)
   */
  isValidationError(): boolean {
    return this.status === 400 && !!this.data.errors;
  }

  /**
   * 서버 에러 여부 (5xx)
   */
  isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * 필드별 에러 메시지 가져오기
   */
  getFieldError(field: string): string | undefined {
    return this.data.errors?.[field]?.[0];
  }

  /**
   * 모든 필드 에러 메시지 가져오기
   */
  getAllFieldErrors(): Record<string, string> {
    if (!this.data.errors) return {};

    return Object.entries(this.data.errors).reduce(
      (acc, [field, messages]) => ({
        ...acc,
        [field]: messages[0],
      }),
      {}
    );
  }
}

/**
 * 네트워크 에러
 */
export class NetworkError extends Error {
  constructor(message = "네트워크 연결을 확인해주세요") {
    super(message);
    this.name = "NetworkError";

    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * 타임아웃 에러
 */
export class TimeoutError extends Error {
  constructor(message = "요청 시간이 초과되었습니다") {
    super(message);
    this.name = "TimeoutError";

    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}
