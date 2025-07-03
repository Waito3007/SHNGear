import { useState, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Hook lấy trạng thái loyalty của user
export function useLoyaltyStatus() {
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);

  const fetchLoyaltyData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập để xem trạng thái thành viên");
        setLoading(false);
        return;
      }
      const decoded = jwtDecode(token);
      const id = parseInt(decoded.sub, 10);
      if (!Number.isInteger(id)) {
        setError("Token không hợp lệ");
        setLoading(false);
        return;
      }
      setUserId(id);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        setError("Token đã hết hạn, vui lòng đăng nhập lại");
        setLoading(false);
        return;
      }
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/loyalty/my-status?userId=${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLoyaltyData(response.data);
    } catch (err) {
      setError("Không thể tải thông tin chương trình khách hàng thân thiết");
    } finally {
      setLoading(false);
    }
  }, []);

  // fetch on mount
  useState(() => {
    fetchLoyaltyData();
  }, [fetchLoyaltyData]);

  return { loyaltyData, loading, error, userId, refetch: fetchLoyaltyData };
}

// Hook quay vòng quay may mắn
export function useSpinWheel(userId, onSuccess) {
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [error, setError] = useState("");

  const spin = useCallback(async () => {
    setSpinning(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/loyalty/spin-wheel?userId=${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSpinResult(response.data);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data || "Không thể quay vòng quay");
    } finally {
      setSpinning(false);
    }
  }, [userId, onSuccess]);

  return { spin, spinning, spinResult, error };
}
