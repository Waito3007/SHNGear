import { useState, useEffect, useCallback } from "react";
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
    if (!userId || !productId) {
      setUserReview(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/Review/user/${userId}/product/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserReview(response.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setUserReview(null); // No review found for this user/product
      } else {
        setError(err.response?.data?.message || "Không thể tải đánh giá của bạn");
        console.error("Error fetching user review:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, productId]);

  useEffect(() => {
    fetchUserReview();
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
