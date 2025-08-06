import React from "react";
import BannersTable from "@/components/Admin/home/BannersTable";
import AddBannerDrawer from "@/components/Admin/home/AddBannerDrawer";
import EditBannerDrawer from "@/components/Admin/home/EditBannerDrawer";
import Header from "@/components/Admin/common/Header";
import { Box } from "@mui/material";

const BannerAdminPage = () => {
  return (
    <Box sx={{ flexGrow: 1, bgcolor: "#1a202c", minHeight: "100vh", color: "#e2e8f0" }}>
      <Header title="Quản lý Banner Trang chủ" />
      <BannersTable />
      <AddBannerDrawer />
      <EditBannerDrawer />
    </Box>
  );
};

export default BannerAdminPage;
