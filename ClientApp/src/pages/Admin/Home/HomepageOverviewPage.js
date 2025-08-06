import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Zap, LayoutDashboard, Tags, ImageIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Admin/common/Header";
import axios from "axios";

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Link as MuiLink,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";

const HomepageOverviewPage = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/homepage-config`
        );
        setConfig(response.data);
      } catch (err) {
        setError("Failed to load homepage configuration.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "#1a202c",
        }}
      >
        <CircularProgress sx={{ color: "#63b3ed" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        sx={{
          m: 2,
          bgcolor: "#2d3748",
          color: "#e2e8f0",
          "& .MuiAlert-icon": { color: "#f56565" },
        }}
      >
        {error}
      </Alert>
    );
  }

  if (!config) {
    return (
      <Alert
        severity="warning"
        sx={{
          m: 2,
          bgcolor: "#2d3748",
          color: "#e2e8f0",
          "& .MuiAlert-icon": { color: "#ecc94b" },
        }}
      >
        No homepage configuration found.
      </Alert>
    );
  }

  const totalSections = Object.keys(config.components).length;
  const enabledSections = Object.values(config.components).filter(
    (comp) => comp.enabled
  ).length;
  const disabledSections = totalSections - enabledSections;

  const managementLinks = [
    {
      title: "Bố cục & Nội dung Trang chủ",
      description:
        "Quản lý thứ tự và nội dung của các phần chính trên trang chủ.",
      icon: LayoutDashboard,
      href: "/admin/homepage",
      color: "#6366F1",
    },
    {
      title: "Danh mục Sản phẩm",
      description:
        "Thêm, chỉnh sửa, xóa và kích hoạt/hủy kích hoạt danh mục sản phẩm.",
      icon: Tags,
      href: "/admin/categories",
      color: "#8B5CF6",
    },
    {
      title: "Sản phẩm Flash Sale",
      description:
        "Đặt và xóa giá flash sale cũng như thời lượng cho sản phẩm.",
      icon: Zap,
      href: "/admin/flash-sale",
      color: "#EC4899",
    },
    {
      title: "Banner Trang chủ",
      description: "Quản lý các banner hình ảnh cho thanh trượt trang chủ.",
      icon: ImageIcon,
      href: "/admin/banners",
      color: "#10B981",
    },
    {
      title: "Slider Trang chủ",
      description: "Quản lý các slider hiển thị trên trang chủ.",
      icon: ImageIcon,
      href: "/admin/sliders",
      color: "#F59E42",
    },
    {
      title: "Sản phẩm ghim (Kanban)",
      description: "Quản lý sản phẩm ghim với giao diện Kanban hiện đại.",
      icon: LayoutDashboard,
      href: "/admin/pinned-products",
      color: "#3B82F6",
    },
  ];

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: "#1a202c",
        minHeight: "100vh",
        color: "#e2e8f0",
      }}
    >
      <Header title="Tổng quan Trang chủ" />

      <Box
        component="main"
        sx={{ maxWidth: "7xl", mx: "auto", py: 3, px: { xs: 2, lg: 4 } }}
      >
        {/* Overview Stats */}
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ borderRadius: 2, bgcolor: "#2d3748" }}>
              <CardContent>
                <Typography
                  variant="h6"
                  color="primary"
                  sx={{ fontWeight: "bold" }}
                >
                  Tổng số phần
                </Typography>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: "bold", color: "#63b3ed" }}
                >
                  {totalSections}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ borderRadius: 2, bgcolor: "#2d3748" }}>
              <CardContent>
                <Typography
                  variant="h6"
                  color="success"
                  sx={{ fontWeight: "bold" }}
                >
                  Phần đang hoạt động
                </Typography>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: "bold", color: "#48bb78" }}
                >
                  {enabledSections}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ borderRadius: 2, bgcolor: "#2d3748" }}>
              <CardContent>
                <Typography
                  variant="h6"
                  color="error"
                  sx={{ fontWeight: "bold" }}
                >
                  Phần đã tắt
                </Typography>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: "bold", color: "#f56565" }}
                >
                  {disabledSections}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </motion.div>

        {/* Section Status List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card
            elevation={0}
            sx={{ borderRadius: 2, mb: 4, bgcolor: "#2d3748" }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{ mb: 2, fontWeight: "bold", color: "#e2e8f0" }}
              >
                Trạng thái các phần trang chủ
              </Typography>
              <List>
                {config.layout.map((sectionName) => (
                  <ListItem
                    key={sectionName}
                    secondaryAction={
                      <Chip
                        label={
                          config.components[sectionName]?.enabled
                            ? "Đang hoạt động"
                            : "Đã tắt"
                        }
                        color={
                          config.components[sectionName]?.enabled
                            ? "success"
                            : "error"
                        }
                        icon={
                          config.components[sectionName]?.enabled ? (
                            <Visibility />
                          ) : (
                            <VisibilityOff />
                          )
                        }
                      />
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography
                          variant="body1"
                          sx={{ textTransform: "capitalize", color: "#e2e8f0" }}
                        >
                          {sectionName.replace(/_/g, " ")}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </motion.div>

        {/* Management Links */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {managementLinks.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <MuiLink
                component={RouterLink}
                to={item.href}
                sx={{
                  textDecoration: "none",
                  "&:hover": { textDecoration: "none" },
                }}
              >
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "all 0.3s ease-in-out",
                    bgcolor: "#2d3748",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 2,
                        color: item.color,
                      }}
                    >
                      {React.createElement(item.icon, {
                        size: 30,
                        style: { marginRight: "12px" },
                      })}
                      <Typography
                        variant="h6"
                        component="h2"
                        sx={{ fontWeight: "bold", color: "#e2e8f0" }}
                      >
                        {item.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="white">
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </MuiLink>
            </Grid>
          ))}
        </motion.div>
      </Box>
    </Box>
  );
};

export default HomepageOverviewPage;
