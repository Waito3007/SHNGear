import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

/**
 * Hook for managing user addresses
 */
export const useAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Get user ID from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const id = parseInt(decoded.sub, 10);
        if (Number.isInteger(id)) {
          setUserId(id);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const fetchAddresses = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/addresses/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const addressData = response.data.$values || response.data || [];
      setAddresses(addressData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch addresses");
      console.error("Error fetching addresses:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addAddress = useCallback(
    async (addressData) => {
      if (!userId) throw new Error("User not authenticated");

      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/addresses`,
          {
            ...addressData,
            userId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const newAddress = response.data;
        setAddresses((prev) => [...prev, newAddress]);
        return newAddress;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to add address";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const updateAddress = useCallback(async (addressId, addressData) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/addresses/${addressId}`,
        addressData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedAddress = response.data;
      setAddresses((prev) =>
        prev.map((addr) => (addr.id === addressId ? updatedAddress : addr))
      );
      return updatedAddress;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update address";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAddress = useCallback(async (addressId) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/api/addresses/${addressId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
      return true;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete address";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const setDefaultAddress = useCallback(async (addressId) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/addresses/${addressId}/set-default`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state to reflect the change
      setAddresses((prev) =>
        prev.map((addr) => ({
          ...addr,
          isDefault: addr.id === addressId,
        }))
      );
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to set default address";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize addresses on mount
  useEffect(() => {
    if (userId) {
      fetchAddresses();
    }
  }, [userId, fetchAddresses]);

  // Get default address
  const defaultAddress =
    addresses.find((addr) => addr.isDefault) || addresses[0] || null;

  return {
    addresses,
    defaultAddress,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refetch: fetchAddresses,
  };
};

/**
 * Hook for address validation
 */
export const useAddressValidation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateAddress = useCallback(async (address) => {
    try {
      setLoading(true);
      setError(null);

      // Basic validation
      const errors = {};

      if (!address.fullName?.trim()) {
        errors.fullName = "Full name is required";
      }

      if (!address.phoneNumber?.trim()) {
        errors.phoneNumber = "Phone number is required";
      } else if (!/^[0-9+\-\s()]+$/.test(address.phoneNumber)) {
        errors.phoneNumber = "Invalid phone number format";
      }

      if (!address.addressLine1?.trim()) {
        errors.addressLine1 = "Address line 1 is required";
      }

      if (!address.city?.trim()) {
        errors.city = "City is required";
      }

      if (!address.state?.trim()) {
        errors.state = "State/Province is required";
      }

      if (!address.postalCode?.trim()) {
        errors.postalCode = "Postal code is required";
      }

      if (!address.country?.trim()) {
        errors.country = "Country is required";
      }

      if (Object.keys(errors).length > 0) {
        return { isValid: false, errors };
      }

      // Additional validation can be added here (e.g., API calls to validate postal codes)

      return { isValid: true, errors: {} };
    } catch (err) {
      setError("Address validation failed");
      return { isValid: false, errors: { general: "Validation failed" } };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    validateAddress,
    loading,
    error,
  };
};

/**
 * Hook for address autocomplete/suggestions
 */
export const useAddressSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getSuggestions = useCallback(async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // This would typically call a geocoding service like Google Maps API
      // For now, we'll return a mock response
      const mockSuggestions = [
        {
          id: 1,
          description: `${query} Street, Example City, Example State`,
          addressLine1: `${query} Street`,
          city: "Example City",
          state: "Example State",
          postalCode: "12345",
          country: "Vietnam",
        },
        {
          id: 2,
          description: `${query} Avenue, Another City, Example State`,
          addressLine1: `${query} Avenue`,
          city: "Another City",
          state: "Example State",
          postalCode: "67890",
          country: "Vietnam",
        },
      ];

      setSuggestions(mockSuggestions);
    } catch (err) {
      setError("Failed to fetch address suggestions");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    suggestions,
    loading,
    error,
    getSuggestions,
    clearSuggestions,
  };
};

/**
 * Hook for shipping calculations
 */
export const useShipping = () => {
  const [shippingOptions, setShippingOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateShipping = useCallback(async (address, items) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/shipping/calculate`,
        {
          address,
          items,
        }
      );

      const options = response.data || [];
      setShippingOptions(options);
      return options;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to calculate shipping";
      setError(errorMessage);
      setShippingOptions([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    shippingOptions,
    loading,
    error,
    calculateShipping,
  };
};
