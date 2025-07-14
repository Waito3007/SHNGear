import { useState, useEffect } from "react";

const HeroBanner = () => {
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

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex, banners.length]);

  const nextSlide = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
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

  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative">
        <div className={`flex relative ${isTransitioning ? "transition-opacity duration-500 ease-in-out" : ""}`}>
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`flex-shrink-0 w-full transition-opacity duration-500 ${index === currentIndex ? "opacity-100" : "opacity-0 absolute"}`}
            >
              <div className="relative">
                <img
                  src={banner.images?.[0]?.imageUrl.startsWith("http") ? banner.images[0].imageUrl : `${process.env.REACT_APP_API_BASE_URL}/${banner.images?.[0]?.imageUrl}`}
                  alt={banner.title || `Slide ${index + 1}`}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/1200x500?text=Error"; }}
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/20 pointer-events-none"
                  style={{
                    maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)"
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <button className="absolute top-1/2 left-5 -translate-y-1/2 w-12 h-12 bg-white/70 rounded-full flex items-center justify-center z-10 hover:bg-white/90 hover:scale-105 shadow-md" onClick={prevSlide}>
        <svg className="w-6 h-6 text-gray-800" viewBox="0 0 24 24"><path fill="currentColor" d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" /></svg>
      </button>
      <button className="absolute top-1/2 right-5 -translate-y-1/2 w-12 h-12 bg-white/70 rounded-full flex items-center justify-center z-10 hover:bg-white/90 hover:scale-105 shadow-md" onClick={nextSlide}>
        <svg className="w-6 h-6 text-gray-800" viewBox="0 0 24 24"><path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" /></svg>
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-1.5 z-20">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`relative w-2 h-2 rounded-full transition-all duration-300 ease-out ${index === currentIndex ? "bg-white scale-[1.8] shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "bg-white/40 hover:bg-white/60 scale-100"}`}
          >
            {index === currentIndex && <span className="absolute inset-0 rounded-full bg-white/20 animate-ping" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
