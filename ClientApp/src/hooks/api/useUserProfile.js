import { useState, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const useUserProfile = () => {
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    role: "",
    phoneNumber: "",
    gender: "",
    dateOfBirth: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Lấy userId từ token khi khởi tạo
  const initUserId = useCallback(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const id = parseInt(decoded.sub, 10);
        if (Number.isInteger(id)) {
          setUserId(id);
          return id;
        }
      } catch (err) {
        setError("Lỗi khi giải mã token");
      }
    }
    return null;
  }, []);

  const fetchUserProfile = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi lấy thông tin user");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserProfile = useCallback(async (updatedUser) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/profile`,
        updatedUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(response.data.user);
      return response.data.user;
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    setUser,
    loading,
    error,
    userId,
    setUserId,
    initUserId,
    fetchUserProfile,
    updateUserProfile,
  };
};
