import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const isValidPassword = (password) =>
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Link dat lai mat khau khong hop le.");
    }
  }, [token]);

  const handleReset = async () => {
    if (!password) return setError("Vui long nhap mat khau moi.");
    if (!isValidPassword(password))
      return setError(
        "Mat khau phai co it nhat 8 ky tu, bao gom chu hoa, chu thuong, so va ky tu dac biet (@$!%*?&)."
      );
    if (password !== confirmPassword)
      return setError("Mat khau xac nhan khong khop.");

    setError("");
    setIsLoading(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/Auth/reset-password`,
        { token, newPassword: password }
      );
      setSuccess(true);
    } catch (err) {
      if (err.response?.status === 400) {
        setError(
          err.response.data?.message ||
            "Link dat lai mat khau khong hop le hoac da het han (1 gio)."
        );
      } else {
        setError("Co loi xay ra. Vui long thu lai.");
      }
    }
    setIsLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-100 font-mono px-4"
      style={{ fontFamily: "'Courier New', monospace" }}
    >
      <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md p-8 relative">
        {/* Corner indicators */}
        <div className="absolute top-2 left-2 w-3 h-3 bg-black"></div>
        <div className="absolute top-2 right-2 w-3 h-3 bg-black"></div>
        <div className="absolute bottom-2 left-2 w-3 h-3 bg-black"></div>
        <div className="absolute bottom-2 right-2 w-3 h-3 bg-black"></div>

        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        ></div>

        <div className="relative">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            </div>
            <span className="text-sm font-bold text-black">SYSTEM.AUTH</span>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-black mb-2 tracking-widest uppercase">
              Dat Lai Mat Khau
            </h2>
            <div className="h-1 bg-black w-32 mx-auto"></div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-2 border-red-500 p-3 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-bold text-black">LOI HE THONG</span>
              </div>
              <p className="text-black mt-1 text-sm">{error}</p>
            </div>
          )}

          {/* Success */}
          {success ? (
            <div className="space-y-6">
              <div className="bg-green-50 border-2 border-green-500 p-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-bold text-black">THANH CONG</span>
                </div>
                <p className="text-black text-sm">
                  Mat khau cua ban da duoc dat lai thanh cong. Vui long dang nhap lai.
                </p>
              </div>
              <button
                onClick={() => navigate("/")}
                className="w-full px-6 py-3 bg-black text-white font-bold border-2 border-black hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 uppercase tracking-widest"
              >
                Ve Trang Chu
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {!token ? null : (
                <>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wider">
                      Mat Khau Moi
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Toi thieu 8 ky tu"
                      className="w-full px-4 py-3 border-2 border-black font-mono text-black focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Yeu cau: chu hoa, chu thuong, so va ky tu dac biet (@$!%*?&)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wider">
                      Xac Nhan Mat Khau
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhap lai mat khau moi"
                      className="w-full px-4 py-3 border-2 border-black font-mono text-black focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      onKeyPress={(e) => e.key === "Enter" && handleReset()}
                    />
                  </div>
                  <button
                    onClick={handleReset}
                    disabled={isLoading || !token}
                    className="w-full px-6 py-3 bg-black text-white font-bold border-2 border-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 uppercase tracking-widest"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>DANG XU LY...</span>
                      </div>
                    ) : (
                      "XAC NHAN DAT LAI MAT KHAU"
                    )}
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="w-full text-sm text-black underline hover:text-gray-600 text-center py-1"
                  >
                    Quay lai trang chu
                  </button>
                </>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-4 border-t-2 border-gray-200">
            <div className="flex justify-between items-center text-xs text-black">
              <span>PASSWORD.RESET // SHN GEAR</span>
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

export default ResetPasswordPage;
