import React from "react";
import ProfileInfo from "../components/Profile/ProfileInfo";
import ProfileSidebar from "../components/Profile/ProfileSidebar";
import ViewedProducts from "../components/Profile/ViewedProducts";
import "../pages/ProfilePage.css";

const ProfilePage = () => {
  return (
    <div className="profile-container">
      <div className="profile-layout">
        <ProfileInfo />
        <ProfileSidebar />
      </div>
      <ViewedProducts />
    </div>
  );
};

export default ProfilePage;
