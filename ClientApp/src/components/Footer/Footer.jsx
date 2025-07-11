import React from "react";
import "./Footer.css";
import { useNavigate } from "react-router-dom";
const Footer = () => {
  const navigate = useNavigate();
  const handleOrderLookup = () => {
    navigate("/order-lookup");
  };
  return (
    <footer className="footer-container">
      <div className="footer-top-container">
        <div className="footer-title">
          <h3>Hệ thống SHN Gear trên toàn quốc</h3>
          <p>
            Bao gồm Cửa hàng SHN Gear, Trung tâm Laptop, F.Studio, S.Studio,
            Garmin Brand Store
          </p>
        </div>
        <button className="store-button" onClick={handleOrderLookup}>Tra cứu đơn </button>
      </div>

      <div className="footer-content">
        {/* Kết nối mạng xã hội */}
        <div className="footer-section">
          <h4>KẾT NỐI VỚI SHN Gear</h4>
          <div className="social-icons">
            <img
              src="https://img.icons8.com/?size=96&id=118497&format=png"
              alt="Facebook"
            />
            <img
              src="https://img.icons8.com/?size=96&id=0m71tmRjlxEe&format=png"
              alt="Zalo"
            />
            <img
              src="https://img.icons8.com/?size=96&id=9a46bTk3awwI&format=png"
              alt="YouTube"
            />
            <img
              src="https://img.icons8.com/?size=100&id=118638&format=png"
              alt="TikTok"
            />
          </div>

          <h4>TỔNG ĐÀI MIỄN PHÍ</h4>
          <p>
            <strong>Tư vấn mua hàng (Miễn phí)</strong>
          </p>
          <p>
            <strong>0338397638 (Nhánh 1)</strong>
          </p>
          <p>
            <strong>Góp ý, khiếu nại</strong>
          </p>
          <p>
            <strong>0797841166 (8h00 - 22h00)</strong>
          </p>
          <p>
            <strong>Hỗ trợ kỹ thuật</strong>
          </p>
          <p>
            <strong>Gặp chuyên gia ngay!</strong>
          </p>
        </div>

        {/* Về chúng tôi */}
        <div className="footer-section">
          <h4>VỀ CHÚNG TÔI</h4>
          <ul>
            <li>Giới thiệu về công ty</li>
            <li>Quy chế hoạt động</li>
            <li>Dự án Doanh nghiệp</li>
            <li>Tin tức khuyến mại</li>
            <li>Giới thiệu máy đổi trả</li>
            <li>Hướng dẫn mua hàng & thanh toán online</li>
            <li>Tra cứu hóa đơn điện tử</li>
            <li>Câu hỏi thường gặp</li>
          </ul>
        </div>

        {/* Chính sách */}
        <div className="footer-section">
          <h4>CHÍNH SÁCH</h4>
          <ul>
            <li>Chính sách bảo hành</li>
            <li>Chính sách đổi trả</li>
            <li>Chính sách bảo mật</li>
            <li>Chính sách trả góp</li>
            <li>Chính sách giao hàng & lắp đặt</li>
            <li>Chính sách thu thập & xử lý dữ liệu cá nhân</li>
          </ul>
        </div>

        {/* Hỗ trợ thanh toán */}
        <div className="footer-section">
          <h4>HỖ TRỢ THANH TOÁN</h4>
          <div className="payment-icons">
            <img
              src="https://img.icons8.com/?size=96&id=13608&format=png"
              alt="Visa"
            />
            <img
              src="https://img.icons8.com/?size=96&id=Sq0VNi1Afgmj&format=png"
              alt="Mastercard"
            />
            <img
              src="https://img.icons8.com/?size=160&id=ikCy0r3I68vX&format=png"
              alt="Momo"
            />
            <img
              src="https://img.icons8.com/?size=96&id=0m71tmRjlxEe&format=png"
              alt="ZaloPay"
            />
            <img
              src="https://img.icons8.com/?size=160&id=cFdvD3H13wdO&format=png"
              alt="Apple Pay"
            />
            <img
              src="https://img.icons8.com/?size=160&id=PjkFdGXiQbvY&format=png"
              alt="Samsung Pay"
            />
          </div>

          <h4>CHỨNG NHẬN</h4>
          <div className="certification-icons">
            <img
              src="https://th.bing.com/th?id=OIP.vZ2cjkL0u4w45jFKiHnkyQHaHa&w=104&h=104&c=7&bgcl=552c98&r=0&o=6&dpr=1.3&pid=13.1"
              alt="DMCA"
            />
            <img
              src="https://th.bing.com/th?id=OIP.JWsl39NXvjcGkxk3H3aB8wHaCz&w=349&h=132&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2"
              alt="Bộ Công Thương"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
