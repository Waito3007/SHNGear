import React from "react";
import { ShieldCheck, Truck, Headphones } from "lucide-react"; // Import icons từ Lucide React
import "./Commitment.css";

const commitments = [
  {
    icon: <ShieldCheck size={50} color="#007bff" />,
    title: "Chất lượng hàng đầu",
    description: "Chúng tôi cam kết cung cấp sản phẩm chất lượng cao, chính hãng.",
  },
  {
    icon: <Truck size={50} color="#28a745" />,
    title: "Giao hàng nhanh chóng",
    description: "Giao hàng toàn quốc trong vòng 1-3 ngày làm việc.",
  },
  {
    icon: <Headphones size={50} color="#ff4e50" />,
    title: "Hỗ trợ 24/7",
    description: "Đội ngũ hỗ trợ khách hàng luôn sẵn sàng giúp đỡ bạn.",
  },
];

const Commitment = () => {
  return (
    <section className="commitment-section">
      <h2>Cam kết của chúng tôi</h2>
      <div className="commitment-grid">
        {commitments.map((item, index) => (
          <div className="commitment-card" key={index}>
            <div className="icon-container">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Commitment;
