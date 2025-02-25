import React from "react";
import "./ServiceSlider.css"; // Import file CSS

const services = [
  {
    href: "dich-vu/the-game",
    imgSrc: "https://cdn2.fptshop.com.vn/svg/the_game_a74fbf07e8_32a77df1b0.svg?w=128&q=100",
    title: "Thẻ game",
  },
  {
    href: "dich-vu/thanh-toan-hoa-don-internet",
    imgSrc: "https://cdn2.fptshop.com.vn/svg/tien_internet_bd9a355225_03e954c658.svg?w=128&q=100",
    title: "Đóng phí Internet",
  },
  {
    href: "dich-vu/thanh-toan-tra-gop",
    imgSrc: "https://cdn2.fptshop.com.vn/svg/tra_gop_d424d9683f_a8e4090e13.svg?w=128&q=100",
    title: "Thanh toán trả góp",
  },
  {
    href: "dich-vu/thanh-toan-tien-nuoc",
    imgSrc: "https://cdn2.fptshop.com.vn/svg/tien_nuoc_7f2b577ea8_fc7c4fe67e.svg?w=128&q=100",
    title: "Tiền nước",
  },
  {
    href: "dich-vu/thanh-toan-tien-dien",
    imgSrc: "https://cdn2.fptshop.com.vn/svg/tien_dien_522ab38b64_fc4ab62614.svg?w=128&q=100",
    title: "Tiền điện",
  },
  {
    href: "dich-vu",
    imgSrc: "https://cdn2.fptshop.com.vn/svg/Khac_a756550960.svg?w=128&q=100",
    title: "Dịch vụ khác",
  },
];

const ServiceSlider = () => {
  return (
    <div className="service-container">
      <div className="service-wrapper">
        {services.map((service, index) => (
          <a key={index} href={service.href} className="service-item">
            <img src={service.imgSrc} alt={service.title} className="service-icon" />
            <p className="service-title">{service.title}</p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default ServiceSlider;
