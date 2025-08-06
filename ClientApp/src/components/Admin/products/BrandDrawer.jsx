import React from "react";
import {
  Drawer, Button, Box, Typography, IconButton, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Alert
} from "@mui/material";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { X, Edit, Trash, AlertTriangle } from "lucide-react"; // Thêm AlertTriangle
import BrandModal from "./BrandModal"; // Đảm bảo BrandModal nhận và sử dụng `onClose(shouldRefresh)`
import { useBrands } from "@/hooks/api/useBrands"; // Đường dẫn tới hook

const BrandDrawer = ({ open, onClose }) => {
  const {
    brands,
    selectedBrand,
    modalOpen,
    deleteDialogOpen,
    brandToDelete,
    loading,
    error,
    actions
  } = useBrands(open); // Truyền `open` vào hook để nó có thể quyết định khi nào fetch dữ liệu

  const getLogoUrl = (logoPath) => {
    if (!logoPath) return "https://via.placeholder.com/50"; // Ảnh mặc định nếu không có logo
    if (logoPath.startsWith("http")) {
      return logoPath; // Full external URL
    }
    return `${process.env.REACT_APP_API_BASE_URL}${logoPath}`;
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: { xs: '100%', sm: 500, md: 600 }, // Responsive width
          p: { xs: 2, sm: 3 },
          bgcolor: "background.paper", // Sử dụng theme background
          height: "100%",
          display: "flex",
          flexDirection: "column",
          boxSizing: 'border-box',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} pb={1.5} borderBottom={1} borderColor="divider">
          <Typography variant="h6" fontWeight={500}> {/* Giảm fontWeight một chút */}
            Quản lý Thương hiệu
          </Typography>
          <IconButton onClick={onClose} aria-label="Đóng Drawer">
            <X size={22} />
          </IconButton>
        </Box>

        {error && (
            <Alert severity="error" onClose={actions.clearError} sx={{ mb: 2 }}>
                {error}
            </Alert>
        )}

        <Button
          variant="contained"
          color="primary" // Sử dụng màu primary của theme
          sx={{ mb: 2, alignSelf: 'flex-start' }} // Canh nút Thêm sang trái
          onClick={() => actions.handleOpenModal()}
          disabled={loading} // Disable nút khi đang có thao tác
        >
          Thêm thương hiệu
        </Button>

        {loading && brands.length === 0 && ( // Chỉ hiển thị spinner toàn cục khi đang load lần đầu
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                <CircularProgress />
            </Box>
        )}

        {!loading && !error && brands.length === 0 && (
             <Typography variant="body1" color="text.secondary" textAlign="center" sx={{mt: 3}}>
                Không có thương hiệu nào.
            </Typography>
        )}

        {brands.length > 0 && (
          <TableContainer component={Paper} sx={{ flexGrow: 1, overflowY: 'auto' }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Thương hiệu</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Logo</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Mô tả</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {brands.map((brand) => (
                  <TableRow hover key={brand.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>{brand.name}</TableCell>
                    <TableCell>
                      <img
                        src={getLogoUrl(brand.logo)}
                        alt={`${brand.name} logo`}
                        style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'contain' }} // CSS trực tiếp hoặc dùng class
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/50"; // Ảnh fallback
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                        {brand.description || "N/A"}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <IconButton onClick={() => actions.handleOpenModal(brand)} aria-label={`Sửa ${brand.name}`} disabled={loading}>
                        <Edit size={20} />
                      </IconButton>
                      <IconButton onClick={() => actions.handleOpenDeleteDialog(brand)} aria-label={`Xóa ${brand.name}`} disabled={loading}>
                        <Trash size={20} color="error" /> {/* Dùng màu error của theme */}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Modal Thêm/Sửa */}
      <BrandModal
        open={modalOpen}
        // Truyền hàm handleCloseModal từ actions, nó sẽ gọi fetchBrands nếu cần
        onClose={(shouldRefresh) => actions.handleCloseModal(shouldRefresh)}
        brand={selectedBrand}
        // Không cần truyền refreshBrands nữa vì onClose của BrandModal sẽ xử lý
      />

      {/* Dialog Xác nhận Xóa */}
      <Dialog open={deleteDialogOpen} onClose={actions.handleCloseDeleteDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{display: 'flex', alignItems: 'center', gap: 1}}>
            <AlertTriangle color="orange" size={22}/> Xác nhận xóa
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa thương hiệu <b>{brandToDelete?.name}</b> không? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{p: 2}}>
          <Button onClick={actions.handleCloseDeleteDialog} color="inherit" variant="outlined" disabled={loading}>
            Hủy
          </Button>
          <Button onClick={actions.handleConfirmDelete} color="error" variant="contained" disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit"/> : <Trash size={18}/>}
          >
            {loading ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
};

export default React.memo(BrandDrawer);