import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
export const useBannerData = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/Banner`);
        setBanners(response.data);
      } catch (err) {
        console.error("Error fetching banner data:", err)
        setError("Không thể tải dữ liệu của banner.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { banners, loading, error };
};