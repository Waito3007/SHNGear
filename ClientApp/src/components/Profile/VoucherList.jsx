import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Ticket } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Chip,
  Box
} from "@mui/material";

const VoucherList = () => {
  const [userId, setUserId] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Lấy userId từ token
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setError("Bạn cần đăng nhập để xem voucher!");
      return;
    }
    try {
      const decoded = jwtDecode(token);
      const id = parseInt(decoded.sub || decoded.id || decoded.userId, 10);
      if (!id) throw new Error();
      setUserId(id);

      setLoading(true);
      axios
        .get(`${process.env.REACT_APP_API_BASE_URL}/api/vouchers/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          setVouchers(res.data.vouchers || []);
          setError("");
        })
        .catch(() => {
          setError("Không thể lấy danh sách voucher.");
        })
        .finally(() => setLoading(false));
    } catch {
      setLoading(false);
      setError("Token không hợp lệ, vui lòng đăng nhập lại!");
    }
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }
  if (!vouchers.length) {
    return (
      <Box sx={{ textAlign: "center", p: 4 }}>
        <Typography variant="h6">Bạn chưa có voucher nào</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Hãy tham gia chương trình tích điểm hoặc sự kiện để nhận voucher!
        </Typography>
      </Box>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "3rem auto", padding: "0 1rem" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, justifyContent: "center" }}>
        <Ticket size={32} style={{ color: "#cb1c22", marginRight: 12 }} />
        <Typography variant="h4" fontWeight="bold" color="error.main" align="center">
          Voucher của bạn
        </Typography>
      </Box>

      {/* Thống kê voucher */}
      {vouchers.length > 0 && (
        <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
          <Chip 
            label={`Tổng cộng: ${vouchers.length}`} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label={`Có thể dùng: ${vouchers.filter(v => v.canUse).length}`} 
            color="success" 
            variant="outlined" 
          />
          <Chip 
            label={`Đã dùng: ${vouchers.filter(v => v.isUsed).length}`} 
            color="default" 
            variant="outlined" 
          />
          <Chip 
            label={`Hết hạn: ${vouchers.filter(v => !v.canUse && !v.isUsed).length}`} 
            color="error" 
            variant="outlined" 
          />
        </Box>
      )}

      <TableContainer component={Paper} sx={{ border: "1px solid #e0e0e0", borderRadius: "12px", boxShadow: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Mã Voucher</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Số tiền giảm</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Đơn tối thiểu</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Hạn dùng</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Thông tin</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vouchers.map((v) => (
              <TableRow 
                hover 
                key={v.id}
                sx={{ 
                  backgroundColor: !v.canUse && !v.isUsed ? "#f5f5f5" : "inherit",
                  opacity: !v.canUse && !v.isUsed ? 0.6 : 1
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight="bold" fontFamily="monospace">
                    {v.code}
                  </Typography>
                </TableCell>
                <TableCell sx={{ color: "#1976d2", fontWeight: 600 }}>
                  {v.discountAmount.toLocaleString()}đ
                </TableCell>
                <TableCell>{v.minimumOrderAmount.toLocaleString()}đ</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {new Date(v.expiryDate).toLocaleDateString("vi-VN")}
                    </Typography>
                    {v.daysUntilExpiry > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        Còn {v.daysUntilExpiry} ngày
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  {v.isUsed ? (
                    <Chip label="Đã dùng" color="default" size="small" />
                  ) : v.canUse ? (
                    <Chip label="Có thể dùng" color="success" size="small" />
                  ) : (
                    <Chip label="Hết hạn" color="error" size="small" />
                  )}
                </TableCell>
                <TableCell>
                  <Box>
                    {v.usedAt && (
                      <Typography variant="caption" display="block">
                        Dùng: {new Date(v.usedAt).toLocaleDateString("vi-VN")}
                      </Typography>
                    )}
                    {!v.isActive && (
                      <Typography variant="caption" color="error" display="block">
                        Voucher bị tắt
                      </Typography>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default VoucherList; 