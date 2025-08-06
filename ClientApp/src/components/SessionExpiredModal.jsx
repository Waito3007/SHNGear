import React from "react";

const SessionExpiredModal = ({ open, onLogin }) => {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.4)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "#fff",
        padding: 32,
        borderRadius: 8,
        boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
        minWidth: 320,
        textAlign: "center"
      }}>
        <h2>Phiên đăng nhập đã hết hạn</h2>
        <p>Vui lòng đăng nhập lại để tiếp tục sử dụng dịch vụ.</p>
        <button
          style={{
            marginTop: 16,
            padding: "8px 24px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer"
          }}
          onClick={onLogin}
        >
          Đăng nhập lại
        </button>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
