import React from "react";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import ProfilePage from "./pages/ProfilePage";

const AppRoutes = [
  {
    index: true,
    element: <Home />,
  },
  {
    path: "/ProductPage/:id",
    element: <ProductPage />,
  },
  {
    path: "/Profile/:id",
    element: <ProfilePage />,
  },
];

export default AppRoutes;
