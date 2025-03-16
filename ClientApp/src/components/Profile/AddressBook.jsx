import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Card, CardContent, CardHeader, Button, Typography, Modal, Box, TextField, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";

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
        const response = await axios.get(`https://localhost:7107/api/Address/user/${userId}`, {
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
          `https://localhost:7107/api/Address/update/${selectedAddress.id}`,
          { ...newAddress, userId },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" } }
        );
        setAddresses(addresses.map((addr) => (addr.id === selectedAddress.id ? response.data : addr)));
      } else {
        const response = await axios.post(
          "https://localhost:7107/api/Address/add",
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
      await axios.delete(`https://localhost:7107/api/Address/delete/${addressToDelete.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAddresses(addresses.filter((addr) => addr.id !== addressToDelete.id));
    } catch (error) {
      console.error("Lỗi khi xóa địa chỉ:", error);
    }
    handleCloseDeleteDialog();
  };

  return (
    <div style={{ maxWidth: "600px", margin: "6rem 2rem" }}>
      <Card style={{ border: "2px solid black", borderRadius: "16px", padding: "16px", backgroundColor: "white", color: "black" }}>
        <CardHeader title={<Typography variant="h6">Địa chỉ của bạn</Typography>} />
        <CardContent>
          {loading ? (
            <Typography>Đang tải...</Typography>
          ) : addresses.length === 0 ? (
            <div style={{ textAlign: "center" }}>
              <Typography>Bạn chưa có địa chỉ nào.</Typography>
              <Button variant="outlined" style={{ marginTop: "16px", borderColor: "black", color: "black" }} onClick={() => handleOpenModal()}>
                Thêm địa chỉ của bạn
              </Button>
            </div>
          ) : (
            <div>
              {addresses.map((address) => (
                <div key={address.id} style={{ padding: "12px", border: "1px solid black", borderRadius: "12px", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <Typography variant="subtitle1" fontWeight="bold">{address.fullName}</Typography>
                    <Typography>{address.addressLine1}</Typography>
                    {address.addressLine2 && <Typography>{address.addressLine2}</Typography>}
                    <Typography>{address.city}, {address.state}, {address.zipCode}, {address.country}</Typography>
                    <Typography>Số điện thoại: {address.phoneNumber}</Typography>
                  </div>
                  <div>
                    <IconButton onClick={() => handleOpenModal(address)}><Edit /></IconButton>
                    <IconButton onClick={() => handleOpenDeleteDialog(address)}><Delete color="error" /></IconButton>
                  </div>
                </div>
              ))}
              <Button variant="outlined" style={{ marginTop: "16px", borderColor: "black", color: "black" }} onClick={() => handleOpenModal()}>
                Thêm địa chỉ phụ
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal thêm/sửa địa chỉ */}
      <Modal open={openModal} onClose={handleCloseModal}>
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 400,
        bgcolor: "white",
        boxShadow: 24,
        p: 4,
        borderRadius: "12px",
        maxHeight: "80vh", // Giới hạn chiều cao tối đa
        overflowY: "auto", // Cho phép cuộn khi nội dung quá dài
      }}
    >
      <Typography variant="h6" textAlign="center" mb={2}>
        {editMode ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ phụ"}
      </Typography>
      
      {Object.keys(newAddress).map((key) => (
        <TextField 
          key={key} 
          fullWidth 
          label={key} 
          name={key} 
          value={newAddress[key]} 
          onChange={handleInputChange} 
          margin="normal" 
        />
      ))}
      
      <Button variant="contained" color="primary" onClick={handleSaveAddress}>
        {editMode ? "Lưu thay đổi" : "Thêm"}
      </Button>
    </Box>
  </Modal>


      {/* Dialog xác nhận xóa */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xác nhận xóa?</DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button onClick={handleDeleteAddress} color="error">Xóa</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddressComponent;
