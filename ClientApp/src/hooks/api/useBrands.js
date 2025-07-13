import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api/brands`;

export const useBrands = (drawerOpen) => {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const [loading, setLoading] = useState(false); // Thêm state loading
  const [error, setError] = useState(null); // Thêm state error

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL);
      setBrands(response.data);
    } catch (err) {
      console.error("Failed to fetch brands:", err);
      setError("Không thể tải danh sách thương hiệu. Vui lòng thử lại.");
      // Có thể setBrands([]) ở đây nếu muốn clear data cũ khi lỗi
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (drawerOpen === undefined || drawerOpen) {
      fetchBrands();
    }
  }, [drawerOpen, fetchBrands]);

  const handleConfirmDelete = async () => {
    if (!brandToDelete) return;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/${brandToDelete.id}`);
      await fetchBrands();
      setDeleteDialogOpen(false);
      setBrandToDelete(null);
    } catch (err) {
      console.error("Failed to delete brand:", err);
      setError("Xóa thương hiệu thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (brand = null) => {
    setSelectedBrand(brand);
    setModalOpen(true);
  };

  const handleCloseModal = (shouldRefresh = false) => {
    setModalOpen(false);
    setSelectedBrand(null);
    if (shouldRefresh) {
      fetchBrands();
    }
  };

  const handleOpenDeleteDialog = (brand) => {
    setBrandToDelete(brand);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  return {
    brands,
    selectedBrand,
    modalOpen,
    deleteDialogOpen,
    brandToDelete,
    loading,
    error,
    actions: {
      fetchBrands,
      handleOpenModal,
      handleCloseModal,
      handleOpenDeleteDialog,
      handleCloseDeleteDialog,
      handleConfirmDelete,
      clearError: () => setError(null)
    }
  };
};
