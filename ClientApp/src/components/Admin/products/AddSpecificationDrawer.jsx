import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Drawer, Button, Box, Typography, IconButton,
  TextField, FormControlLabel, Checkbox,
  CircularProgress, Alert, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle,
  Skeleton, Fade, Snackbar, LinearProgress, Paper, InputAdornment // THÊM InputAdornment
} from "@mui/material";
import {
  X, Trash, Check, Plus, Scale, Smartphone, Monitor, // Monitor for general screen
  Cpu, MemoryStick, HardDrive, Camera, BatteryFull, Nfc, // Phone
  Laptop as LaptopIcon, Gauge, MousePointer2, // Laptop (LaptopIcon to avoid conflict)
  Headphones, Bluetooth, Cable, Usb, // Headphones
  Undo2, // For Cancel button
  AlertTriangle, // For Dialog title
  Package as PackageIcon, // For Product Info
  LayoutGrid, // For Category Info
  Info // For Alert message
} from "lucide-react"; // Import các icon cần thiết
import axios from "axios";

// Constants
const API_BASE_URL_SPECS = `${process.env.REACT_APP_API_BASE_URL}/api/Specifications`;
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

// Thêm thuộc tính 'icon' (là một component icon)
const COMMON_FIELDS = [
  { name: "weight", label: "Trọng lượng", icon: Scale, required: false, props: { placeholder: "Ví dụ: 200g hoặc 1.2kg" } }
];

const CATEGORY_FIELDS = {
  1: [ // Điện thoại
    { name: "screenSize", label: "Kích thước màn hình", icon: Smartphone, required: true, props: { placeholder: "Ví dụ: 6.7 inches" } },
    { name: "resolution", label: "Độ phân giải", icon: Monitor, required: true, props: { placeholder: "Ví dụ: 1080 x 2400 pixels" } },
    { name: "screenType", label: "Loại màn hình", icon: Monitor, required: true, props: { placeholder: "Ví dụ: AMOLED" } },
    { name: "cpuModel", label: "Model CPU", icon: Cpu, required: true, props: { placeholder: "Ví dụ: Snapdragon 8 Gen 2" } },
    { name: "cpuCores", label: "Số nhân CPU", type: "number", icon: Cpu, required: true, props: { inputProps: { min: 1 }, placeholder:"Ví dụ: 8"} },
    { name: "ram", label: "RAM", icon: MemoryStick, required: true, props: { placeholder: "Ví dụ: 8GB DDR5" } },
    { name: "internalStorage", label: "Dung lượng lưu trữ", icon: HardDrive, required: true, props: { placeholder: "Ví dụ: 128GB UFS 3.1" } },
    { name: "frontCamera", label: "Camera trước", icon: Camera, required: false, props: { placeholder: "Ví dụ: 12MP f/2.0" } },
    { name: "rearCamera", label: "Camera sau", icon: Camera, required: false, props: { placeholder: "Ví dụ: Chính 50MP, Phụ 12MP" } },
    { name: "batteryCapacity", label: "Dung lượng pin", icon: BatteryFull, required: true, props: { placeholder: "Ví dụ: 5000mAh" } },
    { name: "supportsNFC", label: "Hỗ trợ NFC", type: "checkbox", icon: Nfc, required: false },
  ],
  2: [ // Laptop
    { name: "cpuType", label: "Loại CPU", icon: Cpu, required: true, props: { placeholder: "Ví dụ: Intel Core i7-13700H" } },
    { name: "cpuNumberOfCores", label: "Số nhân CPU", type: "number", icon: Cpu, required: true, props: { inputProps: { min: 1 }, placeholder:"Ví dụ: 14" } },
    { name: "ram", label: "RAM", icon: MemoryStick, required: true, props: { placeholder: "Ví dụ: 16GB DDR5 5200MHz" } },
    { name: "maxRAMSupport", label: "Hỗ trợ RAM tối đa", icon: MemoryStick, required: false, props: { placeholder: "Ví dụ: 32GB" } },
    { name: "ssdStorage", label: "Dung lượng SSD", icon: HardDrive, required: true, props: { placeholder: "Ví dụ: 512GB PCIe NVMe Gen4" } },
    { name: "screenSize", label: "Kích thước màn hình", icon: LaptopIcon, required: true, props: { placeholder: "Ví dụ: 15.6 inches" } },
    { name: "resolution", label: "Độ phân giải", icon: Monitor, required: true, props: { placeholder: "Ví dụ: 1920 x 1080 (Full HD)" } },
    { name: "refreshRate", label: "Tần số quét", icon: Gauge, required: false, props: { placeholder: "Ví dụ: 120Hz" } },
    { name: "supportsTouch", label: "Hỗ trợ cảm ứng", type: "checkbox", icon: MousePointer2, required: false },
  ],
  3: [ // Tai nghe
    { name: "type", label: "Loại tai nghe", icon: Headphones, required: true, props: { placeholder: "Ví dụ: Over-ear, True Wireless" } },
    { name: "connectionType", label: "Loại kết nối", icon: Bluetooth, required: true, props: { placeholder: "Ví dụ: Bluetooth 5.3, Wired" } }, // Hoặc Cable nếu có logic chọn
    { name: "port", label: "Cổng sạc/kết nối", icon: Usb, required: false, props: { placeholder: "Ví dụ: USB-C, 3.5mm" } },
  ]
};

