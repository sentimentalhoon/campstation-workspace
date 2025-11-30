/**
 * OperationsSection Component
 * 운영 정보 섹션
 */


import { FormField } from "./FormField";
import { FormSection } from "./FormSection";

interface OperationsSectionProps {
  phone: string;
  email: string;
  checkInTime: string;
  checkOutTime: string;
  errors: Record<string, string>;
  onChange: (name: string, value: string | number) => void;
}

export function OperationsSection({
  phone,
  email,
  checkInTime,
  checkOutTime,
  errors,
  onChange,
}: OperationsSectionProps) {
  return (
    <FormSection title="운영 정보">
      {/* Contact Information */}
      <FormField
        label="연락처"
        name="phone"
        type="tel"
        value={phone}
        onChange={onChange}
        error={errors.phone}
        placeholder="010-1234-5678"
        required
      />
      <FormField
        label="이메일"
        name="email"
        type="email"
        value={email}
        onChange={onChange}
        error={errors.email}
        placeholder="camp@example.com"
        required
      />

      {/* Check-in/out Times */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="체크인 시간"
          name="checkInTime"
          type="time"
          value={checkInTime}
          onChange={onChange}
          error={errors.checkInTime}
          required
        />
        <FormField
          label="체크아웃 시간"
          name="checkOutTime"
          type="time"
          value={checkOutTime}
          onChange={onChange}
          error={errors.checkOutTime}
          required
        />
      </div>
    </FormSection>
  );
}
