import React, { useState } from "react";
import { Modal, Button } from "flowbite-react";

const AuthModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [step, setStep] = useState(1);  // Quản lý bước hiển thị form

  const handleNextStep = () => {
    setStep(step + 1);  // Chuyển sang bước tiếp theo
  };

  const handlePreviousStep = () => {
    setStep(step - 1);  // Quay lại bước trước
  };

  const handleSubmitForm = () => {
    console.log("Thông tin đăng ký:", { email, name, phone, dob, gender });
    onClose();  // Đóng modal sau khi submit
  };

  return (
    <Modal show={isOpen} onClose={onClose}>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-lg text-black w-full max-w-md max-h-full">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200">
           
            <div className="flex items-center space-x-2">
              {step > 1 && (
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                  onClick={handlePreviousStep}
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7H1"
                    />
                  </svg>
                </button>
              )}
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                onClick={onClose}
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <h3 className="text-2xl font-bold text-black text-center w-full">
              Đăng nhập / Đăng ký
            </h3>
          <div className="p-4 md:p-5 space-y-4 flex flex-col items-center">
            {step === 1 && (
              <>
                <input
                  id="email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border-gray-300 focus:ring-black focus:border-black h-16"
                />
                <Button
                  onClick={handleNextStep}
                  className="mt-4 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Tiếp tục
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <input
                  id="name"
                  type="text"
                  placeholder="Nhập tên của bạn"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border-gray-300 focus:ring-black focus:border-black h-16"
                />
                <Button
                  onClick={handleNextStep}
                  className="mt-4 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Tiếp tục
                </Button>
              </>
            )}

            {step === 3 && (
              <>
                <input
                  id="phone"
                  type="text"
                  placeholder="Nhập số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border-gray-300 focus:ring-black focus:border-black h-16"
                />
                <Button
                  onClick={handleNextStep}
                  className="mt-4 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Tiếp tục
                </Button>
              </>
            )}

            {step === 4 && (
              <>
                <input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-white border-gray-300 focus:ring-black focus:border-black h-16"
                />
                <Button
                  onClick={handleNextStep}
                  className="mt-4 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Tiếp tục
                </Button>
              </>
            )}

            {step === 5 && (
              <>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-white border-gray-300 focus:ring-black focus:border-black h-16"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
                <Button
                  onClick={handleSubmitForm}
                  className="mt-4 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Đăng ký
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;
