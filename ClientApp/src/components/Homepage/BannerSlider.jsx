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
        const response = await axios.get('/api/banners');
        setBanners(response.data);
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
    <section className="w-full h-auto overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        className="w-full h-full"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <img src={banner.imageUrl} alt={banner.title} className="w-full h-64 md:h-96 object-cover rounded-xl shadow-lg" />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default BannerSlider;
