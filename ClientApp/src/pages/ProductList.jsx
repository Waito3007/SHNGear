import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Breadcrumbs,
  Link,
  Button,
  InputBase,
  IconButton,
  Fade,
  useScrollTrigger,
  Zoom,
  Fab,
} from "@mui/material";
import {
  Home,
  ChevronRight,
  Search,
  ArrowUp,
  GridIcon,
  ListIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar/Navbar";
import CategoryMenu from "../components/List/CategoryMenu";
import FilterSection from "../components/List/FilterSection";
import ProductGrid from "../components/List/ProductGrid";
import Commitment from "../components/Commitment/Commitment";
import Footer from "../components/Footer/Footer";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
};

const ProductList = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryId = queryParams.get("categoryId");
  const searchQuery = queryParams.get("search");

  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [searchValue, setSearchValue] = useState(searchQuery || "");

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <motion.div initial="hidden" animate="show" variants={container}>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f8fafc",
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        }}
      >
        <Navbar />

        <Container
          maxWidth="xl"
          sx={{
            pt: { xs: 3, sm: 4 },
            pb: { xs: 6, sm: 8 },
            position: "relative",
          }}
        >
          <motion.div variants={item}>
            {/* Breadcrumb Navigation */}
            <Breadcrumbs
              separator={<ChevronRight size={16} />}
              sx={{
                mb: 4,
                px: 2,
                py: 1.5,
                bgcolor: "background.paper",
                borderRadius: 2,
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(230, 232, 236, 0.8)",
                "& .MuiBreadcrumbs-li": {
                  display: "flex",
                  alignItems: "center",
                },
              }}
            >
              <Link
                href="/"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: "text.secondary",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  transition: "color 0.2s ease",
                  "&:hover": { color: "primary.main" },
                }}
              >
                <Home size={16} />
                Trang chủ
              </Link>
              <Typography
                color="text.primary"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                {searchQuery ? "Tìm kiếm" : "Danh mục sản phẩm"}
              </Typography>
            </Breadcrumbs>
          </motion.div>

          <motion.div variants={item}>
            {/* Page Header */}
            <Box sx={{ mb: 6, textAlign: "center" }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 800,
                  background:
                    "linear-gradient(45deg, #1e293b 30%, #334155 90%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 2,
                  letterSpacing: "-0.02em",
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: -8,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 60,
                    height: 4,
                    borderRadius: 2,
                    background:
                      "linear-gradient(45deg, #6366F1 30%, #818CF8 90%)",
                  },
                }}
              >
                {searchQuery
                  ? `Kết quả tìm kiếm cho "${searchQuery}"`
                  : "Khám phá sản phẩm"}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  color: "text.secondary",
                  maxWidth: 600,
                  mx: "auto",
                  mb: 4,
                  lineHeight: 1.6,
                }}
              >
                Khám phá bộ sưu tập sản phẩm công nghệ đa dạng với chất lượng
                đảm bảo
              </Typography>
            </Box>
          </motion.div>

          <motion.div variants={item}>
            {/* Category Menu */}
            <Paper
              elevation={0}
              sx={{
                mb: 4,
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                backdropFilter: "blur(20px)",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 24px -8px rgba(0,0,0,0.1)",
                },
              }}
            >
              <CategoryMenu />
            </Paper>
          </motion.div>

          <motion.div variants={item}>
            {/* View Mode Toggle */}{" "}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                mb: 3,
                gap: 2,
              }}
            >
              {/* View Mode Buttons */}
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<GridIcon size={18} />}
                  variant={viewMode === "grid" ? "contained" : "outlined"}
                  onClick={() => setViewMode("grid")}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    boxShadow: "none",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 8px -4px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  Grid
                </Button>
                <Button
                  size="small"
                  startIcon={<ListIcon size={18} />}
                  variant={viewMode === "list" ? "contained" : "outlined"}
                  onClick={() => setViewMode("list")}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    boxShadow: "none",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 8px -4px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  List
                </Button>
              </Box>
            </Box>
          </motion.div>

          <motion.div variants={item}>
            {/* Main Content */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "280px 1fr" },
                gap: 4,
              }}
            >
              {/* Filter Section */}
              <motion.div variants={item}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    height: "fit-content",
                    position: { lg: "sticky" },
                    top: { lg: 24 },
                    backdropFilter: "blur(20px)",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      boxShadow: "0 8px 16px -4px rgba(0,0,0,0.1)",
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <FilterSection
                    onPriceChange={setSelectedPriceRange}
                    onBrandChange={setSelectedBrand}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                  />
                </Paper>
              </motion.div>

              {/* Product Grid */}
              <motion.div variants={item} style={{ width: "100%" }}>
                <ProductGrid
                  selectedCategory={categoryId ? parseInt(categoryId) : null}
                  selectedPriceRange={selectedPriceRange}
                  selectedBrand={selectedBrand}
                  viewMode={viewMode}
                />
              </motion.div>
            </Box>
          </motion.div>
        </Container>

        <motion.div variants={item}>
          <Box sx={{ bgcolor: "background.paper" }}>
            <Container maxWidth="xl" sx={{ py: 6 }}>
              <Commitment />
            </Container>
          </Box>
        </motion.div>

        <motion.div variants={item}>
          <Footer />
        </motion.div>
      </Box>

      {/* Scroll to Top Button */}
      <Zoom in={trigger}>
        <Box
          onClick={scrollToTop}
          role="presentation"
          sx={{
            position: "fixed",
            bottom: 32,
            right: 32,
            zIndex: 1000,
          }}
        >
          <Fab
            color="primary"
            size="small"
            aria-label="scroll back to top"
            sx={{
              boxShadow: "0 8px 16px -4px rgba(99, 102, 241, 0.5)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 12px 20px -4px rgba(99, 102, 241, 0.6)",
              },
            }}
          >
            <ArrowUp size={20} />
          </Fab>
        </Box>
      </Zoom>
    </motion.div>
  );
};

export default ProductList;
