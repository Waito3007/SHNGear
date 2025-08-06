import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const useProductData = () => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/categories`),
          axios.get(`${API_BASE_URL}/api/brands`),
        ]);
        setCategories(categoriesRes.data.$values || categoriesRes.data || []);
        setBrands(brandsRes.data.$values || brandsRes.data || []);
      } catch (err) {
        console.error("Error fetching product data:", err);
        setError("Không thể tải dữ liệu cho danh mục hoặc thương hiệu.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { categories, brands, loading, error };
};
