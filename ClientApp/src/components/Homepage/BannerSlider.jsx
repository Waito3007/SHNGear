import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const BannerSlider = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/Banner`);
        // Filter only active banners (status === false means visible)
        const activeBanners = response.data.filter(banner => 
          banner.status === false
        );
        setBanners(activeBanners);
      } catch (err) {
        setError('Failed to load banners.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);
  if (loading) return <div className="text-white">Loading banners...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (banners.length === 0) return null;
  return (
    <section className="w-full py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={true}
          className="w-full h-full rounded-xl overflow-hidden shadow-lg"
        >
          {banners.map((banner) => (
            <SwiperSlide key={banner.id}>
              {banner.linkTo ? (
                <a href={banner.linkTo} target="_blank" rel="noopener noreferrer">
                  <img 
                    src={banner.imageUrl} 
                    alt={banner.title} 
                    className="w-full h-64 md:h-96 object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                  />
                </a>
              ) : (
                <img 
                  src={banner.imageUrl} 
                  alt={banner.title} 
                  className="w-full h-64 md:h-96 object-cover" 
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default BannerSlider;
