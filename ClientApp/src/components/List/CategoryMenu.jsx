import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Skeleton,
  Paper,
  Fade,
  Chip,
} from "@mui/material";
import { motion } from "framer-motion";

const CategoryMenu = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/categories`
        );
        if (!response.ok) throw new Error("Could not fetch categories");
        const data = await response.json();
        setCategories(data.$values || data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

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
      <Box p={3}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={6} sm={4} md={2} key={item}>
              <Skeleton
                variant="rounded"
                height={160}
                sx={{
                  borderRadius: 4,
                  transform: "none",
                  backgroundColor: "rgba(0,0,0,0.04)",
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <motion.div variants={container} initial="hidden" animate="show">
        <Grid container spacing={3}>
          {categories
            .filter((cat) => !cat.parentId)
            .map((category) => (
              <Grid item xs={6} sm={4} md={2} key={category.id}>
                <motion.div variants={item}>
                  <Paper
                    elevation={0}
                    component={motion.div}
                    whileHover={{ y: -8 }}
                    onMouseEnter={() => setHoveredCategory(category.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    onClick={() =>
                      (window.location.href = `/ProductList?categoryId=${category.id}`)
                    }
                    sx={{
                      p: 2,
                      height: "100%",
                      borderRadius: 4,
                      cursor: "pointer",
                      overflow: "hidden",
                      position: "relative",
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "all 0.3s ease",
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))",
                      backdropFilter: "blur(10px)",
                      "&:hover": {
                        borderColor: "primary.main",
                        boxShadow:
                          "0 10px 20px -10px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.02)",
                      },
                    }}
                  >
                    {/* Background Pattern */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.03,
                        background:
                          "repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)",
                        backgroundSize: "10px 10px",
                        zIndex: 0,
                      }}
                    />

                    <Box
                      sx={{
                        position: "relative",
                        zIndex: 1,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                      }}
                    >
                      {/* Category Image */}
                      <Box
                        sx={{
                          mb: 2,
                          width: "100%",
                          aspectRatio: "1",
                          position: "relative",
                          overflow: "hidden",
                          borderRadius: 3,
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
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='12' fill='%23999'%3EImage Error%3C/text%3E%3C/svg%3E";
                          }}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            transition: "transform 0.6s ease",
                            transform:
                              hoveredCategory === category.id
                                ? "scale(1.1)"
                                : "scale(1)",
                          }}
                        />
                      </Box>

                      {/* Category Name */}
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          color: "text.primary",
                          transition: "color 0.3s ease",
                          position: "relative",
                          "&::after": {
                            content: '""',
                            position: "absolute",
                            bottom: -4,
                            left: "50%",
                            width:
                              hoveredCategory === category.id ? "100%" : "0%",
                            height: 2,
                            bgcolor: "primary.main",
                            transition: "all 0.3s ease",
                            transform: "translateX(-50%)",
                          },
                        }}
                      >
                        {category.name}
                      </Typography>

                      {/* Product Count */}
                      <Fade in={hoveredCategory === category.id}>
                        <Chip
                          label="Xem ngay"
                          size="small"
                          color="primary"
                          sx={{
                            mt: 1,
                            fontSize: "0.75rem",
                            height: 24,
                          }}
                        />
                      </Fade>
                    </Box>
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
