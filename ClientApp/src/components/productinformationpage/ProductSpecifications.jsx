import React, { useState, useEffect } from 'react';
import {
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

const SpecificationDisplay = ({ productId }) => {
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
        
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://localhost:7107';
        const response = await fetch(
          `${apiBaseUrl}/api/ProductSpecifications/product/${productId}`
        );
        
        if (!response.ok) {
          throw new Error('Không tìm thấy thông số kỹ thuật');
        }
        
        const data = await response.json();
        setSpecs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };    if (productId) {
      fetchSpecifications();
    }
  }, [productId]);
  const SpecItem = ({ icon: Icon, label, value, unit, isHighlight = false }) => (
    <div className={`flex items-center py-3 px-4 ${isHighlight ? 'bg-blue-50 rounded-lg' : ''}`}>
      <div className={`p-2 mr-3 rounded-full ${isHighlight ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <span className={`text-sm ${isHighlight ? 'font-semibold text-blue-700' : 'text-gray-600'}`}>{label}</span>
          <span className={`text-right ${isHighlight ? 'font-bold text-blue-900' : 'font-medium text-gray-900'}`}>
            {value || '--'} {unit && unit.trim() && `${unit}`}
            {isHighlight && <Star className="w-3 h-3 text-yellow-500 ml-1 inline" fill="currentColor" />}
          </span>
        </div>
      </div>
    </div>
  );
  const getSpecIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('cpu') || lowerName.includes('bộ xử lý') || lowerName.includes('chip')) return Cpu;
    if (lowerName.includes('ram') || lowerName.includes('bộ nhớ ram')) return MemoryStick;
    if (lowerName.includes('pin') || lowerName.includes('battery') || lowerName.includes('dung lượng pin')) return Battery;
    if (lowerName.includes('màn hình') || lowerName.includes('screen') || lowerName.includes('kích thước màn hình') || lowerName.includes('độ phân giải')) return Monitor;
    if (lowerName.includes('camera')) return Camera;
    if (lowerName.includes('trọng lượng') || lowerName.includes('weight')) return Weight;
    if (lowerName.includes('storage') || lowerName.includes('bộ nhớ') || lowerName.includes('ssd') || lowerName.includes('ổ cứng')) return HardDrive;
    if (lowerName.includes('nfc') || lowerName.includes('bluetooth') || lowerName.includes('wifi') || lowerName.includes('5g')) return Wifi;
    if (lowerName.includes('sạc') || lowerName.includes('charge')) return Plug;
    return Nfc; // Default icon
  };

  const isHighlightSpec = (name) => {
    const lowerName = name.toLowerCase();
    return lowerName.includes('cpu') || 
           lowerName.includes('ram') || 
           lowerName.includes('pin') || 
           lowerName.includes('màn hình') ||
           lowerName.includes('kích thước màn hình') ||
           lowerName.includes('bộ xử lý') ||
           lowerName.includes('camera sau');
  };

  const renderSpecs = () => {
    if (!specs || !Array.isArray(specs)) return null;

    // Sort specs by displayOrder
    const sortedSpecs = [...specs].sort((a, b) => a.displayOrder - b.displayOrder);
    
    // Separate basic specs (first 6) and additional specs
    const basicSpecs = sortedSpecs.slice(0, 6);
    const additionalSpecs = sortedSpecs.slice(6);

    return (
      <>
        {basicSpecs.map((spec) => (
          <SpecItem 
            key={spec.id}
            icon={getSpecIcon(spec.name)}
            label={spec.name}
            value={spec.value}
            unit={spec.unit}
            isHighlight={isHighlightSpec(spec.name)}
          />
        ))}
        
        {showAllSpecs && additionalSpecs.map((spec) => (
          <SpecItem 
            key={spec.id}
            icon={getSpecIcon(spec.name)}
            label={spec.name}
            value={spec.value}
            unit={spec.unit}
            isHighlight={false}
          />
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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-8">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
      >        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Thông số kỹ thuật</h3>
        </div>
        {expanded ? 
          <ChevronUp className="w-5 h-5 text-gray-500" /> : 
          <ChevronDown className="w-5 h-5 text-gray-500" />
        }
      </button>
        {expanded && (
        <div className="divide-y divide-gray-100">
          {renderSpecs()}
          
          {specs && specs.length > 6 && (
            <div className="p-4 text-center">
              <button 
                onClick={() => setShowAllSpecs(!showAllSpecs)}
                className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-800 font-medium text-sm mx-auto"
              >
                {showAllSpecs ? (
                  <>
                    <Minus className="w-4 h-4" />
                    <span>Thu gọn thông số</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Xem thêm thông số chi tiết</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpecificationDisplay;