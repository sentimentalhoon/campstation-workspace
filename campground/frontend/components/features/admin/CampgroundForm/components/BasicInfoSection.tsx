/**
 * BasicInfoSection Component
 * 기본 정보 섹션
 */

import { sanitizeAllowedHtml } from "@/lib/security/validation";

import { FormField } from "./FormField";
import { FormSection } from "./FormSection";

interface BasicInfoSectionProps {
  name: string;
  description: string;
  errors: Record<string, string>;
  onChange: (name: string, value: string | number) => void;
}

export function BasicInfoSection({
  name,
  description,
  errors,
  onChange,
}: BasicInfoSectionProps) {
  const handleDescriptionChange = (
    fieldName: string,
    value: string | number
  ) => {
    if (fieldName === "description" && typeof value === "string") {
      const sanitized = sanitizeAllowedHtml(value);
      onChange(fieldName, sanitized);
    } else {
      onChange(fieldName, value);
    }
  };

  return (
    <FormSection title="기본 정보">
      <FormField
        label="캠핑장 이름"
        name="name"
        value={name}
        onChange={onChange}
        error={errors.name}
        placeholder="예) 행복한 캠핑장"
        required
      />
      <FormField
        label="캠핑장 설명"
        name="description"
        type="textarea"
        value={description}
        onChange={handleDescriptionChange}
        error={errors.description}
        placeholder="캠핑장을 소개해주세요."
        required
      />
    </FormSection>
  );
}
