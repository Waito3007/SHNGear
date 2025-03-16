import React, { useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import ProfileInfo from "../components/Profile/ProfileInfo";
import ProfileSidebar from "../components/Profile/ProfileSidebar";
import AddressBook from "../components/Profile/AddressBook"; // Import AddressBook
import Footer from "../components/Footer/Footer";
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
        </div>
        <ProfileSidebar setActiveTab={setActiveTab} />
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
