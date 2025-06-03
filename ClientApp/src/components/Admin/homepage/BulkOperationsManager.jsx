import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  styled,
  keyframes,
  Fade,
  Zoom,
  Slide
} from '@mui/material';
import { 
  X, 
  Package, 
  Eye, 
  Edit, 
  Delete, 
  Copy,
  Download,
  CheckSquare,
  Archive,
  RefreshCw,
  Zap,
  Target,
  Settings
} from 'lucide-react';

// Styled Components with Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
`;

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
    overflow: 'hidden',
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: '20px 24px',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
    animation: `${shimmer} 3s infinite`,
  },
}));

const StyledCard = styled(Card)(({ theme, variant = 'default' }) => ({
  borderRadius: '16px',
  border: '2px solid transparent',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.6s ease-out`,
  position: 'relative',
  overflow: 'hidden',
  ...(variant === 'selection' && {
    background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)',
    borderColor: '#29b6f6',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, rgba(41, 182, 246, 0.1) 0%, rgba(179, 229, 252, 0.1) 100%)',
    },
  }),
  ...(variant === 'operation' && {
    background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
    borderColor: '#ff9800',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 224, 178, 0.1) 100%)',
    },
  }),
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
  },
}));

const SelectionChip = styled(Chip)(({ theme, isActive }) => ({
  borderRadius: '20px',
  fontWeight: 600,
  ...(isActive ? {
    background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
    color: 'white',
    '& .MuiChip-label': {
      padding: '8px 16px',
    },
  } : {
    background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
    color: '#64748b',
  }),
}));

const OperationMenuItem = styled(MenuItem)(({ theme }) => ({
  borderRadius: '8px',
  margin: '4px 8px',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    transform: 'scale(1.02)',
  },
}));

const StyledListItem = styled(ListItem)(({ theme, isSelected }) => ({
  borderRadius: '12px',
  margin: '4px 0',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  ...(isSelected && {
    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
    borderLeft: '4px solid #2196f3',
    transform: 'translateX(4px)',
  }),
  '&:hover': {
    background: isSelected 
      ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
      : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    transform: 'translateX(4px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
}));

const GradientButton = styled(Button)(({ theme, variant = 'primary' }) => ({
  borderRadius: '12px',
  padding: '10px 24px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '14px',
  boxShadow: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  ...(variant === 'primary' && {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    '&:hover': {
      background: 'linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
    },
    '&:disabled': {
      background: '#e2e8f0',
      color: '#94a3b8',
    },
  }),
  ...(variant === 'secondary' && {
    background: 'transparent',
    color: '#64748b',
    border: '2px solid #e2e8f0',
    '&:hover': {
      background: '#f8fafc',
      borderColor: '#cbd5e1',
    },
  }),
}));

const EmptyState = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: '48px 24px',
  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  borderRadius: '16px',
  border: '2px dashed #cbd5e1',
  animation: `${pulse} 2s infinite`,
  '& .empty-icon': {
    color: '#cbd5e1',
    marginBottom: '16px',
  },
}));

const LoadingButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: '12px',
  padding: '10px 24px',
  fontWeight: 600,
  '&:disabled': {
    background: 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)',
  },
}));

