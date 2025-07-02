import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

/**
 * Hook for managing product reviews
 */
export const useReviews = (productId) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });

  const fetchReviews = useCallback(async () => {
    if (!productId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/reviews/product/${productId}`
      );

      const reviewsData = response.data.$values || response.data || [];
      setReviews(reviewsData);

      // Calculate average rating
      if (reviewsData.length > 0) {
        const totalRating = reviewsData.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        setAverageRating(totalRating / reviewsData.length);

        // Calculate rating distribution
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviewsData.forEach((review) => {
          distribution[review.rating]++;
        });
        setRatingDistribution(distribution);
      } else {
        setAverageRating(0);
        setRatingDistribution({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch reviews");
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    loading,
    error,
    averageRating,
    ratingDistribution,
    totalReviews: reviews.length,
    refetch: fetchReviews,
  };
};

/**
 * Hook for submitting reviews
 */
export const useSubmitReview = (productId, onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitReview = useCallback(
    async (reviewData) => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("You must be logged in to submit a review");
        }

        const decoded = jwtDecode(token);
        const userId = parseInt(decoded.sub, 10);

        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/reviews`,
          {
            productId: parseInt(productId),
            userId,
            rating: reviewData.rating,
            comment: reviewData.comment,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (onSuccess) {
          onSuccess(response.data);
        }

        return response.data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to submit review";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [productId, onSuccess]
  );

  return {
    submitReview,
    loading,
    error,
    setError,
  };
};

/**
 * Hook for checking if user can review a product
 */
export const useCanReview = (productId) => {
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    const checkReviewEligibility = async () => {
      const token = localStorage.getItem("token");
      if (!token || !productId) {
        setCanReview(false);
        return;
      }

      try {
        setLoading(true);
        const decoded = jwtDecode(token);
        const userId = parseInt(decoded.sub, 10);

        // Check if user has purchased this product
        const purchaseResponse = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/orders/user/${userId}/has-purchased/${productId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const hasPurchased = purchaseResponse.data;

        // Check if user has already reviewed this product
        const reviewResponse = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/reviews/user/${userId}/product/${productId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const existingReview = reviewResponse.data;
        setHasReviewed(!!existingReview);
        setCanReview(hasPurchased && !existingReview);
      } catch (err) {
        console.error("Error checking review eligibility:", err);
        setCanReview(false);
      } finally {
        setLoading(false);
      }
    };

    checkReviewEligibility();
  }, [productId]);

  return {
    canReview,
    hasReviewed,
    loading,
  };
};

/**
 * Hook for managing review filters and sorting
 */
export const useReviewFilters = (reviews) => {
  const [filters, setFilters] = useState({
    rating: null, // null = all ratings, 1-5 = specific rating
    sortBy: "newest", // 'newest', 'oldest', 'rating-high', 'rating-low'
  });

  const filteredAndSortedReviews = useCallback(() => {
    let filtered = [...reviews];

    // Apply rating filter
    if (filters.rating) {
      filtered = filtered.filter((review) => review.rating === filters.rating);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "rating-high":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "rating-low":
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case "newest":
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return filtered;
  }, [reviews, filters]);

  const setRatingFilter = useCallback((rating) => {
    setFilters((prev) => ({ ...prev, rating }));
  }, []);

  const setSortBy = useCallback((sortBy) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      rating: null,
      sortBy: "newest",
    });
  }, []);

  return {
    filteredReviews: filteredAndSortedReviews(),
    filters,
    setRatingFilter,
    setSortBy,
    clearFilters,
  };
};

/**
 * Hook for review analytics (Admin)
 */
export const useReviewAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    recentReviews: [],
    topRatedProducts: [],
    reviewsThisMonth: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/reviews/analytics`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAnalytics(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch review analytics"
      );
      console.error("Error fetching review analytics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
};

/**
 * Hook for moderating reviews (Admin)
 */
export const useReviewModeration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const approveReview = useCallback(async (reviewId) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/reviews/${reviewId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to approve review";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectReview = useCallback(async (reviewId, reason) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/reviews/${reviewId}/reject`,
        { reason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to reject review";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReview = useCallback(async (reviewId) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/api/reviews/${reviewId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return true;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete review";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    approveReview,
    rejectReview,
    deleteReview,
  };
};
