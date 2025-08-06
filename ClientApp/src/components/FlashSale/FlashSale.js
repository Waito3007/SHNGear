import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '@/components/shared/ProductCard';
// File removed. Migrated to FlashSale.jsx
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

const CountdownTimer = ({ endDate }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(endDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    const timerComponents = [];

    Object.keys(timeLeft).forEach((interval) => {
        if (!timeLeft[interval] && timeLeft[interval] !== 0) {
            return;
        }

        timerComponents.push(
            <div key={interval} className="text-center">
                <div className="font-display text-xl md:text-2xl font-bold text-neon-magenta">
                    {String(timeLeft[interval]).padStart(2, '0')}
                </div>
                <div className="text-xs uppercase text-light-gray">{interval.charAt(0).toUpperCase() + interval.slice(1)}</div>
            </div>
        );
    });

    return (
        <div className="flex space-x-2 md:space-x-4 justify-center">
            {timerComponents.length ? timerComponents : <span className="text-light-gray">Sale Ended!</span>}
        </div>
    );
};

const FlashSale = ({ data }) => {
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashSaleProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/products/flash-sale');
        setFlashSaleProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch flash sale products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSaleProducts();
  }, []);

  if (loading) {
    return <div className="text-white">Loading flash sales...</div>;
  }

  if (flashSaleProducts.length === 0) {
    return null; // Don't render section if no flash sale products
  }

  return (
    <section className="py-16 md:py-24 bg-primary-dark">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-white mb-12">
          {data.headline || "Flash Sale!"} {/* Use data.headline for section title */}
        </h2>
        
        <Swiper
          modules={[Navigation]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 3,
            },
            1024: {
              slidesPerView: 4,
            },
          }}
          className="!pb-10"
        >
          {flashSaleProducts.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} isFlashSale={true} />
              {product.flashSaleEndDate && (
                <div className="mt-4">
                  <CountdownTimer endDate={product.flashSaleEndDate} />
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default FlashSale;