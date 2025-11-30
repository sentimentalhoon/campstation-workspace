/**
 * Custom Hooks
 */

// Campgrounds
export { useCampgroundDetail } from "./useCampgroundDetail";
export { useCampgroundsByLocation } from "./useCampgroundsByLocation";
export { useCreateCampground } from "./useCreateCampground";
export { useSearchCampgrounds } from "./useSearchCampgrounds";
export { useSearchHistory } from "./useSearchHistory";
export { useSites } from "./useSites";

// Favorites
export {
  useAddFavorite,
  useAllFavorites,
  useFavorites,
  useFavoriteStatus,
  useRemoveFavorite,
  useToggleFavorite,
} from "./useFavorites";

// Images
export {
  useDeleteImages,
  useUploadCampgroundImages,
  useUploadImage,
  useUploadMultipleImages,
  useUploadProfileImage,
  useUploadReviewImages,
} from "./useImages";

// Common hooks
export { useImageUpload } from "./common/useImageUpload";
export type {
  ImageFile,
  OptimizationProgress,
  UseImageUploadOptions,
} from "./common/useImageUpload";

// Banners
export {
  useAdminBanner,
  useAdminBanners,
  useBannerStats,
  useCreateBanner,
  useDeleteBanner,
  useUpdateBanner,
  useUpdateBannerOrder,
  useUpdateBannerStatus,
} from "./useAdminBanners";
export { useBannerClick, useBanners, useBannerView } from "./useBanners";

// Reservations
export { useCancelReservation } from "./useCancelReservation";
export { useRequestDepositConfirmation } from "./useRequestDepositConfirmation";
export { useReservationDetail } from "./useReservationDetail";
export { useReservations } from "./useReservations";

// Pricing
export { usePriceCalculation, usePriceCalculationBySite } from "./usePriceCalculation";

// Reviews
export { useLikeReview } from "./reviews/useLikeReview";
export { useReportReview } from "./reviews/useReportReview";
export { useCreateReview } from "./useCreateReview";
export { useMyReviews } from "./useMyReviews";
export { useReviews } from "./useReviews";
export { useUpdateReview } from "./useUpdateReview";

// User
export { useChangePassword } from "./useChangePassword";
export { useUpdateProfile } from "./useUpdateProfile";
export { useUserProfile } from "./useUserProfile";

// Admin (OWNER)
export { useCampgroundReservations } from "./admin/useCampgroundReservations";
export { useCampgroundSites } from "./admin/useCampgroundSites";
export { useCampgroundStats } from "./admin/useCampgroundStats";
export { useMyCampgrounds } from "./admin/useMyCampgrounds";
export { useUpdateCampground } from "./admin/useUpdateCampground";

// Admin (ADMIN)
export { useAdminStats } from "./admin/useAdminStats";
export { useAllCampgrounds } from "./admin/useAllCampgrounds";
export { useAllReservations } from "./admin/useAllReservations";
export { useAllUsers } from "./admin/useAllUsers";
export { useReports } from "./admin/useReports";
export { useApproveCampground } from "./useApproveCampground";
export { usePendingCampgrounds } from "./usePendingCampgrounds";
export { useRejectCampground } from "./useRejectCampground";
