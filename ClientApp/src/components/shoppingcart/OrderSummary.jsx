import React from "react";

const OrderSummary = ({ total = 0, payable = 0 }) => {
  return (
    <div className="border p-4 rounded-lg bg-white shadow-md">
      <h2 className="font-bold text-lg mb-4">Thông tin đơn hàng</h2>

      <div className="flex justify-between mb-2">
        <span>Tổng tiền</span>
        <span className="font-bold">{(total ?? 0).toLocaleString()} đ</span>
      </div>

      <div className="flex justify-between mb-2 border-t pt-2">
        <span>Cần thanh toán</span>
        <span className="font-bold text-red-500">
          {(payable ?? 0).toLocaleString()} đ
        </span>
      </div>

      <button className="w-full bg-red-500 text-white py-2 rounded-lg font-bold text-lg">
        Xác nhận đơn
      </button>
    </div>
  );
};

export default OrderSummary;
