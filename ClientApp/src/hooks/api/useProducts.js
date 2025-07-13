import { useState, useEffect, useCallback, useMemo } from "react";
import { useApi, usePost, usePut, useDelete } from "./useApi";

/**
 * Hook for fetching products
 */
export const useProducts = (filters = {}) => {
  const {
    data: products,
    loading,
    error,
    execute,
  } = useApi("/api/Products", {
    immediate: true,
    defaultValue: [],
    transform: (data) => data.$values || data || [],
  });

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = [...products];

    // Apply category filter
    if (filters.categoryId) {
      filtered = filtered.filter(
        (product) => product.categoryId === filters.categoryId
      );
    }

    // Apply brand filter
    if (filters.brandId) {
      filtered = filtered.filter(
        (product) => product.brandId === filters.brandId
      );
    }

    // Apply price range filter
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      filtered = filtered.filter((product) => {
        const price =
          product.variants?.[0]?.discountPrice ||
          product.variants?.[0]?.price ||
          0;
        return price >= min && price <= max;
      });
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [products, filters]);

  return {
    products: filteredProducts,
    allProducts: products,
    loading,
    error,
    refetch: execute,
  };
};

/**
 * Hook for fetching a single product
 */
export const useProduct = (productId) => {
  const {
    data: product,
    loading,
    error,
    execute,
  } = useApi(productId ? `/api/Products/${productId}` : null, {
    immediate: !!productId,
  });

  return {
    product,
    loading,
    error,
    refetch: execute,
  };
};

/**
 * Hook for fetching product categories
 */
export const useCategories = () => {
  const {
    data: categories,
    loading,
    error,
    execute,
  } = useApi("/api/categories", {
    immediate: true,
    defaultValue: [],
    transform: (data) => data.$values || data || [],
  });

  return {
    categories,
    loading,
    error,
    refetch: execute,
  };
};

/**
 * Hook for fetching brands
 */
export const useBrands = () => {
  const {
    data: brands,
    loading,
    error,
    execute,
  } = useApi("/api/brands", {
    immediate: true,
    defaultValue: [],
    transform: (data) => data.$values || data || [],
  });

  return {
    brands,
    loading,
    error,
    refetch: execute,
  };
};

/**
 * Hook for product search
 */
export const useProductSearch = () => {
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const search = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      setIsSearching(true);
      setSearchError(null);

      const response = await fetch(
        `${
          process.env.REACT_APP_API_BASE_URL
        }/api/search?query=${encodeURIComponent(query)}`
      );

      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setSearchError(err.message);
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults(null);
    setSearchError(null);
  }, []);

  return {
    searchResults,
    isSearching,
    searchError,
    search,
    clearSearch,
  };
};

/**
 * Hook for managing compare products
 */
export const useCompareProducts = () => {
  const [compareList, setCompareList] = useState([]);
  const [compareProducts, setCompareProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load compare list from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("compareList") || "[]");
    setCompareList(saved);
  }, []);

  // Fetch product details when compare list changes
  useEffect(() => {
    const fetchCompareProducts = async () => {
      if (compareList.length === 0) {
        setCompareProducts([]);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/Products/compare`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(compareList),
          }
        );

        if (!response.ok) throw new Error("Failed to fetch compare products");

        const data = await response.json();
        setCompareProducts(data);
      } catch (error) {
        console.error("Error fetching compare products:", error);
        setCompareProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompareProducts();
  }, [compareList]);

  const addToCompare = useCallback(
    (productId) => {
      const newList = [...compareList];
      if (!newList.includes(productId) && newList.length < 4) {
        newList.push(productId);
        setCompareList(newList);
        localStorage.setItem("compareList", JSON.stringify(newList));
        window.dispatchEvent(new Event("compareListChanged"));
      }
    },
    [compareList]
  );

  const removeFromCompare = useCallback(
    (productId) => {
      const newList = compareList.filter((id) => id !== productId);
      setCompareList(newList);
      localStorage.setItem("compareList", JSON.stringify(newList));
      window.dispatchEvent(new Event("compareListChanged"));
    },
    [compareList]
  );

  const clearCompareList = useCallback(() => {
    setCompareList([]);
    setCompareProducts([]);
    localStorage.removeItem("compareList");
    window.dispatchEvent(new Event("compareListChanged"));
  }, []);

  return {
    compareList,
    compareProducts,
    loading,
    addToCompare,
    removeFromCompare,
    clearCompareList,
    canAddMore: compareList.length < 4,
  };
};

/**
 * Hook for fetching related products
 */
export const useRelatedProducts = (productId, brandId, categoryId) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        setError(null);

        const [productsRes, brandsRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_BASE_URL}/api/Products`),
          fetch(`${process.env.REACT_APP_API_BASE_URL}/api/brands`),
        ]);

        if (!productsRes.ok || !brandsRes.ok) {
          throw new Error("Failed to fetch related products");
        }

        const [productsData, brandsData] = await Promise.all([
          productsRes.json(),
          brandsRes.json(),
        ]);

        const products = productsData.$values || productsData || [];
        const brands = brandsData.$values || brandsData || [];

        // Filter related products (same brand or category, exclude current product)
        const related = products
          .filter(
            (product) =>
              product.id !== parseInt(productId) &&
              (product.brandId === brandId || product.categoryId === categoryId)
          )
          .slice(0, 8)
          .map((product) => {
            const brand = brands.find((b) => b.id === product.brandId);
            return {
              ...product,
              brand: brand || { name: "Unknown", logo: null },
            };
          });

        setRelatedProducts(related);
      } catch (err) {
        setError(err.message);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productId, brandId, categoryId]);

  return {
    relatedProducts,
    loading,
    error,
  };
};

/**
 * Hook for product specifications
 */
export const useProductSpecifications = (productType, productId) => {
  const [specs, setSpecs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSpecifications = async () => {
      if (!productType || !productId) return;

      try {
        setLoading(true);
        setError(null);

        let endpoint;
        switch (productType) {
          case "phone":
            endpoint = "PhoneSpecifications";
            break;
          case "laptop":
            endpoint = "LaptopSpecifications";
            break;
          case "headphone":
            endpoint = "HeadphoneSpecifications";
            break;
          default:
            throw new Error("Unsupported product type");
        }

        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/${endpoint}/product/${productId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch specifications");
        }

        const data = await response.json();
        setSpecs(data);
      } catch (err) {
        setError(err.message);
        setSpecs(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecifications();
  }, [productType, productId]);

  return {
    specs,
    loading,
    error,
  };
};
