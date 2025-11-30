/**
 * BusinessInfoSection Component
 * 사업자 정보 섹션
 */


import { FormField } from "./FormField";
import { FormSection } from "./FormSection";

interface BusinessInfoSectionProps {
  businessName: string;
  businessAddress: string;
  businessEmail: string;
  businessRegistrationNumber: string;
  reportNumber: string;
  errors: Record<string, string>;
  onChange: (name: string, value: string | number) => void;
}

export function BusinessInfoSection({
  businessName,
  businessAddress,
  businessEmail,
  businessRegistrationNumber,
  reportNumber,
  errors,
  onChange,
}: BusinessInfoSectionProps) {
  return (
    <FormSection title="사업자 정보">
      <FormField
        label="사업자명"
        name="businessName"
        value={businessName}
        onChange={onChange}
        error={errors.businessName}
        placeholder="주식회사 캠핑스테이션"
        required
      />
      <FormField
        label="사업장 주소"
        name="businessAddress"
        value={businessAddress}
        onChange={onChange}
        error={errors.businessAddress}
        placeholder="서울시 강남구..."
        required
      />
      <FormField
        label="사업자 이메일"
        name="businessEmail"
        type="email"
        value={businessEmail}
        onChange={onChange}
        error={errors.businessEmail}
        placeholder="business@example.com"
        required
      />
      <FormField
        label="사업자등록번호"
        name="businessRegistrationNumber"
        value={businessRegistrationNumber}
        onChange={onChange}
        error={errors.businessRegistrationNumber}
        placeholder="123-45-67890"
        required
      />
      <FormField
        label="신고번호"
        name="tourismBusinessNumber"
        value={reportNumber}
        onChange={onChange}
        error={errors.tourismBusinessNumber}
        placeholder="제2023-1234호"
        required
      />
    </FormSection>
  );
}
