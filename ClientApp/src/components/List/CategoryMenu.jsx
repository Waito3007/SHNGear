import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Skeleton,
  Paper,
  Fade,
  Chip,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import { useCategories } from "@/hooks/api/useCategories";
import { ArrowRight, Zap, Circuit, Cpu } from "lucide-react";

const CategoryMenu = () => {
  const { categories, loading } = useCategories();
  const [hoveredCategory, setHoveredCategory] = React.useState(null);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };
  if (loading) {
    return (
      <Box
        p={4}
        sx={{
          bgcolor: "#ffffff",
          minHeight: "400px",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 80%, rgba(0,0,0,0.02) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(0,0,0,0.02) 0%, transparent 50%),
              linear-gradient(135deg, transparent 0%, rgba(0,0,0,0.01) 100%)
            `,
          },
        }}
      >
        {/* Tech Header */}
        <Box
          sx={{ mb: 4, textAlign: "center", position: "relative", zIndex: 1 }}
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'JetBrains Mono', 'Roboto Mono', monospace",
              fontWeight: 800,
              color: "#000000",
              letterSpacing: "2px",
              textTransform: "uppercase",
              mb: 1,
              position: "relative",
              "&::before": {
                content: '"[LOADING]"',
                position: "absolute",
                top: -20,
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "12px",
                color: "#666666",
                fontWeight: 400,
              },
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -8,
                left: "50%",
                transform: "translateX(-50%)",
                width: "60px",
                height: "2px",
                bgcolor: "#000000",
              },
            }}
          >
            CATEGORIES
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={item}>
              <Paper
                elevation={0}
                sx={{
                  height: 220,
                  borderRadius: 0,
                  backgroundColor: "#ffffff",
                  border: "2px solid #000000",
                  position: "relative",
                  overflow: "hidden",
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
                <Box sx={{ p: 2, height: "100%" }}>
                  <Skeleton
                    variant="rectangular"
                    height={120}
                    sx={{
                      bgcolor: "rgba(0,0,0,0.05)",
                      mb: 2,
                      borderRadius: 0,
                    }}
                  />
                  <Skeleton
                    variant="text"
                    height={24}
                    width="80%"
                    sx={{
                      bgcolor: "rgba(0,0,0,0.05)",
                      borderRadius: 0,
                    }}
                  />
                  <Skeleton
                    variant="text"
                    height={16}
                    width="60%"
                    sx={{
                      bgcolor: "rgba(0,0,0,0.05)",
                      borderRadius: 0,
                      mt: 1,
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }
  return (
    <Box
      p={4}
      sx={{
        bgcolor: "#ffffff",
        minHeight: "600px",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(0,0,0,0.02) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(0,0,0,0.02) 0%, transparent 50%),
            linear-gradient(135deg, transparent 0%, rgba(0,0,0,0.01) 100%)
          `,
        },
      }}
    >
      {/* Tech Header Section */}
      <Box sx={{ mb: 6, textAlign: "center", position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 2,
                bgcolor: "#000000",
                mr: 2,
              }}
            />
            <Cpu size={24} color="#000000" />
            <Box
              sx={{
                width: 40,
                height: 2,
                bgcolor: "#000000",
                ml: 2,
              }}
            />
          </Box>

          <Typography
            variant="h3"
            sx={{
              fontFamily: "'JetBrains Mono', 'Roboto Mono', monospace",
              fontWeight: 900,
              color: "#000000",
              letterSpacing: "3px",
              textTransform: "uppercase",
              mb: 1,
              position: "relative",
              "&::before": {
                content: '"[SYSTEM]"',
                position: "absolute",
                top: -24,
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "12px",
                color: "#666666",
                fontWeight: 400,
                letterSpacing: "1px",
              },
            }}
          >
            PRODUCT CATEGORIES
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "#666666",
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontSize: "12px",
            }}
          ></Typography>

          {/* Animated underline */}
          <Box
            component={motion.div}
            initial={{ width: 0 }}
            animate={{ width: "120px" }}
            transition={{ duration: 1, delay: 0.5 }}
            sx={{
              height: "3px",
              bgcolor: "#000000",
              mx: "auto",
              mt: 2,
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                top: "50%",
                right: -8,
                transform: "translateY(-50%)",
                width: 0,
                height: 0,
                borderLeft: "6px solid #000000",
                borderTop: "3px solid transparent",
                borderBottom: "3px solid transparent",
              },
            }}
          />
        </motion.div>
      </Box>

      <motion.div variants={container} initial="hidden" animate="show">
        <Grid container spacing={3}>
          {categories
            .filter((cat) => !cat.parentId)
            .map((category, index) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={category.id}>
                <motion.div
                  variants={item}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Paper
                    elevation={0}
                    component={motion.div}
                    onMouseEnter={() => setHoveredCategory(category.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    onClick={() =>
                      (window.location.href = `/ProductList?categoryId=${category.id}`)
                    }
                    sx={{
                      height: 240,
                      borderRadius: 0,
                      cursor: "pointer",
                      overflow: "hidden",
                      position: "relative",
                      backgroundColor: "#ffffff",
                      border: "2px solid #000000",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: `
                          8px 8px 0px #000000,
                          0 0 0 1px #000000
                        `,
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "3px",
                        background:
                          "linear-gradient(90deg, #000000 0%, #333333 50%, #000000 100%)",
                        zIndex: 1,
                      },
                    }}
                  >
                    {/* Binary Pattern Background */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: hoveredCategory === category.id ? 0.06 : 0.02,
                        background: `
                          linear-gradient(45deg, transparent 25%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.1) 50%, transparent 50%, transparent 75%, rgba(0,0,0,0.1) 75%),
                          linear-gradient(-45deg, transparent 25%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.1) 50%, transparent 50%, transparent 75%, rgba(0,0,0,0.1) 75%)
                        `,
                        backgroundSize: "4px 4px",
                        transition: "opacity 0.3s ease",
                        zIndex: 0,
                      }}
                    />

                    <Box
                      sx={{
                        position: "relative",
                        zIndex: 2,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        p: 2,
                      }}
                    >
                      {/* Category ID Badge */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          bgcolor: "#000000",
                          color: "#ffffff",
                          px: 1,
                          py: 0.5,
                          fontSize: "10px",
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 700,
                          letterSpacing: "1px",
                        }}
                      >
                        #{String(index + 1).padStart(2, "0")}
                      </Box>

                      {/* Category Image Container */}
                      <Box
                        sx={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 2,
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          component="img"
                          src={
                            category.image?.startsWith("http")
                              ? category.image
                              : `${process.env.REACT_APP_API_BASE_URL}/${category.image}`
                          }
                          alt={category.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://via.placeholder.com/120x120/000000/FFFFFF?text=TECH";
                          }}
                          sx={{
                            maxWidth: "80%",
                            maxHeight: "80%",
                            objectFit: "contain",
                            filter:
                              hoveredCategory === category.id
                                ? "contrast(1.1) saturate(1.2)"
                                : "contrast(1) saturate(1)",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            transform:
                              hoveredCategory === category.id
                                ? "scale(1.05) rotate(1deg)"
                                : "scale(1) rotate(0deg)",
                          }}
                        />

                        {/* Tech Grid Overlay */}
                        {hoveredCategory === category.id && (
                          <Box
                            component={motion.div}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: `
                                linear-gradient(90deg, transparent 98%, rgba(0,0,0,0.1) 100%),
                                linear-gradient(0deg, transparent 98%, rgba(0,0,0,0.1) 100%)
                              `,
                              backgroundSize: "10px 10px",
                              pointerEvents: "none",
                            }}
                          />
                        )}
                      </Box>

                      {/* Category Info */}
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontFamily:
                              "'JetBrains Mono', 'Roboto Mono', monospace",
                            fontWeight: 800,
                            color: "#000000",
                            fontSize: "14px",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            mb: 0.5,
                            lineHeight: 1.2,
                            transition: "all 0.3s ease",
                            position: "relative",
                          }}
                        >
                          {category.name}
                        </Typography>

                        {/* Action Indicator */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                            opacity: hoveredCategory === category.id ? 1 : 0,
                            transform:
                              hoveredCategory === category.id
                                ? "translateY(0)"
                                : "translateY(10px)",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: "'JetBrains Mono', monospace",
                              color: "#666666",
                              fontSize: "10px",
                              letterSpacing: "1px",
                              textTransform: "uppercase",
                              fontWeight: 600,
                            }}
                          >
                            ENTER
                          </Typography>
                          <ArrowRight size={12} color="#000000" />
                        </Box>

                        {/* Progress Bar */}
                        <Box
                          sx={{
                            width: "100%",
                            height: "2px",
                            bgcolor: "rgba(0,0,0,0.1)",
                            mt: 1,
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            component={motion.div}
                            initial={{ width: "0%" }}
                            animate={{
                              width:
                                hoveredCategory === category.id ? "100%" : "0%",
                            }}
                            transition={{ duration: 0.4 }}
                            sx={{
                              height: "100%",
                              bgcolor: "#000000",
                              position: "absolute",
                              top: 0,
                              left: 0,
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>

                    {/* Corner Accent */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: 0,
                        height: 0,
                        borderLeft: "20px solid transparent",
                        borderBottom: "20px solid #000000",
                        opacity: hoveredCategory === category.id ? 1 : 0,
                        transition: "opacity 0.3s ease",
                      }}
                    />
                  </Paper>
                </motion.div>
              </Grid>
            ))}
        </Grid>
      </motion.div>
    </Box>
  );
};

export default CategoryMenu;
