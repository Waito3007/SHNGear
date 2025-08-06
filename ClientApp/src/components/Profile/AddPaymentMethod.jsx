import React, { useState } from "react";
import { usePaymentMethod } from "@/hooks/api/usePaymentMethod";

const AddPaymentMethod = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { addPaymentMethod, loading, message, setMessage } = usePaymentMethod();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await addPaymentMethod(name, description);
    if (result) {
      setName("");
      setDescription("");
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
            rows={3}
          />
        </div>
        {message && (
          <div className="mb-4 text-center text-green-600 font-semibold">
            {message}
            <button type="button" className="ml-2 text-red-500" onClick={() => setMessage("")}>x</button>
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-[#cb1c22] text-white font-bold py-3 rounded-md hover:bg-[#a3151a] transition-all duration-200"
          disabled={loading}
        >
          {loading ? "Đang thêm..." : "Thêm phương thức"}
        </button>
      </form>
    </div>
  );
};

export default AddPaymentMethod;