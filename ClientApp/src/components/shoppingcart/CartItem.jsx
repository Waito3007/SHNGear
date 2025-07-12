import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useCart } from "@/hooks/api/useCart";

const CartItem = ({ item }) => {
  const [quantity, setQuantity] = useState(item.quantity || 1);
  const { addToCart } = useCart();

  const handleIncrease = async () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    await addToCart(item.id, 1);
  };

  return (
    <div className="border p-4 rounded-lg bg-white shadow-md">
      <div className="flex items-center justify-between">
        <input type="checkbox" className="mr-2" />
        {item.image && (
          <img
            src={item.image}
            alt={item.name || "Sản phẩm"}
            className="w-16 h-16 rounded"
          />
        )}
        <div className="ml-4 flex-1">
          <h2 className="font-bold text-lg">
            {item.name || "Sản phẩm không có tên"}
          </h2>
          <span className="text-gray-600">
            Màu: {item.color || "Không xác định"}
          </span>
        </div>
        <div className="text-right">
          {item.isFlashSale && item.productPrice !== item.productDiscountPrice ? (
            <>
              <span className="text-gray-400 line-through text-sm">
                {item.productPrice ? item.productPrice.toLocaleString() : "0"} đ
              </span>
              <br />
              <span className="text-red-500 font-bold text-lg">
                {item.productDiscountPrice ? item.productDiscountPrice.toLocaleString() : "0"} đ
              </span>
              <span className="bg-red-500 text-white text-xs px-1 ml-1 rounded">FLASH SALE</span>
            </>
          ) : item.productDiscountPrice && item.productPrice !== item.productDiscountPrice ? (
            <>
              <span className="text-gray-400 line-through text-sm">
                {item.productPrice ? item.productPrice.toLocaleString() : "0"} đ
              </span>
              <br />
              <span className="text-red-500 font-bold text-lg">
                {item.productDiscountPrice ? item.productDiscountPrice.toLocaleString() : "0"} đ
              </span>
            </>
          ) : (
            <span className="text-red-500 font-bold text-lg">
              {item.productPrice ? item.productPrice.toLocaleString() : "0"} đ
            </span>
          )}
        </div>
        <div className="flex items-center">
          <button
            onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
            className="px-2 border bg-gray-200"
          >
            -
          </button>
          <span className="px-4">{quantity}</span>
          <button onClick={handleIncrease} className="px-2 border bg-gray-200">
            +
          </button>
        </div>
        <button className="ml-4 text-gray-500 hover:text-red-500">
          <FaTrash size={18} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
