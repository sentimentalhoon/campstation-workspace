/**
 * AdminSection Component
 * 관리자 전용 승인 상태 섹션
 */


import { FormSection } from "./FormSection";

interface AdminSectionProps {
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  onChange: (name: string, value: string | number) => void;
}

export function AdminSection({
  approvalStatus,
  onChange,
}: AdminSectionProps) {
  return (
    <FormSection title="승인 상태" variant="admin">
      <div>
        <label
          htmlFor="approvalStatus"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          상태 *
        </label>
        <select
          id="approvalStatus"
          name="approvalStatus"
          value={approvalStatus}
          onChange={(e) => onChange(e.target.name, e.target.value)}
          className="focus:ring-opacity-50 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        >
          <option value="PENDING">대기 중</option>
          <option value="APPROVED">승인됨</option>
          <option value="REJECTED">거부됨</option>
        </select>
      </div>
    </FormSection>
  );
}
