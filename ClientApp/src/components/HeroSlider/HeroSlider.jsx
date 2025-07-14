import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./HeroSlider.css";

const HeroSlider = () => {
  const [sliders, setSliders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSliders = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/Slider`);
        if (!res.ok) throw new Error("Lỗi khi lấy slider");
        const data = await res.json();
        
        // ✅ Xử lý data từ API
        const validSliders = data
          .filter(s => {
            // status === false nghĩa là hiển thị (tương tự Banner)
            const isVisible = s.status === false;
            // Có imageUrl hợp lệ
            const hasImage = s.imageUrl && s.imageUrl.trim() !== '';
            return isVisible && hasImage;
          })
          .map(s => ({
            ...s,
            link: s.linkToProduct || '', // Sử dụng linkToProduct từ API
          }));
        
        console.log("🔍 HeroSlider loaded from API:", validSliders.length, "sliders");
        console.log("🔍 Valid sliders data:", validSliders);
        validSliders.forEach((s, i) => {
          const finalUrl = s.imageUrl?.startsWith('http') 
            ? s.imageUrl 
            : `${process.env.REACT_APP_API_BASE_URL}${s.imageUrl?.startsWith('/') ? '' : '/'}${s.imageUrl}`;
          console.log(`- Slider ${i+1}: ${s.imageUrl} → ${finalUrl}`);
        });
        setSliders(validSliders);
      } catch (e) {
        console.error("Error loading sliders:", e);
        setSliders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSliders();
  }, []);

  if (loading) {
    return (
      <section className="w-full">
        <div className="w-full">
          <div className="flex items-center justify-center h-96 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
              <p className="text-gray-600 text-lg">Đang tải slider...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (sliders.length === 0) {
    return (
      <section className="w-full">
        <div className="w-full">
          <div className="flex items-center justify-center h-96 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100">
            <div className="text-center">
              <p className="text-gray-600 text-lg">Không có slider nào để hiển thị</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      <div className="w-full">
        <Swiper
          modules={[Navigation, Autoplay, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          slidesPerGroup={1}
          centeredSlides={false}
          autoHeight={true}
          autoplay={sliders.length > 1 ? { 
            delay: 5000, 
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          } : false}
          navigation={sliders.length > 1}
          pagination={sliders.length > 1 ? {
            clickable: true,
            dynamicBullets: true
          } : false}
          loop={sliders.length > 1}
          watchSlidesProgress={true}
          className="hero-slider-full"
        >
          {sliders.map((slider, idx) => {
            console.log(`🎬 Rendering slide ${idx + 1}:`, slider.title || `Slide ${idx + 1}`, slider.imageUrl);
            return (
            <SwiperSlide key={slider.id || idx} data-slide={idx}>
              <div className="relative w-full h-auto min-h-[400px] md:min-h-[500px] lg:min-h-[600px] overflow-hidden bg-gray-100">
                {slider.link ? (
                  <div
                    className="block w-full h-full cursor-pointer"
                    onClick={() => {
                      if (slider.link.startsWith('http')) {
                        window.open(slider.link, '_blank', 'noopener noreferrer');
                      } else {
                        window.location.href = slider.link;
                      }
                    }}
                  >
                    <img
                      src={slider.imageUrl?.startsWith('http') 
                        ? slider.imageUrl 
                        : `${process.env.REACT_APP_API_BASE_URL}${slider.imageUrl?.startsWith('/') ? '' : '/'}${slider.imageUrl}`}
                      alt={slider.title || `Slider ${idx+1}`}
                      className="w-full h-auto max-h-[80vh] object-contain"
                      style={{ aspectRatio: 'auto' }}
                      onLoad={() => {
                        console.log(`✅ API image ${idx+1} (with link) loaded:`, slider.imageUrl);
                        // Auto-fit container to image height after load
                        const container = document.querySelector(`[data-slide="${idx}"]`);
                        if (container) {
                          container.style.height = 'auto';
                        }
                      }}
                      onError={e => {
                        console.error(`❌ API image ${idx+1} (with link) failed:`, slider.imageUrl);
                        console.error(`❌ Attempted URL:`, e.target.src);
                        console.error(`❌ Image element:`, e.target);
                        e.target.onerror = null; 
                        e.target.src = 'https://picsum.photos/1920/800?random=' + (idx + 10);
                        e.target.style.display = 'block';
                        e.target.style.opacity = '1';
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    />
                    {/* Gradient overlay for better text readability */}
                    {/* <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none"></div> */}
                    
                    {/* Title overlay nếu cần */}
                    {/* {slider.title && (
                      <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8">
                        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 md:p-4 max-w-md">
                          <h3 className="text-white text-lg md:text-xl lg:text-2xl font-bold mb-1 md:mb-2">
                            {slider.title}
                          </h3>
                          <p className="text-white/80 text-xs md:text-sm">
                            Click để xem thêm
                          </p>
                        </div>
                      </div>
                    )}*/}
                  </div> 
                ) : (
                  <div className="relative w-full h-full">
                    <img
                      src={slider.imageUrl?.startsWith('http') 
                        ? slider.imageUrl 
                        : `${process.env.REACT_APP_API_BASE_URL}${slider.imageUrl?.startsWith('/') ? '' : '/'}${slider.imageUrl}`}
                      alt={slider.title || `Slider ${idx+1}`}
                      className="w-full h-auto max-h-[80vh] object-contain"
                      style={{ aspectRatio: 'auto' }}
                      onLoad={() => {
                        console.log(`✅ API image ${idx+1} loaded:`, slider.imageUrl);
                        // Auto-fit container to image height after load
                        const container = document.querySelector(`[data-slide="${idx}"]`);
                        if (container) {
                          container.style.height = 'auto';
                        }
                      }}
                      onError={e => {
                        console.error(`❌ API image ${idx+1} failed:`, slider.imageUrl);
                        console.error(`❌ Attempted URL:`, e.target.src);
                        console.error(`❌ Image element:`, e.target);
                        e.target.onerror = null; 
                        e.target.src = 'https://picsum.photos/1920/800?random=' + (idx + 10);
                        e.target.style.display = 'block';
                        e.target.style.opacity = '1';
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none"></div>
                    
                    {/* Title overlay nếu cần */}
                    {slider.title && (
                      <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8">
                        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 md:p-4 max-w-md">
                          <h3 className="text-white text-lg md:text-xl lg:text-2xl font-bold">
                            {slider.title}
                          </h3>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
};

export default HeroSlider;
