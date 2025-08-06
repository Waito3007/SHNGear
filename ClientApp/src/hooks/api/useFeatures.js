import { useState, useEffect, useCallback } from "react";
import axios from "axios";

/**
 * Hook for managing flash sales
 */
export const useFlashSale = () => {
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const fetchFlashSaleProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/Products/lowest-price`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch flash sale products");
      }

      const productsData = await response.json();

      const formattedProducts = productsData.map((product) => {
        const variant = product.variants?.[0] || {};
        const image =
          product.images?.[0]?.imageUrl || "/images/placeholder.jpg";

        const oldPrice = variant.price || 0;
        const newPrice = variant.discountPrice || oldPrice;
        const discountAmount = oldPrice - newPrice;
        const discount =
          oldPrice > 0
            ? `-${Math.round((discountAmount / oldPrice) * 100)}%`
            : "0%";

        return {
          id: product.id,
          name: product.name,
          oldPrice,
          newPrice,
          discount,
          discountAmount,
          image,
          features: product.features || [],
          brand: product.brand,
          rating: product.rating || 0,
          reviewCount: product.reviewCount || 0,
        };
      });

      setFlashSaleProducts(formattedProducts);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching flash sale products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Countdown timer calculation
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1-6 = Monday-Saturday
      const endOfWeek = new Date(now);

      // Set to next Sunday (end of week)
      const daysUntilSunday = currentDay === 0 ? 7 : 7 - currentDay;
      endOfWeek.setDate(now.getDate() + daysUntilSunday);
      endOfWeek.setHours(23, 59, 59, 999);

      const timeDiff = endOfWeek.getTime() - now.getTime();

      if (timeDiff > 0) {
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchFlashSaleProducts();
  }, [fetchFlashSaleProducts]);

  const isFlashSaleActive =
    timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0;

  return {
    flashSaleProducts,
    loading,
    error,
    timeLeft,
    isFlashSaleActive,
    refetch: fetchFlashSaleProducts,
  };
};

/**
 * Hook for managing best sellers
 */
export const useBestSellers = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBestSellers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsResponse, categoriesResponse, brandsResponse] =
        await Promise.all([
          fetch(`${process.env.REACT_APP_API_BASE_URL}/api/Products`),
          fetch(`${process.env.REACT_APP_API_BASE_URL}/api/categories`),
          fetch(`${process.env.REACT_APP_API_BASE_URL}/api/brands`),
        ]);

      if (
        !productsResponse.ok ||
        !categoriesResponse.ok ||
        !brandsResponse.ok
      ) {
        throw new Error("Failed to fetch data");
      }

      const [products, categories, brands] = await Promise.all([
        productsResponse.json(),
        categoriesResponse.json(),
        brandsResponse.json(),
      ]);

      const productsData = products.$values || products || [];
      const categoriesData = categories.$values || categories || [];
      const brandsData = brands.$values || brands || [];

      // Filter and sort products by sales/popularity (mock implementation)
      const bestSellingProducts = productsData
        .filter((product) => product.variants && product.variants.length > 0)
        .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
        .slice(0, 12)
        .map((product) => {
          const category = categoriesData.find(
            (cat) => cat.id === product.categoryId
          );
          const brand = brandsData.find((br) => br.id === product.brandId);

          return {
            ...product,
            category: category || { name: "Unknown" },
            brand: brand || { name: "Unknown", logo: null },
          };
        });

      setBestSellers(bestSellingProducts);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching best sellers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBestSellers();
  }, [fetchBestSellers]);

  return {
    bestSellers,
    loading,
    error,
    refetch: fetchBestSellers,
  };
};

/**
 * Hook for managing featured categories
 */
export const useFeaturedCategories = () => {
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFeaturedCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/categories`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      const categoriesData = data.$values || data || [];

      // Filter featured categories (first 6 for display)
      const featured = categoriesData.slice(0, 6);
      setFeaturedCategories(featured);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching featured categories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedCategories();
  }, [fetchFeaturedCategories]);

  return {
    featuredCategories,
    loading,
    error,
    refetch: fetchFeaturedCategories,
  };
};

/**
 * Hook for managing hero banner slider
 */
export const useHeroBanner = (slides, autoPlayInterval = 5000) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);

    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning, slides.length]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + slides.length) % slides.length
    );

    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning, slides.length]);

  const goToSlide = useCallback(
    (index) => {
      if (isTransitioning || index === currentIndex) return;

      setIsTransitioning(true);
      setCurrentIndex(index);

      setTimeout(() => setIsTransitioning(false), 300);
    },
    [isTransitioning, currentIndex]
  );

  const pauseAutoPlay = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeAutoPlay = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [nextSlide, isPaused, autoPlayInterval, slides.length]);

  return {
    currentIndex,
    isTransitioning,
    isPaused,
    nextSlide,
    prevSlide,
    goToSlide,
    pauseAutoPlay,
    resumeAutoPlay,
  };
};

/**
 * Hook for managing loyalty program data
 */
export const useLoyalty = () => {
  const [loyaltyData, setLoyaltyData] = useState({
    currentTier: null,
    points: 0,
    nextTierPoints: 0,
    benefits: [],
    history: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLoyaltyData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/loyalty/status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setLoyaltyData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch loyalty data");
      console.error("Error fetching loyalty data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const redeemPoints = useCallback(async (pointsToRedeem, rewardId) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication required");

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/loyalty/redeem`,
        {
          points: pointsToRedeem,
          rewardId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local data
      setLoyaltyData((prev) => ({
        ...prev,
        points: prev.points - pointsToRedeem,
      }));

      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to redeem points";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoyaltyData();
  }, [fetchLoyaltyData]);

  return {
    loyaltyData,
    loading,
    error,
    fetchLoyaltyData,
    redeemPoints,
  };
};

/**
 * Hook for managing vouchers
 */
export const useVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVouchers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/vouchers/available`
      );

      const vouchersData = response.data.$values || response.data || [];
      setVouchers(vouchersData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch vouchers");
      console.error("Error fetching vouchers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const validateVoucher = useCallback(async (voucherCode) => {
    try {
      setError(null);

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/vouchers/validate`,
        { code: voucherCode }
      );

      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Invalid voucher code";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  return {
    vouchers,
    loading,
    error,
    fetchVouchers,
    validateVoucher,
  };
};
