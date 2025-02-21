<<<<<<< HEAD
import React from "react";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import ProfilePage from "./pages/ProfilePage";
=======
import HomePage from "./Page/HomePage";
>>>>>>> 19e39e06573d551903db6d761f4471d35d8a8cf9

const AppRoutes = [
  {
    index: true,
<<<<<<< HEAD
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
=======
    element: <HomePage />,
  },
>>>>>>> 19e39e06573d551903db6d761f4471d35d8a8cf9
];

export default AppRoutes;
