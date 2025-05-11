import { useState, useEffect } from "react";
import Banner1 from "../../Assets/img/anhcuanghia/banner1.png";
import Banner2 from "../../Assets/img/anhcuanghia/bannervip.png";
import Banner3 from "../../Assets/img/anhcuanghia/hieuthuhai.png";

const Slider = () => {
  const slides = [
    { img: Banner1 },
    { img: Banner2 },
    { img: Banner3 },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const nextSlide = () => {
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setIsTransitioning(true);
    setCurrentIndex(index);
  };

  // Reset transitioning state after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Slider container */}
      <div className="relative">
        {/* Slider */}
        <div className={`flex relative ${isTransitioning ? "transition-opacity duration-500 ease-in-out" : ""}`}>
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`flex-shrink-0 w-full transition-opacity duration-500 ${index === currentIndex ? "opacity-100" : "opacity-0 absolute"}`}
            >
              <div className="relative">
                <img
                  src={slide.img}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                {/* Gradient overlay để tạo hiệu ứng trong suốt dần về phía dưới */}
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

      {/* Navigation buttons */}
      <button
        className="absolute top-1/2 left-5 -translate-y-1/2 w-12 h-12 bg-white/70 rounded-full flex items-center justify-center z-10 transition-all hover:bg-white/90 hover:scale-105 shadow-md"
        onClick={prevSlide}
      >
        <svg className="w-6 h-6 text-gray-800" viewBox="0 0 24 24">
          <path fill="currentColor" d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
        </svg>
      </button>
      <button
        className="absolute top-1/2 right-5 -translate-y-1/2 w-12 h-12 bg-white/70 rounded-full flex items-center justify-center z-10 transition-all hover:bg-white/90 hover:scale-105 shadow-md"
        onClick={nextSlide}
      >
        <svg className="w-6 h-6 text-gray-800" viewBox="0 0 24 24">
          <path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
        </svg>
      </button>

      {/* Indicators - Phiên bản cao cấp gọn nhẹ */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-1.5 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`relative w-2 h-2 rounded-full transition-all duration-300 ease-out ${index === currentIndex
                ? "bg-white scale-[1.8] shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                : "bg-white/40 hover:bg-white/60 scale-100"
              }`}
          >
            {index === currentIndex && (
              <span className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Slider;