const getInitialFormData = (fields) => {
  return fields.reduce((acc, field) => {
    acc[field.name] = field.type === 'checkbox' ? false : '';
    return acc;
  }, {});
};

const ICON_SIZE_FIELD = 20; // Kích thước cho icon trong field
const ICON_SIZE_BUTTON = 18;
const ICON_SIZE_CLOSE = 22;

const AddSpecificationDrawer = ({ open, onClose, product }) => {
  const [specification, setSpecification] = useState(null);
  const [formData, setFormData] = useState({});
  const [loadingState, setLoadingState] = useState({
    fetch: false,
    submit: false,
    delete: false
  });
  const [snackbarState, setSnackbarState] = useState({ open: false, message: '', severity: 'info' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const formFields = useMemo(() => {
    if (!product?.categoryId || !CATEGORY_ENDPOINTS[product.categoryId]) {
        return COMMON_FIELDS;
    }
    const categorySpecificFields = CATEGORY_FIELDS[product.categoryId] || [];
    return [...COMMON_FIELDS, ...categorySpecificFields];
  }, [product?.categoryId]);

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
    event.preventDefault();
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
    } catch (error) {
      console.error("Lỗi khi xóa thông số:", error);
      showSnackbar(error.response?.data?.message || error.message || "Không thể xóa thông số.", "error");
    } finally {
      setLoadingState(prev => ({ ...prev, delete: false }));
    }
  }, [endpoint, specification?.id, resetComponentState]);

  useEffect(() => {
    if (open && product) {
      setFormData(getInitialFormData(formFields));
      fetchSpecification();
    } else if (!open) {
      resetComponentState();
    }
  }, [open, product, formFields, fetchSpecification, resetComponentState]);

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

  const handleDrawerClose = () => {
    onClose();
  };

  const anyLoading = loadingState.fetch || loadingState.submit || loadingState.delete;
  const canSubmit = !!(product?.id && endpoint);

  const renderFormFieldsContent = useCallback(() => (
    formFields.map((field) => {
      const labelText = field.required ? `${field.label} *` : field.label;
      const IconComponent = field.icon; // Icon component từ field definition

      return (
        <Box key={field.name} sx={{ mb: 2.5 }}>
          {field.type === 'checkbox' ? (
            <FormControlLabel
              control={
                <Checkbox
                  name={field.name}
                  checked={!!formData[field.name]}
                  onChange={handleInputChange}
                  disabled={anyLoading || loadingState.fetch}
                  size="small"
                />
              }
              label={
                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                  {IconComponent && <IconComponent size={ICON_SIZE_FIELD - 4} style={{ marginRight: '8px', opacity: 0.7 }} />}
                  {labelText}
                </Box>
              }
            />
          ) : (
            <TextField
              fullWidth
              label={labelText}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleInputChange}
              type={field.type || 'text'}
              variant="outlined"
              size="small"
              disabled={anyLoading || loadingState.fetch}
              required={field.required}
              InputProps={{
                startAdornment: IconComponent ? (
                  <InputAdornment position="start">
                    <IconComponent size={ICON_SIZE_FIELD} style={{ opacity: 0.7 }}/>
                  </InputAdornment>
                ) : null,
                ...(field.props?.InputProps || {}) // Merge với InputProps từ field.props nếu có
              }}
              // InputLabelProps={{ shrink: true }} // Có thể bỏ nếu không muốn label luôn shrink
              {...(field.props || {})} // Loại bỏ InputProps ở đây để tránh ghi đè
            />
          )}
        </Box>
      );
    })
  ), [formFields, formData, handleInputChange, anyLoading, loadingState.fetch]);

  const renderProductInfo = useCallback(() => (
    product && (
      <Paper variant="outlined" sx={{ mb: 2.5, p: 1.5, bgcolor: 'action.hover' }}>
        <Typography variant="body2" component="div" gutterBottom sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
          <PackageIcon size={ICON_SIZE_FIELD - 2} style={{ marginRight: '8px', opacity: 0.8 }} />
          Sản phẩm: <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>{product.name || "Không có tên"}</Typography>
        </Typography>
        <Typography variant="body2" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
          <LayoutGrid size={ICON_SIZE_FIELD - 2} style={{ marginRight: '8px', opacity: 0.8 }} />
          Danh mục: <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>{CATEGORY_NAMES[product.categoryId] || 'Chưa có hoặc không hợp lệ'}</Typography>
        </Typography>
      </Paper>
    )
  ), [product]);

  const showInitialLoadSpinner = loadingState.fetch && !specification?.id;
  const showRefetchProgressBar = loadingState.fetch && !!specification?.id;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleDrawerClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 480, md: 520 },
          boxSizing: 'border-box',
        }
      }}
    >
      <Box
        sx={{
          p: { xs: 2, md: 2.5 },
          bgcolor: "background.paper",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: 'relative',
        }}
      >
        {showRefetchProgressBar && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, height: '3px' }} />}

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          pb={1.5}
          borderBottom={1}
          borderColor="divider"
        >
          <Typography variant="h6" fontWeight={500}>
            {specification?.id ? "Chỉnh sửa thông số" : "Thêm thông số"}
          </Typography>
          <IconButton onClick={handleDrawerClose} aria-label="Đóng Drawer" size="small">
            <X size={ICON_SIZE_CLOSE} />
          </IconButton>
        </Box>

        {renderProductInfo()}

        {showInitialLoadSpinner ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, minHeight: '200px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            component="form"
            id="specification-form"
            onSubmit={handleSubmit}
            sx={{ flexGrow: 1, overflowY: 'auto', pr: { xs: 0, sm: 0.5 }, pt: 0.5 }}
          >
            {!endpoint && product?.id && (
              <Alert severity="warning" sx={{ mt: 1, mb:2 }} icon={<AlertTriangle size={ICON_SIZE_FIELD}/>}>
                Sản phẩm này chưa có danh mục được hỗ trợ thông số kỹ thuật, hoặc danh mục không hợp lệ.
              </Alert>
            )}
            {endpoint && formFields.length > 0 && renderFormFieldsContent()}
             {endpoint && (!formFields.length || (formFields.length === COMMON_FIELDS.length && !COMMON_FIELDS.some(cf => formFields.find(f => f.name === cf.name && f.label !== cf.label)))) && (
                <Typography variant="body2" color="text.secondary" sx={{mt: 2, textAlign: 'center', p:2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Info size={ICON_SIZE_FIELD} style={{marginRight: '8px'}}/> Danh mục này không có thông số kỹ thuật chi tiết để thêm/sửa.
                </Typography>
            )}
            {endpoint && formFields.length > 0 && !specification?.id && !loadingState.fetch && (
                 <Alert severity="info" variant="outlined" icon={<Info size={ICON_SIZE_FIELD} />} sx={{ mt: 1, mb:2, fontSize: '0.875rem' }}>
                    Chưa có thông số cho sản phẩm này. Điền form để thêm mới.
                </Alert>
            )}
          </Box>
        )}

        {!showInitialLoadSpinner && (
          <Box
            sx={{
              mt: 'auto',
              pt: 2,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1.5,
              justifyContent: 'flex-end',
              bgcolor: 'background.paper',
            }}
          >
            {specification?.id && endpoint && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Trash size={ICON_SIZE_BUTTON}/>}
                onClick={handleDeleteClick}
                disabled={anyLoading}
                sx={{ mr: { sm: 'auto' } }}
                size="medium"
              >
                Xóa
              </Button>
            )}
            <Button
              variant="text"
              startIcon={<Undo2 size={ICON_SIZE_BUTTON} />} // Thêm icon cho nút Hủy
              onClick={handleDrawerClose}
              disabled={anyLoading}
              size="medium"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              form="specification-form"
              variant="contained"
              color="primary"
              startIcon={loadingState.submit ? <CircularProgress size={20} color="inherit" /> : (specification?.id ? <Check size={ICON_SIZE_BUTTON}/> : <Plus size={ICON_SIZE_BUTTON}/>)}
              disabled={anyLoading || !canSubmit || loadingState.fetch}
              size="medium"
              sx={{minWidth: '140px'}}
            >
              {loadingState.submit ? 'Đang xử lý...' : (specification?.id ? 'Lưu thay đổi' : 'Thêm mới')}
            </Button>
          </Box>
        )}
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => !loadingState.delete && setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{display: 'flex', alignItems: 'center', gap: 1}}>
            <AlertTriangle color="orange" size={ICON_SIZE_CLOSE}/> Xác nhận xóa
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa thông số kỹ thuật cho sản phẩm này? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{p:2}}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit" variant="outlined" disabled={loadingState.delete}>
            Hủy
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={loadingState.delete}
            startIcon={loadingState.delete ? <CircularProgress size={20} color="inherit" /> : <Trash size={ICON_SIZE_BUTTON}/>}
            sx={{ minWidth: '100px' }}
          >
            {loadingState.delete ? 'Đang xóa...' : 'Xác nhận xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarState.open}
        autoHideDuration={4000}
        onClose={() => setSnackbarState(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarState(prev => ({ ...prev, open: false }))}
          severity={snackbarState.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </Drawer>
  );
};

export default React.memo(AddSpecificationDrawer);