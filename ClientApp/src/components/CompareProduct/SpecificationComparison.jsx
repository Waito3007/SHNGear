import React, { useState } from 'react';
import { Monitor, Cpu, MemoryStick, HardDrive, Battery, Camera, Weight } from 'lucide-react';
import SpecificationFilter from './SpecificationFilter';

const SpecificationComparison = ({ products }) => {
  // Chuẩn hóa specifications thành mảng (hỗ trợ unified object từ API)
  const normalizedProducts = products.map(product => {
    let specs = [];
    if (product.specifications) {
      // Nếu là unified object (có type/specifications)
      if (
        typeof product.specifications === 'object' &&
        product.specifications.type === 'unified' &&
        typeof product.specifications.specifications === 'object'
      ) {
        specs = Object.entries(product.specifications.specifications).map(([name, detail]) => ({
          name,
          value: detail.value,
          unit: detail.unit
        }));
      } else if (Array.isArray(product.specifications)) {
        specs = product.specifications;
      } else if (product.specifications.name && product.specifications.value !== undefined) {
        specs = [product.specifications];
      }
    }
    return { ...product, specifications: specs };
  });

  const [filters, setFilters] = useState({
    showBasicOnly: false,
    showDifferencesOnly: false,
    categoryFilter: 'all'
  });

  // Lấy tất cả key thông số, hỗ trợ lọc chỉ số cơ bản và khác biệt
  const getAllSpecKeys = () => {
    let allKeys = new Set();
    // Nếu lọc chỉ số cơ bản: lấy 3 displayOrder đầu tiên của từng sản phẩm
    if (filters.showBasicOnly) {
      normalizedProducts.forEach(product => {
        if (Array.isArray(product.specifications)) {
          product.specifications
            .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
            .slice(0, 3)
            .forEach(spec => {
              if (spec.name) allKeys.add(spec.name.trim());
            });
        }
      });
    } else {
      normalizedProducts.forEach(product => {
        if (Array.isArray(product.specifications)) {
          product.specifications.forEach(spec => {
            if (spec.name) allKeys.add(spec.name.trim());
          });
        }
      });
    }
    // Nếu lọc chỉ số khác biệt: chỉ lấy các key có giá trị khác nhau giữa các sản phẩm
    if (filters.showDifferencesOnly) {
      allKeys = new Set(Array.from(allKeys).filter(key => hasSpecDifferences(key)));
    }
    return Array.from(allKeys);
  };

  // Kiểm tra thông số có khác biệt không
  const hasSpecDifferences = (key) => {
    const values = normalizedProducts.map(p => {
      if (Array.isArray(p.specifications)) {
        const spec = p.specifications.find(s => s.name.trim().toLowerCase() === key.trim().toLowerCase());
        return spec ? spec.value : undefined;
      }
      return undefined;
    });
    return new Set(values).size > 1;
  };

  // Định dạng giá trị thông số
  const formatSpecValue = (key, value, unit) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Có' : 'Không';
    if (unit) return `${value} ${unit}`;
    return value.toString();
  };

  // Lấy icon cho từng thông số
  const getSpecIcon = (key) => {
    const map = {
      ram: MemoryStick,
      cpu: Cpu,
      weight: Weight,
      battery: Battery,
      camera: Camera,
      storage: HardDrive,
      screen: Monitor,
    };
    // Tìm icon phù hợp
    for (const k in map) {
      if (key.toLowerCase().includes(k)) return map[k];
    }
    return Monitor;
  };

  // Lấy tên hiển thị
  const getSpecDisplayName = (key) => {
    const nameMap = {
      ram: 'RAM',
      cpu: 'CPU',
      weight: 'Trọng lượng',
      battery: 'Pin',
      camera: 'Camera',
      storage: 'Bộ nhớ',
      screen: 'Màn hình',
    };
    for (const k in nameMap) {
      if (key.toLowerCase().includes(k)) return nameMap[k];
    }
    return key;
  };

  const specKeys = getAllSpecKeys();

  return (
    <div className="mt-8">
      <SpecificationFilter products={products} onFilterChange={setFilters} />
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-xl p-4 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
          So sánh thông số kỹ thuật
        </h3>
      </div>
      <div className="bg-white border border-t-0 border-gray-200 rounded-b-xl overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left p-4 font-semibold text-gray-700 min-w-[180px] sticky left-0 bg-gray-50 z-10">Thông số</th>
              {normalizedProducts.map((product, idx) => (
                <th key={product.id} className="text-center p-4 font-semibold text-gray-700 min-w-[220px]">
                  <div className="flex flex-col items-center">
                    {product.image && <img src={product.image} alt={product.name} className="w-12 h-12 object-contain mb-2" />}
                    <span className="text-base font-medium">{product.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {specKeys.map((key, rowIdx) => {
              const Icon = getSpecIcon(key);
              const isDiff = hasSpecDifferences(key);
              return (
                <tr key={key} className={isDiff ? "bg-yellow-50" : rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-inherit z-10">
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 text-indigo-500 mr-2" />
                      <span>{getSpecDisplayName(key)}</span>
                      {isDiff && <span className="ml-2 px-2 py-0.5 rounded bg-yellow-200 text-yellow-800 text-xs">Khác biệt</span>}
                    </div>
                  </td>
                  {normalizedProducts.map(product => {
                    let value = 'N/A', unit = '';
                    if (Array.isArray(product.specifications)) {
                      const spec = product.specifications.find(s => s.name.trim().toLowerCase() === key.trim().toLowerCase());
                      if (spec) { value = spec.value; unit = spec.unit; }
                    }
                    return (
                      <td key={product.id + key} className="p-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm ${value === 'N/A' ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-indigo-700 font-semibold'}`}>
                          {formatSpecValue(key, value, unit)}
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
      <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-center gap-8 text-xs text-gray-500">
        {normalizedProducts.map((product, idx) => (
          <div key={product.id} className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-1 ${idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-green-500' : 'bg-orange-500'}`}></div>
            <span>{product.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecificationComparison;
