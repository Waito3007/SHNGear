import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Button, 
  Typography, 
  Modal, 
  Box, 
  TextField, 
  IconButton, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  Divider,
  Stack,
  Paper
} from "@mui/material";
import { Delete, Edit, Add, Close } from "@mui/icons-material";
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: '800px',
  margin: '2rem auto',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  overflow: 'hidden'
}));

const AddressItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  borderRadius: '8px',
  border: '1px solid rgba(0,0,0,0.12)',
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  }
}));

const AddressComponent = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phoneNumber: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.sub) {
          setUserId(decodedToken.sub);
        } else {
          console.error("Không tìm thấy userId trong token!");
        }
      } catch (error) {
        console.error("Lỗi khi decode token:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchAddresses = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/Address/user/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setAddresses(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy địa chỉ:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, [userId]);

  const handleOpenModal = (address = null) => {
    setEditMode(!!address);
    setSelectedAddress(address);
    setNewAddress(address || {
      fullName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      phoneNumber: "",
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditMode(false);
    setSelectedAddress(null);
  };

  const handleInputChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = async () => {
    if (!userId) {
      console.error("Không tìm thấy userId, không thể thêm địa chỉ.");
      return;
    }

    try {
      if (editMode && selectedAddress) {
        const response = await axios.put(
          `${process.env.REACT_APP_API_BASE_URL}/api/Address/update/${selectedAddress.id}`,
          { ...newAddress, userId },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" } }
        );
        setAddresses(addresses.map((addr) => (addr.id === selectedAddress.id ? response.data : addr)));
      } else {
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/Address/add`,
          { ...newAddress, userId },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" } }
        );
        setAddresses([...addresses, response.data]);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Lỗi khi lưu địa chỉ:", error);
    }
  };

  const handleOpenDeleteDialog = (address) => {
    setAddressToDelete(address);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setAddressToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteAddress = async () => {
    if (!addressToDelete) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/Address/delete/${addressToDelete.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAddresses(addresses.filter((addr) => addr.id !== addressToDelete.id));
    } catch (error) {
      console.error("Lỗi khi xóa địa chỉ:", error);
    }
    handleCloseDeleteDialog();
  };

  const fieldLabels = {
    fullName: "Họ và tên",
    addressLine1: "Địa chỉ dòng 1",
    addressLine2: "Địa chỉ dòng 2 (tùy chọn)",
    city: "Thành phố",
    state: "Tỉnh/Thành phố",
    zipCode: "Mã bưu điện",
    country: "Quốc gia",
    phoneNumber: "Số điện thoại"
  };
  const hiddenFieldsInEditMode = ['id', 'userId', 'user'];

  return (
    <Box sx={{ p: 3 }}>
      <StyledCard>
        <CardHeader 
          title={<Typography variant="h5" fontWeight="600">Địa chỉ của bạn</Typography>}
          action={
            <Button 
              variant="contained" 
              startIcon={<Add />}
              onClick={() => handleOpenModal()}
              sx={{
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark'
                }
              }}
            >
              Thêm địa chỉ
            </Button>
          }
          sx={{
            borderBottom: '1px solid rgba(0,0,0,0.08)'
          }}
        />
        <CardContent>
          {loading ? (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">Đang tải địa chỉ...</Typography>
            </Box>
          ) : addresses.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary" mb={2}>
                Bạn chưa có địa chỉ nào được lưu.
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => handleOpenModal()}
              >
                Thêm địa chỉ mới
              </Button>
            </Box>
          ) : (
            <Stack spacing={3}>
              {addresses.map((address) => (
                <AddressItem key={address.id}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                        {address.fullName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {address.addressLine1}
                      </Typography>
                      {address.addressLine2 && (
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {address.addressLine2}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {address.city}, {address.state}, {address.zipCode}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {address.country}
                      </Typography>
                      <Typography variant="body2" mt={1}>
                        <Box component="span" fontWeight="500">Điện thoại:</Box> {address.phoneNumber}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <IconButton 
                        onClick={() => handleOpenModal(address)}
                        sx={{
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.08)'
                          }
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleOpenDeleteDialog(address)}
                        sx={{
                          color: 'error.main',
                          '&:hover': {
                            backgroundColor: 'rgba(211, 47, 47, 0.08)'
                          }
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </AddressItem>
              ))}
            </Stack>
          )}
        </CardContent>
      </StyledCard>

      {/* Modal thêm/sửa địa chỉ */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: '90%', sm: '500px' },
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: "12px",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Box sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="600">
                {editMode ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
              </Typography>
              <IconButton onClick={handleCloseModal}>
                <Close />
              </IconButton>
            </Stack>
            
            <Divider sx={{ mb: 3 }} />
            
            <Stack spacing={2}>
              {Object.keys(newAddress)
                .filter(key => !editMode || !hiddenFieldsInEditMode.includes(key))
                .map((key) => (
                  <TextField
                    key={key}
                    fullWidth
                    label={fieldLabels[key] || key}
                    name={key}
                    value={newAddress[key]}
                    onChange={handleInputChange}
                    size="small"
                    variant="outlined"
                    required={key !== 'addressLine2'} // Chỉ addressLine2 là không bắt buộc
                  />
              ))}
            </Stack>
            
            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={4}>
              <Button 
                variant="outlined" 
                onClick={handleCloseModal}
                sx={{
                  color: 'text.primary',
                  borderColor: 'rgba(0,0,0,0.23)'
                }}
              >
                Hủy
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSaveAddress}
                sx={{
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark'
                  }
                }}
              >
                {editMode ? "Cập nhật" : "Lưu địa chỉ"}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Modal>

      {/* Dialog xác nhận xóa */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleCloseDeleteDialog}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            padding: '16px'
          }
        }}
      >
        <DialogTitle fontWeight="600">Xác nhận xóa địa chỉ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa địa chỉ này? Thao tác này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDeleteDialog}
            sx={{
              color: 'text.primary',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.04)'
              }
            }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleDeleteAddress} 
            color="error"
            variant="contained"
            sx={{
              '&:hover': {
                backgroundColor: 'error.dark'
              }
            }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddressComponent;