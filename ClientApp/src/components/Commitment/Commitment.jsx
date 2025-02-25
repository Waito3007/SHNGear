import React from "react";
import "./Commitment.css"; // Import CSS

const policies = [
  {
    icon: "https://fptshop.com.vn/img/icons/policy3.svg?w=128&q=100",
    title: "Thương hiệu đảm bảo",
    description: "Nhập khẩu, bảo hành chính hãng",
  },
  {
    icon: "https://fptshop.com.vn/img/icons/policy1.svg?w=128&q=100",
    title: "Đổi trả dễ dàng",
    description: "Theo chính sách đổi trả tại SHN Gear",
  },
  {
    icon: "https://fptshop.com.vn/img/icons/policy4.svg?w=128&q=100",
    title: "Sản phẩm chất lượng",
    description: "Đảm bảo tương thích và độ bền cao",
  },
  {
    icon: "https://fptshop.com.vn/img/icons/policy2.svg?w=128&q=100",
    title: "Giao hàng tận nơi",
    description: "Tại 63 tỉnh thành",
  },
];

const Commitment = () => {
  return (
    <div className="feature-policy">
      <div className="policy-container">
        {policies.map((policy, index) => (
          <div className="policy-item" key={index}>
            <img src={policy.icon} alt={policy.title} className="policy-icon" />
            <div className="policy-text">
              <p className="policy-title">{policy.title}</p>
              <p className="policy-description">{policy.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Commitment;
