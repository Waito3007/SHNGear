import React, { useState } from 'react';
import { 
  Monitor, 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Battery,
  Camera,
  Weight,
  Wifi,
  Plug,
  Headphones
} from 'lucide-react';
import SpecificationFilter from './SpecificationFilter';

const SpecificationComparison = ({ products }) => {
  const [filters, setFilters] = useState({
    showBasicOnly: false,
    showDifferencesOnly: false,
    categoryFilter: 'all'
  });  // Define basic specifications for filtering
  const basicSpecs = ['screenSize', 'resolution', 'weight', 'cpuModel', 'cpuType', 'ram', 'internalStorage', 'batteryCapacity'];

  // Helper function to get icon based on spec type
  const getSpecIcon = (specKey) => {
    const iconMap = {
      screenSize: Monitor,
      resolution: Monitor,
      screenType: Monitor,
      weight: Weight,
      cpuModel: Cpu,
      cpuType: Cpu,
      cpuCores: Cpu,
      cpuNumberOfCores: Cpu,
      ram: MemoryStick,
      internalStorage: HardDrive,
      ssdStorage: HardDrive,
      batteryCapacity: Battery,
      frontCamera: Camera,
      rearCamera: Camera,
      connectionType: Wifi,
      port: Plug,
      headphoneType: Headphones,
    };
    return iconMap[specKey] || Monitor;
  };

  // Helper function to check if spec values are different across products
  const hasSpecDifferences = (key) => {
    const values = products.map(p => p.specifications?.[key]).filter(v => v !== null && v !== undefined);
    return new Set(values).size > 1;
  };

  // Get all unique specification keys from all products with filtering
  const getAllSpecKeys = () => {
    const allKeys = new Set();
    
    products.forEach(product => {
      if (product.specifications) {
        // Filter by category if specified
        if (filters.categoryFilter !== 'all' && product.specifications.type !== filters.categoryFilter) {
          return;
        }
        
        Object.keys(product.specifications).forEach(key => {
          if (key !== 'type') { // Exclude the type field
            // Apply basic specs filter
            if (filters.showBasicOnly && !basicSpecs.includes(key)) {
              return;
            }
            
            // Apply differences filter
            if (filters.showDifferencesOnly && !hasSpecDifferences(key)) {
              return;
            }
            
            allKeys.add(key);
          }
        });
      }
    });
    
    return Array.from(allKeys).sort();
  };

  // Filter products based on category filter
  const getFilteredProducts = () => {
    if (filters.categoryFilter === 'all') {
      return products;
    }
    return products.filter(p => p.specifications?.type === filters.categoryFilter);
  };

  // Helper function to format specification value
  const formatSpecValue = (key, value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Có' : 'Không';
    if (key.includes('weight') && !isNaN(value)) return `${value}g`;
    if (key.includes('ram') && !isNaN(value)) return `${value}GB`;
    if (key.includes('battery') && !isNaN(value)) return `${value}mAh`;
    return value.toString();
  };

  // Helper function to get specification display name
  const getSpecDisplayName = (key) => {
    const nameMap = {
      screenSize: 'Kích thước màn hình',
      resolution: 'Độ phân giải',
      screenType: 'Loại màn hình',
      weight: 'Trọng lượng',
      material: 'Chất liệu',
      cpuModel: 'CPU',
      cpuType: 'Loại CPU',
      cpuCores: 'Số nhân CPU',
      cpuNumberOfCores: 'Số nhân CPU',
      ram: 'RAM',
      maxRAMSupport: 'RAM tối đa hỗ trợ',
      internalStorage: 'Bộ nhớ trong',
      ssdStorage: 'Ổ cứng SSD',
      batteryCapacity: 'Dung lượng pin',
      frontCamera: 'Camera trước',
      rearCamera: 'Camera sau',
      supportsNFC: 'Hỗ trợ NFC',
      supports5G: 'Hỗ trợ 5G',
      supportsTouch: 'Hỗ trợ cảm ứng',
      refreshRate: 'Tần số quét',
      connectionType: 'Loại kết nối',
      port: 'Cổng kết nối',
      headphoneType: 'Loại tai nghe',
      type: 'Loại'
    };
    return nameMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };
  // Check if products have specifications
  const hasSpecifications = products.some(p => p.specifications);

  if (!hasSpecifications) {
    return (
      <div className="mt-8 p-6 bg-gray-50 rounded-xl text-center">
        <div className="text-gray-400 mb-2">
          <Monitor className="w-8 h-8 mx-auto" />
        </div>
        <p className="text-gray-600">Không có thông số kỹ thuật để so sánh</p>
      </div>
    );
  }

  const specKeys = getAllSpecKeys();
  const filteredProducts = getFilteredProducts();

  return (
    <div className="mt-8">
      {/* Specification Filter */}
      <SpecificationFilter 
        products={products} 
        onFilterChange={setFilters}
      />
      
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-xl p-4 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
          So sánh thông số kỹ thuật
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Bảng so sánh chi tiết các thông số kỹ thuật
          {specKeys.length === 0 && ' (Không có thông số phù hợp với bộ lọc)'}
        </p>
      </div>
      
      {specKeys.length === 0 ? (
        <div className="bg-white border border-t-0 border-gray-200 rounded-b-xl p-8 text-center">
          <div className="text-gray-400 mb-2">
            <Monitor className="w-8 h-8 mx-auto" />
          </div>
          <p className="text-gray-600">Không có thông số nào phù hợp với bộ lọc hiện tại</p>
        </div>
      ) : (
        <div className="bg-white border border-t-0 border-gray-200 rounded-b-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left p-4 font-semibold text-gray-700 min-w-[200px] sticky left-0 bg-gray-50">
                    Thông số
                  </th>
                  {filteredProducts.map((product, index) => (
                    <th key={product.id} className="text-center p-4 font-semibold text-gray-700 min-w-[200px]">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full mb-2 ${
                          index === 0 ? 'bg-blue-500' : 
                          index === 1 ? 'bg-green-500' : 
                          index === 2 ? 'bg-orange-500' : 'bg-purple-500'
                        }`}></div>
                        <span className="text-sm truncate max-w-[150px]" title={product.name}>
                          {product.name}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {specKeys.map((key, rowIndex) => {
                  const Icon = getSpecIcon(key);
                  return (
                    <tr 
                      key={key} 
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="p-4 font-medium text-gray-700 sticky left-0 bg-inherit">
                        <div className="flex items-center">
                          <Icon className="w-4 h-4 text-indigo-500 mr-3 flex-shrink-0" />
                          <span>{getSpecDisplayName(key)}</span>
                        </div>
                      </td>
                      {filteredProducts.map((product) => {
                        const value = product.specifications?.[key];
                        const formattedValue = formatSpecValue(key, value);
                        
                        return (
                          <td key={`${product.id}-${key}`} className="p-4 text-center">
                            <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm ${
                              formattedValue === 'N/A' 
                                ? 'bg-gray-100 text-gray-500' 
                                : 'bg-indigo-50 text-indigo-700 font-medium'
                            }`}>
                              {formattedValue}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Legend */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
              {filteredProducts.map((product, index) => (
                <div key={product.id} className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-1 ${
                    index === 0 ? 'bg-blue-500' : 
                    index === 1 ? 'bg-green-500' : 
                    index === 2 ? 'bg-orange-500' : 'bg-purple-500'
                  }`}></div>
                  <span>Sản phẩm {index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecificationComparison;
