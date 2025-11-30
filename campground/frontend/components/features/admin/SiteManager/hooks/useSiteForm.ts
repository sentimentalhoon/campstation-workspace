/**
 * useSiteForm Hook
 * React 19+ Site form state management
 */

import type { Amenity, Site } from "@/types/domain";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type { SiteFormData } from "../types";
import { validateSiteForm } from "../validation";

const initialFormData: SiteFormData = {
  siteNumber: "",
  siteType: "CARAVAN",
  capacity: 2,
  description: "",
  amenities: [],
  basePrice: 50000,
  status: "AVAILABLE",
};

export function useSiteForm(initialData?: Site | null) {
  const [formData, setFormData] = useState<SiteFormData>(() => {
    if (!initialData) return initialFormData;

    return {
      siteNumber: initialData.siteNumber,
      siteType: initialData.siteType,
      capacity: initialData.capacity,
      description: initialData.description,
      amenities: initialData.amenities,
      basePrice: initialData.basePrice,
      latitude: initialData.latitude,
      longitude: initialData.longitude,
      status: initialData.status as "AVAILABLE" | "UNAVAILABLE" | "MAINTENANCE",
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  // Track the last initialData to detect changes
  const lastInitialDataRef = useRef<Site | null | undefined>(initialData);

  // Sync form data when initialData changes (for edit mode)
  useEffect(() => {
    // Only update if initialData actually changed
    if (lastInitialDataRef.current !== initialData) {
      lastInitialDataRef.current = initialData;

      if (initialData) {
        // Use startTransition to avoid cascading render warning
        startTransition(() => {
          setFormData({
            siteNumber: initialData.siteNumber,
            siteType: initialData.siteType,
            capacity: initialData.capacity,
            description: initialData.description,
            amenities: initialData.amenities,
            basePrice: initialData.basePrice,
            latitude: initialData.latitude,
            longitude: initialData.longitude,
            status: initialData.status as
              | "AVAILABLE"
              | "UNAVAILABLE"
              | "MAINTENANCE",
          });
          setErrors({});
        });
      } else {
        startTransition(() => {
          setFormData(initialFormData);
          setErrors({});
        });
      }
    }
  }, [initialData]);

  const updateField = useCallback(
    (name: string, value: string | number) => {
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

  const toggleAmenity = useCallback((amenity: Amenity) => {
    startTransition(() => {
      setFormData((prev) => ({
        ...prev,
        amenities: prev.amenities.includes(amenity)
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      }));
    });
  }, []);

  const validate = useCallback((): boolean => {
    const validationErrors = validateSiteForm(formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [formData]);

  const reset = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    isPending,
    updateField,
    toggleAmenity,
    validate,
    reset,
  };
}
