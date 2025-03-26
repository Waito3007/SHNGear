import { useState } from "react";
import { Select, MenuItem } from "@mui/material";
import { motion } from "framer-motion";

const CardProduct = ({ name, icon: Icon, value, color, options, onOptionChange }) => {
	const [selectedOption, setSelectedOption] = useState(options?.[0] || "");

	const handleOptionChange = (event) => {
		const newValue = event.target.value;
		setSelectedOption(newValue);
		onOptionChange(newValue);
	};

	return (
		<motion.div
			className="bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700"
			whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
		>
			<div className="px-4 py-5 sm:p-6">
				<div className="flex items-center justify-between">
					<span className="flex items-center text-sm font-medium text-gray-400">
						<Icon size={20} className="mr-2" style={{ color }} />
						{name}
					</span>
					{options && (
						<Select
							value={selectedOption}
							onChange={handleOptionChange}
							size="small"
							variant="outlined"
							sx={{
								color: "white",
								backgroundColor: "rgba(255, 255, 255, 0.1)",
								borderRadius: 1,
								"& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.2)" },
								"&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
								"&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: color },
							}}
						>
							{options.map((option) => (
								<MenuItem key={option} value={option}>
									{option}
								</MenuItem>
							))}
						</Select>
					)}
				</div>
				<p className="mt-1 text-3xl font-semibold text-gray-100">{value}</p>
			</div>
		</motion.div>
	);
};

export default CardProduct;
