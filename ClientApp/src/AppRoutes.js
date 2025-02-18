import React from "react";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";

const AppRoutes = [
  {
    index: true,
    element: <Home />,
  },
  {
    path: "/ProductPage/:id",
    element: <ProductPage />,
  },
];

export default AppRoutes;
