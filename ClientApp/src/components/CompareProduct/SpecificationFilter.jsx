import React, { useState } from 'react';
import { Filter, Smartphone, Laptop, Headphones, ChevronDown } from 'lucide-react';

const SpecificationFilter = ({ products, onFilterChange }) => {
  const [activeFilters, setActiveFilters] = useState({
    showBasicOnly: false,
    showDifferencesOnly: false,
    categoryFilter: 'all'
  });
  const [isExpanded, setIsExpanded] = useState(false);

  // Get available product categories
  const getCategories = () => {
    const categories = new Set();
    products.forEach(product => {
      if (product.specifications?.type) {
        categories.add(product.specifications.type);
      }
    });
    return Array.from(categories);
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...activeFilters,
      [filterType]: value
    };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'phone': return Smartphone;
      case 'laptop': return Laptop;
      case 'headphone': return Headphones;
      default: return Filter;
    }
  };

  const getCategoryName = (category) => {
    switch (category) {
      case 'phone': return 'Điện thoại';
      case 'laptop': return 'Laptop';
      case 'headphone': return 'Tai nghe';
      default: return category;
    }
  };

  const categories = getCategories();
  const hasMultipleCategories = categories.length > 1;

  return (
    <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Filter className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Bộ lọc thông số</h3>
            <p className="text-sm text-gray-500">
              Tùy chỉnh hiển thị so sánh thông số kỹ thuật
            </p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
          isExpanded ? 'rotate-180' : ''
        }`} />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
          {/* Basic filters */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeFilters.showBasicOnly}
                  onChange={(e) => handleFilterChange('showBasicOnly', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Chỉ hiện thông số cơ bản
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeFilters.showDifferencesOnly}
                  onChange={(e) => handleFilterChange('showDifferencesOnly', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Chỉ hiện thông số khác biệt
                </span>
              </label>
            </div>
          </div>

          {/* Category filter - only show if there are multiple categories */}
          {hasMultipleCategories && (
            <div className="pt-3 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo loại sản phẩm
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFilterChange('categoryFilter', 'all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeFilters.categoryFilter === 'all'
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Tất cả
                </button>
                {categories.map(category => {
                  const Icon = getCategoryIcon(category);
                  return (
                    <button
                      key={category}
                      onClick={() => handleFilterChange('categoryFilter', category)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1 ${
                        activeFilters.categoryFilter === category
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{getCategoryName(category)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active filters summary */}
          {(activeFilters.showBasicOnly || activeFilters.showDifferencesOnly || activeFilters.categoryFilter !== 'all') && (
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {activeFilters.showBasicOnly && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      Cơ bản
                    </span>
                  )}
                  {activeFilters.showDifferencesOnly && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                      Khác biệt
                    </span>
                  )}
                  {activeFilters.categoryFilter !== 'all' && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      {getCategoryName(activeFilters.categoryFilter)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    const resetFilters = {
                      showBasicOnly: false,
                      showDifferencesOnly: false,
                      categoryFilter: 'all'
                    };
                    setActiveFilters(resetFilters);
                    onFilterChange(resetFilters);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpecificationFilter;
