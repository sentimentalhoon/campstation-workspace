/**
 * PasswordSection Component
 * Password change form section with toggle visibility
 * React 19+ with React Compiler auto-optimization
 */

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface PasswordSectionProps {
  isVisible: boolean;
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
  isChanging: boolean;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onNewPasswordConfirmChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onToggleVisibility: () => void;
  onCancel: () => void;
}

export function PasswordSection({
  isVisible,
  currentPassword,
  newPassword,
  newPasswordConfirm,
  isChanging,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onNewPasswordConfirmChange,
  onSubmit,
  onToggleVisibility,
  onCancel,
}: PasswordSectionProps) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">
          비밀번호 변경
        </h2>
        {!isVisible && (
          <Button variant="outline" size="sm" onClick={onToggleVisibility}>
            변경하기
          </Button>
        )}
      </div>

      {isVisible ? (
        <form onSubmit={onSubmit} className="space-y-4">
          {/* 현재 비밀번호 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              현재 비밀번호 <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => onCurrentPasswordChange(e.target.value)}
              placeholder="현재 비밀번호를 입력하세요"
              required
            />
          </div>

          {/* 새 비밀번호 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              새 비밀번호 <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => onNewPasswordChange(e.target.value)}
              placeholder="새 비밀번호 (최소 8자)"
              required
              minLength={8}
            />
          </div>

          {/* 새 비밀번호 확인 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              새 비밀번호 확인 <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              value={newPasswordConfirm}
              onChange={(e) => onNewPasswordConfirmChange(e.target.value)}
              placeholder="새 비밀번호를 다시 입력하세요"
              required
              minLength={8}
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
            <Button type="submit" loading={isChanging}>
              비밀번호 변경
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-neutral-600">
          비밀번호를 변경하려면 &ldquo;변경하기&rdquo; 버튼을 클릭하세요.
        </p>
      )}
    </section>
  );
}
