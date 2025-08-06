import { useEffect, useState } from "react";
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
  Chip,
  Fade,
  Zoom,
  Slide,
} from "@mui/material";
import {
  Delete,
  Edit,
  Add,
  Close,
  LocationOn,
  Phone,
  Person,
  Home,
  Public,
  Circle,
} from "@mui/icons-material";
import { styled, keyframes } from "@mui/material/styles";
import { useAddresses } from "@/hooks/api/useAddresses";

// Animations
const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.3); }
  50% { box-shadow: 0 0 30px rgba(255, 255, 255, 0.6); }
`;

const slideInFromLeft = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: "900px",
  margin: "2rem auto",
  borderRadius: "24px",
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(0,0,0,0.1)",
  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
  overflow: "hidden",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "2px",
    background: "linear-gradient(90deg, #000000, #666666, #000000)",
  },
}));

const AddressItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: "16px",
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(0,0,0,0.1)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "4px",
    height: "100%",
    background: "linear-gradient(180deg, #000000, #666666)",
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  "&:hover": {
    transform: "translateY(-8px) scale(1.02)",
    boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
    border: "1px solid rgba(0,0,0,0.2)",
    background:
      "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)",
    "&::before": {
      opacity: 1,
    },
  },
  animation: `${slideInFromLeft} 0.6s ease-out`,
}));

const TechButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: "12px",
  textTransform: "none",
  fontWeight: 600,
  padding: "12px 24px",
  position: "relative",
  overflow: "hidden",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  ...(variant === "contained" && {
    background: "linear-gradient(135deg, #000000 0%, #333333 100%)",
    color: "#ffffff",
    border: "1px solid rgba(0,0,0,0.2)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
      background: "linear-gradient(135deg, #333333 0%, #555555 100%)",
    },
  }),
  ...(variant === "outlined" && {
    background: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(0,0,0,0.3)",
    color: "#000000",
    "&:hover": {
      background: "rgba(0,0,0,0.05)",
      borderColor: "#000000",
      transform: "translateY(-2px)",
    },
  }),
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
    transition: "left 0.5s",
  },
  "&:hover::before": {
    left: "100%",
  },
}));

const TechIconButton = styled(IconButton)(({ theme, color }) => ({
  width: 44,
  height: 44,
  borderRadius: "12px",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  ...(color === "edit" && {
    background:
      "linear-gradient(135deg, rgba(0, 0, 0, 0.05), rgba(50, 50, 50, 0.05))",
    color: "#000000",
    border: "1px solid rgba(0, 0, 0, 0.2)",
    "&:hover": {
      background: "linear-gradient(135deg, #000000, #333333)",
      color: "#ffffff",
      transform: "translateY(-3px) rotate(5deg)",
      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.2)",
    },
  }),
  ...(color === "delete" && {
    background:
      "linear-gradient(135deg, rgba(220, 220, 220, 0.1), rgba(180, 180, 180, 0.1))",
    color: "#666666",
    border: "1px solid rgba(0, 0, 0, 0.2)",
    "&:hover": {
      background: "linear-gradient(135deg, #ff4444, #ff6666)",
      color: "white",
      transform: "translateY(-3px) rotate(-5deg)",
      boxShadow: "0 8px 25px rgba(255, 68, 68, 0.3)",
    },
  }),
}));

const TechModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const ModalContent = styled(Box)(({ theme }) => ({
  width: "90%",
  maxWidth: "500px",
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
  backdropFilter: "blur(20px)",
  borderRadius: "24px",
  border: "1px solid rgba(0,0,0,0.1)",
  boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "3px",
    background: "linear-gradient(90deg, #000000, #666666, #000000)",
  },
}));

const TechTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    background: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "rgba(255,255,255,0.9)",
    },
    "&.Mui-focused": {
      background: "rgba(255,255,255,1)",
      boxShadow: "0 0 0 3px rgba(0,0,0,0.1)",
    },
    "& fieldset": {
      borderColor: "rgba(0,0,0,0.2)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(0,0,0,0.4)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#000000",
      borderWidth: "2px",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#64748b",
    "&.Mui-focused": {
      color: "#000000",
    },
  },
}));

const InfoChip = styled(Chip)(({ theme }) => ({
  background:
    "linear-gradient(135deg, rgba(0, 0, 0, 0.05), rgba(50, 50, 50, 0.05))",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(0, 0, 0, 0.2)",
  borderRadius: "8px",
  color: "#000000",
  fontWeight: 600,
  "& .MuiChip-icon": {
    color: "#333333",
  },
}));

const AddressComponent = () => {
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
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
  const {
    addresses,
    loading,
    error,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
  } = useAddresses();

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses, refreshTrigger]);

  // Debug log để theo dõi thay đổi addresses
  useEffect(() => {
    console.log("Addresses updated:", addresses);
  }, [addresses]);

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
    try {
      if (editMode && selectedAddress) {
        await updateAddress(selectedAddress.id, newAddress);
        console.log("Địa chỉ đã được cập nhật");
      } else {
        await addAddress(newAddress);
        console.log("Địa chỉ mới đã được thêm");
      }
      handleCloseModal();
      // Trigger refresh
      setRefreshTrigger((prev) => prev + 1);
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
      await deleteAddress(addressToDelete.id);
      console.log("Địa chỉ đã được xóa");
      // Trigger refresh
      setRefreshTrigger((prev) => prev + 1);
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
    <Box
      sx={{
        p: 3,
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%)",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23000000" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')',
          opacity: 0.5,
        },
      }}
    >
      <StyledCard>
        <CardHeader
          title={
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #000000, #333333)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: `${float} 3s ease-in-out infinite`,
                }}
              >
                <LocationOn sx={{ color: "#ffffff", fontSize: 24 }} />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  fontWeight="700"
                  sx={{
                    background: "linear-gradient(135deg, #000000, #333333)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 0.5,
                  }}
                >
                  Sổ Địa Chỉ
                </Typography>
                <Typography variant="body2" sx={{ color: "#666666" }}>
                  Quản lý địa chỉ giao hàng của bạn
                </Typography>
              </Box>
            </Box>
          }
          action={
            <TechButton
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenModal()}
            >
              Thêm Địa Chỉ
            </TechButton>
          }
          sx={{
            borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
            pb: 3,
          }}
        />
        <CardContent sx={{ p: 4 }}>
          {loading ? (
            <Box textAlign="center" py={6}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  border: "3px solid rgba(0, 0, 0, 0.3)",
                  borderTopColor: "#000000",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 16px",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              />
              <Typography sx={{ color: "#666666" }} variant="h6">
                Đang tải địa chỉ...
              </Typography>
            </Box>
          ) : addresses.length === 0 ? (
            <Fade in={true}>
              <Box
                textAlign="center"
                py={8}
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(0, 0, 0, 0.05), rgba(50, 50, 50, 0.05))",
                  borderRadius: "20px",
                  border: "2px dashed rgba(0, 0, 0, 0.3)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #000000, #333333)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 24px",
                    animation: `${glowPulse} 2s ease-in-out infinite`,
                  }}
                >
                  <Home sx={{ color: "white", fontSize: 32 }} />
                </Box>
                <Typography
                  variant="h5"
                  fontWeight="600"
                  mb={2}
                  sx={{
                    background: "linear-gradient(135deg, #000000, #333333)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Chưa có địa chỉ nào
                </Typography>
                <Typography variant="body1" sx={{ color: "#666666" }} mb={4}>
                  Thêm địa chỉ để thuận tiện cho việc giao hàng
                </Typography>
                <TechButton
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => handleOpenModal()}
                  size="large"
                >
                  Thêm địa chỉ đầu tiên
                </TechButton>
              </Box>
            </Fade>
          ) : (
            <Stack spacing={3}>
              {addresses.map((address, index) => (
                <Zoom
                  in={true}
                  style={{ transitionDelay: `${index * 100}ms` }}
                  key={address.id}
                >
                  <AddressItem>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 2,
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: "10px",
                              background:
                                "linear-gradient(135deg, #000000, #333333)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Person sx={{ color: "white", fontSize: 20 }} />
                          </Box>
                          <Typography
                            variant="h6"
                            fontWeight="700"
                            sx={{
                              background:
                                "linear-gradient(135deg, #000000, #333333)",
                              backgroundClip: "text",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            {address.fullName}
                          </Typography>
                        </Box>

                        <Stack spacing={1.5} sx={{ ml: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <LocationOn
                              sx={{ color: "#000000", fontSize: 18 }}
                            />
                            <Typography
                              variant="body1"
                              color="#374151"
                              fontWeight="500"
                            >
                              {address.addressLine1}
                            </Typography>
                          </Box>

                          {address.addressLine2 && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                ml: 4.5,
                              }}
                            >
                              <Circle sx={{ color: "#94a3b8", fontSize: 6 }} />
                              <Typography variant="body2" color="#6b7280">
                                {address.addressLine2}
                              </Typography>
                            </Box>
                          )}

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Public sx={{ color: "#333333", fontSize: 18 }} />
                            <Typography
                              variant="body2"
                              color="#6b7280"
                              fontWeight="500"
                            >
                              {address.city}, {address.state} {address.zipCode}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Public sx={{ color: "#666666", fontSize: 18 }} />
                            <Typography
                              variant="body2"
                              color="#6b7280"
                              fontWeight="500"
                            >
                              {address.country}
                            </Typography>
                          </Box>
                        </Stack>

                        <Box sx={{ mt: 3 }}>
                          <InfoChip
                            icon={<Phone />}
                            label={address.phoneNumber}
                            size="medium"
                          />
                        </Box>
                      </Box>

                      <Stack direction="row" spacing={1.5}>
                        <TechIconButton
                          color="edit"
                          onClick={() => handleOpenModal(address)}
                        >
                          <Edit fontSize="small" />
                        </TechIconButton>
                        <TechIconButton
                          color="delete"
                          onClick={() => handleOpenDeleteDialog(address)}
                        >
                          <Delete fontSize="small" />
                        </TechIconButton>
                      </Stack>
                    </Stack>
                  </AddressItem>
                </Zoom>
              ))}
            </Stack>
          )}
        </CardContent>
      </StyledCard>

      {/* Modal thêm/sửa địa chỉ */}
      <TechModal open={openModal} onClose={handleCloseModal}>
        <Slide direction="up" in={openModal} mountOnEnter unmountOnExit>
          <ModalContent>
            <Box sx={{ p: 4 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {editMode ? (
                      <Edit sx={{ color: "white", fontSize: 20 }} />
                    ) : (
                      <Add sx={{ color: "white", fontSize: 20 }} />
                    )}
                  </Box>
                  <Typography
                    variant="h5"
                    fontWeight="700"
                    sx={{
                      background: "linear-gradient(135deg, #1e40af, #7c3aed)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {editMode ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
                  </Typography>
                </Box>
                <TechIconButton onClick={handleCloseModal} color="delete">
                  <Close />
                </TechIconButton>
              </Stack>

              <Divider
                sx={{
                  mb: 4,
                  background:
                    "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)",
                  height: "2px",
                  border: "none",
                }}
              />

              <Stack spacing={3}>
                {Object.keys(newAddress)
                  .filter(
                    (key) => !editMode || !hiddenFieldsInEditMode.includes(key)
                  )
                  .map((key, index) => (
                    <Fade
                      in={true}
                      style={{ transitionDelay: `${index * 100}ms` }}
                      key={key}
                    >
                      <TechTextField
                        fullWidth
                        label={fieldLabels[key] || key}
                        name={key}
                        value={newAddress[key]}
                        onChange={handleInputChange}
                        size="medium"
                        variant="outlined"
                        required={key !== "addressLine2"}
                      />
                    </Fade>
                  ))}
              </Stack>

              <Stack
                direction="row"
                spacing={2}
                justifyContent="flex-end"
                mt={5}
              >
                <TechButton
                  variant="outlined"
                  onClick={handleCloseModal}
                  size="large"
                >
                  Hủy
                </TechButton>
                <TechButton
                  variant="contained"
                  onClick={handleSaveAddress}
                  size="large"
                >
                  {editMode ? "Cập nhật" : "Lưu địa chỉ"}
                </TechButton>
              </Stack>
            </Box>
          </ModalContent>
        </Slide>
      </TechModal>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            padding: "8px",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.3)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
          },
        }}
      >
        <DialogTitle
          fontWeight="700"
          sx={{
            textAlign: "center",
            pb: 1,
            background: "linear-gradient(135deg, #1e40af, #7c3aed)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ⚠️ Xác nhận xóa địa chỉ
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", py: 3 }}>
          <DialogContentText sx={{ fontSize: "1.1rem", color: "#374151" }}>
            Bạn có chắc chắn muốn xóa địa chỉ này?
            <br />
            <strong>Thao tác này không thể hoàn tác.</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: "center", gap: 2 }}>
          <TechButton
            onClick={handleCloseDeleteDialog}
            variant="outlined"
            size="large"
          >
            Hủy
          </TechButton>
          <TechButton
            onClick={handleDeleteAddress}
            variant="contained"
            size="large"
            sx={{
              background:
                "linear-gradient(135deg, #ef4444, #f87171) !important",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #dc2626, #ef4444) !important",
              },
            }}
          >
            Xóa ngay
          </TechButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddressComponent;
