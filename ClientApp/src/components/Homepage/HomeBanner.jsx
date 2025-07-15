import { useState, useEffect } from "react";

const HomeBanner = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/Banner`
        );
        if (!res.ok) throw new Error("Không thể tải banner");
        const data = await res.json();
        // ✅ Lọc banner có status === false (hiển thị)
        const visibleBanners = data.filter((banner) => banner.status === false);
        setBanners(visibleBanners);
      } catch (error) {
        console.error("Lỗi khi fetch banner:", error.message);
      }
    };
    fetchBanners();
  }, []);

  // Auto slide every 4 seconds (faster for tech products)
  useEffect(() => {
    if (banners.length <= 2) return; // Don't auto-slide if 2 or fewer banners

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev + 2) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex, banners.length]);

  const nextSlide = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 2) % banners.length);
  };

  const prevSlide = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => {
      const newIndex = prev - 2;
      return newIndex < 0 ? Math.max(0, banners.length - 2) : newIndex;
    });
  };

  const goToSlide = (index) => {
    setIsTransitioning(true);
    setCurrentIndex(index);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  if (banners.length === 0) return null;

  // Get current pair of banners to display
  const getCurrentBanners = () => {
    const current = banners.slice(currentIndex, currentIndex + 2);
    if (current.length === 1 && banners.length > 1) {
      // If only one banner in current slice, add the first banner to complete the pair
      current.push(banners[0]);
    }
    return current;
  };

  const currentBanners = getCurrentBanners();

  return (
    <div className="relative w-full bg-white py-8 border-t border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            {/* Tech Icon */}
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight">
              Khuyến Mãi Công Nghệ
            </h2>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <span className="font-mono">Cập nhật deal công nghệ mới nhất</span>
            <div className="w-2 h-2 bg-black rounded-full"></div>
          </div>
          {/* Tech divider */}
          <div className="mt-6 flex items-center justify-center">
            <div className="h-px bg-gradient-to-r from-transparent via-black to-transparent w-64"></div>
          </div>
        </div>

        {/* Banner Grid */}
        <div className="relative">
          <div
            className={`grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 transition-all duration-700 ${
              isTransitioning
                ? "opacity-60 transform translate-y-2"
                : "opacity-100 transform translate-y-0"
            }`}
          >
            {currentBanners.map((banner, index) => (
              <div
                key={`${banner.id}-${currentIndex}-${index}`}
                className="group relative overflow-hidden bg-white border-2 border-gray-200 hover:border-black transition-all duration-500 transform hover:-translate-y-1"
                style={{
                  clipPath:
                    "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
                }}
              >
                {/* Tech corner indicator */}
                <div className="absolute top-0 right-0 w-6 h-6 bg-black transform rotate-45 translate-x-3 -translate-y-3 group-hover:bg-gray-800 transition-colors duration-300"></div>

                {banner.linkTo ? (
                  <div
                    className="block w-full h-full cursor-pointer relative"
                    onClick={() => {
                      if (banner.linkTo.startsWith("http")) {
                        window.open(
                          banner.linkTo,
                          "_blank",
                          "noopener noreferrer"
                        );
                      } else {
                        window.location.href = banner.linkTo;
                      }
                    }}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={
                          banner.imageUrl?.startsWith("http")
                            ? banner.imageUrl
                            : `${process.env.REACT_APP_API_BASE_URL}/${banner.imageUrl}`
                        }
                        alt={banner.title || `Tech Banner ${index + 1}`}
                        className="w-full h-56 md:h-64 lg:h-72 object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/600x300/000000/ffffff?text=TECH+DEAL";
                        }}
                      />

                      {/* Tech overlay grid */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                        style={{
                          backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(0,0,0,.1) 25%, rgba(0,0,0,.1) 26%, transparent 27%, transparent 74%, rgba(0,0,0,.1) 75%, rgba(0,0,0,.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0,0,0,.1) 25%, rgba(0,0,0,.1) 26%, transparent 27%, transparent 74%, rgba(0,0,0,.1) 75%, rgba(0,0,0,.1) 76%, transparent 77%, transparent)`,
                          backgroundSize: "20px 20px",
                        }}
                      ></div>

                      {/* Modern click indicator */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                        <div className="bg-black text-white px-4 py-2 font-mono text-xs tracking-wider border border-white/20">
                          VIEW DEAL →
                        </div>
                      </div>

                      {/* Scan line effect */}
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-white opacity-0 group-hover:opacity-100 group-hover:animate-pulse"></div>
                    </div>
                  </div>
                ) : (
                  <div className="relative overflow-hidden">
                    <img
                      src={
                        banner.imageUrl?.startsWith("http")
                          ? banner.imageUrl
                          : `${process.env.REACT_APP_API_BASE_URL}/${banner.imageUrl}`
                      }
                      alt={banner.title || `Tech Banner ${index + 1}`}
                      className="w-full h-56 md:h-64 lg:h-72 object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/600x300/000000/ffffff?text=TECH+PRODUCT";
                      }}
                    />

                    {/* Tech overlay grid */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                      style={{
                        backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(0,0,0,.1) 25%, rgba(0,0,0,.1) 26%, transparent 27%, transparent 74%, rgba(0,0,0,.1) 75%, rgba(0,0,0,.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0,0,0,.1) 25%, rgba(0,0,0,.1) 26%, transparent 27%, transparent 74%, rgba(0,0,0,.1) 75%, rgba(0,0,0,.1) 76%, transparent 77%, transparent)`,
                        backgroundSize: "20px 20px",
                      }}
                    ></div>
                  </div>
                )}

                {/* Tech status bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-black via-gray-600 to-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                {/* Tech frame corners */}
                <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Controls - Tech Style */}
        {banners.length > 2 && (
          <>
            <button
              className="absolute top-1/2 -left-4 md:left-2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white border-2 border-black hover:bg-black hover:text-white transition-all duration-300 transform hover:scale-110 z-10 group"
              onClick={prevSlide}
              style={{
                clipPath: "polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)",
              }}
            >
              <svg
                className="w-6 h-6 md:w-7 md:h-7 ml-1"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
              </svg>
              {/* Tech indicator */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-black group-hover:bg-white transition-colors duration-300"></div>
            </button>
            <button
              className="absolute top-1/2 -right-4 md:right-2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white border-2 border-black hover:bg-black hover:text-white transition-all duration-300 transform hover:scale-110 z-10 group"
              onClick={nextSlide}
              style={{
                clipPath: "polygon(0% 0%, 75% 0%, 100% 100%, 25% 100%)",
              }}
            >
              <svg
                className="w-6 h-6 md:w-7 md:h-7 mr-1"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
              </svg>
              {/* Tech indicator */}
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-black group-hover:bg-white transition-colors duration-300"></div>
            </button>
          </>
        )}

        {/* Progress Indicators */}
        {banners.length > 2 && (
          <div className="flex justify-center mt-8 space-x-1">
            {/* Tech progress bar */}
            <div className="flex items-center gap-1 bg-gray-100 p-2 border border-gray-300">
              <div className="text-xs font-mono text-black mr-2">
                {String(Math.floor(currentIndex / 2) + 1).padStart(2, "0")}
              </div>
              {Array.from(
                { length: Math.ceil(banners.length / 2) },
                (_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index * 2)}
                    className={`relative transition-all duration-300 ${
                      Math.floor(currentIndex / 2) === index
                        ? "w-8 h-3 bg-black"
                        : "w-3 h-3 bg-gray-400 hover:bg-gray-600"
                    }`}
                    style={{
                      clipPath:
                        Math.floor(currentIndex / 2) === index
                          ? "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))"
                          : "none",
                    }}
                  >
                    {/* Active indicator */}
                    {Math.floor(currentIndex / 2) === index && (
                      <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-white"></div>
                    )}
                  </button>
                )
              )}
              <div className="text-xs font-mono text-black ml-2">
                {String(Math.ceil(banners.length / 2)).padStart(2, "0")}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeBanner;
