import React from 'react';
import SpecificationDisplay from './ProductSpecifications';

// Test component để kiểm tra ProductSpecifications
const TestSpecifications = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Product Specifications</h1>
      
      {/* Test với productId = 1 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Product ID: 1</h2>
        <SpecificationDisplay productId={1} />
      </div>
      
      {/* Test với productId không tồn tại */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Product ID: 999 (không tồn tại)</h2>
        <SpecificationDisplay productId={999} />
      </div>
    </div>
  );
};

export default TestSpecifications;
