import { useState } from "react";
import axios from "axios";

export const usePaymentMethod = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const addPaymentMethod = async (name, description) => {
    setLoading(true);
    setError(null);
    setMessage("");
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/PaymentMethod`,
        { name, description }
      );
      setMessage(`Thêm thành công: ${response.data.name}`);
      return response.data;
    } catch (err) {
      setError("Lỗi: " + err.message);
      setMessage("Lỗi: " + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { addPaymentMethod, loading, error, message, setMessage };
};
