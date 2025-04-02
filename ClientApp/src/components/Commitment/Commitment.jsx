import React from "react";

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
    <div className="bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {policies.map((policy, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg shadow-sm p-4 flex items-start sm:items-center space-x-3 sm:space-x-4"
            >
              <img 
                src={policy.icon} 
                alt={policy.title} 
                className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
              />
              <div className="flex-1">
                <h3 className="font-bold text-sm sm:text-base mb-1 text-gray-800">
                  {policy.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {policy.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Commitment;