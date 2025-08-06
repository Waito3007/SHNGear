// Main hooks index file - exports all custom hooks for easy importing
// Organized by category for better developer experience

// API Hooks
export {
  useApi,
  useApiData,
  useApiMutation,
  usePaginatedApi,
  useSearchApi,
} from "./api/useApi";

export {
  useProducts,
  useProduct,
  useProductSearch,
  useProductFilters,
  useProductCategories,
  useProductBrands,
  useProductComparison,
  useRelatedProducts,
  useProductRecommendations,
} from "./api/useProducts";

export {
  useCart,
  useCartItems,
  useCartActions,
  useGuestCart,
  useCartSync,
  useCartPersistence,
} from "./api/useCart";

export {
  useOrders,
  useOrder,
  useOrderHistory,
  useOrderTracking,
  useOrderActions,
  useOrderStatistics,
} from "./api/useOrders";

export {
  useReviews,
  useProductReviews,
  useUserReviews,
  useReviewActions,
  useReviewModeration,
  useReviewStatistics,
  useProductRatingStats,
  useSubmitReview,
  useUserReview,
  useReviewAnalytics,
  useAllReviews,
} from "./api/useReviews";

export {
  useAddresses,
  useUserAddresses,
  useAddressValidation,
  useShippingZones,
  useAddressActions,
} from "./api/useAddresses";

export {
  useAdmin,
  useAdminUsers,
  useAdminProducts,
  useAdminOrders,
  useAdminAnalytics,
  useAdminSettings,
  useAdminReports,
} from "./api/useAdmin";

export {
  useChat,
  useChatConnection,
  useChatHistory,
  useChatActions,
  useAdminChat,
  useChatNotifications,
} from "./api/useChat";

export {
  useFeatures,
  useFlashSales,
  useLoyaltyProgram,
  useVouchers,
  useWishlist,
  useNotifications,
  useRecentlyViewed,
} from "./api/useFeatures";

// Authentication Hooks
export {
  useAuth,
  useAuthState,
  useAuthActions,
  useProfile,
  useProfileActions,
  usePasswordReset,
  useEmailVerification,
  useRoleManagement,
} from "./auth/useAuth";

// UI Hooks
export {
  useDebounce,
  usePagination,
  useForm,
  useModal,
  useToast,
  useLocalStorage,
  useSessionStorage,
  useToggle,
  useClickOutside,
  useKeyPress,
  useWindowSize,
  useScrollPosition,
  useIntersectionObserver,
  useImageLazyLoad,
  useInfiniteScroll,
  useTabManager,
  useConfirmDialog,
  useFileUpload,
  useClipboard,
} from "./ui/useUI";

// Utility function to check if all hooks are properly exported
export const getAvailableHooks = () => {
  return {
    api: [
      "useApi",
      "useApiData",
      "useApiMutation",
      "usePaginatedApi",
      "useSearchApi",
      "useProducts",
      "useProduct",
      "useProductSearch",
      "useProductFilters",
      "useCart",
      "useCartItems",
      "useCartActions",
      "useOrders",
      "useOrder",
      "useOrderHistory",
      "useReviews",
      "useProductReviews",
      "useUserReviews",
      "useAddresses",
      "useUserAddresses",
      "useAddressValidation",
      "useAdmin",
      "useAdminUsers",
      "useAdminProducts",
      "useChat",
      "useChatConnection",
      "useChatHistory",
      "useFeatures",
      "useFlashSales",
      "useLoyaltyProgram",
    ],
    auth: ["useAuth", "useAuthState", "useAuthActions", "useProfile"],
    ui: [
      "useDebounce",
      "usePagination",
      "useForm",
      "useModal",
      "useToast",
      "useLocalStorage",
      "useToggle",
      "useClickOutside",
      "useKeyPress",
    ],
  };
};

// Hook categories for documentation and discovery
export const HOOK_CATEGORIES = {
  API: "api",
  AUTH: "auth",
  UI: "ui",
};

// Common hook patterns and utilities
export const HOOK_PATTERNS = {
  LOADING_STATES: ["loading", "error", "data"],
  CRUD_OPERATIONS: ["create", "read", "update", "delete"],
  FORM_STATES: ["values", "errors", "touched", "isValid"],
};
