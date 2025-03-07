import React, { useState, useEffect } from "react";
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  CircularProgress,
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";

const priceRanges = [
  { label: "Tất cả", value: "all" },
  { label: "Dưới 2 triệu", value: "0-2000000" },
  { label: "Từ 2 - 4 triệu", value: "2000000-4000000" },
  { label: "Từ 4 - 7 triệu", value: "4000000-7000000" },
  { label: "Từ 7 - 13 triệu", value: "7000000-13000000" },
  { label: "Từ 13 - 20 triệu", value: "13000000-20000000" },
  { label: "Trên 20 triệu", value: "20000000-99999999" },
];

const FilterSection = ({ onPriceChange, onBrandChange }) => {
  const [expandedPrice, setExpandedPrice] = useState(true);
  const [expandedBrand, setExpandedBrand] = useState(true);
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch("https://localhost:7107/api/brands");
        if (!response.ok)
          throw new Error("Không thể tải danh sách thương hiệu");
        const data = await response.json();
        setBrands(Array.isArray(data.$values) ? data.$values : data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách thương hiệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const handlePriceChange = (event) => {
    const value = event.target.value;
    setSelectedPrice(value);
    onPriceChange(value);
  };

  const handleBrandChange = (event) => {
    const value = parseInt(event.target.value);
    let updatedBrands = selectedBrands.includes(value)
      ? selectedBrands.filter((id) => id !== value)
      : [...selectedBrands, value];

    setSelectedBrands(updatedBrands);
    onBrandChange(updatedBrands.length > 0 ? updatedBrands : null);
  };

  return (
    <aside className="max-w-[320px] w-full bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Bộ lọc</h2>

      {/* Lọc theo giá */}
      <div
        className="flex justify-between items-center cursor-pointer py-2 border-b border-gray-300 hover:bg-gray-100 px-2 rounded"
        onClick={() => setExpandedPrice(!expandedPrice)}
      >
        <h3 className="text-lg font-medium text-gray-700">Mức giá</h3>
        {expandedPrice ? (
          <ExpandLess fontSize="large" />
        ) : (
          <ExpandMore fontSize="large" />
        )}
      </div>
      {expandedPrice && (
        <FormGroup className="mt-2 space-y-1 px-2">
          {priceRanges.map((range) => (
            <FormControlLabel
              key={range.value}
              label={
                <span className="text-sm font-medium text-gray-700">
                  {range.label}
                </span>
              }
              control={
                <Checkbox
                  checked={selectedPrice === range.value}
                  onChange={handlePriceChange}
                  value={range.value}
                  sx={{
                    "& .MuiSvgIcon-root": { fontSize: 20 },
                    "&.Mui-checked": { color: "#d32f2f" },
                  }}
                />
              }
              className="flex items-center w-full px-2 py-1 bg-gray-50 hover:bg-gray-200 rounded-md"
            />
          ))}
        </FormGroup>
      )}

      {/* Lọc theo thương hiệu */}
      <div
        className="flex justify-between items-center cursor-pointer py-2 border-b border-gray-300 hover:bg-gray-100 px-2 rounded mt-3"
        onClick={() => setExpandedBrand(!expandedBrand)}
      >
        <h3 className="text-lg font-medium text-gray-700">Thương hiệu</h3>
        {expandedBrand ? (
          <ExpandLess fontSize="large" />
        ) : (
          <ExpandMore fontSize="large" />
        )}
      </div>
      {expandedBrand && (
        <FormGroup className="mt-2 space-y-1 px-2">
          {loading ? (
            <div className="flex justify-center py-4">
              <CircularProgress size={24} />
            </div>
          ) : brands.length > 0 ? (
            brands.map((brand) => (
              <FormControlLabel
                key={brand.id}
                label={
                  <span className="text-sm font-medium text-gray-700">
                    {brand.name}
                  </span>
                }
                control={
                  <Checkbox
                    checked={selectedBrands.includes(brand.id)}
                    onChange={handleBrandChange}
                    value={brand.id}
                    sx={{
                      "& .MuiSvgIcon-root": { fontSize: 20 },
                      "&.Mui-checked": { color: "#d32f2f" },
                    }}
                  />
                }
                className="flex items-center w-full px-2 py-1 bg-gray-50 hover:bg-gray-200 rounded-md"
              />
            ))
          ) : (
            <p className="text-sm text-gray-500 px-2 py-2">
              Không có thương hiệu nào.
            </p>
          )}
        </FormGroup>
      )}
    </aside>
  );
};

export default FilterSection;
