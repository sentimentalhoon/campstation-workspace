/**
 * useProfileForm Hook
 * Profile update form state management with image optimization
 */

import {
  formatCompressionRatio,
  formatFileSize,
  optimizeProfileImage,
  validateImageFile,
} from "@/lib/utils/imageOptimizer";
import { useCallback, useState, useTransition } from "react";

interface ProfileFormData {
  name: string;
  phone: string;
}

export function useProfileForm(initialData?: ProfileFormData) {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: initialData?.name || "",
    phone: initialData?.phone || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  // Image state
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationInfo, setOptimizationInfo] = useState<string | null>(null);

  const updateField = useCallback(
    (name: string, value: string) => {
      startTransition(() => {
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error
        if (errors[name]) {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
          });
        }
      });
    },
    [errors]
  );

  const setInitialImage = useCallback((imageUrl: string | null) => {
    if (imageUrl) {
      setPreviewImage(imageUrl);
    }
  }, []);

  const handleImageSelect = useCallback(async (file: File) => {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error || "유효하지 않은 파일입니다");
      return false;
    }

    try {
      setIsOptimizing(true);
      setOptimizationInfo("이미지 최적화 중...");

      // Optimize image
      const optimized = await optimizeProfileImage(file);

      // Compression info
      if (optimized.compressionRatio > 0.1) {
        const saved = formatFileSize(
          optimized.originalSize - optimized.compressedSize
        );
        const ratio = formatCompressionRatio(optimized.compressionRatio);
        setOptimizationInfo(`${saved} 절약 (${ratio} 압축)`);
      } else {
        setOptimizationInfo(null);
      }

      setSelectedFile(optimized.file);

      // Generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(optimized.file);

      return true;
    } catch (error) {
      console.error("Image optimization failed:", error);
      alert("이미지 최적화에 실패했습니다");
      return false;
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const reset = useCallback((data?: ProfileFormData) => {
    setFormData({
      name: data?.name || "",
      phone: data?.phone || "",
    });
    setErrors({});
    setSelectedFile(null);
    setPreviewImage(null);
    setOptimizationInfo(null);
  }, []);

  return {
    formData,
    errors,
    isPending,
    previewImage,
    selectedFile,
    isOptimizing,
    optimizationInfo,
    updateField,
    setInitialImage,
    handleImageSelect,
    validate,
    reset,
  };
}
