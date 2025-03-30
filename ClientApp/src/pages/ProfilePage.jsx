import React, { useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import ProfileInfo from "../components/Profile/ProfileInfo";
import ProfileSidebar from "../components/Profile/ProfileSidebar";
import AddressBook from "../components/Profile/AddressBook"; // Import AddressBook
import UserOrders from "../components/Profile/UserOrders"; // Import UserOrders
import Footer from "../components/Footer/Footer";
import LoyaltyProgram from "../components/Profile/LoyaltyProgram";
import "../pages/ProfilePage.css";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile"); // State để chuyển tab

  return (
    <div className="profile-container">
      <Navbar />
      <div className="profile-layout">
        <div className="profile-content">
          {activeTab === "profile" && <ProfileInfo />}
          {activeTab === "address" && <AddressBook />}
          {activeTab === "orders" && <UserOrders />} 
          {activeTab === "loyalty" && <LoyaltyProgram />} 
        </div>
        <ProfileSidebar setActiveTab={setActiveTab} />
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;