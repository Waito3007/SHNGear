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

  const renderPhoneSpecs = () => {
    const basicSpecs = [
      { icon: Cpu, label: "Bộ xử lý", value: `${specs.cpuModel} (${specs.cpuCores} nhân)`, highlight: true },
      { icon: MemoryStick, label: "RAM", value: `${specs.ram}GB`, highlight: true },
      { icon: Monitor, label: "Màn hình", value: `${specs.screenSize}" ${specs.screenType}`, highlight: true },
      { icon: HardDrive, label: "Bộ nhớ trong", value: `${specs.internalStorage}` }
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
          </div>
        )}
      </div>
    </>
  );
};

export default SpecificationDisplay;