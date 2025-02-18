// src/pages/HomePage.js
import React, { useState } from "react";
import { Button } from "flowbite-react";
import AuthModal from "../components/AuthModal";

const HomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex justify-center bg-blue-500  items-center min-h-screen">
      <div className=" text-white p-4">
        <Button className=" text-white p-4" onClick={handleOpenModal}>Đăng nhập / Đăng ký</Button>
      </div>

      <AuthModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default HomePage;
