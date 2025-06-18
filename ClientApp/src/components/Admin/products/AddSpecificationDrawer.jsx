import React, { useMemo, useCallback } from "react";
import {
  Drawer, Button, Box, Typography, IconButton,
  TextField, FormControlLabel, Checkbox,
  CircularProgress, Alert, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle,
  Fade, Snackbar, LinearProgress, Paper, InputAdornment
} from "@mui/material";
import {
  X, Trash, Check, Plus, Scale, Smartphone, Monitor,
  Cpu, MemoryStick, HardDrive, Camera, BatteryFull, Nfc,
  Laptop as LaptopIcon, Gauge, MousePointer2,
  Headphones, Bluetooth, Cable, Usb,
  Undo2,
  AlertTriangle,
  Package as PackageIcon,
  LayoutGrid,
  Info
} from "lucide-react";
import { useSpecificationForm } from "../../../hook/products/useSpecificationManager"; // Đường dẫn tới hook

// Constants cho UI (nếu không dùng ở hook thì để đây)
const CATEGORY_NAMES = {
  1: "Điện thoại",
  2: "Laptop",
  3: "Tai nghe"
};

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
    { name: "connectionType", label: "Loại kết nối", icon: Bluetooth, required: true, props: { placeholder: "Ví dụ: Bluetooth 5.3, Wired" } },
    { name: "port", label: "Cổng sạc/kết nối", icon: Usb, required: false, props: { placeholder: "Ví dụ: USB-C, 3.5mm" } },
  ]
};

const ICON_SIZE_FIELD = 20;
const ICON_SIZE_BUTTON = 18;
const ICON_SIZE_CLOSE = 22;


const AddSpecificationDrawer = ({ open, onClose, product }) => {
  const formFields = useMemo(() => {
    if (!product?.categoryId || !CATEGORY_FIELDS[product.categoryId]) { // Sử dụng CATEGORY_FIELDS thay vì CATEGORY_ENDPOINTS để check
        return COMMON_FIELDS;
    }
    const categorySpecificFields = CATEGORY_FIELDS[product.categoryId] || [];
    return [...COMMON_FIELDS, ...categorySpecificFields];
  }, [product?.categoryId]);

  const {
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
    actions
  } = useSpecificationForm(product, open, formFields, onClose); // Truyền onClose vào hook nếu cần gọi từ đó

  const handleDrawerClose = () => {
    // onClose có thể nhận 1 tham số boolean để báo hiệu có sự thay đổi cần refresh list bên ngoài
    onClose();
  };


  const renderFormFieldsContent = useCallback(() => (
    formFields.map((field) => {
      const labelText = field.required ? `${field.label} *` : field.label;
      const IconComponent = field.icon;

      return (
        <Box key={field.name} sx={{ mb: 2.5 }}>
          {field.type === 'checkbox' ? (
            <FormControlLabel
              control={
                <Checkbox
                  name={field.name}
                  checked={!!formData[field.name]}
                  onChange={actions.handleInputChange}
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
              onChange={actions.handleInputChange}
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
                ...(field.props?.InputProps || {})
              }}
              {...(field.props || {})}
            />
          )}
        </Box>
      );
    })
  ), [formFields, formData, actions.handleInputChange, anyLoading, loadingState.fetch]);

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


  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleDrawerClose} // Sử dụng handleDrawerClose đã định nghĩa
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
            onSubmit={actions.handleSubmit}
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
            {endpoint && formFields.length > 0 && !specification?.id && !loadingState.fetch && open && ( // Thêm open để chỉ hiển thị khi drawer mở
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
                onClick={actions.handleDeleteClick}
                disabled={anyLoading}
                sx={{ mr: { sm: 'auto' } }}
                size="medium"
              >
                Xóa
              </Button>
            )}
            <Button
              variant="text"
              startIcon={<Undo2 size={ICON_SIZE_BUTTON} />}
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
        onClose={actions.handleCloseDeleteDialog}
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
          <Button onClick={actions.handleCloseDeleteDialog} color="inherit" variant="outlined" disabled={loadingState.delete}>
            Hủy
          </Button>
          <Button
            onClick={actions.handleDelete}
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
        onClose={actions.handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={actions.handleCloseSnackbar}
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