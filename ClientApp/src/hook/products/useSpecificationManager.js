import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

// Constants (có thể chuyển ra file riêng nếu dùng ở nhiều nơi)
const API_BASE_URL_SPECS = `${process.env.REACT_APP_API_BASE_URL}/api/Specifications`;
const CATEGORY_ENDPOINTS = {
  1: "PhoneSpecifications",
  2: "LaptopSpecifications",
  3: "HeadphoneSpecifications"
};

// Hàm khởi tạo form data (giữ lại ở đây hoặc trong hook đều được)
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
    // Không reset snackbar ở đây để nó có thể hiển thị sau khi đóng drawer
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
        fetchSpecification(); // Refetch để cập nhật UI với data mới nhất
      } else {
        const postResponse = await axios.post(url, payload);
        successMessage = 'Thêm thông số thành công!';
        if (postResponse.data && Object.keys(postResponse.data).length > 0) {
          setSpecification(postResponse.data);
          setFormData(postResponse.data);
        } else {
          fetchSpecification(); // Fetch nếu API không trả về data mới
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
      resetComponentState(); // Reset state sau khi xóa
      // Cân nhắc gọi fetchSpecification ở đây nếu muốn load lại (mặc dù đã reset)
      // hoặc đảm bảo drawer đóng và refresh danh sách bên ngoài
      if (onClose) onClose(true); // Truyền true để báo hiệu có thay đổi cần refresh
    } catch (error) {
      console.error("Lỗi khi xóa thông số:", error);
      showSnackbar(error.response?.data?.message || error.message || "Không thể xóa thông số.", "error");
    } finally {
      setLoadingState(prev => ({ ...prev, delete: false }));
    }
  }, [endpoint, specification?.id, resetComponentState, onClose]);


  useEffect(() => {
    if (open && product) {
      // Chỉ fetch khi drawer được mở và có product
      // Việc reset formData về initial sẽ được fetchSpecification xử lý nếu không tìm thấy data
      fetchSpecification();
    } else if (!open) {
      // Khi drawer đóng, reset tất cả state liên quan đến form này
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
  const showInitialLoadSpinner = loadingState.fetch && !specification?.id && open; // Chỉ show khi đang fetch và chưa có spec và drawer mở
  const showRefetchProgressBar = loadingState.fetch && !!specification?.id && open; // Chỉ show khi đang refetch và drawer mở


  return {
    specification,
    formData,
    loadingState,
    snackbarState,
    deleteDialogOpen,
    endpoint, // UI cần endpoint để quyết định hiển thị một số thứ
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
      showSnackbar // Có thể cần từ UI
    }
  };
};