const BulkOperationsManager = ({
  open,
  onClose,
  items = [],
  itemType = 'products', // products, categories, banners, etc.
  onBulkOperation
}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [operation, setOperation] = useState('');
  const [operationData, setOperationData] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  const operations = {
    products: [
      { value: 'visibility', label: 'Thay đổi hiển thị', icon: <Eye size={16} /> },
      { value: 'category', label: 'Chuyển danh mục', icon: <Package size={16} /> },
      { value: 'discount', label: 'Áp dụng giảm giá', icon: <Edit size={16} /> },
      { value: 'duplicate', label: 'Nhân bản', icon: <Copy size={16} /> },
      { value: 'export', label: 'Xuất dữ liệu', icon: <Download size={16} /> },
      { value: 'delete', label: 'Xóa', icon: <Delete size={16} /> }
    ],
    categories: [
      { value: 'visibility', label: 'Thay đổi hiển thị', icon: <Eye size={16} /> },
      { value: 'reorder', label: 'Sắp xếp lại', icon: <RefreshCw size={16} /> },
      { value: 'merge', label: 'Gộp danh mục', icon: <Archive size={16} /> },
      { value: 'export', label: 'Xuất dữ liệu', icon: <Download size={16} /> },
      { value: 'delete', label: 'Xóa', icon: <Delete size={16} /> }
    ],
    banners: [
      { value: 'visibility', label: 'Thay đổi hiển thị', icon: <Eye size={16} /> },
      { value: 'schedule', label: 'Lên lịch hiển thị', icon: <RefreshCw size={16} /> },
      { value: 'duplicate', label: 'Nhân bản', icon: <Copy size={16} /> },
      { value: 'delete', label: 'Xóa', icon: <Delete size={16} /> }
    ]
  };

  const handleSelectAll = useCallback(() => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
    setSelectAll(!selectAll);
  }, [selectAll, items]);

  const handleItemSelect = useCallback((itemId) => {
    setSelectedItems(prev => {
      const isSelected = prev.includes(itemId);
      if (isSelected) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  }, []);

  const handleOperationChange = (newOperation) => {
    setOperation(newOperation);
    setOperationData({});
  };

  const renderOperationForm = () => {
    switch (operation) {
      case 'visibility':
        return (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Trạng thái hiển thị</InputLabel>
            <Select
              value={operationData.visibility || ''}
              onChange={(e) => setOperationData(prev => ({ ...prev, visibility: e.target.value }))}
            >
              <MenuItem value="show">Hiển thị</MenuItem>
              <MenuItem value="hide">Ẩn</MenuItem>
            </Select>
          </FormControl>
        );

      case 'category':
        return (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Chuyển sang danh mục</InputLabel>
            <Select
              value={operationData.categoryId || ''}
              onChange={(e) => setOperationData(prev => ({ ...prev, categoryId: e.target.value }))}
            >
              <MenuItem value="1">Máy tính</MenuItem>
              <MenuItem value="2">Laptop</MenuItem>
              <MenuItem value="3">Phụ kiện</MenuItem>
            </Select>
          </FormControl>
        );

      case 'discount':
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Loại giảm giá</InputLabel>
                <Select
                  value={operationData.discountType || 'percentage'}
                  onChange={(e) => setOperationData(prev => ({ ...prev, discountType: e.target.value }))}
                >
                  <MenuItem value="percentage">Phần trăm (%)</MenuItem>
                  <MenuItem value="fixed">Số tiền cố định</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Giá trị giảm"
                value={operationData.discountValue || ''}
                onChange={(e) => setOperationData(prev => ({ ...prev, discountValue: e.target.value }))}
              />
            </Grid>
          </Grid>
        );

      case 'schedule':
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Bắt đầu hiển thị"
                value={operationData.startDate || ''}
                onChange={(e) => setOperationData(prev => ({ ...prev, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Kết thúc hiển thị"
                value={operationData.endDate || ''}
                onChange={(e) => setOperationData(prev => ({ ...prev, endDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  const handleExecuteOperation = async () => {
    if (!operation || selectedItems.length === 0) {
      return;
    }

    // Confirm destructive operations
    if (['delete', 'merge'].includes(operation)) {
      const confirmMessage = operation === 'delete' 
        ? `Bạn có chắc chắn muốn xóa ${selectedItems.length} mục đã chọn?`
        : `Bạn có chắc chắn muốn gộp ${selectedItems.length} mục đã chọn?`;
      
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    setIsProcessing(true);
    
    try {
      await onBulkOperation({
        operation,
        itemIds: selectedItems,
        data: operationData
      });
      
      // Reset selections
      setSelectedItems([]);
      setSelectAll(false);
      setOperation('');
      setOperationData({});
      
      onClose();
    } catch (error) {
      console.error('Bulk operation failed:', error);
      alert('Có lỗi xảy ra khi thực hiện thao tác');
    } finally {
      setIsProcessing(false);
    }
  };

  const getItemTitle = (item) => {
    return item.name || item.title || `Item ${item.id}`;
  };

  const getItemSubtitle = (item) => {
    switch (itemType) {
      case 'products':
        return `Giá: ${item.price?.toLocaleString()}đ • Danh mục: ${item.categoryName || 'N/A'}`;
      case 'categories':
        return `${item.productCount || 0} sản phẩm`;
      case 'banners':
        return `Vị trí: ${item.position || 'N/A'}`;
      default:
        return `ID: ${item.id}`;
    }
  };
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 600 }}
    >
      <StyledDialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center" position="relative" zIndex={1}>
          <Box display="flex" alignItems="center" gap={2}>
            <Zap size={28} />
            <Typography variant="h5" fontWeight="700">
              Thao tác hàng loạt - {itemType}
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose}
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                transform: 'scale(1.1)',
              }
            }}
          >
            <X size={24} />
          </IconButton>
        </Box>
      </StyledDialogTitle>

      <DialogContent dividers sx={{ background: 'transparent', padding: '24px' }}>
        {/* Selection Summary */}
        <Zoom in={open} timeout={600}>
          <StyledCard variant="selection" sx={{ mb: 3 }}>
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Target size={24} color="#1976d2" />
                  <Typography variant="h6" fontWeight="600" color="#1565c0">
                    Chọn mục để thao tác
                  </Typography>
                </Box>
                <SelectionChip 
                  label={`${selectedItems.length} / ${items.length} đã chọn`}
                  isActive={selectedItems.length > 0}
                />
              </Box>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectAll}
                    onChange={handleSelectAll}
                    indeterminate={selectedItems.length > 0 && selectedItems.length < items.length}
                    sx={{
                      color: '#1976d2',
                      '&.Mui-checked': {
                        color: '#1976d2',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body1" fontWeight="500" color="#1565c0">
                    Chọn tất cả
                  </Typography>
                }
              />
            </CardContent>
          </StyledCard>
        </Zoom>

        {/* Operation Selection */}
        <Zoom in={open} timeout={800}>
          <StyledCard variant="operation" sx={{ mb: 3 }}>
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Settings size={24} color="#f57c00" />
                <Typography variant="h6" fontWeight="600" color="#ef6c00">
                  Chọn thao tác
                </Typography>
              </Box>
              
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#ef6c00', '&.Mui-focused': { color: '#ef6c00' } }}>
                  Thao tác
                </InputLabel>
                <Select
                  value={operation}
                  onChange={(e) => handleOperationChange(e.target.value)}
                  disabled={selectedItems.length === 0}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ffb74d',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ff9800',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#f57c00',
                    },
                  }}
                >
                  {(operations[itemType] || []).map((op) => (
                    <OperationMenuItem key={op.value} value={op.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {op.icon}
                        {op.label}
                      </Box>
                    </OperationMenuItem>
                  ))}
                </Select>
              </FormControl>

              {renderOperationForm()}
            </CardContent>
          </StyledCard>
        </Zoom>

        {/* Items List */}
        <Zoom in={open} timeout={1000}>
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Package size={24} color="#667eea" />
                <Typography variant="h6" fontWeight="600" color="#1e293b">
                  Danh sách mục ({items.length})
                </Typography>
              </Box>
              
              <List sx={{ maxHeight: 300, overflow: 'auto', padding: '8px' }}>
                {items.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <Slide in={open} timeout={1200 + index * 100} direction="up">
                      <StyledListItem
                        isSelected={selectedItems.includes(item.id)}
                        onClick={() => handleItemSelect(item.id)}
                      >
                        <ListItemIcon>
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleItemSelect(item.id)}
                            sx={{
                              color: '#667eea',
                              '&.Mui-checked': {
                                color: '#667eea',
                              },
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body1" fontWeight="500" color="#1e293b">
                              {getItemTitle(item)}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="#64748b">
                              {getItemSubtitle(item)}
                            </Typography>
                          }
                        />
                      </StyledListItem>
                    </Slide>
                    {index < items.length - 1 && <Divider sx={{ margin: '4px 0' }} />}
                  </React.Fragment>
                ))}
              </List>

              {items.length === 0 && (
                <Fade in={open} timeout={1000}>
                  <EmptyState>
                    <Box className="empty-icon">
                      <Package size={64} />
                    </Box>
                    <Typography variant="h5" color="#64748b" fontWeight="600" mb={1}>
                      Không có mục nào
                    </Typography>
                    <Typography variant="body1" color="#94a3b8">
                      Danh sách sẽ được hiển thị khi có dữ liệu
                    </Typography>
                  </EmptyState>
                </Fade>
              )}
            </CardContent>
          </StyledCard>
        </Zoom>
      </DialogContent>

      <DialogActions sx={{ 
        padding: '20px 24px', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderTop: '1px solid #e2e8f0' 
      }}>
        <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
          <Alert 
            severity={selectedItems.length === 0 ? "warning" : "info"} 
            sx={{ 
              mr: 2,
              borderRadius: '12px',
              background: selectedItems.length === 0 
                ? 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)'
                : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
              border: 'none',
            }}
          >
            {selectedItems.length === 0 
              ? 'Chọn ít nhất 1 mục để tiếp tục'
              : `Sẽ áp dụng cho ${selectedItems.length} mục`
            }
          </Alert>
          
          <Box display="flex" gap={2}>
            <GradientButton variant="secondary" onClick={onClose} disabled={isProcessing}>
              Hủy
            </GradientButton>
            {isProcessing ? (
              <LoadingButton
                disabled
                startIcon={<CircularProgress size={16} color="inherit" />}
              >
                Đang xử lý...
              </LoadingButton>
            ) : (
              <GradientButton
                variant="primary"
                onClick={handleExecuteOperation}
                disabled={!operation || selectedItems.length === 0}
              >
                <CheckSquare size={16} style={{ marginRight: '8px' }} />
                Thực hiện
              </GradientButton>
            )}
          </Box>
        </Box>
      </DialogActions>
    </StyledDialog>
  );
};

export default BulkOperationsManager;
