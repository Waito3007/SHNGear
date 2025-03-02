import React from "react";
import Navbar from "../components/Navbar/Navbar";
import ProfileInfo from "../components/Profile/ProfileInfo";
import ProfileSidebar from "../components/Profile/ProfileSidebar";
import ViewedProducts from "../components/Profile/ViewedProducts";
import Commitment from "../components/Commitment/Commitment";
import Footer from "../components/Footer/Footer";
import "../pages/ProfilePage.css";

const ProfilePage = () => {
  return (
    <div className="profile-container">
      <div className="profile-layout">
        <Navbar />
        <ProfileInfo />
        <ProfileSidebar />
      </div>
      <ViewedProducts />
      <Commitment />
      <Footer />
    </div>
  );
};

export default ProfilePage;
