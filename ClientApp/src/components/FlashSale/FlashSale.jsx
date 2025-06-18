import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import Flaslsalebanner from "../../assets/img/anhcuanghia/hot-sale-cuoi-tuan.gif"
import "swiper/css";
import "swiper/css/navigation";

const FlashSale = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 0,
    seconds: 0,
  });
  const navigate = useNavigate();

  // Countdown timer effect
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentDay = now.getDay(); // 0 là Chủ Nhật, 1-6 là Thứ 2-Thứ 7
      const endOfWeek = new Date(now);

      // Tính đến 23:59:59 Chủ Nhật
      endOfWeek.setDate(now.getDate() + (7 - currentDay)); // Nhảy đến Chủ Nhật
      endOfWeek.setHours(23, 59, 59, 0);

      const diff = endOfWeek - now;

      if (diff <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      const hours = Math.floor((diff / (1000 * 60 * 60))) % 24;
      const minutes = Math.floor((diff / (1000 * 60))) % 60;
      const seconds = Math.floor((diff / 1000)) % 60;

      return { hours, minutes, seconds };
    };

    // Cập nhật ngay lần đầu
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/Products/lowest-price`);
        if (!response.ok) throw new Error("Không thể tải sản phẩm");
        const productsData = await response.json();

        const formattedProducts = productsData.map((product) => {
          const variant = product.variants?.[0] || {};
          const image = product.images?.[0]?.imageUrl || "/images/placeholder.jpg";

          const oldPrice = variant.price || 0;
          const newPrice = variant.discountPrice || oldPrice;
          const discountAmount = oldPrice - newPrice;
          const discount = oldPrice > 0
            ? `-${Math.round((discountAmount / oldPrice) * 100)}%`
            : "0%";

          return {
            id: product.id,
            name: product.name,
            oldPrice,
            newPrice,
            discount,
            discountAmount,
            image,
            features: [
              variant.storage || "Không xác định",
              product.brand?.name || "Không có thương hiệu",
              "Hiệu suất cao"
            ],
          };
        });

        setProducts(formattedProducts);
      } catch (err) {
        setError("Không thể tải dữ liệu: " + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        <span className="ml-3 text-gray-600">Đang tải sản phẩm...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-auto max-w-3xl my-6">
        <p className="font-bold">Lỗi</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-b from-red-50 to-white py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-10 w-16 h-16 bg-red-200 rounded-full opacity-20"></div>
        <div className="absolute bottom-10 right-20 w-24 h-24 bg-red-300 rounded-full opacity-15"></div>
        <div className="absolute top-1/3 right-1/4 w-10 h-10 bg-red-400 rounded-full opacity-10"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <div className="inline-block bg-red-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
            <span className="font-bold">TOP 10 GIÁ TỐT NHẤT</span>
          </div>
          {/* Thay thế phần text bằng ảnh GIF */}
          <div className="flex justify-center">
            <img
              src={Flaslsalebanner}
              alt="Flash Sale Banner"
              className="max-w-full h-auto"
              style={{
                maxHeight: '150px',
                border: '2px solid #fecaca' // Thêm viền màu đỏ nhạt nếu cần
              }} // Điều chỉnh theo nhu cầu
            />
          </div>

          {/* Countdown timer */}
          <div className="mt-6 flex justify-center">
            <div className="bg-white shadow-lg rounded-lg p-4 inline-flex items-center space-x-4 border-2 border-red-200">
              <span className="text-sm font-medium text-gray-600">Kết thúc sau:</span>
              <div className="flex items-center space-x-2">
                <div className="bg-red-600 text-white rounded p-2 min-w-[50px] text-center">
                  <span className="block text-xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</span>
                  <span className="text-xs">Giờ</span>
                </div>
                <span className="text-red-600 font-bold">:</span>
                <div className="bg-red-600 text-white rounded p-2 min-w-[50px] text-center">
                  <span className="block text-xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                  <span className="text-xs">Phút</span>
                </div>
                <span className="text-red-600 font-bold">:</span>
                <div className="bg-red-600 text-white rounded p-2 min-w-[50px] text-center">
                  <span className="block text-xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                  <span className="text-xs">Giây</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          {products.length > 0 ? (
            <>
              <Swiper
                modules={[Navigation]}
                navigation={{
                  nextEl: ".flash-sale-next",
                  prevEl: ".flash-sale-prev",
                }}
                spaceBetween={30}
                slidesPerView={1}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  768: { slidesPerView: 3 },
                  1024: { slidesPerView: 4 },
                }}
                className="pb-12"
              >
                {products.map((product) => (
                  <SwiperSlide key={product.id}>
                    <div className="h-full flex flex-col">
                      <div
                        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group relative border-2 border-transparent hover:border-red-500 flex flex-col h-full"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        {/* Hot sale ribbon */}
                        <div className="absolute top-0 left-0 bg-red-600 text-white text-xs font-bold px-3 py-1 z-10 clip-path-ribbon">
                          HOT SALE
                        </div>

                        {/* Phần hình ảnh - cố định tỷ lệ khung hình */}
                        <div className="relative aspect-square bg-gray-50 flex-shrink-0">
                          <img
                            src={
                              product.image?.startsWith("http")
                                ? product.image
                                : `${process.env.REACT_APP_API_BASE_URL}/${product.image}`
                            }
                            alt={product.name}
                            className="absolute top-0 left-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/300";
                            }}
                          />
                          {product.discount !== "0%" && (
                            <div className="absolute top-4 right-4 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                              {product.discount}
                            </div>
                          )}
                        </div>

                        {/* Phần thông tin - cố định chiều cao */}
                        <div className="p-5 flex flex-col flex-grow" style={{ minHeight: '280px' }}>
                          <div className="flex justify-between items-start mb-2">
                            {product.oldPrice > product.newPrice ? (
                              <span className="text-gray-500 text-sm line-through">
                                {product.oldPrice.toLocaleString()}đ
                              </span>
                            ) : (
                              <span className="text-sm invisible">0đ</span>
                            )}
                            <span className="text-red-600 font-bold text-lg">
                              {product.newPrice.toLocaleString()}đ
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2" style={{ height: '3.5rem' }}>
                            {product.name}
                          </h3>

                          <div className="mb-3 min-h-[28px]">
                            {product.discountAmount > 0 && (
                              <span className="inline-block bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">
                                Tiết kiệm {product.discountAmount.toLocaleString()}đ
                              </span>
                            )}
                          </div>

                          <ul className="space-y-1 text-sm text-gray-600 mb-4 flex-grow">
                            {product.features.map((feature, index) => (
                              <li key={index} className="flex items-start h-6">
                                <svg
                                  className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-red-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span className="line-clamp-1">{feature}</span>
                              </li>
                            ))}
                          </ul>

                          <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-md mt-auto">
                            MUA NGAY
                          </button>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              <div className="flash-sale-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-red-50 border-2 border-red-200">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </div>
              <div className="flash-sale-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-red-50 border-2 border-red-200">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </>
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm max-w-4xl mx-auto">
              <svg
                className="w-16 h-16 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Không có sản phẩm khuyến mãi</h3>
              <p className="mt-1 text-gray-500">Hiện không có sản phẩm nào trong chương trình flash sale</p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/productlist')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                >
                  Xem tất cả sản phẩm
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View all button */}
        <div className="text-center mt-8">
          <button
            className="bg-white text-red-600 border-2 border-red-600 hover:bg-red-600 hover:text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
            onClick={() => navigate('/productlist')}
          >
            Xem tất cả sản phẩm
          </button>
        </div>
      </div>

      {/* CSS for ribbon */}
      <style jsx>{`
        .clip-path-ribbon {
          clip-path: polygon(0 0, 100% 0, 95% 50%, 100% 100%, 0 100%);
          width: 80px;
        }
      `}</style>
    </div>
  );
};

export default FlashSale;