import React, { useState, useCallback, useEffect } from "react";
import {
  Drawer, Button, Box, Typography, IconButton,
  TextField, CircularProgress, Alert, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle,
  Snackbar, LinearProgress, Paper, InputAdornment
} from "@mui/material";
import {
  X, Trash, Check, Plus, Package as PackageIcon,
  LayoutGrid, Info, AlertTriangle, Edit, Save
} from "lucide-react";
import { useSpecificationForm } from "@/hooks/api/useProductSpecificationManager";

const ICON_SIZE_FIELD = 20;
const ICON_SIZE_BUTTON = 18;
const ICON_SIZE_CLOSE = 22;

const AddSpecificationDrawer = ({ open, onClose, product }) => {
  const { specifications, loadingState, snackbarState, deleteDialogOpen, specToDelete, anyLoading, showInitialLoadSpinner, showRefetchProgressBar, actions } = useSpecificationForm(product, open, onClose);

  const [newSpec, setNewSpec] = useState({
    name: '',
    value: '',
    unit: '',
    displayOrder: specifications.length > 0 ? Math.max(...specifications.map(s => s.displayOrder)) + 1 : 1,
  });
  const [editingSpecId, setEditingSpecId] = useState(null);
  const [editingSpecData, setEditingSpecData] = useState({});

  useEffect(() => {
    if (!open) {
      setNewSpec({
        name: '',
        value: '',
        unit: '',
        displayOrder: 1,
      });
      setEditingSpecId(null);
      setEditingSpecData({});
    } else if (specifications.length > 0) {
      setNewSpec(prev => ({ ...prev, displayOrder: Math.max(...specifications.map(s => s.displayOrder)) + 1 }));
    }
  }, [open, specifications]);

  const handleNewSpecChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewSpec(prev => ({
      ...prev,
      [name]: name === 'displayOrder' ? (value === '' ? '' : Number(value)) : value
    }));
  }, []);

  const handleEditSpecChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditingSpecData(prev => ({
      ...prev,
      [name]: name === 'displayOrder' ? (value === '' ? '' : Number(value)) : value
    }));
  }, []);

  const handleAddNewSpec = useCallback(async (e) => {
    e.preventDefault();
    if (!newSpec.name || !newSpec.value) {
      actions.showSnackbar("Tên và Giá trị thông số không được để trống.", "warning");
      return;
    }
    await actions.handleAddOrUpdateSpecification(newSpec);
    setNewSpec({
      name: '',
      value: '',
      unit: '',
      displayOrder: specifications.length > 0 ? Math.max(...specifications.map(s => s.displayOrder)) + 1 : 1,
    });
  }, [newSpec, actions, specifications]);

  const handleEditClick = useCallback((spec) => {
    setEditingSpecId(spec.id);
    setEditingSpecData({ ...spec });
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingSpecData.name || !editingSpecData.value) {
      actions.showSnackbar("Tên và Giá trị thông số không được để trống.", "warning");
      return;
    }
    await actions.handleAddOrUpdateSpecification(editingSpecData);
    setEditingSpecId(null);
    setEditingSpecData({});
  }, [editingSpecData, actions]);

  const handleCancelEdit = useCallback(() => {
    setEditingSpecId(null);
    setEditingSpecData({});
  }, []);

  const renderProductInfo = useCallback(() => (
    product && (
      <Paper variant="outlined" sx={{ mb: 2.5, p: 1.5, bgcolor: 'action.hover' }}>
        <Typography variant="body2" component="div" gutterBottom sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
          <PackageIcon size={ICON_SIZE_FIELD - 2} style={{ marginRight: '8px', opacity: 0.8 }} />
          Sản phẩm: <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>{product.name || "Không có tên"}</Typography>
        </Typography>
        <Typography variant="body2" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
          <LayoutGrid size={ICON_SIZE_FIELD - 2} style={{ marginRight: '8px', opacity: 0.8 }} />
          Danh mục: <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>{product.category?.name || 'Chưa có hoặc không hợp lệ'}</Typography>
        </Typography>
      </Paper>
    )
  ), [product]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
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
            Quản lý Thông số Kỹ thuật
          </Typography>
          <IconButton onClick={onClose} aria-label="Đóng Drawer" size="small">
            <X size={ICON_SIZE_CLOSE} />
          </IconButton>
        </Box>

        {renderProductInfo()}

        {showInitialLoadSpinner ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, minHeight: '200px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: { xs: 0, sm: 0.5 }, pt: 0.5 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Thêm Thông số Mới</Typography>
            <form onSubmit={handleAddNewSpec} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 border rounded-lg bg-gray-100">
              <TextField
                label="Tên thông số"
                name="name"
                value={newSpec.name}
                onChange={handleNewSpecChange}
                fullWidth
                size="small"
                required
                disabled={anyLoading}
              />
              <TextField
                label="Giá trị"
                name="value"
                value={newSpec.value}
                onChange={handleNewSpecChange}
                fullWidth
                size="small"
                required
                disabled={anyLoading}
              />
              <TextField
                label="Đơn vị (tùy chọn)"
                name="unit"
                value={newSpec.unit}
                onChange={handleNewSpecChange}
                fullWidth
                size="small"
                disabled={anyLoading}
              />
              <TextField
                label="Thứ tự hiển thị"
                name="displayOrder"
                type="number"
                value={newSpec.displayOrder}
                onChange={handleNewSpecChange}
                fullWidth
                size="small"
                disabled={anyLoading}
                inputProps={{ min: 1 }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={loadingState.submit ? <CircularProgress size={20} color="inherit" /> : <Plus size={ICON_SIZE_BUTTON} />}
                disabled={anyLoading || !newSpec.name || !newSpec.value}
                sx={{ mt: 1, gridColumn: 'span 2' }}
              >
                {loadingState.submit ? 'Đang thêm...' : 'Thêm Thông số'}
              </Button>
            </form>

            <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>Thông số Hiện có ({specifications.length})</Typography>
            {specifications.length === 0 && !loadingState.fetch && (
              <Alert severity="info" variant="outlined" icon={<Info size={ICON_SIZE_FIELD} />} sx={{ mt: 1, mb: 2, fontSize: '0.875rem' }}>
                Sản phẩm này chưa có thông số kỹ thuật nào.
              </Alert>
            )}
            <Box>
              {specifications.map((spec) => (
                <Paper key={spec.id} variant="outlined" sx={{ p: 2, mb: 2, display: 'flex', flexDirection: 'column', gap: 1, bgcolor: 'background.paper' }}>
                  {editingSpecId === spec.id ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField
                        label="Tên thông số"
                        name="name"
                        value={editingSpecData.name || ''}
                        onChange={handleEditSpecChange}
                        fullWidth
                        size="small"
                        required
                        disabled={anyLoading}
                      />
                      <TextField
                        label="Giá trị"
                        name="value"
                        value={editingSpecData.value || ''}
                        onChange={handleEditSpecChange}
                        fullWidth
                        size="small"
                        required
                        disabled={anyLoading}
                      />
                      <TextField
                        label="Đơn vị (tùy chọn)"
                        name="unit"
                        value={editingSpecData.unit || ''}
                        onChange={handleEditSpecChange}
                        fullWidth
                        size="small"
                        disabled={anyLoading}
                      />
                      <TextField
                        label="Thứ tự hiển thị"
                        name="displayOrder"
                        type="number"
                        value={editingSpecData.displayOrder || ''}
                        onChange={handleEditSpecChange}
                        fullWidth
                        size="small"
                        disabled={anyLoading}
                        inputProps={{ min: 1 }}
                      />
                      <Box sx={{ gridColumn: 'span 2', display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button onClick={handleCancelEdit} variant="outlined" disabled={anyLoading}>Hủy</Button>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={loadingState.submit ? <CircularProgress size={20} color="inherit" /> : <Save size={ICON_SIZE_BUTTON} />}
                          disabled={anyLoading || !editingSpecData.name || !editingSpecData.value}
                        >
                          {loadingState.submit ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                      </Box>
                    </form>
                  ) : (
                    <>
                      <Typography variant="body1" fontWeight="medium">{spec.name}: {spec.value} {spec.unit}</Typography>
                      <Typography variant="body2" color="text.secondary">Thứ tự hiển thị: {spec.displayOrder}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Edit size={ICON_SIZE_BUTTON} />}
                          onClick={() => handleEditClick(spec)}
                          disabled={anyLoading}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<Trash size={ICON_SIZE_BUTTON} />}
                          onClick={() => actions.handleDeleteClick(spec)}
                          disabled={anyLoading}
                        >
                          Xóa
                        </Button>
                      </Box>
                    </>
                  )}
                </Paper>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={actions.handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AlertTriangle color="orange" size={ICON_SIZE_CLOSE} /> Xác nhận xóa
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa thông số kỹ thuật "{specToDelete?.name}: {specToDelete?.value}" này không? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={actions.handleCloseDeleteDialog} color="inherit" variant="outlined" disabled={loadingState.delete}>
            Hủy
          </Button>
          <Button
            onClick={actions.handleDeleteSpecification}
            color="error"
            variant="contained"
            disabled={loadingState.delete}
            startIcon={loadingState.delete ? <CircularProgress size={20} color="inherit" /> : <Trash size={ICON_SIZE_BUTTON} />}
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
