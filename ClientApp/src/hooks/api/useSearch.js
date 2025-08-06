import { useState, useCallback } from "react";
import axios from "axios";

export const useSearch = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (query, limit = 5) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/search`,
        {
          params: { query, limit },
        }
      );
      setResults(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Search failed");
      setResults({ products: [], categories: [], brands: [], totalResults: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
};
