/**
 * User Profile Page (Refactored)
 * User profile management with image upload and password change
 */

"use client";

import { DashboardNav } from "@/components/features/dashboard";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  useChangePassword,
  useUpdateProfile,
  useUploadProfileImage,
  useUserProfile,
} from "@/hooks";
import { useToast } from "@/hooks/ui/useToast";
import { ApiError, NetworkError } from "@/lib/api/errors";
import { ROUTES } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PasswordSection } from "./components/PasswordSection";
import { ProfileInfoSection } from "./components/ProfileInfoSection";
import { usePasswordForm } from "./hooks/usePasswordForm";
import { useProfileForm } from "./hooks/useProfileForm";

export default function UserProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // API hooks
  const { data: userProfile, isLoading } = useUserProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const uploadProfileImage = useUploadProfileImage();

  const user = userProfile;

  // Form hooks
  const profileForm = useProfileForm({ name: "", phone: "" });
  const passwordForm = usePasswordForm();

  // Initialize profile data
  useEffect(() => {
    if (user) {
      profileForm.reset({ name: user.name, phone: user.phone || "" });
      if (user.thumbnailUrl) {
        profileForm.setInitialImage(user.thumbnailUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Profile update handler
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileForm.validate()) {
      toast.warning("입력 정보를 확인해주세요");
      return;
    }

    try {
      // 1. Upload image if selected
      let thumbnailUrl: string | undefined;
      let originalUrl: string | undefined;

      if (profileForm.selectedFile) {
        const uploadResult = await uploadProfileImage.mutateAsync(
          profileForm.selectedFile
        );
        thumbnailUrl = uploadResult.thumbnailUrl;
        originalUrl = uploadResult.originalUrl;
      }

      // 2. Update profile
      const updateData = {
        ...profileForm.formData,
        ...(thumbnailUrl && { thumbnailUrl }),
        ...(originalUrl && { originalUrl }),
      };

      updateProfile.mutate(updateData, {
        onSuccess: () => {
          toast.success("프로필이 수정되었습니다");
          profileForm.reset({
            name: profileForm.formData.name,
            phone: profileForm.formData.phone,
          });
        },
        onError: (error) => {
          if (error instanceof ApiError) {
            if (error.status === 404) {
              toast.error("사용자를 찾을 수 없습니다");
            } else if (error.status === 403) {
              toast.error("프로필 수정 권한이 없습니다");
            } else if (error.status >= 500) {
              toast.error(
                "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요"
              );
            } else {
              toast.error(`프로필 수정에 실패했습니다: ${error.message}`);
            }
          } else if (error instanceof NetworkError) {
            toast.error("네트워크 연결을 확인해주세요");
          } else {
            toast.error(`프로필 수정에 실패했습니다: ${error.message}`);
          }
        },
      });
    } catch (uploadError) {
      console.error("Image upload failed:", uploadError);
      toast.error("이미지 업로드에 실패했습니다. 다시 시도해주세요");
    }
  };

  // Password change handler
  const handlePasswordSubmit = passwordForm.handleSubmit(async (data) => {
    if (!passwordForm.validate()) {
      toast.warning("비밀번호가 일치하지 않습니다");
      return;
    }

    changePassword.mutate(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        newPasswordConfirm: data.newPasswordConfirm,
      },
      {
        onSuccess: () => {
          toast.success("비밀번호가 변경되었습니다");
          setShowPasswordSection(false);
          passwordForm.reset();
        },
        onError: (error) => {
          if (error instanceof ApiError) {
            if (error.status === 401) {
              toast.error("현재 비밀번호가 일치하지 않습니다");
            } else if (error.status === 403) {
              toast.error("비밀번호 변경 권한이 없습니다");
            } else if (error.status >= 500) {
              toast.error(
                "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요"
              );
            } else {
              toast.error(`비밀번호 변경에 실패했습니다: ${error.message}`);
            }
          } else if (error instanceof NetworkError) {
            toast.error("네트워크 연결을 확인해주세요");
          } else {
            toast.error(`비밀번호 변경에 실패했습니다: ${error.message}`);
          }
        },
      }
    );
  });

  // Cancel password change
  const handlePasswordCancel = () => {
    setShowPasswordSection(false);
    passwordForm.reset();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-neutral-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <PageHeader title="프로필 수정" showBack onBack={() => router.back()} />

      {/* Dashboard Navigation */}
      <DashboardNav />

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        <ProfileInfoSection
        email={user?.email || ""}
        name={profileForm.formData.name}
        phone={profileForm.formData.phone}
        previewImage={profileForm.previewImage}
        isOptimizing={profileForm.isOptimizing}
        optimizationInfo={profileForm.optimizationInfo}
        isUploading={updateProfile.isPending}
        onNameChange={(value) => profileForm.updateField("name", value)}
        onPhoneChange={(value) => profileForm.updateField("phone", value)}
        onImageSelect={profileForm.handleImageSelect}
        onSubmit={handleProfileSubmit}
        onCancel={() => router.push(ROUTES.DASHBOARD.USER)}
      />

        <PasswordSection
          isVisible={showPasswordSection}
          currentPassword={passwordForm.formData.currentPassword}
          newPassword={passwordForm.formData.newPassword}
          newPasswordConfirm={passwordForm.formData.newPasswordConfirm}
          isChanging={changePassword.isPending}
          onCurrentPasswordChange={(value) =>
            passwordForm.setValue("currentPassword", value)
          }
          onNewPasswordChange={(value) =>
            passwordForm.setValue("newPassword", value)
          }
          onNewPasswordConfirmChange={(value) =>
            passwordForm.setValue("newPasswordConfirm", value)
          }
          onSubmit={handlePasswordSubmit}
          onToggleVisibility={() => setShowPasswordSection(true)}
          onCancel={handlePasswordCancel}
        />

        {/* Bottom Navigation 여백 */}
        <div className="h-20" />
      </div>
    </div>
  );
}
