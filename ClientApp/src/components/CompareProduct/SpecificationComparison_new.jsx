import React from 'react';
import { Monitor, Smartphone, Headphones, Cpu, HardDrive, Camera, Battery, Wifi, Bluetooth } from 'lucide-react';

const SpecificationComparison = ({ products }) => {
  if (!products || products.length === 0) return null;

  // Get all unique specification keys from all products
  const getAllSpecKeys = () => {
    const allKeys = new Set();
    products.forEach(product => {
      if (product.Specifications) {
        Object.keys(product.Specifications).forEach(key => {
          if (key !== 'Type') allKeys.add(key);
        });
      }
    });
    return Array.from(allKeys);
  };

  // Get icon for specification type
  const getSpecIcon = (key) => {
    const iconMap = {
      ScreenSize: Monitor,
      Resolution: Monitor,
      ScreenType: Monitor,
      CPUModel: Cpu,
      CPUType: Cpu,
      CPUCores: Cpu,
      CPUNumberOfCores: Cpu,
      RAM: HardDrive,
      InternalStorage: HardDrive,
      SSDStorage: HardDrive,
      FrontCamera: Camera,
      RearCamera: Camera,
      BatteryCapacity: Battery,
      ConnectionType: Bluetooth,
      Port: Wifi,
      Weight: Monitor,
      Material: Monitor
    };
    return iconMap[key] || Monitor;
  };

  // Format specification key for display
  const formatSpecKey = (key) => {
    const keyMap = {
      ScreenSize: 'Kích thước màn hình',
      Resolution: 'Độ phân giải',
      ScreenType: 'Loại màn hình',
      Weight: 'Trọng lượng',
      Material: 'Chất liệu',
      CPUModel: 'CPU',
      CPUType: 'Loại CPU',
      CPUCores: 'Số lõi CPU',
      CPUNumberOfCores: 'Số lõi CPU',
      RAM: 'RAM',
      MaxRAMSupport: 'RAM tối đa',
      InternalStorage: 'Bộ nhớ trong',
      SSDStorage: 'Ổ cứng SSD',
      FrontCamera: 'Camera trước',
      RearCamera: 'Camera sau',
      BatteryCapacity: 'Dung lượng pin',
      SupportsNFC: 'Hỗ trợ NFC',
      SupportsTouch: 'Màn hình cảm ứng',
      RefreshRate: 'Tần số quét',
      HeadphoneType: 'Loại tai nghe',
      ConnectionType: 'Kết nối',
      Port: 'Cổng kết nối'
    };
    return keyMap[key] || key;
  };

  // Format specification value for display
  const formatSpecValue = (value, key) => {
    if (value === null || value === undefined || value === '') {
      return 'Không có thông tin';
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Có' : 'Không';
    }
    
    return value.toString();
  };

  // Group specifications by category
  const groupSpecifications = () => {
    const groups = {
      display: ['ScreenSize', 'Resolution', 'ScreenType', 'RefreshRate', 'SupportsTouch'],
      performance: ['CPUModel', 'CPUType', 'CPUCores', 'CPUNumberOfCores', 'RAM', 'MaxRAMSupport'],
      storage: ['InternalStorage', 'SSDStorage'],
      camera: ['FrontCamera', 'RearCamera'],
      connectivity: ['ConnectionType', 'Port', 'SupportsNFC'],
      physical: ['Weight', 'Material', 'BatteryCapacity', 'HeadphoneType']
    };

    const allKeys = getAllSpecKeys();
    const result = {};
    
    Object.entries(groups).forEach(([groupName, groupKeys]) => {
      const availableKeys = groupKeys.filter(key => allKeys.includes(key));
      if (availableKeys.length > 0) {
        result[groupName] = availableKeys;
      }
    });

    // Add remaining keys to "other" group
    const usedKeys = Object.values(result).flat();
    const remainingKeys = allKeys.filter(key => !usedKeys.includes(key));
    if (remainingKeys.length > 0) {
      result.other = remainingKeys;
    }

    return result;
  };

  const getGroupTitle = (groupKey) => {
    const titles = {
      display: 'Màn hình',
      performance: 'Hiệu năng',
      storage: 'Lưu trữ',
      camera: 'Camera',
      connectivity: 'Kết nối',
      physical: 'Thiết kế & Pin',
      other: 'Khác'
    };
    return titles[groupKey] || 'Khác';
  };

  const getGroupIcon = (groupKey) => {
    const icons = {
      display: Monitor,
      performance: Cpu,
      storage: HardDrive,
      camera: Camera,
      connectivity: Wifi,
      physical: Battery,
      other: Monitor
    };
    return icons[groupKey] || Monitor;
  };

  const groupedSpecs = groupSpecifications();

  if (Object.keys(groupedSpecs).length === 0) {
    return (
      <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <div className="text-center">
          <Monitor className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Chưa có thông số kỹ thuật
          </h3>
          <p className="text-gray-500">
            Thông số kỹ thuật chi tiết sẽ được cập nhật sớm
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-xl">
        <h3 className="text-xl font-bold flex items-center">
          <Smartphone className="w-6 h-6 mr-2" />
          So sánh thông số kỹ thuật
        </h3>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-b-xl overflow-hidden">
        {Object.entries(groupedSpecs).map(([groupKey, specKeys]) => {
          const GroupIcon = getGroupIcon(groupKey);
          
          return (
            <div key={groupKey} className="border-b border-gray-100 last:border-b-0">
              {/* Group Header */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h4 className="font-semibold text-gray-800 flex items-center">
                  <GroupIcon className="w-5 h-5 mr-2 text-indigo-600" />
                  {getGroupTitle(groupKey)}
                </h4>
              </div>

              {/* Specifications Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 border-r border-gray-200 min-w-[200px]">
                        Thông số
                      </th>
                      {products.map((product, index) => (
                        <th key={product.Id} className="text-center py-3 px-4 font-semibold text-gray-700 border-r border-gray-200 last:border-r-0 min-w-[200px]">
                          <div className="flex items-center justify-center">
                            <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
                            Sản phẩm {index + 1}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {specKeys.map((specKey) => {
                      const SpecIcon = getSpecIcon(specKey);
                      
                      return (
                        <tr key={specKey} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4 border-r border-gray-200 font-medium text-gray-700">
                            <div className="flex items-center">
                              <SpecIcon className="w-4 h-4 mr-2 text-gray-500" />
                              {formatSpecKey(specKey)}
                            </div>
                          </td>
                          {products.map((product) => {
                            const value = product.Specifications?.[specKey];
                            const formattedValue = formatSpecValue(value, specKey);
                            const isEmpty = !value || value === '' || formattedValue === 'Không có thông tin';
                            
                            return (
                              <td key={product.Id} className="py-4 px-4 border-r border-gray-200 last:border-r-0 text-center">
                                <span className={`${isEmpty ? 'text-gray-400 italic' : 'text-gray-700 font-medium'}`}>
                                  {formattedValue}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpecificationComparison;
