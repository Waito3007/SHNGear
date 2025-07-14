import React from "react";
import SlidersTable from "@/components/Admin/home/SlidersTable";
import AddSliderDrawer from "@/components/Admin/home/AddSliderDrawer";
import EditSliderDrawer from "@/components/Admin/home/EditSliderDrawer";
import Header from "@/components/Admin/common/Header";
import { Box } from "@mui/material";

const SliderAdminPage = () => {
  return (
    <Box sx={{ flexGrow: 1, bgcolor: "#1a202c", minHeight: "100vh", color: "#e2e8f0" }}>
      <Header title="Quản lý Slider Trang chủ" />
      <SlidersTable />
      <AddSliderDrawer />
      <EditSliderDrawer />
    </Box>
  );
};

export default SliderAdminPage;
