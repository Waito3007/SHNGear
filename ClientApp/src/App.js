import React, { Component } from "react";
import { Route, Routes } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import AdminLayout from "./components/layouts/AdminLayout";
import ProductPage from "./pages/ProductPage";
import ProfilePage from "./pages/ProfilePage";

export default class App extends Component {
  static displayName = App.name;

  render() {
    return (
      <Routes>
        <Route path="/profile/" element={<ProfilePage />} />
        <Route path="/product/" element={<ProductPage />} />
        {AppRoutes.map((route, index) => {
          const { element, path } = route;
          const isAdminRoute = path && path.startsWith("/admin");

          return (
            <Route
              key={index}
              path={path}
              element={
                isAdminRoute ? <AdminLayout>{element}</AdminLayout> : element
              }
            />
          );
        })}
      </Routes>
    );
  }
}
