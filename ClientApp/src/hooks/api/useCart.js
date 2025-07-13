import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

/**
 * Hook for managing shopping cart
 */
export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Get user ID from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const id = parseInt(decoded.sub, 10);
        if (Number.isInteger(id)) {
          setUserId(id);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  // Fetch cart items
  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setError(null);

    try {
      let items = [];

      if (token && userId) {
        // Fetch from API for logged-in users
        const [apiResponse, sessionCart] = await Promise.all([
          axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/api/Cart?userId=${userId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          sessionStorage.getItem("cart"),
        ]);

        const apiItems = apiResponse.data?.$values || apiResponse.data || [];
        const sessionItems = sessionCart ? JSON.parse(sessionCart) : [];

        // Merge API items with session items
        const merged = [...apiItems];
        sessionItems.forEach((sessionItem) => {
          if (
            !merged.find(
              (item) => item.productVariantId === sessionItem.productVariantId
            )
          ) {
            merged.push(sessionItem);
          }
        });

        // Sync session items to database
        if (sessionItems.length > 0) {
          await Promise.all(
            sessionItems.map((item) =>
              axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/api/Cart`,
                {
                  userId,
                  productVariantId: item.productVariantId,
                  quantity: item.quantity,
                },
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              )
            )
          );
          sessionStorage.removeItem("cart");
        }

        items = merged;
      } else {
        // Get from session storage for guests
        const sessionCart = sessionStorage.getItem("cart");
        items = sessionCart ? JSON.parse(sessionCart) : [];
      }

      setCartItems(items);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Add item to cart
  const addToCart = useCallback(
    async (productVariantId, quantity = 1) => {
      const token = localStorage.getItem("token");
      setLoading(true);
      setError(null);

      try {
        if (token && userId) {
          // Add to database for logged-in users
          await axios.post(
            `${process.env.REACT_APP_API_BASE_URL}/api/Cart`,
            {
              userId,
              productVariantId,
              quantity,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        } else {
          // Add to session storage for guests
          const sessionCart = JSON.parse(
            sessionStorage.getItem("cart") || "[]"
          );
          const existingItem = sessionCart.find(
            (item) => item.productVariantId === productVariantId
          );

          if (existingItem) {
            existingItem.quantity += quantity;
          } else {
            sessionCart.push({ productVariantId, quantity });
          }

          sessionStorage.setItem("cart", JSON.stringify(sessionCart));
        }

        // Refresh cart
        await fetchCart();
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId, fetchCart]
  );

  // Update item quantity
  const updateQuantity = useCallback(
    async (productVariantId, quantity) => {
      const token = localStorage.getItem("token");
      setLoading(true);
      setError(null);

      try {
        if (quantity <= 0) {
          // Remove item if quantity is 0
          await removeFromCart(productVariantId);
          return;
        }

        if (token && userId) {
          // Update in database for logged-in users
          await axios.put(
            `${process.env.REACT_APP_API_BASE_URL}/api/Cart/update`,
            {
              userId,
              productVariantId,
              quantity,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        } else {
          // Update in session storage for guests
          const sessionCart = JSON.parse(
            sessionStorage.getItem("cart") || "[]"
          );
          const itemIndex = sessionCart.findIndex(
            (item) => item.productVariantId === productVariantId
          );

          if (itemIndex !== -1) {
            sessionCart[itemIndex].quantity = quantity;
            sessionStorage.setItem("cart", JSON.stringify(sessionCart));
          }
        }

        // Refresh cart
        await fetchCart();
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId, fetchCart]
  );

  // Remove item from cart
  const removeFromCart = useCallback(
    async (productVariantId) => {
      const token = localStorage.getItem("token");
      setLoading(true);
      setError(null);

      try {
        if (token && userId) {
          // Remove from database for logged-in users
          await axios.delete(
            `${process.env.REACT_APP_API_BASE_URL}/api/Cart/${userId}/${productVariantId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        } else {
          // Remove from session storage for guests
          const sessionCart = JSON.parse(
            sessionStorage.getItem("cart") || "[]"
          );
          const updatedCart = sessionCart.filter(
            (item) => item.productVariantId !== productVariantId
          );
          sessionStorage.setItem("cart", JSON.stringify(updatedCart));
        }

        // Refresh cart
        await fetchCart();
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId, fetchCart]
  );

  // Clear entire cart
  const clearCart = useCallback(async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setError(null);

    try {
      if (token && userId) {
        // Clear from database for logged-in users
        await axios.delete(
          `${process.env.REACT_APP_API_BASE_URL}/api/Cart/clear/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        // Clear session storage for guests
        sessionStorage.removeItem("cart");
      }

      setCartItems([]);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Calculate cart totals
  const getCartTotals = useCallback(() => {
    const subtotal = cartItems.reduce((total, item) => {
      const price = item.discountPrice || item.price || 0;
      return total + price * item.quantity;
    }, 0);

    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    return {
      subtotal,
      tax,
      total,
      itemCount: cartItems.reduce((count, item) => count + item.quantity, 0),
    };
  }, [cartItems]);

  // Initialize cart on mount
  useEffect(() => {
    if (userId !== null) {
      fetchCart();
    }
  }, [userId, fetchCart]);

  return {
    cartItems,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
    ...getCartTotals(),
  };
};

/**
 * Hook for managing vouchers
 */
export const useVoucher = () => {
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const applyVoucher = useCallback(async (voucherCode) => {
    if (!voucherCode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/vouchers/apply`,
        { code: voucherCode }
      );

      const voucher = response.data;
      setAppliedVoucher(voucher);
      return voucher;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Invalid voucher code";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeVoucher = useCallback(() => {
    setAppliedVoucher(null);
    setError(null);
  }, []);

  const calculateDiscount = useCallback(
    (subtotal) => {
      if (!appliedVoucher) return 0;

      if (appliedVoucher.discountType === "percentage") {
        return (subtotal * appliedVoucher.discountAmount) / 100;
      } else {
        return Math.min(appliedVoucher.discountAmount, subtotal);
      }
    },
    [appliedVoucher]
  );

  return {
    appliedVoucher,
    loading,
    error,
    applyVoucher,
    removeVoucher,
    calculateDiscount,
  };
};
