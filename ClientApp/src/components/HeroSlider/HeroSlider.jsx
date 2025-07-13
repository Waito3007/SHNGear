import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
// import slider1 from "..//..//assets/img/HeadPhone/banner_headphone.jpg";
// import slider2 from "..//..//assets/img/Laptop/banner_laptop.jpg";
// import slider3 from "..//..//assets/img/Phone/banner_iphone.jpg";
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
        // Xử lý dữ liệu slider: fallback cho status, images, imageUrl
        // Chuẩn hóa: map linkToProduct sang link nếu thiếu
        const validSliders = data
          .filter(s => {
            // Chỉ lấy slider có status là "Hiển thị" (hoặc không có status thì cũng lấy)
            const isVisible = !s.status || s.status === "Hiển thị";
            // Có ít nhất 1 ảnh hợp lệ
            const hasImage = s.images && Array.isArray(s.images) && s.images.length > 0 && s.images[0].imageUrl;
            return isVisible && hasImage;
          })
          .map(s => ({
            ...s,
            link: s.link || s.linkToProduct || '',
          }));
        setSliders(validSliders);
      } catch (e) {
        setSliders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSliders();
  }, []);

  return (
    <div className="hero-slider">
      {loading ? (
        <div style={{height:320,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}>Đang tải slider...</div>
      ) : (
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={20}
          slidesPerView={2}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop={sliders.length > 2}
          pagination={{ clickable: true }}
          className="custom-swiper"
        >
          {sliders.length === 0 ? (
            <SwiperSlide>
              <div style={{height:320,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}>Không có slider nào</div>
            </SwiperSlide>
          ) : (
            sliders.map((slider, idx) => (
              <SwiperSlide key={slider.id || idx}>
                {slider.link ? (
                  <div
                    style={{display:'block',width:'100%',height:'100%',cursor:'pointer'}}
                    onClick={() => {
                      if (slider.link.startsWith('http')) {
                        window.open(slider.link, '_blank', 'noopener noreferrer');
                      } else {
                        window.location.href = slider.link;
                      }
                    }}
                  >
                    <img
                      src={slider.images[0].imageUrl.startsWith('http') ? slider.images[0].imageUrl : `${process.env.REACT_APP_API_BASE_URL}/${slider.images[0].imageUrl}`}
                      alt={slider.title || slider.name || `Slider ${idx+1}`}
                      className="slide-image"
                      style={{pointerEvents:'none'}}
                      onError={e => {e.target.onerror=null; e.target.src='https://via.placeholder.com/800x320?text=No+Image';}}
                    />
                  </div>
                ) : (
                  <img
                    src={slider.images[0].imageUrl.startsWith('http') ? slider.images[0].imageUrl : `${process.env.REACT_APP_API_BASE_URL}/${slider.images[0].imageUrl}`}
                    alt={slider.title || slider.name || `Slider ${idx+1}`}
                    className="slide-image"
                    onError={e => {e.target.onerror=null; e.target.src='https://via.placeholder.com/800x320?text=No+Image';}}
                  />
                )}
              </SwiperSlide>
            ))
          )}
        </Swiper>
      )}
    </div>
  );
};

export default HeroSlider;
