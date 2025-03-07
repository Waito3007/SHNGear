// AddSpecificationDrawer.jsx
import React from "react";
import { Drawer, TextField, Button } from "@mui/material";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";

const AddSpecificationDrawer = ({ isOpen, onClose, product }) => {
    const { register, handleSubmit, reset } = useForm();

    const onSubmit = async (data) => {
        try {
            const specData = { productId: product.id, ...data };
            let endpoint;
            switch (product.categoryId) {
                case 1:
                    endpoint = "PhoneSpecifications";
                    break;
                case 2:
                    endpoint = "LaptopSpecifications";
                    break;
                case 3:
                    endpoint = "HeadphoneSpecifications";
                    break;
                default:
                    throw new Error("Danh mục không được hỗ trợ");
            }

            const response = await fetch(`https://localhost:7107/api/Specifications/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(specData),
            });

            if (response.ok) {
                console.log("Thêm thông số kỹ thuật thành công:", await response.json());
                reset();
                onClose();
            } else {
                const errorText = await response.text();
                console.error("Lỗi:", errorText);
            }
        } catch (error) {
            console.error("Lỗi khi thêm thông số:", error);
        }
    };

    return (
        <Drawer anchor="right" open={isOpen} onClose={onClose}>
            <div className="w-96 p-6 bg-gray-900 h-full text-white">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Thêm thông số kỹ thuật</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    {product?.categoryId === 1 && (
                        <>
                            <TextField
                                label="Kích thước màn hình"
                                {...register("screenSize")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="Độ phân giải"
                                {...register("resolution")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="Loại màn hình"
                                {...register("screenType")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="Trọng lượng"
                                {...register("weight")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="Chất liệu"
                                {...register("material")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="Model CPU"
                                {...register("cpuModel")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="Số nhân CPU"
                                type="number"
                                {...register("cpuCores")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="RAM"
                                {...register("ram")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="Dung lượng lưu trữ"
                                {...register("internalStorage")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="Camera trước"
                                {...register("frontCamera")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="Camera sau"
                                {...register("rearCamera")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="Dung lượng pin"
                                {...register("batteryCapacity")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="Hỗ trợ NFC"
                                type="checkbox"
                                {...register("supportsNFC")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                        </>
                    )}
                    {product?.categoryId === 2 && (
                        <>
                            <TextField
                                label="Trọng lượng"
                                {...register("weight")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="Chất liệu"
                                {...register("material")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="Loại CPU"
                                {...register("cpuType")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="Số nhân CPU"
                                type="number"
                                {...register("cpuNumberOfCores")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="RAM"
                                {...register("ram")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="Hỗ trợ RAM tối đa"
                                {...register("maxRAMSupport")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="Dung lượng SSD"
                                {...register("ssdStorage")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="Kích thước màn hình"
                                {...register("screenSize")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="Độ phân giải"
                                {...register("resolution")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="Tần số quét"
                                {...register("refreshRate")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="Hỗ trợ cảm ứng"
                                type="checkbox"
                                {...register("supportsTouch")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                        </>
                    )}
                    {product?.categoryId === 3 && (
                        <>
                            <TextField
                                label="Trọng lượng"
                                {...register("weight")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="Loại tai nghe"
                                {...register("type")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="Loại kết nối"
                                {...register("connectionType")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="Cổng"
                                {...register("port")}
                                fullWidth
                                margin="normal"
                                className="bg-gray-800 text-white"
                                InputLabelProps={{ style: { color: "#fff" } }}
                            />
                        </>
                    )}
                    <Button type="submit" variant="contained" color="primary" fullWidth className="mt-4">
                        Thêm thông số
                    </Button>
                </form>
            </div>
        </Drawer>
    );
};

export default AddSpecificationDrawer;