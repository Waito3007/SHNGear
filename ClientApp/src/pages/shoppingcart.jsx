import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar/Navbar";
import CartItem from "../components/shoppingcart/CartItem";
import OrderSummary from "../components/shoppingcart/OrderSummary";
import Commitment from "../components/Commitment/Commitment";
import Footer from "../components/Footer/Footer";

const Shoppingcart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [payable, setPayable] = useState(0);
  const [rewardPoints, setRewardPoints] = useState(0);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch("https://localhost:7107/api/cart", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Không thể lấy dữ liệu giỏ hàng");
        }

        const data = await response.json();
        setCartItems(data.items);
        setTotal(data.total);
        setDiscount(data.discount);
        setPayable(data.payable);
        setRewardPoints(data.rewardPoints);
      } catch (error) {
        console.error("Lỗi khi tải giỏ hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  return (
    <div className="shoppingcart-container mt-14">
      <Navbar />

      <div className="flex gap-6 p-6">
        <div className="w-2/3">
          {loading ? (
            <p className="text-center text-gray-500">Đang tải giỏ hàng...</p>
          ) : cartItems.length > 0 ? (
            cartItems.map((item) => <CartItem key={item.id} item={item} />)
          ) : (
            <div className="text-center text-gray-500 font-semibold p-4">
              🛒 Giỏ hàng của bạn đang trống
            </div>
          )}
        </div>

        <div className="w-1/3">
          <OrderSummary
            total={total}
            discount={discount}
            payable={payable}
            rewardPoints={rewardPoints}
          />
        </div>
      </div>

      <Commitment />
      <Footer />
    </div>
  );
};

export default Shoppingcart;
