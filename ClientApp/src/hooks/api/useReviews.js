import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

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
        `${process.env.REACT_APP_API_BASE_URL}/api/Review/product/${productId}`
      );

      const reviewsData = response.data.$values || response.data || [];
      setReviews(reviewsData);

      // Calculate average rating từ data reviews
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
      setError(err.response?.data?.message || "Không thể tải đánh giá");
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
    fetchReviews, // Alias để tương thích với component hiện tại
    fetchAverageRating: fetchReviews, // Alias vì average rating được tính cùng lúc
  };
};

/**
 * Hook for getting product rating distribution and statistics
 * Optimized with better error handling and performance
 */
export const useProductRatingStats = (productId) => {
  const [stats, setStats] = useState(null);
  const [distribution, setDistribution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRatingDistribution = useCallback(async () => {
    if (!productId || isNaN(productId)) return null;

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/Review/product/${productId}/rating-distribution`,
        {
          timeout: 10000, // 10 second timeout
          headers: {
            'Cache-Control': 'max-age=300' // 5 minute cache
          }
        }
      );
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        // Product not found or no reviews - not really an error
        return {
          ProductId: productId,
          TotalReviews: 0,
          AverageRating: 0,
          RatingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          RatingPercentage: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
      }
      throw new Error(err.response?.data?.message || "Không thể tải phân bố đánh giá");
    }
  }, [productId]);

  const fetchProductStats = useCallback(async () => {
    if (!productId || isNaN(productId)) return null;

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/Review/product/${productId}/stats`,
        {
          timeout: 10000,
          headers: {
            'Cache-Control': 'max-age=300'
          }
        }
      );
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        // Product not found or no reviews - return empty stats
        return {
          ProductId: productId,
          TotalApprovedReviews: 0,
          PendingReviews: 0,
          AverageRating: 0,
          RatingStats: { 1: { Count: 0, Percentage: 0 }, 2: { Count: 0, Percentage: 0 }, 3: { Count: 0, Percentage: 0 }, 4: { Count: 0, Percentage: 0 }, 5: { Count: 0, Percentage: 0 } },
          RecentActivity: { Last7Days: 0, Last30Days: 0 },
          LatestReviews: []
        };
      }
      throw new Error(err.response?.data?.message || "Không thể tải thống kê đánh giá");
    }
  }, [productId]);

  const fetchAll = useCallback(async () => {
    if (!productId || isNaN(productId)) {
      setDistribution(null);
      setStats(null);
      setError("Product ID không hợp lệ");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use Promise.allSettled to handle partial failures
      const [distributionResult, statsResult] = await Promise.allSettled([
        fetchRatingDistribution(),
        fetchProductStats()
      ]);

      let distributionData = null;
      let statsData = null;

      if (distributionResult.status === 'fulfilled') {
        distributionData = distributionResult.value;
      } else {
        console.warn('Distribution fetch failed:', distributionResult.reason);
      }

      if (statsResult.status === 'fulfilled') {
        statsData = statsResult.value;
      } else {
        console.warn('Stats fetch failed:', statsResult.reason);
      }

      // If both failed, show error
      if (!distributionData && !statsData) {
        throw new Error("Không thể tải dữ liệu thống kê đánh giá");
      }

      setDistribution(distributionData);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching review statistics:", err);
    } finally {
      setLoading(false);
    }
  }, [productId, fetchRatingDistribution, fetchProductStats]);

  useEffect(() => {
    // Debounce the fetch to prevent excessive API calls
    const timeoutId = setTimeout(() => {
      fetchAll();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [fetchAll]);

  // Memoized computed values with better error handling
  const computedData = useMemo(() => {
    if (!distribution && !stats) return null;

    const totalReviews = distribution?.TotalReviews || stats?.TotalApprovedReviews || 0;
    const averageRating = distribution?.AverageRating || stats?.AverageRating || 0;
    const ratingDist = distribution?.RatingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    return {
      hasReviews: totalReviews > 0,
      averageRatingFormatted: Number(averageRating).toFixed(1),
      totalReviews,
      pendingReviews: stats?.PendingReviews || 0,
      recentActivity: stats?.RecentActivity || { Last7Days: 0, Last30Days: 0 },
      mostCommonRating: Object.entries(ratingDist)
        .reduce((a, b) => ratingDist[a[0]] > ratingDist[b[0]] ? a : b, [1, 0])[0],
      satisfactionRate: totalReviews > 0 
        ? ((ratingDist[4] + ratingDist[5]) / totalReviews * 100).toFixed(1)
        : 0
    };
  }, [distribution, stats]);

  return {
    distribution,
    stats,
    computed: computedData,
    loading,
    error,
    refetch: fetchAll,
    fetchRatingDistribution,
    fetchProductStats,
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

        if (!token) {
          throw new Error("You must be logged in to submit a review");
        }

        // Backend sẽ tự lấy userId từ JWT token
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/Review`,
          {
            productId: parseInt(productId),
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

export const useUserReview = (userId, productId) => {
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserReview = useCallback(async () => {
    if (!userId || !productId || isNaN(userId) || isNaN(productId)) {
      setUserReview(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let token = null;
      try {
        // Safe token access with fallback
        token = localStorage.getItem("token");
      } catch (storageError) {
        console.warn("Storage access blocked, skipping user review fetch:", storageError);
        setUserReview(null);
        return;
      }
      
      // Check if token exists before making request
      if (!token) {
        console.log("No token found, user not logged in");
        setUserReview(null);
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/Review/user/${userId}/product/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000, // 8 second timeout
        }
      );
      setUserReview(response.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setUserReview(null); // No review found for this user/product
      } else if (err.response && err.response.status === 401) {
        console.log("Unauthorized access, token might be invalid");
        setUserReview(null);
        // Optionally clear invalid token with try-catch
        try {
          localStorage.removeItem("token");
        } catch (storageError) {
          console.warn("Cannot clear token from storage:", storageError);
        }
      } else if (err.code === 'ECONNABORTED') {
        setError("Kết nối quá chậm, vui lòng thử lại");
      } else {
        setError(err.response?.data?.message || "Không thể tải đánh giá của bạn");
        console.error("Error fetching user review:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, productId]);

  useEffect(() => {
    // Debounce to prevent excessive API calls
    const timeoutId = setTimeout(() => {
      fetchUserReview();
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [fetchUserReview]);

  return { userReview, loading, error, refetchUserReview: fetchUserReview };
};

export const useReviewModeration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const approveReview = useCallback(async (reviewId) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/Review/${reviewId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Không thể duyệt đánh giá");
      console.error("Error approving review:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectReview = useCallback(async (reviewId) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/Review/${reviewId}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Không thể từ chối đánh giá");
      console.error("Error rejecting review:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { approveReview, rejectReview, loading, error };
};

export const useReviewAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/Review/analytics`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAnalytics(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải phân tích đánh giá");
      console.error("Error fetching review analytics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { analytics, loading, error, refetchAnalytics: fetchAnalytics };
};

export const useAllReviews = (filters = {}) => {
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      const queryParams = new URLSearchParams();
      for (const key in filters) {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      }

      const url = `${process.env.REACT_APP_API_BASE_URL}/api/Review/all?${queryParams.toString()}`;

      const response = await axios.get(
        url,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllReviews(response.data.$values || response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải tất cả đánh giá");
      console.error("Error fetching all reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAllReviews();
  }, [fetchAllReviews]);

  return { allReviews, loading, error, refetchAllReviews: fetchAllReviews };
};
