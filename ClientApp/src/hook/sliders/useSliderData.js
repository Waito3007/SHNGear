import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
export const useSliderData = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/Slider`);
        setSliders(response.data);
      } catch (err) {
        console.error("Error fetching slider data:", err)
        setError("Không thể tải dữ liệu của slider.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { sliders, loading, error };
};