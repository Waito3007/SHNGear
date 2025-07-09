import React from 'react';
import { useBrands } from '@/hooks/api/useBrands';

const BrandTrustSection = ({ data }) => {
  // Fetch brands from API
  const { brands, loading, error } = useBrands(true);

  return (
    <section className="py-16 md:py-24 bg-gray-900/50">
      <div className="container mx-auto px-4">
        {/* Brand Logos */}
        <div className="flex justify-center items-center flex-wrap gap-x-12 gap-y-8 mb-16">
          {loading ? (
            <div className="text-white">Đang tải thương hiệu...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            brands.map((brand) => (
              <div key={brand.id} className="flex-shrink-0">
                <img 
                  src={brand.logo || '/placeholder-logo.png'} 
                  alt={brand.name} 
                  className="h-12 md:h-16 object-contain filter grayscale hover:filter-none transition-all duration-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            ))
          )}
        </div>

        {/* Commitments */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {(data?.commitments || []).map((commitment) => (
            <div key={commitment.id} className="p-4">
              {/* You can use a proper icon library here */}
              <div className="flex items-center justify-center h-16 w-16 mx-auto mb-4 bg-white/5 rounded-full border border-white-20">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-electric-blue h-6 w-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 className="font-display text-xl font-bold text-white">{commitment.title}</h3>
              <p className="text-light-gray mt-1">{commitment.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandTrustSection;
