/**
 * usePasswordForm Hook
 * Password change form state management with validation
 * Now using useSecureForm for enhanced security
 */

import { useSecureForm } from "@/hooks/security/useSecureForm";

export function usePasswordForm() {
  const {
    values: formData,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValue,
  } = useSecureForm(
    {
      currentPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
    },
    {
      currentPassword: {
        required: true,
        minLength: 8,
        message: "현재 비밀번호를 입력해주세요",
      },
      newPassword: {
        required: true,
        minLength: 8,
        message: "새 비밀번호는 최소 8자 이상이어야 합니다",
      },
      newPasswordConfirm: {
        required: true,
        minLength: 8,
        message: "비밀번호 확인을 입력해주세요",
      },
    }
  );

  // Custom validation for password match
  const validate = () => {
    if (formData.newPassword !== formData.newPasswordConfirm) {
      return false;
    }
    return true;
  };

  return {
    formData,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    validate,
    reset,
    setValue,
  };
}
