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
    // Chỉ fetch khi drawer được mở lần đầu hoặc khi drawerOpen thay đổi từ false sang true
    // để tránh fetch liên tục nếu component cha re-render mà drawer vẫn đang đóng.
    // Hoặc đơn giản là fetch mỗi khi drawerOpen là true.
    if (drawerOpen) {
      fetchBrands();
    }
  }, [drawerOpen, fetchBrands]); // Thêm drawerOpen vào dependencies

  const handleConfirmDelete = async () => {
    if (!brandToDelete) return;
    setLoading(true); // Bắt đầu loading cho thao tác xoá
    try {
      await axios.delete(`${API_URL}/${brandToDelete.id}`);
      await fetchBrands(); // Tải lại danh sách sau khi xóa
      setDeleteDialogOpen(false);
      setBrandToDelete(null);
      // Thông báo thành công (có thể dùng snackbar như ví dụ trước)
    } catch (err) {
      console.error("Failed to delete brand:", err);
      setError("Xóa thương hiệu thất bại. Vui lòng thử lại.");
      // Thông báo lỗi
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  const handleOpenModal = (brand = null) => {
    setSelectedBrand(brand);
    setModalOpen(true);
  };

  const handleCloseModal = (shouldRefresh = false) => {
    setModalOpen(false);
    setSelectedBrand(null); // Reset selectedBrand khi đóng modal
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
    // Không reset brandToDelete ở đây để Dialog vẫn có thể hiển thị tên brand khi đóng
    // Nó sẽ được reset trong handleConfirmDelete hoặc khi mở dialog cho brand khác
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
      fetchBrands, // Có thể cần gọi lại từ UI nếu có nút refresh riêng
      handleOpenModal,
      handleCloseModal,
      handleOpenDeleteDialog,
      handleCloseDeleteDialog,
      handleConfirmDelete,
      clearError: () => setError(null) // Cho phép UI clear lỗi
    }
  };
};