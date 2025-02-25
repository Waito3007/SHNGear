import React, { Component } from "react";
import { Route, Routes } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import AdminLayout from "./components/layouts/AdminLayout";

export default class App extends Component {
  static displayName = App.name;

  render() {
    return (
      <Routes>
        {AppRoutes.map((route, index) => {
          const { element, path } = route;
          const isAdminRoute = path && path.startsWith('/admin');

          return (
            <Route
              key={index}
              path={path}
              element={isAdminRoute ? <AdminLayout>{element}</AdminLayout> : element}
            />
          );
        })}
      </Routes>
    );
  }
}
