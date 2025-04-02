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
        
        let endpoint;
        switch (productType) {
          case 'phone':
            endpoint = 'PhoneSpecifications';
            break;
          case 'laptop':
            endpoint = 'LaptopSpecifications';
            break;
          case 'headphone':
            endpoint = 'HeadphoneSpecifications';
            break;
          default:
            throw new Error('Loại sản phẩm không hợp lệ');
        }

        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/Specifications/${endpoint}/product/${productId}`
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
    };

    if (productId && productType) {
      fetchSpecifications();
    }
  }, [productId, productType]);

  const SpecItem = ({ icon: Icon, label, value, isHighlight = false }) => (
    <div className={`flex items-center py-3 px-4 ${isHighlight ? 'bg-blue-50 rounded-lg' : ''}`}>
      <div className={`p-2 mr-3 rounded-full ${isHighlight ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <span className={`text-sm ${isHighlight ? 'font-semibold text-blue-700' : 'text-gray-600'}`}>{label}</span>
          <span className={`text-right ${isHighlight ? 'font-bold text-blue-900' : 'font-medium text-gray-900'}`}>
            {value || '--'}
            {isHighlight && <Star className="w-3 h-3 text-yellow-500 ml-1 inline" fill="currentColor" />}
          </span>
        </div>
      </div>
    </div>
  );

  const renderPhoneSpecs = () => {
    const basicSpecs = [
      { icon: Cpu, label: "Bộ xử lý", value: `${specs.cpuModel} (${specs.cpuCores} nhân)`, highlight: true },
      { icon: MemoryStick, label: "RAM", value: `${specs.ram}GB`, highlight: true },
      { icon: Monitor, label: "Màn hình", value: `${specs.screenSize}" ${specs.screenType}`, highlight: true },
      { icon: HardDrive, label: "Bộ nhớ trong", value: `${specs.internalStorage}` }
    ];

    const additionalSpecs = [
      { icon: Battery, label: "Pin", value: `${specs.batteryCapacity}mAh`, highlight: true },
      { icon: Camera, label: "Camera trước", value: specs.frontCamera },
      { icon: Camera, label: "Camera sau", value: specs.rearCamera },
      { icon: Nfc, label: "NFC", value: specs.supportsNFC ? 'Có' : 'Không' },
      { icon: Weight, label: "Trọng lượng", value: `${specs.weight}g` },
      { icon: Monitor, label: "Độ phân giải", value: specs.resolution },
      { icon: Nfc, label: "Hỗ trợ 5G", value: specs.supports5G ? 'Có' : 'Không' },
      { icon: HardDrive, label: "Khe cắm thẻ nhớ", value: specs.hasSDCardSlot ? 'Có' : 'Không' }
    ];

    return (
      <>
        {basicSpecs.map((spec, index) => (
          <SpecItem key={`basic-${index}`} {...spec} />
        ))}
        
        {showAllSpecs && additionalSpecs.map((spec, index) => (
          <SpecItem key={`additional-${index}`} {...spec} />
        ))}
      </>
    );
  };

  const renderLaptopSpecs = () => {
    const basicSpecs = [
      { icon: Cpu, label: "CPU", value: `${specs.cpuType} (${specs.cpuNumberOfCores} nhân)`, highlight: true },
      { icon: MemoryStick, label: "RAM", value: `${specs.ram}GB (Tối đa ${specs.maxRAMSupport}GB)`, highlight: true },
      { icon: HardDrive, label: "Ổ cứng SSD", value: `${specs.ssdStorage}`, highlight: true },
      { icon: Monitor, label: "Màn hình", value: `${specs.screenSize}"` }
    ];

    const additionalSpecs = [
      { icon: Monitor, label: "Độ phân giải", value: specs.resolution },
      { icon: Monitor, label: "Tần số quét", value: `${specs.refreshRate}Hz` },
      { icon: Weight, label: "Trọng lượng", value: `${specs.weight}g` },
      { icon: Nfc, label: "Card đồ họa", value: specs.graphicsCard },
      { icon: HardDrive, label: "Ổ cứng SSD", value: specs.ssdStorage ? `${specs.ssdStorage}` : 'Không có' },
      { icon: Battery, label: "Thời lượng pin", value: specs.batteryLife },
      { icon: Nfc, label: "Cổng kết nối", value: specs.ports },
      { icon: Wifi, label: "Chuẩn WiFi", value: specs.wifiStandard }
    ];

    return (
      <>
        {basicSpecs.map((spec, index) => (
          <SpecItem key={`basic-${index}`} {...spec} />
        ))}
        
        {showAllSpecs && additionalSpecs.map((spec, index) => (
          <SpecItem key={`additional-${index}`} {...spec} />
        ))}
      </>
    );
  };

  const renderHeadphoneSpecs = () => {
    const basicSpecs = [
      { icon: Headphones, label: "Loại tai nghe", value: specs.type, highlight: true },
      { icon: Wifi, label: "Kết nối", value: specs.connectionType, highlight: true },
      { icon: Weight, label: "Trọng lượng", value: `${specs.weight}g` }
    ];

    const additionalSpecs = [
      { icon: Plug, label: "Cổng kết nối", value: specs.port },
      { icon: Battery, label: "Thời lượng pin", value: specs.batteryLife || 'Không có' },
      { icon: Nfc, label: "Kháng nước", value: specs.waterResistant ? 'Có' : 'Không' },
      { icon: Nfc, label: "Microphone", value: specs.hasMicrophone ? 'Có' : 'Không' },
      { icon: Nfc, label: "Điều khiển cảm ứng", value: specs.hasTouchControl ? 'Có' : 'Không' },
      { icon: Nfc, label: "Chống ồn", value: specs.noiseCancelling ? 'Có' : 'Không' }
    ];

    return (
      <>
        {basicSpecs.map((spec, index) => (
          <SpecItem key={`basic-${index}`} {...spec} />
        ))}
        
        {showAllSpecs && additionalSpecs.map((spec, index) => (
          <SpecItem key={`additional-${index}`} {...spec} />
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
      >
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            {productType === 'phone' && <Smartphone className="w-5 h-5" />}
            {productType === 'laptop' && <Laptop className="w-5 h-5" />}
            {productType === 'headphone' && <Headphones className="w-5 h-5" />}
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
          {productType === 'phone' && renderPhoneSpecs()}
          {productType === 'laptop' && renderLaptopSpecs()}
          {productType === 'headphone' && renderHeadphoneSpecs()}
          
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
        </div>
      )}
    </div>
  );
};

export default SpecificationDisplay;