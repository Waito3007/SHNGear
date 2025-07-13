import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

const API_BASE_URL_SPECS = `${process.env.REACT_APP_API_BASE_URL}/api/Specifications`;
const CATEGORY_ENDPOINTS = {
  1: "PhoneSpecifications",
  2: "LaptopSpecifications",
  3: "HeadphoneSpecifications"
};

const getInitialFormData = (fields) => {
  return fields.reduce((acc, field) => {
    acc[field.name] = field.type === 'checkbox' ? false : '';
    return acc;
  }, {});
};

export const useSpecificationForm = (product, open, formFields, onClose) => {
  const [specification, setSpecification] = useState(null);
  const [formData, setFormData] = useState(() => getInitialFormData(formFields));
  const [loadingState, setLoadingState] = useState({
    fetch: false,
    submit: false,
    delete: false
  });
  const [snackbarState, setSnackbarState] = useState({ open: false, message: '', severity: 'info' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const endpoint = useMemo(() => {
    return product?.categoryId ? CATEGORY_ENDPOINTS[product.categoryId] : null;
  }, [product?.categoryId]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarState({ open: true, message, severity });
  };

  const resetComponentState = useCallback(() => {
    setSpecification(null);
    setFormData(getInitialFormData(formFields));
    setDeleteDialogOpen(false);
  }, [formFields]);

  const fetchSpecification = useCallback(async () => {
    if (!endpoint || !product?.id) {
      setSpecification(null);
      setFormData(getInitialFormData(formFields));
      return;
    }
    setLoadingState(prev => ({ ...prev, fetch: true }));
    try {
      const response = await axios.get(
        `${API_BASE_URL_SPECS}/${endpoint}/product/${product.id}`
      );
      if (response.data && Object.keys(response.data).length > 0) {
        setSpecification(response.data);
        setFormData(response.data);
      } else {
        setSpecification(null);
        setFormData(getInitialFormData(formFields));
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setSpecification(null);
        setFormData(getInitialFormData(formFields));
      } else {
        console.error("Lỗi khi tải thông số kỹ thuật:", error);
        showSnackbar(error.response?.data?.message || error.message || "Không thể tải thông số kỹ thuật.", "error");
      }
    } finally {
      setLoadingState(prev => ({ ...prev, fetch: false }));
    }
  }, [endpoint, product?.id, formFields]);

  const handleSubmit = useCallback(async (event) => {
    if (event) event.preventDefault();
    if (!endpoint || !product?.id) {
      showSnackbar("Không thể lưu: Thiếu thông tin sản phẩm hoặc danh mục.", "error");
      return;
    }
    setLoadingState(prev => ({ ...prev, submit: true }));
    const payload = { ...formData, productId: product.id };
    formFields.forEach(field => {
      if (field.type === 'number') {
        const val = formData[field.name];
        if (val === '' || val === null || isNaN(parseFloat(String(val)))) {
          payload[field.name] = null;
        } else {
          payload[field.name] = parseFloat(String(val));
        }
      }
    });
    const url = `${API_BASE_URL_SPECS}/${endpoint}`;
    try {
      let successMessage = "";
      if (specification?.id) {
        await axios.put(`${url}/${specification.id}`, payload);
        successMessage = 'Cập nhật thông số thành công!';
        fetchSpecification();
      } else {
        const postResponse = await axios.post(url, payload);
        successMessage = 'Thêm thông số thành công!';
        if (postResponse.data && Object.keys(postResponse.data).length > 0) {
          setSpecification(postResponse.data);
          setFormData(postResponse.data);
        } else {
          fetchSpecification();
        }
      }
      showSnackbar(successMessage, "success");
    } catch (error) {
      console.error("Lỗi khi lưu thông số:", error);
      const errorData = error.response?.data;
      let errorMsg = "Đã xảy ra lỗi khi lưu thông số.";
      if (typeof errorData === 'string') {
        errorMsg = errorData;
      } else if (errorData?.message) {
        errorMsg = errorData.message;
      } else if (errorData?.errors && typeof errorData.errors === 'object') {
        errorMsg = Object.values(errorData.errors).flat().join('; ');
      } else if (errorData?.title) {
        errorMsg = errorData.title;
      }
      showSnackbar(errorMsg, "error");
    } finally {
      setLoadingState(prev => ({ ...prev, submit: false }));
    }
  }, [endpoint, product?.id, formData, specification, formFields, fetchSpecification]);

  const handleDelete = useCallback(async () => {
    if (!endpoint || !specification?.id) return;
    setLoadingState(prev => ({ ...prev, delete: true }));
    try {
      await axios.delete(`${API_BASE_URL_SPECS}/${endpoint}/${specification.id}`);
      showSnackbar("Xóa thông số thành công!");
      setDeleteDialogOpen(false);
      resetComponentState();
      if (onClose) onClose(true);
    } catch (error) {
      console.error("Lỗi khi xóa thông số:", error);
      showSnackbar(error.response?.data?.message || error.message || "Không thể xóa thông số.", "error");
    } finally {
      setLoadingState(prev => ({ ...prev, delete: false }));
    }
  }, [endpoint, specification?.id, resetComponentState, onClose]);

  useEffect(() => {
    if (open && product) {
      fetchSpecification();
    } else if (!open) {
      resetComponentState();
    }
  }, [open, product, fetchSpecification, resetComponentState]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleDeleteClick = useCallback(() => {
    if (specification?.id) {
      setDeleteDialogOpen(true);
    }
  }, [specification]);

  const handleCloseDeleteDialog = () => {
    if (!loadingState.delete) {
      setDeleteDialogOpen(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarState(prev => ({ ...prev, open: false }));
  };

  const anyLoading = loadingState.fetch || loadingState.submit || loadingState.delete;
  const canSubmit = !!(product?.id && endpoint);
  const showInitialLoadSpinner = loadingState.fetch && !specification?.id && open;
  const showRefetchProgressBar = loadingState.fetch && !!specification?.id && open;

  return {
    specification,
    formData,
    loadingState,
    snackbarState,
    deleteDialogOpen,
    endpoint,
    anyLoading,
    canSubmit,
    showInitialLoadSpinner,
    showRefetchProgressBar,
    actions: {
      handleSubmit,
      handleDelete,
      handleInputChange,
      handleDeleteClick,
      handleCloseDeleteDialog,
      handleCloseSnackbar,
      showSnackbar
    }
  };
};
