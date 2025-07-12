import React from "react";

const OrderSummary = ({ items = [], total = 0, payable = 0, discount = 0 }) => {
  // Tính toán chi tiết
  const originalTotal = items.reduce((sum, item) => 
    sum + (item.productPrice * item.quantity), 0
  );
  const currentTotal = items.reduce((sum, item) => 
    sum + ((item.productDiscountPrice || item.productPrice) * item.quantity), 0
  );
  const productSavings = originalTotal - currentTotal;
  
  return (
    <div className="border p-4 rounded-lg bg-white shadow-md">
      <h2 className="font-bold text-lg mb-4">Thông tin đơn hàng</h2>

      <div className="flex justify-between mb-2">
        <span>Tổng giá gốc</span>
        <span>{(originalTotal || total).toLocaleString()} đ</span>
      </div>

      {productSavings > 0 && (
        <div className="flex justify-between mb-2 text-green-600">
          <span>Tiết kiệm từ sản phẩm</span>
          <span>-{productSavings.toLocaleString()} đ</span>
        </div>
      )}

      <div className="flex justify-between mb-2">
        <span>Tạm tính</span>
        <span>{(currentTotal || total).toLocaleString()} đ</span>
      </div>

      {discount > 0 && (
        <div className="flex justify-between mb-2 text-green-600">
          <span>Giảm giá voucher</span>
          <span>-{discount.toLocaleString()} đ</span>
        </div>
      )}

      <div className="flex justify-between mb-2 border-t pt-2">
        <span className="font-bold">Cần thanh toán</span>
        <span className="font-bold text-red-500">
          {(payable || currentTotal - discount).toLocaleString()} đ
        </span>
      </div>

      {(productSavings + discount) > 0 && (
        <div className="flex justify-between mb-2 text-sm text-green-600">
          <span>Tổng tiết kiệm</span>
          <span>{(productSavings + discount).toLocaleString()} đ</span>
        </div>
      )}

      <button className="w-full bg-red-500 text-white py-2 rounded-lg font-bold text-lg">
        Xác nhận đơn
      </button>
    </div>
  );
};

export default OrderSummary;
