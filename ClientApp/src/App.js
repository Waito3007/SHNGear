import React, { Component } from "react";
import { Route, Routes } from "react-router-dom";
import AppRoutes from "./AppRoutes";
<<<<<<< HEAD
import { Layout } from "./components/Layout";
import ProductPage from "./pages/ProductPage";
import ProfilePage from "./pages/ProfilePage";
=======

>>>>>>> 19e39e06573d551903db6d761f4471d35d8a8cf9
import "./custom.css";

export default class App extends Component {
  static displayName = App.name;

  render() {
    return (
<<<<<<< HEAD
      <Layout>
        <Routes>
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          {AppRoutes.map((route, index) => {
            const { element, ...rest } = route;
            return <Route key={index} {...rest} element={element} />;
          })}
        </Routes>
      </Layout>
=======
      <Routes>
        {AppRoutes.map((route, index) => {
          const { element, ...rest } = route;
          return <Route key={index} {...rest} element={element} />;
        })}
      </Routes>
>>>>>>> 19e39e06573d551903db6d761f4471d35d8a8cf9
    );
  }
}
