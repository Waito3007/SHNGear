import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Button, FormControl, InputLabel, Select, MenuItem, Card, CardContent, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from "@mui/material";

const Checkout = ({ token, onOrderPlaced }) => {
  const [userId, setUserId] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [guestAddress, setGuestAddress] = useState(sessionStorage.getItem("guestAddress") || "");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const id = decoded.sub;
        setUserId(id);
        if (!id) return;

        axios.get(`https://localhost:7107/api/Address/user/${id}`, { headers: { Authorization: `Bearer ${token}` } })
          .then((res) => setAddresses(res.data))
          .catch(() => setAddresses([]));
      } catch (error) {
        console.error("Token decode error", error);
      }
    }
  }, [token]);

  useEffect(() => {
    axios.get("https://localhost:7107/api/PaymentMethods")
      .then((res) => setPaymentMethods(res.data))
      .catch(() => setPaymentMethods([]));
  }, []);

  const handleOrder = async () => {
    const orderData = {
      addressId: userId ? selectedAddress : null,
      guestAddress: userId ? null : guestAddress,
      paymentMethodId: selectedPayment,
      items: JSON.parse(sessionStorage.getItem("cart")) || [],
    };

    try {
      const response = await axios.post("https://localhost:7107/api/Order/place-order", orderData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      alert(response.data.message);
      sessionStorage.removeItem("cart");
      onOrderPlaced();
    } catch (error) {
      alert("Lỗi khi đặt hàng!");
    }
  };

  return (
    <Card sx={{ maxWidth: 500, margin: "auto", padding: 2 }}>
      <CardContent>
        {userId && addresses.length > 0 ? (
          <FormControl fullWidth>
            <InputLabel>Chọn địa chỉ</InputLabel>
            <Select value={selectedAddress} onChange={(e) => setSelectedAddress(e.target.value)}>
              {addresses.map((addr) => (
                <MenuItem key={addr.id} value={addr.id}>{`${addr.fullName} - ${addr.addressLine1}, ${addr.city}`}</MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <>
            <Button fullWidth variant="outlined" onClick={() => setOpenModal(true)}>Nhập Địa Chỉ</Button>
            <Dialog open={openModal} onClose={() => setOpenModal(false)}>
              <DialogTitle>Nhập Địa Chỉ Giao Hàng</DialogTitle>
              <DialogContent>
                <TextField fullWidth label="Địa chỉ" value={guestAddress} onChange={(e) => setGuestAddress(e.target.value)} margin="dense" />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenModal(false)}>Hủy</Button>
                <Button onClick={() => { sessionStorage.setItem("guestAddress", guestAddress); setOpenModal(false); }}>Lưu</Button>
              </DialogActions>
            </Dialog>
          </>
        )}

        <FormControl fullWidth sx={{ marginTop: 2 }}>
          <InputLabel>Chọn phương thức thanh toán</InputLabel>
          <Select value={selectedPayment} onChange={(e) => setSelectedPayment(e.target.value)}>
            {paymentMethods.map((method) => (
              <MenuItem key={method.id} value={method.id}>{method.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button fullWidth variant="contained" color="primary" sx={{ marginTop: 2 }} onClick={handleOrder}>
          Xác nhận đặt hàng
        </Button>
      </CardContent>
    </Card>
  );
};

export default Checkout;
