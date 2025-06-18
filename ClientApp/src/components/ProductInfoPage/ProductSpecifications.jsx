import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Laptop,
  Headphones,
  Monitor,
  Cpu,
  MemoryStick,
  Battery,
  Nfc,
  Weight,
  HardDrive,
  Camera,
  Wifi,
  Plug,
  ChevronDown,
  ChevronUp,
  Star,
  Plus,
  Minus
} from 'lucide-react';

const SpecificationDisplay = ({ productType, productId }) => {
  const [specs, setSpecs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(true);
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  useEffect(() => {
    const fetchSpecifications = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the unified ProductSpecifications API endpoint
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/ProductSpecifications/product/${productId}`
        );

        if (!response.ok) {
          throw new Error('Không tìm thấy thông số kỹ thuật');
        }

        const data = await response.json();
        
        // Convert array of specifications to object for easier access
        const specsObject = {};
        data.forEach(spec => {
          specsObject[spec.name] = spec.value;
        });
        
        setSpecs(specsObject);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchSpecifications();
    }
  }, [productId]);  const renderPhoneSpecs = () => {
    const basicSpecs = [
      { icon: Cpu, label: "Bộ xử lý", value: `${specs['CPU Model'] || specs['Bộ xử lý'] || '--'} ${specs['CPU Cores'] || specs['Số nhân CPU'] ? `(${specs['CPU Cores'] || specs['Số nhân CPU']} nhân)` : ''}`, highlight: true },
      { icon: MemoryStick, label: "RAM", value: specs['RAM'] ? `${specs['RAM']}` : '--', highlight: true },
      { icon: Monitor, label: "Màn hình", value: `${specs['Screen Size'] || specs['Kích thước màn hình'] || '--'} ${specs['Screen Type'] || specs['Loại màn hình'] || ''}`, highlight: true },
      { icon: HardDrive, label: "Bộ nhớ trong", value: specs['Internal Storage'] || specs['Bộ nhớ trong'] || '--' }
    ];

    return (
      <>
        {basicSpecs.map((spec, index) => (
          <div key={index} className="flex items-center py-3 px-4">
            <div className="p-2 mr-3 rounded-full bg-gray-100 text-gray-600">
              <spec.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{spec.label}</span>
                <span className="text-right font-medium text-gray-900">{spec.value || '--'}</span>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  };

  const renderLaptopSpecs = () => {
    const basicSpecs = [
      { icon: Cpu, label: "Bộ xử lý", value: `${specs['CPU Type'] || specs['Loại CPU'] || '--'} ${specs['CPU Number Of Cores'] || specs['Số nhân CPU'] ? `(${specs['CPU Number Of Cores'] || specs['Số nhân CPU']} nhân)` : ''}`, highlight: true },
      { icon: MemoryStick, label: "RAM", value: specs['RAM'] ? `${specs['RAM']}` : '--', highlight: true },
      { icon: Monitor, label: "Màn hình", value: `${specs['Screen Size'] || specs['Kích thước màn hình'] || '--'} ${specs['Resolution'] || specs['Độ phân giải'] || ''}`, highlight: true },
      { icon: HardDrive, label: "Ổ cứng", value: specs['SSD Storage'] || specs['Ổ SSD'] || '--' }
    ];

    return (
      <>
        {basicSpecs.map((spec, index) => (
          <div key={index} className="flex items-center py-3 px-4">
            <div className="p-2 mr-3 rounded-full bg-gray-100 text-gray-600">
              <spec.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{spec.label}</span>
                <span className="text-right font-medium text-gray-900">{spec.value || '--'}</span>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  };

  const renderHeadphoneSpecs = () => {
    const basicSpecs = [
      { icon: Headphones, label: "Loại tai nghe", value: specs['Type'] || specs['Loại'] || '--', highlight: true },
      { icon: Plug, label: "Kết nối", value: specs['Connection Type'] || specs['Kiểu kết nối'] || '--', highlight: true },
      { icon: Weight, label: "Trọng lượng", value: specs['Weight'] || specs['Trọng lượng'] || '--', highlight: true },
      { icon: Wifi, label: "Cổng", value: specs['Port'] || specs['Cổng'] || '--' }
    ];

    return (
      <>
        {basicSpecs.map((spec, index) => (
          <div key={index} className="flex items-center py-3 px-4">
            <div className="p-2 mr-3 rounded-full bg-gray-100 text-gray-600">
              <spec.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{spec.label}</span>
                <span className="text-right font-medium text-gray-900">{spec.value || '--'}</span>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  };

  const renderGeneralSpecs = () => {
    // For products that don't fit specific categories, show all available specs
    const specEntries = Object.entries(specs);
    
    return (
      <>
        {specEntries.map(([key, value], index) => (
          <div key={index} className="flex items-center py-3 px-4">
            <div className="p-2 mr-3 rounded-full bg-gray-100 text-gray-600">
              <Monitor className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{key}</span>
                <span className="text-right font-medium text-gray-900">{value || '--'}</span>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center my-8 py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-6">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (!specs) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-8">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              {productType === 'phone' && <Smartphone className="w-5 h-5" />}
              {productType === 'laptop' && <Laptop className="w-5 h-5" />}
              {productType === 'headphone' && <Headphones className="w-5 h-5" />}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Thông số kỹ thuật</h3>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>        {expanded && (
          <div className="divide-y divide-gray-100">
            {productType === 'phone' && renderPhoneSpecs()}
            {productType === 'laptop' && renderLaptopSpecs()}
            {productType === 'headphone' && renderHeadphoneSpecs()}
            {(!productType || (productType !== 'phone' && productType !== 'laptop' && productType !== 'headphone')) && renderGeneralSpecs()}
          </div>
        )}
      </div>
    </>
  );
};

export default SpecificationDisplay;