import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  CircularProgress,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Decode token to get userId
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.sub) {
          setUserId(decodedToken.sub);
        } else {
          console.error("Không tìm thấy userId trong token!");
        }
      } catch (err) {
        console.error("Lỗi khi decode token:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://localhost:7107/api/orders/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        setOrders(response.data);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách đơn hàng:", err);
        setError("Không thể tải danh sách đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Typography color="error">{error}</Typography>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "6rem auto" }}> {/* Tăng maxWidth */}
      <Card style={{ border: "2px solid black", borderRadius: "16px" }}>
        <CardHeader
          title={<Typography variant="h6">Đơn hàng của bạn</Typography>}
        />
        <CardContent>
          {orders.length === 0 ? (
            <Typography>Bạn chưa có đơn hàng nào.</Typography>
          ) : (
            <List>
              {orders.map((order) => (
                <ListItem
                  key={order.id}
                  style={{
                    border: "1px solid black",
                    borderRadius: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <ListItemText
                    
                    secondary={
                      <>
                        <Typography>
                          Ngày đặt: {new Date(order.orderDate).toLocaleDateString()}
                        </Typography>
                        <Typography>
                          Tổng tiền: {order.totalAmount.toLocaleString()} VND
                        </Typography>
                        <Typography>Trạng thái: {order.orderStatus}</Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserOrders;