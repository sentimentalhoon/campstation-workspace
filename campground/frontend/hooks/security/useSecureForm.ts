"use client";

import {
  isValidEmail,
  sanitizeText,
  validateInput,
} from "@/lib/security/sanitize";
import { useCallback, useState } from "react";

/**
 * Form 필드 에러
 */
type FieldErrors = Record<string, string>;

/**
 * Form 검증 규칙
 */
type ValidationRule = {
  /** 필수 입력 여부 */
  required?: boolean;
  /** 최소 길이 */
  minLength?: number;
  /** 최대 길이 */
  maxLength?: number;
  /** 이메일 형식 검증 */
  email?: boolean;
  /** 커스텀 검증 함수 */
  custom?: (value: string) => string | undefined;
  /** 에러 메시지 */
  message?: string;
};

/**
 * Form 검증 규칙 맵
 */
type ValidationRules<T> = Partial<Record<keyof T, ValidationRule>>;

/**
 * useSecureForm Hook
 *
 * 보안이 강화된 Form 관리를 위한 Hook입니다.
 * 입력값 정제, XSS 방지, 검증 기능을 제공합니다.
 *
 * @param initialValues - 초기 Form 값
 * @param validationRules - 검증 규칙
 *
 * @example
 * ```tsx
 * const { values, errors, handleChange, handleSubmit, isSubmitting } = useSecureForm(
 *   { email: "", password: "" },
 *   {
 *     email: { required: true, email: true },
 *     password: { required: true, minLength: 8 },
 *   }
 * );
 *
 * <form onSubmit={handleSubmit(async (data) => {
 *   await login(data);
 * })}>
 *   <input
 *     name="email"
 *     value={values.email}
 *     onChange={handleChange}
 *   />
 *   {errors.email && <span>{errors.email}</span>}
 * </form>
 * ```
 *
 * @see docs/technical/SECURITY-GUIDE.md
 */
export function useSecureForm<T extends Record<string, string>>(
  initialValues: T,
  validationRules: ValidationRules<T> = {}
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 필드 검증
   */
  const validateField = useCallback(
    (name: keyof T, value: string): string => {
      const rule = validationRules[name];
      if (!rule) return "";

      // 필수 입력 검증
      if (rule.required && !value.trim()) {
        return rule.message || "필수 입력 항목입니다";
      }

      // 최소 길이 검증
      if (rule.minLength && value.length < rule.minLength) {
        return `최소 ${rule.minLength}자 이상 입력해주세요`;
      }

      // 최대 길이 검증
      if (rule.maxLength && value.length > rule.maxLength) {
        return `최대 ${rule.maxLength}자까지 입력 가능합니다`;
      }

      // 이메일 형식 검증
      if (rule.email && value && !isValidEmail(value)) {
        return "올바른 이메일 형식이 아닙니다";
      }

      // XSS 및 SQL Injection 패턴 검증
      const securityCheck = validateInput(value);
      if (!securityCheck.isValid) {
        return securityCheck.message;
      }

      // 커스텀 검증
      if (rule.custom) {
        const customError = rule.custom(value);
        if (customError) return customError;
      }

      return "";
    },
    [validationRules]
  );

  /**
   * 모든 필드 검증
   */
  const validateAllFields = useCallback((): boolean => {
    const newErrors: FieldErrors = {};
    let isValid = true;

    Object.keys(values).forEach((key) => {
      const fieldName = key as keyof T;
      const fieldValue = values[fieldName];
      if (fieldValue !== undefined) {
        const error = validateField(fieldName, fieldValue);
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField]);

  /**
   * 입력값 변경 핸들러
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      const { name, value } = e.target;

      // 입력값 정제 (XSS 방지)
      const sanitized = sanitizeText(value);

      setValues((prev) => ({
        ...prev,
        [name]: sanitized,
      }));

      // 이미 터치된 필드는 실시간 검증
      if (touched[name]) {
        const error = validateField(name as keyof T, sanitized);
        setErrors((prev) => ({
          ...prev,
          [name]: error,
        }));
      }
    },
    [touched, validateField]
  );

  /**
   * 필드 blur 핸들러
   */
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      const { name, value } = e.target;

      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));

      const error = validateField(name as keyof T, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    },
    [validateField]
  );

  /**
   * Form 제출 핸들러
   */
  const handleSubmit = useCallback(
    (onSubmit: (data: T) => Promise<void> | void) => {
      return async (e: React.FormEvent) => {
        e.preventDefault();

        // 모든 필드를 터치 상태로 설정
        const allTouched = Object.keys(values).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {}
        );
        setTouched(allTouched);

        // 전체 검증
        if (!validateAllFields()) {
          return;
        }

        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } finally {
          setIsSubmitting(false);
        }
      };
    },
    [values, validateAllFields]
  );

  /**
   * Form 초기화
   */
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * 특정 필드 값 설정
   */
  const setValue = useCallback((name: keyof T, value: string) => {
    const sanitized = sanitizeText(value);
    setValues((prev) => ({
      ...prev,
      [name]: sanitized,
    }));
  }, []);

  /**
   * 특정 필드 에러 설정
   */
  const setFieldError = useCallback((name: string, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValue,
    setFieldError,
    validateField,
  };
}
