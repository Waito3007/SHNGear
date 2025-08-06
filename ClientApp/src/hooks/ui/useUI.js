import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook for debouncing values
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for managing loading states
 */
export const useLoading = (initialState = {}) => {
  const [loadingStates, setLoadingStates] = useState(initialState);

  const setLoading = useCallback((key, isLoading) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: isLoading,
    }));
  }, []);

  const isLoading = useCallback(
    (key) => {
      return !!loadingStates[key];
    },
    [loadingStates]
  );

  const resetLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  return {
    loadingStates,
    setLoading,
    isLoading,
    resetLoading,
  };
};

/**
 * Hook for managing notification/toast states
 */
export const useNotification = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback(
    (message, type = "info", duration = 3000, title = "") => {
      setNotification({ message, type, title });

      if (duration > 0) {
        setTimeout(() => {
          setNotification(null);
        }, duration);
      }
    },
    []
  );

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const showSuccess = useCallback(
    (message, title = "Success") => {
      showNotification(message, "success", 3000, title);
    },
    [showNotification]
  );

  const showError = useCallback(
    (message, title = "Error") => {
      showNotification(message, "error", 5000, title);
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message, title = "Warning") => {
      showNotification(message, "warning", 4000, title);
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message, title = "Info") => {
      showNotification(message, "info", 3000, title);
    },
    [showNotification]
  );

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

/**
 * Hook for managing modal states
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};

/**
 * Hook for managing pagination
 */
export const usePagination = (totalItems, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const goToPage = useCallback(
    (page) => {
      const newPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(newPage);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const canGoNext = currentPage < totalPages;
  const canGoPrev = currentPage > 1;

  // Reset to page 1 when total items change significantly
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    itemsPerPage,
    canGoNext,
    canGoPrev,
    goToPage,
    nextPage,
    prevPage,
    setCurrentPage,
  };
};

/**
 * Hook for managing form state
 */
export const useForm = (initialValues = {}, validate) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback(
    (name, value) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [errors]
  );

  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched((prev) => ({ ...prev, [name]: isTouched }));
  }, []);

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      setValue(name, type === "checkbox" ? checked : value);
    },
    [setValue]
  );

  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      setFieldTouched(name, true);

      if (validate) {
        const fieldErrors = validate({ ...values, [name]: values[name] });
        if (fieldErrors[name]) {
          setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
        }
      }
    },
    [values, validate, setFieldTouched]
  );

  const validateForm = useCallback(() => {
    if (!validate) return {};

    const formErrors = validate(values);
    setErrors(formErrors);
    return formErrors;
  }, [values, validate]);

  const resetForm = useCallback(
    (newValues = initialValues) => {
      setValues(newValues);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
    },
    [initialValues]
  );

  const handleSubmit = useCallback(
    (onSubmit) => {
      return async (e) => {
        if (e) {
          e.preventDefault();
        }

        setIsSubmitting(true);

        const formErrors = validateForm();
        const hasErrors = Object.keys(formErrors).length > 0;

        if (!hasErrors) {
          try {
            await onSubmit(values);
          } catch (error) {
            console.error("Form submission error:", error);
          }
        } else {
          // Mark all fields as touched to show errors
          const allTouched = Object.keys(values).reduce((acc, key) => {
            acc[key] = true;
            return acc;
          }, {});
          setTouched(allTouched);
        }

        setIsSubmitting(false);
      };
    },
    [values, validateForm]
  );

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setValue,
    setFieldTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    validateForm,
  };
};

/**
 * Hook for managing filters
 */
export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const removeFilter = useCallback((key) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const hasActiveFilters = useCallback(() => {
    return Object.keys(filters).some((key) => {
      const value = filters[key];
      return (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        (Array.isArray(value) ? value.length > 0 : true)
      );
    });
  }, [filters]);

  return {
    filters,
    setFilter,
    removeFilter,
    clearFilters,
    hasActiveFilters: hasActiveFilters(),
  };
};

/**
 * Hook for handling click outside
 */
export const useClickOutside = (callback) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [callback]);

  return ref;
};

/**
 * Hook for managing scroll position
 */
export const useScroll = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const updatePosition = () => {
      setScrollPosition(window.pageYOffset);
    };

    window.addEventListener("scroll", updatePosition);
    updatePosition();

    return () => window.removeEventListener("scroll", updatePosition);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const scrollToElement = useCallback((elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return {
    scrollPosition,
    scrollToTop,
    scrollToElement,
  };
};

/**
 * Hook for managing local storage
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        setStoredValue(value);
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};
