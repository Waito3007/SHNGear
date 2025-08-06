import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

/**
 * Hook for managing orders
 */
export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Lấy userId từ token khi khởi tạo
  const initUserId = useCallback(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const id = decoded.sub;
        if (id) {
          setUserId(id);
          return id;
        }
      } catch (err) {
        setError("Lỗi khi giải mã token");
      }
    }
    return null;
  }, []);

  const fetchOrders = useCallback(
    async (id, page = 1, pageSize = 10) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/orders/user/${id}/paged`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { page, pageSize },
          }
        );
        setOrders(response.data.orders);
        return response.data.orders;
      } catch (err) {
        setError(err.response?.data?.message || "Không thể tải danh sách đơn hàng.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    orders,
    loading,
    error,
    userId,
    setUserId,
    initUserId,
    fetchOrders,
  };
};

/**
 * Hook for fetching a single order
 */
export const useOrder = (orderId) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/orders/${orderId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      setOrder(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch order");
      console.error("Error fetching order:", err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return {
    order,
    loading,
    error,
    refetch: fetchOrder,
  };
};

/**
 * Hook for creating orders
 */
export const useCreateOrder = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createOrder = useCallback(async (orderData) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/orders`,
        orderData,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to create order";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createOrder,
    loading,
    error,
  };
};

/**
 * Hook for updating order status
 */
export const useUpdateOrderStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateStatus = useCallback(async (orderId, status) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/orders/${orderId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update order status";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateStatus,
    loading,
    error,
  };
};

/**
 * Hook for order lookup by phone number
 */
export const useOrderLookup = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const lookupOrders = useCallback(async (phoneNumber) => {
    if (!phoneNumber.trim()) {
      setError("Please enter a phone number");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${
          process.env.REACT_APP_API_BASE_URL
        }/api/orders/lookup?phoneNumber=${encodeURIComponent(phoneNumber)}`
      );

      const ordersData = response.data.$values || response.data || [];
      setOrders(ordersData);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "No orders found for this phone number";
      setError(errorMessage);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setOrders([]);
    setError(null);
  }, []);

  return {
    orders,
    loading,
    error,
    lookupOrders,
    clearResults,
  };
};

/**
 * Hook for order statistics (Admin)
 */
export const useOrderStats = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async (timeRange = "all") => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/orders/stats?range=${timeRange}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStats(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch order statistics"
      );
      console.error("Error fetching order stats:", err);
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
 * Hook for sales data (Admin)
 */
export const useSalesData = (timeRange = "month") => {
  const [salesData, setSalesData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSalesData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/orders/dashboard/sales-overview`,
        {
          params: { range: timeRange },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSalesData(response.data.chartData || []);
      setSummary(response.data.summary || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch sales data");
      console.error("Error fetching sales data:", err);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  return {
    salesData,
    summary,
    loading,
    error,
    refetch: fetchSalesData,
  };
};

/**
 * Hook for sales by category data (Admin)
 */
export const useSalesByCategory = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategoryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/orders/sales-by-category`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCategoryData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch category sales data"
      );
      console.error("Error fetching category sales data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategoryData();
  }, [fetchCategoryData]);

  return {
    categoryData,
    loading,
    error,
    refetch: fetchCategoryData,
  };
};

/**
 * Hook for payment processing
 */
export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const processPayment = useCallback(async (paymentData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/payment/process`,
        paymentData
      );

      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Payment processing failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPayPalOrder = useCallback(async (orderData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/paypal/create-order`,
        orderData
      );

      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to create PayPal order";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const capturePayPalOrder = useCallback(async (orderId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/paypal/capture-order`,
        { orderId }
      );

      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to capture PayPal order";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    processPayment,
    createPayPalOrder,
    capturePayPalOrder,
  };
};
