import React, { useState, useEffect } from "react";
import axios from "axios";

const AuthModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (password) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      password
    );

  const handleCheckEmail = async () => {
    if (!email) return setError("Email khong duoc de trong!");
    if (!isValidEmail(email)) return setError("Email khong hop le!");

    setError("");
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/Auth/check-email`,
        { email }
      );
      setStep(response.data.exists ? 1 : 2);
    } catch (error) {
      setError("Loi khi kiem tra email! Vui long thu lai.");
    }
    setIsLoading(false);
  };

  const handleLogin = async () => {
    if (!password) return setError("Mat khau khong duoc de trong!");

    setError("");
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/Auth/login`,
        { email, password }
      );
      localStorage.setItem("token", response.data.token);
      onClose();
      setTimeout(() => window.location.reload(), 300);
    } catch (error) {
      setError("Sai tai khoan hoac mat khau!");
    }
    setIsLoading(false);
  };

  const handleRegister = async () => {
    if (!isValidPassword(password))
      return setError(
        "Mat khau phai co it nhat 8 ky tu, bao gom chu hoa, chu thuong, so va ky tu dac biet!"
      );
    if (password !== confirmPassword)
      return setError("Mat khau xac nhan khong khop!");

    setError("");
    setIsLoading(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/Auth/register`,
        { email, fullName, phoneNumber, password }
      );
      setStep(1);
    } catch (error) {
      setError("Dang ky that bai! Hay thu lai.");
    }
    setIsLoading(false);
  };

  const getStepTitle = () => {
    switch (step) {
      case 0:
        return "DANG NHAP / DANG KY";
      case 1:
        return "DANG NHAP";
      case 2:
        return "THONG TIN CA NHAN";
      case 3:
        return "DANG KY";
      default:
        return "SYSTEM.AUTH";
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-start justify-center pt-4 sm:pt-8 pb-4 px-2 sm:px-4 font-mono overflow-y-auto"
      style={{ zIndex: 10000 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md sm:max-w-lg min-h-fit my-4 sm:my-8">
        {/* Corner indicators */}
        <div className="absolute top-2 left-2 w-3 h-3 bg-black"></div>
        <div className="absolute top-2 right-2 w-3 h-3 bg-black"></div>
        <div className="absolute bottom-2 left-2 w-3 h-3 bg-black"></div>
        <div className="absolute bottom-2 right-2 w-3 h-3 bg-black"></div>

        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        ></div>

        <div className="relative p-6">
          {/* Tech Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              </div>
              <span className="text-sm font-bold text-black">SYSTEM.AUTH</span>
            </div>
            <div className="text-right">
              <div className="text-xs text-black">THOI GIAN HE THONG</div>
              <div className="text-sm font-bold text-black">
                {currentTime.toLocaleTimeString("vi-VN")}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mb-6">
            {step !== 0 ? (
              <button
                onClick={() => setStep(0)}
                className="px-3 py-1 border-2 border-black bg-white text-black font-bold hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
              >
                ← BACK
              </button>
            ) : (
              <div></div>
            )}

            <button
              onClick={onClose}
              className="px-3 py-1 bg-black text-white font-bold border-2 border-black hover:bg-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
            >
              ✕ CLOSE
            </button>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-black mb-2">
              {getStepTitle()}
            </h2>
            <div className="h-1 bg-black w-32 mx-auto"></div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-2 border-red-500 p-3 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-bold text-black">LOI HE THONG</span>
              </div>
              <p className="text-black mt-1 text-sm">{error}</p>
            </div>
          )}

          {/* Form Content */}
          <div className="space-y-4">
            {/* Step 0: Email Input */}
            {step === 0 && (
              <>
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="VD: user@example.com"
                    className="w-full px-4 py-3 border-2 border-black font-mono text-black focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    onKeyPress={(e) => e.key === "Enter" && handleCheckEmail()}
                  />
                </div>
                <button
                  onClick={handleCheckEmail}
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-black text-white font-bold border-2 border-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>DANG KIEM TRA...</span>
                    </div>
                  ) : (
                    "TIEP TUC"
                  )}
                </button>
              </>
            )}

            {/* Step 1: Login */}
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-300 bg-gray-50 font-mono text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    MAT KHAU
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhap mat khau cua ban"
                    className="w-full px-4 py-3 border-2 border-black font-mono text-black focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-black text-white font-bold border-2 border-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>DANG DANG NHAP...</span>
                    </div>
                  ) : (
                    "DANG NHAP"
                  )}
                </button>
              </>
            )}

            {/* Step 2: Personal Info */}
            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-300 bg-gray-50 font-mono text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    HO VA TEN
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="VD: Nguyen Van A"
                    className="w-full px-4 py-3 border-2 border-black font-mono text-black focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    SO DIEN THOAI
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="VD: 0778706084"
                    className="w-full px-4 py-3 border-2 border-black font-mono text-black focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>
                <button
                  onClick={() => setStep(3)}
                  className="w-full px-6 py-3 bg-black text-white font-bold border-2 border-black hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                >
                  TIEP TUC
                </button>
              </>
            )}

            {/* Step 3: Password Setup */}
            {step === 3 && (
              <>
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    MAT KHAU MOI
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Toi thieu 8 ky tu"
                    className="w-full px-4 py-3 border-2 border-black font-mono text-black focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  />
                  <div className="text-xs text-black mt-1">
                    Yeu cau: chu hoa, chu thuong, so va ky tu dac biet
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    XAC NHAN MAT KHAU
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhap lai mat khau"
                    className="w-full px-4 py-3 border-2 border-black font-mono text-black focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    onKeyPress={(e) => e.key === "Enter" && handleRegister()}
                  />
                </div>
                <button
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-black text-white font-bold border-2 border-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>DANG DANG KY...</span>
                    </div>
                  ) : (
                    "DANG KY"
                  )}
                </button>
              </>
            )}
          </div>

          {/* System Stats Footer */}
          <div className="mt-8 pt-4 border-t-2 border-gray-200">
            <div className="flex justify-between items-center text-xs text-black">
              <div className="flex space-x-4">
                <span>STEP: {step + 1}/4</span>
                <span>STATUS: ACTIVE</span>
                <span>VERSION: 2.1.0</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>SYSTEM.ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
