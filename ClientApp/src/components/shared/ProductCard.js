import React from 'react';

const ProductCard = ({ product }) => {

  // Xử lý ảnh chính xác, hỗ trợ cả link tuyệt đối và tương đối
  let primaryImage = '/images/default-product.png';
  if (product.images && product.images.length > 0) {
    const imgObj = product.images.find(img => img.isPrimary) || product.images[0];
    if (imgObj?.imageUrl) {
      primaryImage = imgObj.imageUrl.startsWith('http')
        ? imgObj.imageUrl
        : `${process.env.REACT_APP_API_BASE_URL ? process.env.REACT_APP_API_BASE_URL.replace(/\/$/, '') : ''}/${imgObj.imageUrl.replace(/^\//, '')}`;
    }
  }

  const isFlashSaleActive = product.isFlashSale && product.flashSalePrice && 
                            new Date(product.flashSaleStartDate) <= new Date() && 
                            new Date(product.flashSaleEndDate) >= new Date();

  return (
    <div className="group relative bg-primary-dark border border-white-20 rounded-lg overflow-hidden transition-all duration-300 hover:border-electric-blue">
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          onError={e => { e.target.onerror = null; e.target.src = '/images/default-product.png'; }}
        />
      </div>
      <div className="p-4 text-left">
        <h3 className="font-sans text-base font-semibold text-white">
          <a href={`/product/${product.id}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product.name}
          </a>
        </h3>
        <div className="mt-1 flex items-baseline">
          {isFlashSaleActive ? (
            <>
              <p className="text-lg font-bold text-neon-magenta mr-2">
                {product.flashSalePrice?.toLocaleString('vi-VN')}₫
              </p>
              <p className="text-sm text-light-gray line-through">
                {product.variants[0]?.price?.toLocaleString('vi-VN')}₫
              </p>
            </>
          ) : (
            <p className="text-lg font-bold text-electric-blue">
              {product.variants[0]?.price?.toLocaleString('vi-VN')}₫
            </p>
          )}
        </div>
      </div>
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button className="p-2 rounded-full bg-electric-blue text-primary-dark">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6Z"/><path d="M12 15V9"/><path d="M9 12h6"/></svg>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;