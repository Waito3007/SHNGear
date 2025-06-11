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
  Paper,
} from "@mui/material";
import { Delete, Edit, Add, Close } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: "800px",
  margin: "2rem auto",
  borderRadius: "12px",
  backgroundColor: "#ffffff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  border: "1px solid #e5e7eb",
  overflow: "hidden",
}));

const AddressItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: "#cb1c22",
    boxShadow: "0 4px 12px rgba(203,28,34,0.15)",
    transform: "translateY(-1px)",
  },
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
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/Address/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
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
    setNewAddress(
      address || {
        fullName: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        phoneNumber: "",
      }
    );
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
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        setAddresses(
          addresses.map((addr) =>
            addr.id === selectedAddress.id ? response.data : addr
          )
        );
      } else {
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/Address/add`,
          { ...newAddress, userId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
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
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/api/Address/delete/${addressToDelete.id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
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
    phoneNumber: "Số điện thoại",
  };
  const hiddenFieldsInEditMode = ["id", "userId", "user"];

  return (
    <Box sx={{ p: 3 }}>
      <StyledCard>
        <CardHeader
          title={
            <Typography variant="h5" fontWeight="600" color="#1f2937">
              Sổ địa chỉ
            </Typography>
          }
          action={
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenModal()}
              sx={{
                backgroundColor: "#cb1c22",
                color: "white",
                fontWeight: "500",
                px: 3,
                py: 1,
                borderRadius: "6px",
                textTransform: "none",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                "&:hover": {
                  backgroundColor: "#a11520",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                },
              }}
            >
              Thêm địa chỉ
            </Button>
          }
          sx={{
            borderBottom: "1px solid #e5e7eb",
            pb: 2,
          }}
        />
        <CardContent>
          {loading ? (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">
                Đang tải địa chỉ...
              </Typography>
            </Box>
          ) : addresses.length === 0 ? (
            <Box
              textAlign="center"
              py={8}
              sx={{
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                border: "1px dashed #d1d5db",
              }}
            >
              <Typography variant="h6" fontWeight="500" mb={1} color="#6b7280">
                Chưa có địa chỉ nào
              </Typography>
              <Typography variant="body2" color="#9ca3af" mb={3}>
                Thêm địa chỉ để thuận tiện cho việc giao hàng
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => handleOpenModal()}
                sx={{
                  borderColor: "#cb1c22",
                  color: "#cb1c22",
                  fontWeight: "500",
                  px: 3,
                  py: 1,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#cb1c22",
                    color: "white",
                    borderColor: "#cb1c22",
                  },
                }}
              >
                Thêm địa chỉ đầu tiên
              </Button>
            </Box>
          ) : (
            <Stack spacing={3}>
              {addresses.map((address) => (
                <AddressItem key={address.id}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        fontWeight="600"
                        mb={1}
                        color="#1f2937"
                      >
                        {address.fullName}
                      </Typography>

                      <Typography variant="body1" mb={0.5} color="#374151">
                        {address.addressLine1}
                      </Typography>

                      {address.addressLine2 && (
                        <Typography variant="body2" mb={1} color="#6b7280">
                          {address.addressLine2}
                        </Typography>
                      )}

                      <Typography variant="body2" mb={1} color="#6b7280">
                        {address.city}, {address.state} {address.zipCode}
                      </Typography>

                      <Typography variant="body2" mb={2} color="#6b7280">
                        {address.country}
                      </Typography>

                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          px: 2,
                          py: 0.5,
                          backgroundColor: "#f3f4f6",
                          borderRadius: "4px",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight="500"
                          color="#374151"
                        >
                          📞 {address.phoneNumber}
                        </Typography>
                      </Box>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        onClick={() => handleOpenModal(address)}
                        sx={{
                          color: "#3b82f6",
                          backgroundColor: "#eff6ff",
                          border: "1px solid #dbeafe",
                          width: 36,
                          height: 36,
                          "&:hover": {
                            backgroundColor: "#3b82f6",
                            color: "white",
                            borderColor: "#3b82f6",
                          },
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleOpenDeleteDialog(address)}
                        sx={{
                          color: "#ef4444",
                          backgroundColor: "#fef2f2",
                          border: "1px solid #fecaca",
                          width: 36,
                          height: 36,
                          "&:hover": {
                            backgroundColor: "#ef4444",
                            color: "white",
                            borderColor: "#ef4444",
                          },
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
            width: { xs: "90%", sm: "500px" },
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: "12px",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Box sx={{ p: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
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
                .filter(
                  (key) => !editMode || !hiddenFieldsInEditMode.includes(key)
                )
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
                    required={key !== "addressLine2"} // Chỉ addressLine2 là không bắt buộc
                  />
                ))}
            </Stack>

            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={4}>
              <Button
                variant="outlined"
                onClick={handleCloseModal}
                sx={{
                  color: "text.primary",
                  borderColor: "rgba(0,0,0,0.23)",
                }}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveAddress}
                sx={{
                  backgroundColor: "primary.main",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
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
            borderRadius: "12px",
            padding: "16px",
          },
        }}
      >
        <DialogTitle fontWeight="600">Xác nhận xóa địa chỉ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa địa chỉ này? Thao tác này không thể hoàn
            tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseDeleteDialog}
            sx={{
              color: "text.primary",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.04)",
              },
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleDeleteAddress}
            color="error"
            variant="contained"
            sx={{
              "&:hover": {
                backgroundColor: "error.dark",
              },
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
