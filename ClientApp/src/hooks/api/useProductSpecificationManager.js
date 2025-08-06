import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

const API_BASE_URL_SPECS = `${process.env.REACT_APP_API_BASE_URL}/api/Specifications`;

export const useSpecificationForm = (product, open, onClose) => {
  const [specifications, setSpecifications] = useState([]); // Now an array
  const [loadingState, setLoadingState] = useState({
    fetch: false,
    submit: false,
    delete: false
  });
  const [snackbarState, setSnackbarState] = useState({ open: false, message: '', severity: 'info' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [specToDelete, setSpecToDelete] = useState(null); // To store the specific spec to delete

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarState({ open: true, message, severity });
  };

  const resetComponentState = useCallback(() => {
    setSpecifications([]);
    setDeleteDialogOpen(false);
    setSpecToDelete(null);
  }, []);

  const fetchSpecifications = useCallback(async () => {
    if (!product?.id) {
      setSpecifications([]);
      return;
    }
    setLoadingState(prev => ({ ...prev, fetch: true }));
    try {
      const response = await axios.get(`${API_BASE_URL_SPECS}/product/${product.id}`);
      setSpecifications(response.data.$values || response.data || []);
    } catch (error) {
      console.error("Lỗi khi tải thông số kỹ thuật:", error);
      showSnackbar(error.response?.data?.message || error.message || "Không thể tải thông số kỹ thuật.", "error");
      setSpecifications([]);
    } finally {
      setLoadingState(prev => ({ ...prev, fetch: false }));
    }
  }, [product?.id]);

  const handleAddOrUpdateSpecification = useCallback(async (specData) => {
    if (!product?.id) {
      showSnackbar("Không thể lưu: Thiếu thông tin sản phẩm.", "error");
      return;
    }
    setLoadingState(prev => ({ ...prev, submit: true }));
    const payload = { ...specData, productId: product.id };

    try {
      let successMessage = "";
      if (specData.id) { // Update existing specification
        await axios.put(`${API_BASE_URL_SPECS}/${specData.id}`, payload);
        successMessage = 'Cập nhật thông số thành công!';
      } else { // Add new specification
        const postResponse = await axios.post(API_BASE_URL_SPECS, payload);
        successMessage = 'Thêm thông số thành công!';
      }
      showSnackbar(successMessage, "success");
      fetchSpecifications(); // Re-fetch to update the list
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
  }, [product?.id, fetchSpecifications]);

  const handleDeleteSpecification = useCallback(async () => {
    if (!specToDelete) return;
    setLoadingState(prev => ({ ...prev, delete: true }));
    try {
      await axios.delete(`${API_BASE_URL_SPECS}/${specToDelete.id}`);
      showSnackbar("Thông số kỹ thuật đã được xóa thành công!", "success");
      setDeleteDialogOpen(false);
      setSpecToDelete(null);
      fetchSpecifications(); // Re-fetch to update the list
    } catch (error) {
      console.error("Lỗi khi xóa thông số:", error);
      showSnackbar(error.response?.data?.message || error.message || "Không thể xóa thông số kỹ thuật.", "error");
    } finally {
      setLoadingState(prev => ({ ...prev, delete: false }));
    }
  }, [specToDelete, fetchSpecifications]);

  useEffect(() => {
    if (open && product) {
      fetchSpecifications();
    } else if (!open) {
      resetComponentState();
    }
  }, [open, product, fetchSpecifications, resetComponentState]);

  const handleDeleteClick = useCallback((spec) => {
    setSpecToDelete(spec);
    setDeleteDialogOpen(true);
  }, []);

  const handleCloseDeleteDialog = () => {
    if (!loadingState.delete) {
      setDeleteDialogOpen(false);
      setSpecToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarState(prev => ({ ...prev, open: false }));
  };

  const anyLoading = loadingState.fetch || loadingState.submit || loadingState.delete;
  const showInitialLoadSpinner = loadingState.fetch && specifications.length === 0 && open;
  const showRefetchProgressBar = loadingState.fetch && specifications.length > 0 && open;

  return {
    specifications,
    loadingState,
    snackbarState,
    deleteDialogOpen,
    specToDelete,
    anyLoading,
    showInitialLoadSpinner,
    showRefetchProgressBar,
    actions: {
      handleAddOrUpdateSpecification,
      handleDeleteSpecification,
      handleDeleteClick,
      handleCloseDeleteDialog,
      handleCloseSnackbar,
      showSnackbar
    }
  };
};
