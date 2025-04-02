import React, { useState } from "react";

const AddPaymentMethod = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const paymentMethod = { name, description };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/PaymentMethod`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentMethod),
      });

      if (!response.ok) {
        throw new Error("Không thể thêm phương thức thanh toán");
      }

      const data = await response.json();
      setMessage(`Thêm thành công: ${data.name}`);
      setName("");
      setDescription("");
    } catch (error) {
      setMessage("Lỗi: " + error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg border-t-4 border-[#cb1c22]">
      <h2 className="text-2xl font-bold mb-6 text-[#cb1c22] text-center">
        Thêm phương thức thanh toán
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className="block text-gray-700 font-semibold mb-2">
            Tên phương thức
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#cb1c22] focus:border-transparent transition-all duration-200"
            required
          />
        </div>
        <div className="mb-5">
          <label className="block text-gray-700 font-semibold mb-2">
            Mô tả
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#cb1c22] focus:border-transparent transition-all duration-200"
            rows="4"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#cb1c22] text-white p-3 rounded-md hover:bg-[#a1161b] transition-colors duration-300 font-semibold"
        >
          Thêm
        </button>
      </form>
      {message && (
        <p
          className={`mt-5 text-center font-medium ${
            message.includes("Lỗi") ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
      
    </div>
  );
};

export default AddPaymentMethod;