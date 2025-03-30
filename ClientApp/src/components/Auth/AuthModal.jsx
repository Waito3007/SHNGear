import React, { useState } from "react";
import { Modal, Button } from "flowbite-react";
import axios from "axios";
import "./AuthModal.css";

const AuthModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (password) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const handleCheckEmail = async () => {
    if (!email) return setError("Email không được để trống!");
    if (!isValidEmail(email)) return setError("Email không hợp lệ!");

    setError("");
    setIsLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/Auth/check-email`, { email });
      setStep(response.data.exists ? 1 : 2);
    } catch (error) {
      setError("Lỗi khi kiểm tra email! Vui lòng thử lại.");
    }
    setIsLoading(false);
  };

  const handleLogin = async () => {
    if (!password) return setError("Mật khẩu không được để trống!");

    setError("");
    setIsLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/Auth/login`, { email, password });
      localStorage.setItem("token", response.data.token);
      onClose();
      setTimeout(() => window.location.reload(), 300);
    } catch (error) {
      setError("Sai tài khoản hoặc mật khẩu!");
    }
    setIsLoading(false);
  };

  const handleRegister = async () => {
    if (!isValidPassword(password)) return setError("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt!");
    if (password !== confirmPassword) return setError("Mật khẩu xác nhận không khớp!");

    setError("");
    setIsLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/Auth/register`, { email, fullName, phoneNumber, password });
      setStep(1);
    } catch (error) {
      setError("Đăng ký thất bại! Hãy thử lại.");
    }
    setIsLoading(false);
  };

  return (
    <Modal show={isOpen} onClose={onClose}>
      <div className="modal-overlay">
        <div className="relative bg-white rounded-xl shadow-lg text-black w-full max-w-md max-h-full">
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-200">
            {step !== 0 && (
              <button className="text-gray-400 hover:bg-gray-200 rounded-lg text-sm w-8 h-8" onClick={() => setStep(0)}>◀</button>
            )}
            <button className="text-gray-400 hover:bg-gray-200 rounded-lg text-sm w-8 h-8" onClick={onClose}>✖</button>
          </div>
          <h3 className="text-2xl font-bold text-black text-center">
            {step === 0 ? "Đăng nhập/Đăng ký" : step === 1 ? "Đăng nhập" : step === 2 ? "Thông tin cá nhân" : "Đăng ký"}
          </h3>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="p-4 space-y-4 flex flex-col items-center">
            {step === 0 && (
              <>
                <input type="email" placeholder="Nhập email của bạn" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border-gray-300 focus:ring-black focus:border-black h-12 px-3" />
                <Button onClick={handleCheckEmail} className="mt-4 bg-red-700 hover:bg-red-800 text-white font-medium rounded-lg px-5 py-2.5" disabled={isLoading}>{isLoading ? "Đang kiểm tra..." : "Tiếp tục"}</Button>
              </>
            )}
            {step === 1 && (
              <>
                <input type="password" placeholder="Nhập mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border-gray-300 focus:ring-black focus:border-black h-12 px-3" />
                <Button onClick={handleLogin} className="mt-4 bg-red-700 hover:bg-red-800 text-white font-medium rounded-lg px-5 py-2.5" disabled={isLoading}>{isLoading ? "Đang đăng nhập..." : "Đăng nhập"}</Button>
              </>
            )}
            {step === 2 && (
              <>
                <input type="text" placeholder="Họ và tên" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border-gray-300 focus:ring-black focus:border-black h-12 px-3" />
                <input type="text" placeholder="Số điện thoại" value={phoneNumber} onChange={(e) => setPhone(e.target.value)} className="w-full border-gray-300 focus:ring-black focus:border-black h-12 px-3" />
                <Button onClick={() => setStep(3)} className="mt-4 bg-red-700 hover:bg-red-800 text-white font-medium rounded-lg px-5 py-2.5">Tiếp tục</Button>
              </>
            )}
            {step === 3 && (
              <>
                <input type="password" placeholder="Nhập mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border-gray-300 focus:ring-black focus:border-black h-12 px-3" />
                <input type="password" placeholder="Xác nhận mật khẩu" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border-gray-300 focus:ring-black focus:border-black h-12 px-3" />
                <Button onClick={handleRegister} className="mt-4 bg-red-700 hover:bg-red-800 text-white font-medium rounded-lg px-5 py-2.5" disabled={isLoading}>{isLoading ? "Đang đăng ký..." : "Đăng ký"}</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;
