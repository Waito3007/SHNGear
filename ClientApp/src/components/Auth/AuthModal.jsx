import React, { useState } from "react";
import { Modal, Button } from "flowbite-react";
import axios from "axios";
import "./AuthModal.css";

const AuthModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckEmail = async () => {
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await axios.post("https://localhost:7107/api/Auth/check-email", { email });
      const { exists } = response.data;

      if (exists) {
        setStep(1); // Tồn tại -> sang bước đăng nhập
      } else {
        setStep(2); // Không tồn tại -> sang bước đăng ký
      }
    } catch (error) {
      console.error("Lỗi kiểm tra email:", error);
    }
    setIsLoading(false);
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("https://localhost:7107/api/Auth/login", { email, password });
      const { token } = response.data;
  
      // Lưu token vào localStorage
      localStorage.setItem("token", token);
  
      // Chuyển hướng về trang chủ
      window.location.href = "/";
  
      console.log("Đăng nhập thành công:", response.data);
    } catch (error) {
      console.error("Đăng nhập thất bại:", error);
    }
    setIsLoading(false);
  };
  

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("https://localhost:7107/api/Auth/register", { email, password });
      console.log("Đăng ký thành công:", response.data);
      onClose();
    } catch (error) {
      console.error("Đăng ký thất bại:", error);
    }
    setIsLoading(false);
  };

  return (
    <Modal show={isOpen} onClose={onClose}>
      <div className="modal-overlay">
        <div className="relative bg-white rounded-xl shadow-lg text-black w-full max-w-md max-h-full">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200">
            {step !== 0 && (
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                onClick={() => setStep(0)}
              >
                ◀
              </button>
            )}
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
              onClick={onClose}
            >
              ✖
            </button>
          </div>

          <h3 className="text-2xl font-bold text-black text-center w-full">
            {step === 0 ? "Nhập email" : step === 1 ? "Đăng nhập" : "Đăng ký"}
          </h3>

          <div className="p-4 md:p-5 space-y-4 flex flex-col items-center">
            {step === 0 && (
              <>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border-gray-300 focus:ring-black focus:border-black h-16"
                />
                <Button
                  onClick={handleCheckEmail}
                  className={`mt-4 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center ${email ? 'bg-red-700 hover:bg-red-800' : 'bg-gray-400 cursor-not-allowed'}`}
                  disabled={!email || isLoading}
                >
                  {isLoading ? "Đang kiểm tra..." : "Tiếp tục"}
                </Button>
              </>
            )}

            {step === 1 && (
              <>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border-gray-300 focus:ring-black focus:border-black h-16"
                />
                <Button
                  onClick={handleLogin}
                  className="mt-4 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border-gray-300 focus:ring-black focus:border-black h-16"
                />
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white border-gray-300 focus:ring-black focus:border-black h-16"
                />
                <Button
                  onClick={handleRegister}
                  className="mt-4 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang đăng ký..." : "Đăng ký"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;
