import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '@/components/shared/ProductCard';
// File removed. Migrated to BestSellers.jsx
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

const BestSellerSection = ({ data }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!data.productIds || data.productIds.length === 0) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Assuming an API endpoint to fetch products by a list of IDs
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/products/by-ids?ids=${data.productIds.join(',')}`);
        setProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch best seller products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [data.productIds]);

  if (!data.enabled) {
    return null; // Don't render if section is not enabled
  }

  if (loading) {
    return <div>Loading best sellers...</div>; // Or a proper skeleton loader
  }

  if (products.length === 0) {
    return null; // Don't render if no products are found
  }

  return (
    <section className="py-16 md:py-24 bg-primary-dark">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-white mb-12">
          {data.title}
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
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default BestSellerSection;