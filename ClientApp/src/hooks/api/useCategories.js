import { useState, useEffect } from "react";
import axios from "axios";

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/categories`);
        const data = response.data;
        const categoriesArray = Array.isArray(data.$values)
          ? data.$values
          : Array.isArray(data)
          ? data
          : [];
        setCategories(categoriesArray);
      } catch (error) {
        setError("Không thể tải danh mục: " + error.message);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return { categories, loading, error };
};
