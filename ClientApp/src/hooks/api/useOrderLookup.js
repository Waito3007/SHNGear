import { useState, useCallback } from "react";
import axios from "axios";

export const useOrderLookup = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchOrdersByPhone = useCallback(async (phoneNumber) => {
    if (!phoneNumber.trim()) {
      setError("Vui lòng nhập số điện thoại");
      setOrders([]);
      return;
    }
    setLoading(true);
    setError(null);
    setOrders([]);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/orders/by-phone/${phoneNumber}`
      );
      if (response.data && Array.isArray(response.data)) {
        if (response.data.length > 0) {
          setOrders(response.data);
        } else {
          setError("Không tìm thấy đơn hàng nào với số điện thoại này");
        }
      } else {
        setError("Dữ liệu trả về không hợp lệ");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Lỗi khi tra cứu đơn hàng. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return { orders, loading, error, searchOrdersByPhone };
};
