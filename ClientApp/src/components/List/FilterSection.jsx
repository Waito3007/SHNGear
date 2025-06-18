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
} from "@mui/material";
import { ChevronDown, Filter, X, CheckCircle2, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllBrands, setShowAllBrands] = useState(false);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/brands`
        );
        if (!response.ok) throw new Error("Could not fetch brands");
        const data = await response.json();
        setBrands(data.$values || data || []);
      } catch (error) {
        console.error("Error fetching brands:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

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
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Filter size={20} />
          <Typography variant="subtitle1" fontWeight={600}>
            Bộ lọc tìm kiếm
          </Typography>
        </Box>
        {hasActiveFilters && (
          <IconButton
            size="small"
            onClick={clearFilters}
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: "error.main",
                bgcolor: "error.lighter",
              },
            }}
          >
            <X size={18} />
          </IconButton>
        )}
      </Box>

      {/* Active Filters */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
              {selectedPrice !== "all" && (
                <Chip
                  label={
                    priceRanges.find((r) => r.value === selectedPrice)?.label
                  }
                  onDelete={() => handlePriceChange("all")}
                  size="small"
                  color="primary"
                  variant="outlined"
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
                      color="primary"
                      variant="outlined"
                      avatar={
                        brand.logo ? (
                          <Avatar
                            src={
                              brand.logo?.startsWith("http")
                                ? brand.logo
                                : `${process.env.REACT_APP_API_BASE_URL}/${brand.logo}`
                            }
                            sx={{ width: 20, height: 20 }}
                          />
                        ) : null
                      }
                    />
                  )
                );
              })}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      <Divider sx={{ mb: 3 }} />

      {/* Price Filter */}
      <Accordion
        expanded={expanded.includes("price")}
        onChange={handleAccordionChange("price")}
        elevation={0}
        disableGutters
        sx={{
          "&:before": { display: "none" },
          mb: 2,
          bgcolor: "transparent",
        }}
      >
        <AccordionSummary
          expandIcon={<ChevronDown size={20} />}
          sx={{
            px: 0,
            "&.Mui-expanded": {
              minHeight: 48,
            },
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Khoảng giá
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0, py: 1 }}>
          <FormGroup>
            {priceRanges.map((range) => (
              <motion.div
                key={range.value}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      icon={<Circle size={18} />}
                      checkedIcon={<CheckCircle2 size={18} />}
                      checked={selectedPrice === range.value}
                      onChange={() => handlePriceChange(range.value)}
                      size="small"
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          selectedPrice === range.value
                            ? "primary.main"
                            : "text.primary",
                        fontWeight: selectedPrice === range.value ? 500 : 400,
                      }}
                    >
                      {range.label}
                    </Typography>
                  }
                  sx={{
                    py: 0.5,
                    transition: "all 0.2s",
                    "&:hover": {
                      color: "primary.main",
                    },
                  }}
                />
              </motion.div>
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* Brand Filter */}
      <Accordion
        expanded={expanded.includes("brand")}
        onChange={handleAccordionChange("brand")}
        elevation={0}
        disableGutters
        sx={{
          "&:before": { display: "none" },
          bgcolor: "transparent",
        }}
      >
        <AccordionSummary
          expandIcon={<ChevronDown size={20} />}
          sx={{
            px: 0,
            "&.Mui-expanded": {
              minHeight: 48,
            },
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Thương hiệu
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0, py: 1 }}>
          {loading ? (
            <Box sx={{ py: 2 }}>
              <Skeleton height={32} sx={{ mb: 1 }} />
              <Skeleton height={32} sx={{ mb: 1 }} />
              <Skeleton height={32} />
            </Box>
          ) : (
            <FormGroup>
              <AnimatePresence>
                {brands
                  .slice(0, showAllBrands ? undefined : 6)
                  .map((brand, index) => (
                    <motion.div
                      key={brand.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            icon={<Circle size={18} />}
                            checkedIcon={<CheckCircle2 size={18} />}
                            checked={selectedBrands.includes(brand.id)}
                            onChange={() => handleBrandChange(brand.id)}
                            size="small"
                          />
                        }
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {brand.logo && (
                              <Avatar
                                src={
                                  brand.logo?.startsWith("http")
                                    ? brand.logo
                                    : `${process.env.REACT_APP_API_BASE_URL}/${brand.logo}`
                                }
                                sx={{ width: 24, height: 24 }}
                                variant="rounded"
                              />
                            )}
                            <Typography
                              variant="body2"
                              sx={{
                                color: selectedBrands.includes(brand.id)
                                  ? "primary.main"
                                  : "text.primary",
                                fontWeight: selectedBrands.includes(brand.id)
                                  ? 500
                                  : 400,
                              }}
                            >
                              {brand.name}
                            </Typography>
                          </Box>
                        }
                        sx={{
                          py: 0.5,
                          transition: "all 0.2s",
                          "&:hover": {
                            color: "primary.main",
                          },
                        }}
                      />
                    </motion.div>
                  ))}
              </AnimatePresence>

              {brands.length > 6 && (
                <Box sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    onClick={() => setShowAllBrands(!showAllBrands)}
                    sx={{
                      textTransform: "none",
                      color: "primary.main",
                      "&:hover": {
                        bgcolor: "primary.lighter",
                      },
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
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default FilterSection;
