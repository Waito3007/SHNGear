import { useState, useEffect } from "react";

const HomeBanner = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/Banner`);
        if (!res.ok) throw new Error("Không thể tải banner");
        const data = await res.json();
        // ✅ Lọc banner có status === false (hiển thị)  
        const visibleBanners = data.filter(banner => banner.status === false);
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
      setCurrentIndex((prev) => (prev + 2) % (banners.length));
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex, banners.length]);

  const nextSlide = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 2) % (banners.length));
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
    <div className="relative w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Khuyến Mãi Công Nghệ
          </h2>
          <p className="text-gray-600 mt-2">Cập nhật những deal hot nhất trong tuần</p>
        </div>

        {/* Banner Grid */}
        <div className="relative">
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 transition-all duration-500 ${isTransitioning ? 'opacity-75 transform scale-[0.99]' : 'opacity-100 transform scale-100'}`}>
            {currentBanners.map((banner, index) => (
              <div
                key={`${banner.id}-${currentIndex}-${index}`}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white border border-gray-100"
              >
                {banner.linkTo ? (
                  <div
                    className="block w-full h-full cursor-pointer"
                    onClick={() => {
                      if (banner.linkTo.startsWith('http')) {
                        window.open(banner.linkTo, '_blank', 'noopener noreferrer');
                      } else {
                        window.location.href = banner.linkTo;
                      }
                    }}
                  >
                    <div className="relative">
                      <img
                        src={banner.imageUrl?.startsWith("http") ? banner.imageUrl : `${process.env.REACT_APP_API_BASE_URL}/${banner.imageUrl}`}
                        alt={banner.title || `Tech Banner ${index + 1}`}
                        className="w-full h-48 md:h-56 lg:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/600x300/1e40af/ffffff?text=Tech+Deal"; }}
                      />
                      {/* Tech-style overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Click indicator */}
                      <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Xem Deal
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={banner.imageUrl?.startsWith("http") ? banner.imageUrl : `${process.env.REACT_APP_API_BASE_URL}/${banner.imageUrl}`}
                      alt={banner.title || `Tech Banner ${index + 1}`}
                      className="w-full h-48 md:h-56 lg:h-64 object-cover"
                      loading="lazy"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/600x300/1e40af/ffffff?text=Tech+Product"; }}
                    />
                  </div>
                )}
                
                {/* Tech border accent */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Controls - Tech Style */}
        {banners.length > 2 && (
          <>
            <button 
              className="absolute top-1/2 -left-2 md:left-4 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center z-10 shadow-lg border border-gray-200 text-gray-700 transition-all duration-300 hover:bg-blue-50 hover:border-blue-200" 
              onClick={prevSlide}
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
              </svg>
            </button>
            <button 
              className="absolute top-1/2 -right-2 md:right-4 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center z-10 shadow-lg border border-gray-200 text-gray-700 transition-all duration-300 hover:bg-blue-50 hover:border-blue-200" 
              onClick={nextSlide}
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
              </svg>
            </button>
          </>
        )}

        {/* Progress Indicators */}
        {banners.length > 2 && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: Math.ceil(banners.length / 2) }, (_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index * 2)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  Math.floor(currentIndex / 2) === index 
                    ? "bg-blue-600 shadow-lg shadow-blue-600/30" 
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeBanner;
