import React from "react";
import { Pagination, Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledPagination = styled(Pagination)(({ theme }) => ({
  "& .MuiPaginationItem-root": {
    borderRadius: "12px",
    margin: "0 4px",
    border: "1px solid transparent",
    transition: "all 0.3s ease",
    fontWeight: 500,
    minWidth: "40px",
    height: "40px",

    "&:hover": {
      backgroundColor: theme.palette.primary.main,
      color: "white",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
    },

    "&.Mui-selected": {
      backgroundColor: theme.palette.primary.main,
      color: "white",
      fontWeight: 600,
      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)",

      "&:hover": {
        backgroundColor: theme.palette.primary.dark,
      },
    },
  },

  "& .MuiPaginationItem-ellipsis": {
    color: theme.palette.text.secondary,
  },
}));

const PaginationInfo = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: "0.875rem",
  fontWeight: 500,
  display: "flex",
  alignItems: "center",
  gap: "4px",
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
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
        mt: 6,
        mb: 4,
        p: 3,
        bgcolor: "background.paper",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        backdropFilter: "blur(20px)",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Thông tin hiển thị */}
      <PaginationInfo>
        Hiển thị <strong>{startProduct}</strong>-<strong>{endProduct}</strong>{" "}
        trong tổng số <strong>{totalProducts}</strong> sản phẩm
      </PaginationInfo>

      {/* Pagination Controls */}
      <StyledPagination
        count={totalPages}
        page={currentPage}
        onChange={(event, page) => onPageChange(page)}
        color="primary"
        size="large"
        siblingCount={1}
        boundaryCount={1}
        showFirstButton
        showLastButton
        sx={{
          "& .MuiPaginationItem-root": {
            fontSize: "0.875rem",
          },
        }}
      />
    </Box>
  );
};

export default ProductPagination;
