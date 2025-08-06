import React, { useEffect, useState } from "react";
import { useOrders } from "@/hooks/api/useOrders";
import { useNavigate } from "react-router-dom";
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
  Avatar,
  Collapse,
  IconButton,
  Box,
  Chip,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  ShoppingBag,
  Receipt,
  CreditCard,
  LocalShipping,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const UserOrders = () => {
  // Đã khai báo expandedOrder ở dưới, xóa dòng này để tránh trùng lặp
  const { orders, loading, error, userId, setUserId, initUserId, fetchOrders } =
    useOrders();
  const [expandedOrder, setExpandedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const id = initUserId();
    if (id) {
      setUserId(id);
      fetchOrders(id, 1, 10);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "#4CAF50";
      case "Pending":
        return "#FF9800";
      case "Cancelled":
        return "#F44336";
      case "Paid":
        return "#2196F3";
      default:
        return "#666666";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return "✓";
      case "Pending":
        return "⏳";
      case "Cancelled":
        return "✗";
      case "Paid":
        return "💳";
      default:
        return "●";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Delivered":
        return "Đã giao";
      case "Pending":
        return "Chờ xử lý";
      case "Cancelled":
        return "Đã hủy";
      case "Paid":
        return "Đã thanh toán";
      default:
        return status;
    }
  };

  const handleProductClick = (productId) => {
    console.log("Product ID clicked:", productId);
    console.log("Navigating to:", `/product/${productId}`);

    if (productId) {
      navigate(`/product/${productId}`);
    } else {
      console.error("Product ID is undefined or null");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
          bgcolor: "#ffffff",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: "#000000",
              mb: 2,
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Roboto Mono', monospace",
              color: "#000000",
              fontWeight: 600,
              letterSpacing: "1px",
            }}
          >
            ĐANG TẢI DỮ LIỆU...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
          bgcolor: "#ffffff",
        }}
      >
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            border: "2px solid #000000",
            borderRadius: 2,
            background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
            maxWidth: 400,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#F44336",
              mb: 2,
              fontFamily: "'Roboto Mono', monospace",
            }}
          >
            ⚠
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#000000",
              fontFamily: "'Roboto Mono', monospace",
              fontWeight: 600,
            }}
          >
            LỖI TẢI DỮ LIỆU
          </Typography>
          <Typography
            sx={{
              color: "#666666",
              mt: 1,
              fontFamily: "'Roboto Mono', monospace",
            }}
          >
            {error}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#ffffff",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
          zIndex: 1,
        },
      }}
    >
      <Box
        sx={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "2rem 1rem",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Header Section */}
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            p: 4,
            border: "2px solid #000000",
            borderRadius: 2,
            background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
            color: "#ffffff",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)
              `,
              pointerEvents: "none",
            },
          }}
        >
          <Box sx={{ position: "relative", zIndex: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 6,
                  height: 40,
                  bgcolor: "#ffffff",
                  borderRadius: 1,
                }}
              />
              <ShoppingBag sx={{ fontSize: 40, color: "#ffffff" }} />
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  fontFamily: "'Roboto Mono', monospace",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  textShadow: "2px 2px 8px rgba(0,0,0,0.5)",
                }}
              >
                LỊCH SỬ ĐƠN HÀNG
              </Typography>
            </Box>
            <Typography
              variant="body1"
              sx={{
                color: "rgba(255,255,255,0.8)",
                fontFamily: "'Roboto Mono', monospace",
                letterSpacing: "1px",
              }}
            >
              Quản lý và theo dõi tất cả đơn hàng của bạn
            </Typography>
          </Box>
        </Paper>

        {orders.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: "center",
              border: "2px solid #000000",
              borderRadius: 2,
              background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background:
                  "linear-gradient(90deg, #000000 0%, #333333 50%, #000000 100%)",
              },
            }}
          >
            <Receipt sx={{ fontSize: 80, color: "#cccccc", mb: 3 }} />
            <Typography
              variant="h5"
              sx={{
                fontFamily: "'Roboto Mono', monospace",
                fontWeight: 700,
                color: "#000000",
                textTransform: "uppercase",
                letterSpacing: "2px",
                mb: 2,
              }}
            >
              CHƯA CÓ ĐƠN HÀNG
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#666666",
                fontFamily: "'Roboto Mono', monospace",
                letterSpacing: "1px",
                mb: 3,
              }}
            >
              Hãy bắt đầu mua sắm ngay để trải nghiệm dịch vụ của chúng tôi!
            </Typography>
            <Box
              sx={{
                display: "inline-block",
                px: 4,
                py: 2,
                border: "2px solid #000000",
                borderRadius: 2,
                bgcolor: "#000000",
                color: "#ffffff",
                fontFamily: "'Roboto Mono', monospace",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                },
              }}
            >
              Bắt đầu mua sắm
            </Box>
          </Paper>
        ) : (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              border: "2px solid #000000",
              borderRadius: 2,
              background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
              overflow: "hidden",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background:
                  "linear-gradient(90deg, #000000 0%, #333333 50%, #000000 100%)",
                zIndex: 1,
              },
            }}
          >
            <Table>
              <TableHead
                sx={{
                  background:
                    "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
                  "& .MuiTableCell-head": {
                    color: "#ffffff",
                    fontFamily: "'Roboto Mono', monospace",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    fontSize: "0.9rem",
                    borderBottom: "2px solid #333333",
                  },
                }}
              >
                <TableRow>
                  <TableCell sx={{ width: 60 }} />
                  <TableCell>Mã đơn hàng</TableCell>
                  <TableCell align="right">Ngày đặt</TableCell>
                  <TableCell align="right">Tổng tiền</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order, index) => (
                  <React.Fragment key={order.id}>
                    <TableRow
                      component={motion.tr}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      sx={{
                        "&:hover": {
                          bgcolor: "#f8f9fa",
                          transform: "translateX(4px)",
                          transition: "all 0.3s ease",
                        },
                        borderBottom: "1px solid #e0e0e0",
                        "& .MuiTableCell-root": {
                          fontFamily: "'Roboto Mono', monospace",
                          borderBottom: "1px solid #e0e0e0",
                        },
                      }}
                    >
                      <TableCell>
                        <IconButton
                          aria-label="expand row"
                          size="small"
                          onClick={() => toggleOrderExpand(order.id)}
                          sx={{
                            color: "#000000",
                            border: "1px solid #000000",
                            borderRadius: 1,
                            width: 40,
                            height: 40,
                            "&:hover": {
                              bgcolor: "#000000",
                              color: "#ffffff",
                            },
                          }}
                        >
                          {expandedOrder === order.id ? (
                            <KeyboardArrowUp />
                          ) : (
                            <KeyboardArrowDown />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Box
                            sx={{
                              width: 6,
                              height: 30,
                              bgcolor: "#000000",
                              borderRadius: 1,
                            }}
                          />
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: "#000000",
                              fontFamily: "'Roboto Mono', monospace",
                            }}
                          >
                            #{order.id}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          sx={{
                            fontFamily: "'Roboto Mono', monospace",
                            color: "#666666",
                          }}
                        >
                          {new Date(order.orderDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "#000000",
                            fontFamily: "'Roboto Mono', monospace",
                            fontSize: "1.1rem",
                          }}
                        >
                          {order.totalAmount.toLocaleString("vi-VN")}₫
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 1,
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            border: "2px solid #000000",
                            bgcolor: getStatusColor(order.orderStatus),
                            color: "#ffffff",
                            fontFamily: "'Roboto Mono', monospace",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            fontSize: "0.75rem",
                          }}
                        >
                          <span>{getStatusIcon(order.orderStatus)}</span>
                          {getStatusText(order.orderStatus)}
                        </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={6}
                      >
                        <Collapse
                          in={expandedOrder === order.id}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box
                            sx={{
                              margin: 3,
                              p: 3,
                              border: "2px solid #000000",
                              borderRadius: 2,
                              background:
                                "linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)",
                              position: "relative",
                              "&::before": {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                height: "3px",
                                background:
                                  "linear-gradient(90deg, #000000 0%, #333333 50%, #000000 100%)",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                mb: 3,
                              }}
                            >
                              <LocalShipping
                                sx={{ fontSize: 24, color: "#000000" }}
                              />
                              <Typography
                                variant="h6"
                                sx={{
                                  fontFamily: "'Roboto Mono', monospace",
                                  fontWeight: 700,
                                  color: "#000000",
                                  textTransform: "uppercase",
                                  letterSpacing: "1px",
                                }}
                              >
                                Chi tiết đơn hàng
                              </Typography>
                            </Box>
                            <Table size="small">
                              <TableHead
                                sx={{
                                  background: "#000000",
                                  "& .MuiTableCell-head": {
                                    color: "#ffffff",
                                    fontFamily: "'Roboto Mono', monospace",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    fontSize: "0.8rem",
                                  },
                                }}
                              >
                                <TableRow>
                                  <TableCell>Sản phẩm</TableCell>
                                  <TableCell align="right">Đơn giá</TableCell>
                                  <TableCell align="center">Số lượng</TableCell>
                                  <TableCell align="right">
                                    Thành tiền
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {order.items.map((item) => {
                                  console.log("Item data:", item);
                                  return (
                                    <TableRow
                                      key={`${order.id}-${item.productVariantId}`}
                                      sx={{
                                        "&:hover": {
                                          bgcolor: "#f0f0f0",
                                          cursor: "pointer",
                                        },
                                        "& .MuiTableCell-root": {
                                          fontFamily:
                                            "'Roboto Mono', monospace",
                                          borderBottom: "1px solid #e0e0e0",
                                        },
                                      }}
                                    >
                                      <TableCell>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 2,
                                          }}
                                        >
                                          <Avatar
                                            src={
                                              item.productImage?.startsWith(
                                                "http"
                                              )
                                                ? item.productImage
                                                : `${process.env.REACT_APP_API_BASE_URL}/${item.productImage}`
                                            }
                                            sx={{
                                              width: 60,
                                              height: 60,
                                              border: "2px solid #000000",
                                              borderRadius: 2,
                                            }}
                                            variant="rounded"
                                            alt="Product img"
                                            onError={(e) => {
                                              e.target.onerror = null;
                                            }}
                                          />
                                          <Box>
                                            <Typography
                                              variant="subtitle1"
                                              sx={{
                                                cursor: "pointer",
                                                color: "#000000",
                                                fontFamily:
                                                  "'Roboto Mono', monospace",
                                                fontWeight: 700,
                                                "&:hover": {
                                                  textDecoration: "underline",
                                                },
                                              }}
                                              onClick={() =>
                                                handleProductClick(
                                                  item.productId
                                                )
                                              }
                                            >
                                              {item.productName}
                                            </Typography>
                                            <Box
                                              sx={{
                                                display: "flex",
                                                gap: 1,
                                                mt: 1,
                                              }}
                                            >
                                              <Chip
                                                label={item.variantColor}
                                                size="small"
                                                sx={{
                                                  bgcolor: "#000000",
                                                  color: "#ffffff",
                                                  fontFamily:
                                                    "'Roboto Mono', monospace",
                                                  fontSize: "0.7rem",
                                                }}
                                              />
                                              <Chip
                                                label={item.variantStorage}
                                                size="small"
                                                sx={{
                                                  bgcolor: "#666666",
                                                  color: "#ffffff",
                                                  fontFamily:
                                                    "'Roboto Mono', monospace",
                                                  fontSize: "0.7rem",
                                                }}
                                              />
                                            </Box>
                                          </Box>
                                        </Box>
                                      </TableCell>
                                      <TableCell align="right">
                                        <Typography
                                          sx={{
                                            fontWeight: 600,
                                            color: "#000000",
                                            fontFamily:
                                              "'Roboto Mono', monospace",
                                          }}
                                        >
                                          {item.price.toLocaleString("vi-VN")}₫
                                        </Typography>
                                      </TableCell>
                                      <TableCell align="center">
                                        <Box
                                          sx={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: 40,
                                            height: 40,
                                            borderRadius: 1,
                                            border: "2px solid #000000",
                                            bgcolor: "#ffffff",
                                            color: "#000000",
                                            fontFamily:
                                              "'Roboto Mono', monospace",
                                            fontWeight: 700,
                                          }}
                                        >
                                          {item.quantity}
                                        </Box>
                                      </TableCell>
                                      <TableCell align="right">
                                        <Typography
                                          sx={{
                                            fontWeight: 700,
                                            color: "#000000",
                                            fontFamily:
                                              "'Roboto Mono', monospace",
                                            fontSize: "1.1rem",
                                          }}
                                        >
                                          {(
                                            item.price * item.quantity
                                          ).toLocaleString("vi-VN")}
                                          ₫
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                            <Box
                              sx={{
                                mt: 3,
                                pt: 3,
                                borderTop: "2px solid #000000",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <CreditCard
                                  sx={{ fontSize: 20, color: "#000000" }}
                                />
                                <Typography
                                  variant="body1"
                                  sx={{
                                    fontFamily: "'Roboto Mono', monospace",
                                    color: "#666666",
                                    fontWeight: 600,
                                  }}
                                >
                                  Phương thức:{" "}
                                  <Box
                                    component="span"
                                    sx={{
                                      px: 2,
                                      py: 0.5,
                                      borderRadius: 1,
                                      border: "1px solid #000000",
                                      bgcolor: "#000000",
                                      color: "#ffffff",
                                      fontWeight: 700,
                                      textTransform: "uppercase",
                                      letterSpacing: "0.5px",
                                    }}
                                  >
                                    {order.paymentMethodId === 1
                                      ? "Tiền mặt"
                                      : "Online"}
                                  </Box>
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  textAlign: "right",
                                  p: 2,
                                  border: "2px solid #000000",
                                  borderRadius: 2,
                                  bgcolor: "#000000",
                                  color: "#ffffff",
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontFamily: "'Roboto Mono', monospace",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "1px",
                                  }}
                                >
                                  Tổng cộng:{" "}
                                  {order.totalAmount.toLocaleString("vi-VN")}₫
                                </Typography>
                                {order.orderStatus === "Pending" && (
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: "#cccccc",
                                      fontFamily: "'Roboto Mono', monospace",
                                      mt: 0.5,
                                    }}
                                  >
                                    Đơn hàng đang chờ xử lý
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
};

export default UserOrders;
