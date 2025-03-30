import React, { useState, useEffect, useCallback, useMemo } from "react";
import { message } from 'antd';
import { 
  Drawer, Button, Box, Typography, IconButton, 
  TextField, FormControlLabel, Checkbox,
  CircularProgress, Alert, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle,
  Skeleton, Fade
} from "@mui/material";
import { X, Trash, Check, Plus } from "lucide-react";
import axios from "axios";

// Constants
const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api/Specifications`;
const CATEGORY_ENDPOINTS = {
  1: "PhoneSpecifications",
  2: "LaptopSpecifications",
  3: "HeadphoneSpecifications"
};

const CATEGORY_NAMES = {
  1: "Điện thoại",
  2: "Laptop",
  3: "Tai nghe"
};

const COMMON_FIELDS = [
  { name: "weight", label: "Trọng lượng" }
];

const CATEGORY_FIELDS = {
  1: [
    { name: "screenSize", label: "Kích thước màn hình" },
    { name: "resolution", label: "Độ phân giải" },
    { name: "screenType", label: "Loại màn hình" },
    { name: "cpuModel", label: "Model CPU" },
    { name: "cpuCores", label: "Số nhân CPU", type: "number" },
    { name: "ram", label: "RAM" },
    { name: "internalStorage", label: "Dung lượng lưu trữ" },
    { name: "frontCamera", label: "Camera trước" },
    { name: "rearCamera", label: "Camera sau" },
    { name: "batteryCapacity", label: "Dung lượng pin" },
    { name: "supportsNFC", label: "Hỗ trợ NFC", type: "checkbox" },
  ],
  2: [
    { name: "cpuType", label: "Loại CPU" },
    { name: "cpuNumberOfCores", label: "Số nhân CPU", type: "number" },
    { name: "ram", label: "RAM" },
    { name: "maxRAMSupport", label: "Hỗ trợ RAM tối đa" },
    { name: "ssdStorage", label: "Dung lượng SSD" },
    { name: "screenSize", label: "Kích thước màn hình" },
    { name: "resolution", label: "Độ phân giải" },
    { name: "refreshRate", label: "Tần số quét" },
    { name: "supportsTouch", label: "Hỗ trợ cảm ứng", type: "checkbox" },
  ],
  3: [
    { name: "type", label: "Loại tai nghe" },
    { name: "connectionType", label: "Loại kết nối" },
    { name: "port", label: "Cổng" },
  ]
};

const AddSpecificationDrawer = ({ open, onClose, product }) => {
  // State management
  const [specification, setSpecification] = useState(null);
  const [loadingState, setLoadingState] = useState({
    fetch: false,
    submit: false,
    delete: false
  });
  const [notification, setNotification] = useState({
    error: null,
    success: null
  });
  const [formData, setFormData] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [specToDelete, setSpecToDelete] = useState(null);

  // Memoized values
  const formFields = useMemo(() => {
    if (!product?.categoryId) return COMMON_FIELDS;
    return [...COMMON_FIELDS, ...(CATEGORY_FIELDS[product.categoryId] || [])];
  }, [product]);

  const endpoint = useMemo(() => {
    return product?.categoryId ? CATEGORY_ENDPOINTS[product.categoryId] : null;
  }, [product]);

  // API calls
  const fetchSpecification = useCallback(async () => {
    if (!endpoint || !product?.id) return;
    
    try {
      setLoadingState(prev => ({ ...prev, fetch: true }));
      setNotification({ error: null, success: null });

      const response = await axios.get(
        `${API_BASE_URL}/${endpoint}/product/${product.id}`
      );
      
      if (response.data) {
        setSpecification(response.data);
        setFormData(response.data);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Fetch specification failed:", error);
        setNotification(prev => ({
          ...prev,
          error: error.response?.data || "Không thể tải thông số kỹ thuật"
        }));
      }
    } finally {
      setLoadingState(prev => ({ ...prev, fetch: false }));
    }
  }, [endpoint, product]);


const handleSubmit = useCallback(async () => {
  if (!endpoint || !product?.id) return;

  try {
    setLoadingState(prev => ({ ...prev, submit: true }));
    setNotification({ error: null, success: null });

    const payload = { ...formData, productId: product.id };
    const url = `${API_BASE_URL}/${endpoint}`;

    if (specification) {
      await axios.put(`${url}/${specification.id}`, payload);
      message.success('Cập nhật thông số thành công!');
    } else {
      await axios.post(url, payload);
      message.success('Thêm thông số thành công!');
    }

    setTimeout(onClose, 2000);
  } catch (error) {
    console.error("Lưu thông số thất bại:", error);
    message.error(error.response?.data || "Đã xảy ra lỗi khi lưu thông số");
  } finally {
    setLoadingState(prev => ({ ...prev, submit: false }));
  }
}, [endpoint, formData, specification, product, onClose]);
  
  const handleDelete = useCallback(async () => {
    if (!endpoint || !specToDelete?.id) return;

    try {
      setLoadingState(prev => ({ ...prev, delete: true }));
      setNotification({ error: null, success: null });

      await axios.delete(`${API_BASE_URL}/${endpoint}/${specToDelete.id}`);
      setNotification({ success: "Xóa thông số thành công!", error: null });
      setDeleteDialogOpen(false);

      setTimeout(onClose, 2000);
    } catch (error) {
      console.error("Delete specification failed:", error);
      setNotification(prev => ({
        ...prev,
        error: "Không thể xóa thông số kỹ thuật"
      }));
    } finally {
      setLoadingState(prev => ({ ...prev, delete: false }));
    }
  }, [endpoint, specToDelete, onClose]);

  // Effects
  useEffect(() => {
    if (open && product) {
      fetchSpecification();
    } else {
      setSpecification(null);
      setFormData({});
      setNotification({ error: null, success: null });
    }
  }, [open, product, fetchSpecification]);

  // Event handlers
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleDeleteClick = useCallback(() => {
    setSpecToDelete(specification);
    setDeleteDialogOpen(true);
  }, [specification]);

  // Render helpers
  const renderFormFields = useCallback(() => (
    <Box sx={{ mt: 2 }}>
      {formFields.map((field) => (
        <Box key={field.name} sx={{ mb: 2 }}>
          {field.type === 'checkbox' ? (
            <FormControlLabel
              control={
                <Checkbox
                  name={field.name}
                  checked={formData[field.name] || false}
                  onChange={handleInputChange}
                />
              }
              label={field.label}
            />
          ) : (
            <TextField
              fullWidth
              label={field.label}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleInputChange}
              type={field.type || 'text'}
              variant="outlined"
              size="small"
            />
          )}
        </Box>
      ))}
    </Box>
  ), [formFields, formData, handleInputChange]);

  const renderProductInfo = useCallback(() => (
    product && (
      <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="subtitle1">
          <b>Sản phẩm:</b> {product.name}
        </Typography>
        <Typography variant="subtitle1">
          <b>Danh mục:</b> {CATEGORY_NAMES[product.categoryId] || 'Khác'}
        </Typography>
      </Box>
    )
  ), [product]);

  const renderSkeletonLoader = useCallback(() => (
    <Box sx={{ flexGrow: 1 }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} variant="rectangular" height={56} sx={{ mb: 2 }} />
      ))}
    </Box>
  ), []);

  return (
    <Drawer 
      anchor="right" 
      open={open} 
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 600 },
          boxSizing: 'border-box',
        }
      }}
    >
      <Box
        sx={{
          p: 3,
          bgcolor: "background.paper",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: 'auto'
        }}
      >
        {/* Header */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={3}
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            pb: 2
          }}
        >
          <Typography variant="h5" fontWeight="bold" color="primary">
            {specification ? "Thông số kỹ thuật" : "Thêm thông số kỹ thuật"}
          </Typography>
          <IconButton 
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            <X size={24} />
          </IconButton>
        </Box>

        {/* Loading state */}
        <Fade in={loadingState.fetch && !specification} unmountOnExit>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            flexGrow: 1,
            minHeight: '300px'
          }}>
            <CircularProgress color="primary" size={60} thickness={4} />
          </Box>
        </Fade>

        {!loadingState.fetch && (
          <>
            {/* Product info */}
            {renderProductInfo()}

            {/* Notifications */}
            <Box sx={{ my: 2 }}>
              {notification.error && (
                <Alert 
                  severity="error" 
                  onClose={() => setNotification(prev => ({ ...prev, error: null }))}
                  sx={{ mb: 2 }}
                >
                  {notification.error}
                </Alert>
              )}

              {notification.success && (
                <Alert 
                  severity="success" 
                  onClose={() => setNotification(prev => ({ ...prev, success: null }))}
                  sx={{ mb: 2 }}
                >
                  {notification.success}
                </Alert>
              )}
            </Box>

            {/* Form content */}
            <Box sx={{ flexGrow: 1 }}>
              {loadingState.fetch ? renderSkeletonLoader() : renderFormFields()}
            </Box>

            {/* Action buttons */}
            <Box 
              sx={{ 
                mt: 4,
                pt: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                gap: 2,
                justifyContent: 'flex-end'
              }}
            >
              {specification ? (
                <>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Trash />}
                    onClick={handleDeleteClick}
                    sx={{ mr: 'auto' }}
                  >
                    Xóa
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={loadingState.submit ? 
                      <CircularProgress size={20} color="inherit" /> : <Check />}
                    onClick={handleSubmit}
                    disabled={loadingState.submit}
                    sx={{
                      minWidth: '120px',
                      '& .MuiCircularProgress-root': { marginRight: '8px' }
                    }}
                  >
                    {loadingState.submit ? 'Đang xử lý...' : 'Cập nhật'}
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  startIcon={loadingState.submit ? 
                    <CircularProgress size={20} color="inherit" /> : <Plus />}
                  onClick={handleSubmit}
                  disabled={loadingState.submit}
                  fullWidth
                  size="large"
                  sx={{
                    '& .MuiCircularProgress-root': { marginRight: '8px' }
                  }}
                >
                  {loadingState.submit ? 'Đang thêm...' : 'Thêm thông số'}
                </Button>
              )}
            </Box>
          </>
        )}
      </Box>

      {/* Delete confirmation dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa thông số kỹ thuật cho sản phẩm này không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            color="inherit"
          >
            Hủy
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error"
            variant="contained"
            disabled={loadingState.delete}
            sx={{
              minWidth: '100px',
              '& .MuiCircularProgress-root': { color: 'white' }
            }}
          >
            {loadingState.delete ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Đang xóa...
              </>
            ) : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
};

export default AddSpecificationDrawer;