import React, { useState, useEffect, useCallback } from "react";
import { message } from 'antd';
import { 
  Drawer, Button, Box, Typography, IconButton, 
  TextField, CircularProgress, Alert, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle,
  Skeleton, Fade
} from "@mui/material";
import { X, Trash, Plus } from "lucide-react";
import axios from "axios";

// Constants
const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL || 'https://localhost:7107'}/api/ProductSpecifications`;

const CATEGORY_NAMES = {
  1: "Điện thoại",
  2: "Laptop", 
  3: "Tai nghe"
};

// Predefined specification templates for different categories
const SPECIFICATION_TEMPLATES = {
  1: [ // Phone
    { name: "Kích thước màn hình", unit: "inch", displayOrder: 1 },
    { name: "Độ phân giải", unit: "", displayOrder: 2 },
    { name: "Loại màn hình", unit: "", displayOrder: 3 },
    { name: "CPU", unit: "", displayOrder: 4 },
    { name: "Số nhân CPU", unit: "nhân", displayOrder: 5 },
    { name: "RAM", unit: "GB", displayOrder: 6 },
    { name: "Bộ nhớ trong", unit: "GB", displayOrder: 7 },
    { name: "Camera trước", unit: "MP", displayOrder: 8 },
    { name: "Camera sau", unit: "MP", displayOrder: 9 },
    { name: "Dung lượng pin", unit: "mAh", displayOrder: 10 },
    { name: "Hỗ trợ NFC", unit: "", displayOrder: 11 },
    { name: "Trọng lượng", unit: "g", displayOrder: 12 }
  ],
  2: [ // Laptop
    { name: "CPU", unit: "", displayOrder: 1 },
    { name: "Số nhân CPU", unit: "nhân", displayOrder: 2 },
    { name: "RAM", unit: "GB", displayOrder: 3 },
    { name: "Hỗ trợ RAM tối đa", unit: "GB", displayOrder: 4 },
    { name: "Dung lượng SSD", unit: "GB", displayOrder: 5 },
    { name: "Kích thước màn hình", unit: "inch", displayOrder: 6 },
    { name: "Độ phân giải", unit: "", displayOrder: 7 },
    { name: "Tần số quét", unit: "Hz", displayOrder: 8 },
    { name: "Card đồ họa", unit: "", displayOrder: 9 },
    { name: "Trọng lượng", unit: "g", displayOrder: 10 }
  ],
  3: [ // Headphone
    { name: "Loại tai nghe", unit: "", displayOrder: 1 },
    { name: "Loại kết nối", unit: "", displayOrder: 2 },
    { name: "Cổng kết nối", unit: "", displayOrder: 3 },
    { name: "Thời lượng pin", unit: "giờ", displayOrder: 4 },
    { name: "Trọng lượng", unit: "g", displayOrder: 5 },
    { name: "Chống ồn", unit: "", displayOrder: 6 }
  ]
};

const AddSpecificationDrawer = ({ open, onClose, product }) => {
  // State management
  const [specifications, setSpecifications] = useState([]);
  const [loadingState, setLoadingState] = useState({
    fetch: false,
    submit: false,
    delete: false
  });
  const [notification, setNotification] = useState({
    error: null,
    success: null
  });
  const [newSpec, setNewSpec] = useState({
    name: '',
    value: '',
    unit: '',
    displayOrder: 0
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [specToDelete, setSpecToDelete] = useState(null);

  // API calls
  const fetchSpecifications = useCallback(async () => {
    if (!product?.id) return;
    
    try {
      setLoadingState(prev => ({ ...prev, fetch: true }));
      setNotification({ error: null, success: null });

      const response = await axios.get(`${API_BASE_URL}/product/${product.id}`);
      
      if (response.data) {
        setSpecifications(response.data);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Fetch specifications failed:", error);
        setNotification(prev => ({
          ...prev,
          error: error.response?.data || "Không thể tải thông số kỹ thuật"
        }));
      }
    } finally {
      setLoadingState(prev => ({ ...prev, fetch: false }));
    }
  }, [product]);

  const handleAddSpecification = useCallback(async () => {
    if (!product?.id || !newSpec.name.trim() || !newSpec.value.trim()) {
      message.error('Vui lòng nhập đầy đủ tên và giá trị thông số');
      return;
    }

    try {
      setLoadingState(prev => ({ ...prev, submit: true }));
      setNotification({ error: null, success: null });

      const payload = {
        productId: product.id,
        name: newSpec.name.trim(),
        value: newSpec.value.trim(),
        unit: newSpec.unit?.trim() || '',
        displayOrder: newSpec.displayOrder || specifications.length + 1
      };

      await axios.post(API_BASE_URL, payload);
      message.success('Thêm thông số thành công!');
      
      // Reset form
      setNewSpec({
        name: '',
        value: '',
        unit: '',
        displayOrder: 0
      });
      
      // Refresh specifications
      fetchSpecifications();
    } catch (error) {
      console.error("Add specification failed:", error);
      message.error(error.response?.data || "Đã xảy ra lỗi khi thêm thông số");
    } finally {
      setLoadingState(prev => ({ ...prev, submit: false }));
    }
  }, [newSpec, product, specifications.length, fetchSpecifications]);

  const handleUpdateSpecification = useCallback(async (spec) => {
    try {
      setLoadingState(prev => ({ ...prev, submit: true }));
      
      await axios.put(`${API_BASE_URL}/${spec.id}`, {
        name: spec.name,
        value: spec.value,
        unit: spec.unit || '',
        displayOrder: spec.displayOrder
      });
      
      message.success('Cập nhật thông số thành công!');
      fetchSpecifications();
    } catch (error) {
      console.error("Update specification failed:", error);
      message.error(error.response?.data || "Đã xảy ra lỗi khi cập nhật thông số");
    } finally {
      setLoadingState(prev => ({ ...prev, submit: false }));
    }
  }, [fetchSpecifications]);

  const handleDeleteSpecification = useCallback(async () => {
    if (!specToDelete?.id) return;

    try {
      setLoadingState(prev => ({ ...prev, delete: true }));
      setNotification({ error: null, success: null });

      await axios.delete(`${API_BASE_URL}/${specToDelete.id}`);
      message.success('Xóa thông số thành công!');
      setDeleteDialogOpen(false);
      setSpecToDelete(null);
      fetchSpecifications();
    } catch (error) {
      console.error("Delete specification failed:", error);
      message.error("Không thể xóa thông số kỹ thuật");
    } finally {
      setLoadingState(prev => ({ ...prev, delete: false }));
    }
  }, [specToDelete, fetchSpecifications]);

  const handleQuickAdd = useCallback((template) => {
    setNewSpec(prev => ({
      ...prev,
      name: template.name,
      unit: template.unit,
      displayOrder: template.displayOrder
    }));
  }, []);
  // Effects
  useEffect(() => {
    if (open && product) {
      fetchSpecifications();
    } else {
      setSpecifications([]);
      setNewSpec({
        name: '',
        value: '',
        unit: '',
        displayOrder: 0
      });
      setNotification({ error: null, success: null });
    }
  }, [open, product, fetchSpecifications]);

  // Event handlers
  const handleInputChange = useCallback((field, value) => {
    setNewSpec(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSpecificationChange = useCallback((id, field, value) => {
    setSpecifications(prev => 
      prev.map(spec => 
        spec.id === id ? { ...spec, [field]: value } : spec
      )
    );
  }, []);

  const handleDeleteClick = useCallback((spec) => {
    setSpecToDelete(spec);
    setDeleteDialogOpen(true);
  }, []);
  // Render helpers
  const renderAddSpecificationForm = useCallback(() => (
    <Box sx={{ mb: 4, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Thêm thông số mới</Typography>
      
      {/* Quick templates */}
      {product?.categoryId && SPECIFICATION_TEMPLATES[product.categoryId] && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
            Mẫu thông số nhanh:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {SPECIFICATION_TEMPLATES[product.categoryId].map((template, index) => (
              <Button
                key={index}
                size="small"
                variant="outlined"
                onClick={() => handleQuickAdd(template)}
                sx={{ fontSize: '0.75rem' }}
              >
                {template.name}
              </Button>
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="Tên thông số"
          value={newSpec.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          size="small"
          required
        />
        <TextField
          fullWidth
          label="Giá trị"
          value={newSpec.value}
          onChange={(e) => handleInputChange('value', e.target.value)}
          size="small"
          required
        />
        <TextField
          fullWidth
          label="Đơn vị (tùy chọn)"
          value={newSpec.unit}
          onChange={(e) => handleInputChange('unit', e.target.value)}
          size="small"
          placeholder="VD: GB, inch, mAh"
        />
        <TextField
          fullWidth
          label="Thứ tự hiển thị"
          type="number"
          value={newSpec.displayOrder}
          onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 0)}
          size="small"
        />
        <Button
          variant="contained"
          startIcon={loadingState.submit ? 
            <CircularProgress size={20} color="inherit" /> : <Plus />}
          onClick={handleAddSpecification}
          disabled={loadingState.submit || !newSpec.name.trim() || !newSpec.value.trim()}
        >
          {loadingState.submit ? 'Đang thêm...' : 'Thêm thông số'}
        </Button>
      </Box>
    </Box>
  ), [newSpec, loadingState.submit, product, handleInputChange, handleQuickAdd, handleAddSpecification]);

  const renderSpecificationsList = useCallback(() => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Thông số hiện tại ({specifications.length})
      </Typography>
      
      {specifications.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
          <Typography>Chưa có thông số kỹ thuật nào</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {specifications
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((spec) => (
            <Box 
              key={spec.id} 
              sx={{ 
                p: 2, 
                border: '1px solid', 
                borderColor: 'divider', 
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" fontWeight="medium">
                  {spec.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {spec.value} {spec.unit && `(${spec.unit})`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Thứ tự: {spec.displayOrder}
                </Typography>
              </Box>
              <IconButton
                color="error"
                onClick={() => handleDeleteClick(spec)}
                size="small"
              >
                <Trash size={16} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  ), [specifications, handleDeleteClick]);

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
        >          <Typography variant="h5" fontWeight="bold" color="primary">
            Quản lý thông số kỹ thuật
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
        </Box>        {/* Loading state */}
        <Fade in={loadingState.fetch && specifications.length === 0} unmountOnExit>
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
            </Box>            {/* Form content */}
            <Box sx={{ flexGrow: 1 }}>
              {loadingState.fetch ? renderSkeletonLoader() : (
                <>
                  {renderAddSpecificationForm()}
                  {renderSpecificationsList()}
                </>
              )}
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
              <Button
                variant="outlined"
                onClick={onClose}
                size="large"
              >
                Đóng
              </Button>
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
          </Button>          <Button 
            onClick={handleDeleteSpecification} 
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