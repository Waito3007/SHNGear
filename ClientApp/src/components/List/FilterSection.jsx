import React, { useState } from "react";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
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

const FilterSection = () => {
  const [expanded, setExpanded] = useState(true);
  const [selectedPrice, setSelectedPrice] = useState("all");

  const handlePriceChange = (event) => {
    setSelectedPrice(event.target.value);
  };

  return (
    <aside className="max-w-[320px] w-full bg-white p-2 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold">Bộ lọc</h2>

      {/* Header đóng/mở */}
      <div
        className="flex justify-between items-center cursor-pointer mt-3 pb-2 border-b-2 border-gray-200"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-lg font-semibold">Mức giá</h3>
        {expanded ? (
          <ExpandLess fontSize="large" />
        ) : (
          <ExpandMore fontSize="large" />
        )}
      </div>

      {/* Hiển thị checkbox nếu expanded = true */}
      <div
        className={`transition-all duration-300 ${
          expanded ? "block" : "hidden"
        }`}
      >
        <FormGroup className="mt-1 gap-0.5">
          {priceRanges.map((range) => (
            <FormControlLabel
              key={range.value}
              label={<span className="text-sm font-medium">{range.label}</span>}
              control={
                <Checkbox
                  checked={selectedPrice === range.value}
                  onChange={handlePriceChange}
                  value={range.value}
                  sx={{
                    "& .MuiSvgIcon-root": { fontSize: 18 }, // Giảm kích thước icon checkbox
                    "&.Mui-checked": { color: "#d32f2f" },
                  }}
                />
              }
              className="flex items-center w-full px-1 py-0.5 bg-gray-100 hover:bg-gray-200 rounded-md"
            />
          ))}
        </FormGroup>
      </div>
    </aside>
  );
};

export default FilterSection;
