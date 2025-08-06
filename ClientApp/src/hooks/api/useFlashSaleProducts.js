import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const useFlashSaleProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Corrected endpoint to fetch actual flash sale products
        const response = await axios.get(`${API_BASE_URL}/api/Products/flash-sale`);
        // The response from this endpoint is a simple array of ProductDto
        setProducts(response.data || []);
      } catch (error) {
        setError("Không thể tải sản phẩm: " + error.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return { products, loading, error };
};
