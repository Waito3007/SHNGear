import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
  Button,
  Skeleton,
  Avatar,
  Divider,
  Collapse,
  IconButton,
  Paper,
} from "@mui/material";
import {
  ChevronDown,
  X,
  ChevronUp,
  Filter,
  Zap,
  Settings2,
  Cpu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBrands } from "@/hooks/api/useBrands";

const priceRanges = [
  { value: "all", min: 0, max: Infinity, label: "Tất cả" },
  { value: "0-2000000", min: 0, max: 2000000, label: "Dưới 2 triệu" },
  {
    value: "2000000-4000000",
    min: 2000000,
    max: 4000000,
    label: "2 - 4 triệu",
  },
  {
    value: "4000000-7000000",
    min: 4000000,
    max: 7000000,
    label: "4 - 7 triệu",
  },
  {
    value: "7000000-13000000",
    min: 7000000,
    max: 13000000,
    label: "7 - 13 triệu",
  },
  {
    value: "13000000-20000000",
    min: 13000000,
    max: 20000000,
    label: "13 - 20 triệu",
  },
  {
    value: "20000000-99999999",
    min: 20000000,
    max: 99999999,
    label: "Trên 20 triệu",
  },
];

const FilterSection = ({ onPriceChange, onBrandChange }) => {
  const [expanded, setExpanded] = useState(["price", "brand"]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [showAllBrands, setShowAllBrands] = useState(false);
  const { brands, loading } = useBrands(true);

  const handleAccordionChange = (panel) => (_, isExpanded) => {
    setExpanded(
      isExpanded
        ? [...expanded, panel]
        : expanded.filter((item) => item !== panel)
    );
  };

  const handlePriceChange = (range) => {
    setSelectedPrice(range);
    onPriceChange(range);
  };

  const handleBrandChange = (brandId) => {
    const newSelectedBrands = selectedBrands.includes(brandId)
      ? selectedBrands.filter((id) => id !== brandId)
      : [...selectedBrands, brandId];

    setSelectedBrands(newSelectedBrands);
    onBrandChange(newSelectedBrands.length > 0 ? newSelectedBrands : null);
  };

  const clearFilters = () => {
    setSelectedPrice("all");
    setSelectedBrands([]);
    onPriceChange("all");
    onBrandChange(null);
  };
  const hasActiveFilters = selectedPrice !== "all" || selectedBrands.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <Paper
        elevation={0}
        sx={{
          background:
            "linear-gradient(145deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%)",
          borderRadius: 4,
          overflow: "hidden",
          border: "2px solid #000000",
          position: "relative",
          width: "100%",
          maxHeight: "85vh",
          boxShadow: `
            0 0 0 1px rgba(0,0,0,0.05),
            0 10px 40px rgba(0,0,0,0.08),
            0 20px 60px rgba(0,0,0,0.12)
          `,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background:
              "linear-gradient(90deg, #000000 0%, #404040 25%, #808080 50%, #404040 75%, #000000 100%)",
            zIndex: 2,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 80%, rgba(0,0,0,0.02) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(0,0,0,0.02) 0%, transparent 50%)
            `,
            pointerEvents: "none",
            zIndex: 1,
          },
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: `
              0 0 0 1px rgba(0,0,0,0.08),
              0 15px 50px rgba(0,0,0,0.12),
              0 25px 80px rgba(0,0,0,0.16)
            `,
            border: "2px solid #333333",
          },
          transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <Box
          sx={{
            maxHeight: "85vh",
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: "0px",
              background: "transparent",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "transparent",
            },
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* Enhanced Header */}{" "}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: { xs: 3, sm: 4 },
              borderBottom: "3px solid #000000",
              bgcolor: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              position: "relative",
              minWidth: 0,
              width: "100%",
              "&::before": {
                content: '""',
                position: "absolute",
                bottom: -3,
                left: 0,
                right: 0,
                height: "2px",
                background:
                  "linear-gradient(90deg, transparent 0%, #000000 20%, #000000 80%, transparent 100%)",
              },
            }}
          >
            {" "}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                minWidth: 0,
                flex: 1,
              }}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{
                  fontFamily: "'Roboto Mono', monospace",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "#000000",
                  background:
                    "linear-gradient(135deg, #000000 0%, #333333 50%, #000000 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  minWidth: 0,
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                  flex: 1,
                }}
              >
                BỘ LỌC
              </Typography>
            </Box>
            {hasActiveFilters && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconButton
                  onClick={clearFilters}
                  sx={{
                    bgcolor: "#000000",
                    color: "#ffffff",
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    border: "3px solid #333333",
                    background:
                      "linear-gradient(135deg, #000000 0%, #333333 50%, #000000 100%)",
                    boxShadow: "0 6px 15px rgba(0,0,0,0.3)",
                    "&:hover": {
                      bgcolor: "#ff0000",
                      background:
                        "linear-gradient(135deg, #ff0000 0%, #cc0000 50%, #ff0000 100%)",
                      transform: "scale(1.05)",
                      boxShadow: "0 8px 20px rgba(255,0,0,0.3)",
                    },
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  <X size={22} />
                </IconButton>
              </motion.div>
            )}
          </Box>
          {/* Active Filters */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Box
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderBottom: "1px solid #e0e0e0",
                    bgcolor: "#f8f9fa",
                  }}
                >
                  {" "}
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "'Roboto Mono', monospace",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      color: "#666666",
                      mb: 2,
                      fontWeight: 700,
                    }}
                  >
                    Bộ lọc đang áp dụng:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {selectedPrice !== "all" && (
                      <Chip
                        label={
                          priceRanges.find((r) => r.value === selectedPrice)
                            ?.label
                        }
                        onDelete={() => handlePriceChange("all")}
                        size="small"
                        sx={{
                          bgcolor: "#000000",
                          color: "#ffffff",
                          border: "2px solid #333333",
                          fontFamily: "'Roboto Mono', monospace",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          "& .MuiChip-deleteIcon": {
                            color: "#ffffff",
                            "&:hover": {
                              color: "#ff0000",
                            },
                          },
                          "&:hover": {
                            bgcolor: "#333333",
                          },
                        }}
                      />
                    )}
                    {selectedBrands.map((brandId) => {
                      const brand = brands.find((b) => b.id === brandId);
                      return (
                        brand && (
                          <Chip
                            key={brandId}
                            label={brand.name}
                            onDelete={() => handleBrandChange(brandId)}
                            size="small"
                            avatar={
                              brand.logo ? (
                                <Avatar
                                  src={
                                    brand.logo?.startsWith("http")
                                      ? brand.logo
                                      : `${process.env.REACT_APP_API_BASE_URL}/${brand.logo}`
                                  }
                                  sx={{
                                    width: 20,
                                    height: 20,
                                    border: "1px solid #ffffff",
                                  }}
                                />
                              ) : null
                            }
                            sx={{
                              bgcolor: "#000000",
                              color: "#ffffff",
                              border: "2px solid #333333",
                              fontFamily: "'Roboto Mono', monospace",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                              "& .MuiChip-deleteIcon": {
                                color: "#ffffff",
                                "&:hover": {
                                  color: "#ff0000",
                                },
                              },
                              "&:hover": {
                                bgcolor: "#333333",
                              },
                            }}
                          />
                        )
                      );
                    })}
                  </Box>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Price Filter */}
          <Box
            sx={{
              borderBottom: hasActiveFilters ? "none" : "1px solid #e0e0e0",
            }}
          >
            <Button
              onClick={() =>
                handleAccordionChange("price")(
                  null,
                  !expanded.includes("price")
                )
              }
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: { xs: 2, sm: 3 },
                textTransform: "none",
                bgcolor: "#ffffff",
                borderRadius: 0,
                fontWeight: 700,
                fontSize: { xs: 16, sm: 18 },
                color: "#000000",
                fontFamily: "'Roboto Mono', monospace",
                letterSpacing: "1px",
                "&:hover": {
                  bgcolor: "#f8f9fa",
                },
                transition: "all 0.3s ease",
              }}
            >
              {" "}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="#000000"
                  sx={{
                    fontFamily: "'Roboto Mono', monospace",
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    whiteSpace: "nowrap",
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                  }}
                >
                  KHOẢNG GIÁ
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: "#000000",
                  color: "#ffffff",
                  transition: "all 0.3s ease",
                  transform: expanded.includes("price")
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
              >
                {expanded.includes("price") ? (
                  <ChevronUp size={24} />
                ) : (
                  <ChevronDown size={24} />
                )}
              </Box>
            </Button>
            <Collapse in={expanded.includes("price")}>
              <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#f8f9fa" }}>
                <FormGroup>
                  {priceRanges.map((range, index) => (
                    <motion.div
                      key={range.value}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          py: 1.5,
                          px: 2,
                          mb: 1,
                          borderRadius: 2,
                          border: "1px solid #e0e0e0",
                          background:
                            selectedPrice === range.value
                              ? "linear-gradient(145deg, #000000 0%, #333333 100%)"
                              : "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                          color:
                            selectedPrice === range.value
                              ? "#ffffff"
                              : "#000000",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            borderColor: "#000000",
                            transform: "translateX(4px)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          },
                        }}
                        onClick={() => handlePriceChange(range.value)}
                      >
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            border: `2px solid ${
                              selectedPrice === range.value
                                ? "#ffffff"
                                : "#000000"
                            }`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor:
                              selectedPrice === range.value
                                ? "#ffffff"
                                : "transparent",
                          }}
                        >
                          {selectedPrice === range.value && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: "#000000",
                              }}
                            />
                          )}
                        </Box>
                        <Typography
                          variant="body1"
                          sx={{
                            fontFamily: "'Roboto Mono', monospace",
                            fontWeight: 600,
                            letterSpacing: "0.5px",
                          }}
                        >
                          {range.label}
                        </Typography>
                      </Box>
                    </motion.div>
                  ))}
                </FormGroup>
              </Box>
            </Collapse>
          </Box>
          {/* Brand Filter */}
          <Box>
            <Button
              onClick={() =>
                handleAccordionChange("brand")(
                  null,
                  !expanded.includes("brand")
                )
              }
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: { xs: 2, sm: 3 },
                textTransform: "none",
                bgcolor: "#ffffff",
                borderRadius: 0,
                fontWeight: 700,
                fontSize: { xs: 16, sm: 18 },
                color: "#000000",
                fontFamily: "'Roboto Mono', monospace",
                letterSpacing: "1px",
                "&:hover": {
                  bgcolor: "#f8f9fa",
                },
                transition: "all 0.3s ease",
              }}
            >
              {" "}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="#000000"
                  sx={{
                    fontFamily: "'Roboto Mono', monospace",
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    whiteSpace: "nowrap",
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                  }}
                >
                  THƯƠNG HIỆU
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: "#000000",
                  color: "#ffffff",
                  transition: "all 0.3s ease",
                  transform: expanded.includes("brand")
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
              >
                {expanded.includes("brand") ? (
                  <ChevronUp size={24} />
                ) : (
                  <ChevronDown size={24} />
                )}
              </Box>
            </Button>
            <Collapse in={expanded.includes("brand")}>
              <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#f8f9fa" }}>
                {loading ? (
                  <Box sx={{ py: 2 }}>
                    {[1, 2, 3].map((i) => (
                      <Box
                        key={i}
                        sx={{
                          height: 60,
                          mb: 2,
                          borderRadius: 2,
                          border: "1px solid #e0e0e0",
                          bgcolor: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          px: 2,
                        }}
                      >
                        <Skeleton
                          variant="circular"
                          width={32}
                          height={32}
                          sx={{ mr: 2 }}
                        />
                        <Skeleton variant="text" width="60%" height={24} />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <FormGroup>
                    <AnimatePresence>
                      {brands
                        .slice(0, showAllBrands ? undefined : 6)
                        .map((brand, index) => (
                          <motion.div
                            key={brand.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                py: 2,
                                px: 2,
                                mb: 1,
                                borderRadius: 2,
                                border: "1px solid #e0e0e0",
                                background: selectedBrands.includes(brand.id)
                                  ? "linear-gradient(145deg, #000000 0%, #333333 100%)"
                                  : "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                                color: selectedBrands.includes(brand.id)
                                  ? "#ffffff"
                                  : "#000000",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  borderColor: "#000000",
                                  transform: "translateX(4px)",
                                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                                },
                              }}
                              onClick={() => handleBrandChange(brand.id)}
                            >
                              <Box
                                sx={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: "50%",
                                  border: `2px solid ${
                                    selectedBrands.includes(brand.id)
                                      ? "#ffffff"
                                      : "#000000"
                                  }`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  bgcolor: selectedBrands.includes(brand.id)
                                    ? "#ffffff"
                                    : "transparent",
                                }}
                              >
                                {selectedBrands.includes(brand.id) && (
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: "50%",
                                      bgcolor: "#000000",
                                    }}
                                  />
                                )}
                              </Box>
                              {brand.logo && (
                                <Avatar
                                  src={
                                    brand.logo?.startsWith("http")
                                      ? brand.logo
                                      : `${process.env.REACT_APP_API_BASE_URL}/${brand.logo}`
                                  }
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    border: `2px solid ${
                                      selectedBrands.includes(brand.id)
                                        ? "#ffffff"
                                        : "#000000"
                                    }`,
                                  }}
                                  variant="rounded"
                                />
                              )}
                              <Typography
                                variant="body1"
                                sx={{
                                  fontFamily: "'Roboto Mono', monospace",
                                  fontWeight: 600,
                                  letterSpacing: "0.5px",
                                }}
                              >
                                {brand.name}
                              </Typography>
                            </Box>
                          </motion.div>
                        ))}
                    </AnimatePresence>

                    {brands.length > 6 && (
                      <Box
                        sx={{
                          mt: 2,
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Button
                          onClick={() => setShowAllBrands(!showAllBrands)}
                          variant="outlined"
                          endIcon={
                            showAllBrands ? (
                              <ChevronUp size={20} />
                            ) : (
                              <ChevronDown size={20} />
                            )
                          }
                          sx={{
                            borderRadius: 2,
                            px: 4,
                            py: 1.5,
                            fontWeight: 700,
                            bgcolor: "#ffffff",
                            borderColor: "#000000",
                            color: "#000000",
                            borderWidth: 2,
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            fontFamily: "'Roboto Mono', monospace",
                            "&:hover": {
                              bgcolor: "#f0f0f0",
                              borderColor: "#000000",
                              borderWidth: 2,
                              transform: "translateY(-2px)",
                              boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                            },
                            transition: "all 0.3s ease",
                          }}
                        >
                          {showAllBrands
                            ? "Thu gọn"
                            : `Xem thêm ${brands.length - 6} thương hiệu`}
                        </Button>
                      </Box>
                    )}
                  </FormGroup>
                )}
              </Box>
            </Collapse>
          </Box>{" "}
        </Box>
      </Paper>
    </motion.div>
  );
};

export default FilterSection;
