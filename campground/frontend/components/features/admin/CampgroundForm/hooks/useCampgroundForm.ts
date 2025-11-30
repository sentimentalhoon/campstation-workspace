/**
 * useCampgroundForm Hook
 * React 19+ 기법: useOptimistic, useActionState 준비
 */

import { useCallback, useState, useTransition } from "react";
import type { CampgroundFormData } from "../types";
import { validateCampgroundForm } from "../validation";

const initialFormData: CampgroundFormData = {
  name: "",
  description: "",
  address: "",
  phone: "",
  email: "",
  latitude: 0,
  longitude: 0,
  checkInTime: "14:00",
  checkOutTime: "11:00",
  businessName: "",
  businessAddress: "",
  businessEmail: "",
  businessRegistrationNumber: "",
  tourismBusinessNumber: "",
  images: [],
};

export function useCampgroundForm(initialData?: Partial<CampgroundFormData>) {
  const [formData, setFormData] = useState<CampgroundFormData>({
    ...initialFormData,
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const updateField = useCallback(
    (name: string, value: string | number | undefined) => {
      startTransition(() => {
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error when field is updated
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

  const updateLocation = useCallback(
    (address: string, latitude: number, longitude: number) => {
      startTransition(() => {
        setFormData((prev) => ({
          ...prev,
          address,
          latitude,
          longitude,
        }));

        // Clear location errors
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.address;
          delete newErrors.latitude;
          delete newErrors.longitude;
          return newErrors;
        });
      });
    },
    []
  );

  const updateImages = useCallback((images: string[]) => {
    startTransition(() => {
      setFormData((prev) => ({ ...prev, images }));
    });
  }, []);

  const validate = useCallback((): boolean => {
    const validationErrors = validateCampgroundForm(formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [formData]);

  const reset = useCallback(() => {
    setFormData({ ...initialFormData, ...initialData });
    setErrors({});
  }, [initialData]);

  return {
    formData,
    errors,
    isPending,
    updateField,
    updateLocation,
    updateImages,
    validate,
    reset,
  };
}
