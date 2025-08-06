import { useState, useEffect, useCallback } from "react";
import axios from "axios";

/**
 * Hook for admin dashboard statistics
 */
export const useAdminStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    newUsersToday: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    averageOrderValue: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/dashboard/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStats(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch admin statistics"
      );
      console.error("Error fetching admin stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

/**
 * Hook for managing users (Admin)
 */
export const useAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          params.append(key, value);
        }
      });

      let url = `${process.env.REACT_APP_API_BASE_URL}/api/admin/users`;
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = response.data.$values || response.data || [];
      setUsers(userData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/roles`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const rolesData = response.data.$values || response.data || [];
      setRoles(rolesData);
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  }, []);

  const updateUser = useCallback(async (userId, userData) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/users/${userId}`,
        userData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedUser = response.data;
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? updatedUser : user))
      );

      return updatedUser;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update user";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUsers((prev) => prev.filter((user) => user.id !== userId));
      return true;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete user";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/users`,
        userData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newUser = response.data;
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to create user";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  return {
    users,
    roles,
    loading,
    error,
    fetchUsers,
    updateUser,
    deleteUser,
    createUser,
  };
};

/**
 * Hook for managing products (Admin)
 */
export const useAdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          params.append(key, value);
        }
      });

      let url = `${process.env.REACT_APP_API_BASE_URL}/api/admin/products`;
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const productsData = response.data.$values || response.data || [];
      setProducts(productsData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch products");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const [categoriesRes, brandsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/brands`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setCategories(categoriesRes.data.$values || categoriesRes.data || []);
      setBrands(brandsRes.data.$values || brandsRes.data || []);
    } catch (err) {
      console.error("Error fetching product data:", err);
    }
  }, []);

  const createProduct = useCallback(async (productData) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/products`,
        productData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newProduct = response.data;
      setProducts((prev) => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to create product";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (productId, productData) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/products/${productId}`,
        productData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedProduct = response.data;
      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId ? updatedProduct : product
        )
      );

      return updatedProduct;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update product";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (productId) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/products/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProducts((prev) => prev.filter((product) => product.id !== productId));
      return true;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete product";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchProductData();
  }, [fetchProducts, fetchProductData]);

  return {
    products,
    categories,
    brands,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};

/**
 * Hook for managing categories (Admin)
 */
export const useAdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/categories`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const categoriesData = response.data.$values || response.data || [];
      setCategories(categoriesData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch categories");
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (categoryData) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/categories`,
        categoryData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newCategory = response.data;
      setCategories((prev) => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to create category";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (categoryId, categoryData) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/categories/${categoryId}`,
        categoryData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedCategory = response.data;
      setCategories((prev) =>
        prev.map((category) =>
          category.id === categoryId ? updatedCategory : category
        )
      );

      return updatedCategory;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update category";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (categoryId) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/categories/${categoryId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCategories((prev) =>
        prev.filter((category) => category.id !== categoryId)
      );
      return true;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete category";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};

/**
 * Hook for admin analytics
 */
export const useAdminAnalytics = (timeRange = "month") => {
  const [analyticsData, setAnalyticsData] = useState({
    revenue: [],
    orders: [],
    users: [],
    products: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/analytics`,
        {
          params: { range: timeRange },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAnalyticsData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch analytics data");
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analyticsData,
    loading,
    error,
    refetch: fetchAnalytics,
  };
};
