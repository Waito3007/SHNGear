import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const ProductInfo = ({ product }) => {
  return (
    <Card className="shadow-lg">
      <CardContent>
        <Typography variant="h4" gutterBottom>
          {product?.name}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {product?.description}
        </Typography>
        <div className="flex items-center gap-4 mt-4">
          <img
            src={product?.brand?.logo}
            alt={product?.brand?.name}
            className="w-10"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductInfo;
