import React from "react";
import { Pagination, Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// Tech-style CSS animations
const styles = `
  @keyframes techGlow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
    }
    50% {
      box-shadow: 0 0 30px rgba(0,0,0,0.2);
    }
  }
  
  @keyframes slideUpTech {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes circuitPulse {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  if (
    !document.head.querySelector('style[data-component="ProductPagination"]')
  ) {
    styleSheet.setAttribute("data-component", "ProductPagination");
    document.head.appendChild(styleSheet);
  }
}

const StyledPagination = styled(Pagination)(({ theme }) => ({
  "& .MuiPaginationItem-root": {
    borderRadius: "16px",
    margin: "0 6px",
    border: "3px solid #000000",
    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
    fontWeight: 700,
    minWidth: "48px",
    height: "48px",
    fontSize: "14px",
    fontFamily: "'Roboto Mono', monospace",
    textTransform: "uppercase",
    letterSpacing: "1px",
    background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
    color: "#000000",
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
        "linear-gradient(90deg, #000000 0%, #404040 25%, #808080 50%, #404040 75%, #000000 100%)",
      zIndex: 1,
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
      zIndex: 0,
    },

    "&:hover": {
      background: "linear-gradient(135deg, #f0f0f0 0%, #e8e9ea 100%)",
      color: "#000000",
      transform: "translateY(-4px) scale(1.05)",
      boxShadow: `
        0 0 0 1px rgba(0,0,0,0.1),
        0 15px 50px rgba(0,0,0,0.15),
        0 25px 80px rgba(0,0,0,0.2)
      `,
      borderColor: "#333333",
    },

    "&.Mui-selected": {
      background: "linear-gradient(135deg, #000000 0%, #333333 100%)",
      color: "#ffffff",
      fontWeight: 700,
      boxShadow: `
        0 0 0 1px rgba(0,0,0,0.2),
        0 20px 60px rgba(0,0,0,0.3),
        0 30px 80px rgba(0,0,0,0.4)
      `,
      borderColor: "#000000",
      zIndex: 2,

      "&::before": {
        background:
          "linear-gradient(90deg, #ffffff 0%, #cccccc 25%, #888888 50%, #cccccc 75%, #ffffff 100%)",
      },

      "&:hover": {
        background: "linear-gradient(135deg, #333333 0%, #555555 100%)",
        transform: "translateY(-6px) scale(1.08)",
        boxShadow: `
          0 0 0 1px rgba(0,0,0,0.3),
          0 25px 70px rgba(0,0,0,0.4),
          0 35px 90px rgba(0,0,0,0.5)
        `,
      },
    },

    "&.MuiPaginationItem-firstLast, &.MuiPaginationItem-previousNext": {
      minWidth: "56px",
      background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",

      "&:hover": {
        background: "linear-gradient(135deg, #f0f0f0 0%, #e8e9ea 100%)",
      },

      "&.Mui-disabled": {
        background: "linear-gradient(145deg, #f5f5f5 0%, #e8e8e8 100%)",
        color: "#cccccc",
        borderColor: "#cccccc",
        opacity: 0.5,
        transform: "none",
        boxShadow: "none",
      },
    },
  },

  "& .MuiPaginationItem-ellipsis": {
    color: "#666666",
    fontFamily: "'Roboto Mono', monospace",
    fontWeight: 700,
    fontSize: "16px",
  },
}));

const PaginationInfo = styled(Typography)(({ theme }) => ({
  color: "#000000",
  fontSize: "14px",
  fontWeight: 700,
  fontFamily: "'Roboto Mono', monospace",
  textTransform: "uppercase",
  letterSpacing: "1px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "12px 20px",
  background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
  borderRadius: "16px",
  border: "3px solid #000000",
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
      "linear-gradient(90deg, #000000 0%, #404040 25%, #808080 50%, #404040 75%, #000000 100%)",
    zIndex: 1,
  },

  "& strong": {
    color: "#000000",
    background:
      "linear-gradient(135deg, #000000 0%, #333333 50%, #000000 100%)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: 700,
  },
}));

const ProductPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalProducts,
  productsPerPage = 9,
  loading = false,
}) => {
  if (loading || totalPages <= 1) {
    return null;
  }

  const startProduct = (currentPage - 1) * productsPerPage + 1;
  const endProduct = Math.min(currentPage * productsPerPage, totalProducts);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 4,
          mt: 8,
          mb: 6,
          p: 0,
          position: "relative",
        }}
      >
        {/* Tech Background Container */}
        <Box
          sx={{
            position: "absolute",
            top: -20,
            left: -20,
            right: -20,
            bottom: -20,
            background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
            borderRadius: "32px",
            border: "3px solid #000000",
            zIndex: -1,
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "6px",
              background:
                "linear-gradient(90deg, #000000 0%, #404040 25%, #808080 50%, #404040 75%, #000000 100%)",
              zIndex: 1,
            },
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 15% 85%, rgba(0,0,0,0.03) 0%, transparent 50%),
                radial-gradient(circle at 85% 15%, rgba(0,0,0,0.03) 0%, transparent 50%)
              `,
              pointerEvents: "none",
              zIndex: 0,
            },
            boxShadow: `
              0 0 0 1px rgba(0,0,0,0.05),
              0 20px 60px rgba(0,0,0,0.1),
              0 30px 80px rgba(0,0,0,0.15)
            `,
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: `
                0 0 0 1px rgba(0,0,0,0.08),
                0 25px 70px rgba(0,0,0,0.15),
                0 35px 90px rgba(0,0,0,0.2)
              `,
            },
          }}
        />

        {/* Thông tin hiển thị */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <PaginationInfo>
            <span style={{ color: "#666666" }}>HIỂN THỊ</span>
            <strong>{startProduct}</strong>
            <span style={{ color: "#666666" }}>-</span>
            <strong>{endProduct}</strong>
            <span style={{ color: "#666666" }}>TRONG TỔNG SỐ</span>
            <strong>{totalProducts}</strong>
            <span style={{ color: "#666666" }}>SẢN PHẨM</span>
          </PaginationInfo>
        </motion.div>

        {/* Pagination Controls */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <StyledPagination
            count={totalPages}
            page={currentPage}
            onChange={(event, page) => onPageChange(page)}
            size="large"
            siblingCount={1}
            boundaryCount={1}
            showFirstButton
            showLastButton
            sx={{
              "& .MuiPaginationItem-root": {
                fontSize: "14px",
                animation: "slideUpTech 0.5s ease",
              },
              "& .MuiPaginationItem-firstLast": {
                "& svg": {
                  fontSize: "20px",
                },
              },
              "& .MuiPaginationItem-previousNext": {
                "& svg": {
                  fontSize: "18px",
                },
              },
            }}
            renderItem={(item) => {
              let icon = null;

              if (item.type === "first") {
                icon = <ChevronsLeft size={20} color="#000000" />;
              } else if (item.type === "last") {
                icon = <ChevronsRight size={20} color="#000000" />;
              } else if (item.type === "previous") {
                icon = <ChevronLeft size={18} color="#000000" />;
              } else if (item.type === "next") {
                icon = <ChevronRight size={18} color="#000000" />;
              }

              return (
                <motion.div
                  key={item.page || item.type}
                  whileHover={{
                    scale: 1.05,
                    y: -4,
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                >
                  <Box
                    component="button"
                    onClick={item.onClick}
                    disabled={item.disabled}
                    sx={{
                      ...StyledPagination.defaultProps?.sx?.[
                        "& .MuiPaginationItem-root"
                      ],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: item.disabled ? "not-allowed" : "pointer",
                      position: "relative",
                      zIndex: item.selected ? 10 : 1,
                      ...(item.selected && {
                        background:
                          "linear-gradient(135deg, #000000 0%, #333333 100%)",
                        color: "#ffffff",
                        boxShadow: `
                          0 0 0 1px rgba(0,0,0,0.2),
                          0 20px 60px rgba(0,0,0,0.3),
                          0 30px 80px rgba(0,0,0,0.4)
                        `,
                        "& svg": {
                          color: "#ffffff !important",
                        },
                      }),
                      ...(item.disabled && {
                        "& svg": {
                          color: "#cccccc !important",
                        },
                      }),
                    }}
                  >
                    {icon || item.page}
                  </Box>
                </motion.div>
              );
            }}
          />
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default ProductPagination;
