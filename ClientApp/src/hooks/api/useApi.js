import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * Base API hook for common API operations
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Configuration options
 * @returns {Object} - API state and functions
 */
export const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    immediate = true,
    defaultValue = null,
    transform = (data) => data,
    onSuccess,
    onError,
  } = options;

  const execute = useCallback(
    async (config = {}) => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios({
          url: `${API_BASE_URL}${endpoint}`,
          method: "GET",
          ...config,
        });

        const transformedData = transform(response.data);
        setData(transformedData);

        if (onSuccess) onSuccess(transformedData);

        return transformedData;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || "An error occurred";
        setError(errorMessage);

        if (onError) onError(err);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, transform, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(defaultValue);
    setError(null);
    setLoading(false);
  }, [defaultValue]);

  useEffect(() => {
    if (immediate && endpoint) {
      execute();
    }
  }, [execute, immediate, endpoint]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
  };
};

/**
 * Hook for POST requests
 */
export const usePost = (endpoint, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (data, config = {}) => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.post(
          `${API_BASE_URL}${endpoint}`,
          data,
          config
        );

        if (options.onSuccess) options.onSuccess(response.data);

        return response.data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || "An error occurred";
        setError(errorMessage);

        if (options.onError) options.onError(err);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, options]
  );

  return {
    execute,
    loading,
    error,
    setError,
  };
};

/**
 * Hook for PUT requests
 */
export const usePut = (endpoint, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (data, config = {}) => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.put(
          `${API_BASE_URL}${endpoint}`,
          data,
          config
        );

        if (options.onSuccess) options.onSuccess(response.data);

        return response.data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || "An error occurred";
        setError(errorMessage);

        if (options.onError) options.onError(err);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, options]
  );

  return {
    execute,
    loading,
    error,
    setError,
  };
};

/**
 * Hook for DELETE requests
 */
export const useDelete = (options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (endpoint, config = {}) => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.delete(
          `${API_BASE_URL}${endpoint}`,
          config
        );

        if (options.onSuccess) options.onSuccess(response.data);

        return response.data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || "An error occurred";
        setError(errorMessage);

        if (options.onError) options.onError(err);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  return {
    execute,
    loading,
    error,
    setError,
  };
};

export default useApi;
