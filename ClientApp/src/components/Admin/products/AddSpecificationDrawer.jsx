import React from "react";
import { Drawer, TextField, Button, Grid, FormControlLabel, Checkbox } from "@mui/material";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";

const AddSpecificationDrawer = ({ isOpen, onClose, product }) => {
    const { register, handleSubmit, reset } = useForm();

    const onSubmit = async (data) => {
        try {
            const specData = { productId: product.id, ...data };
            const endpoints = {
                1: "PhoneSpecifications",
                2: "LaptopSpecifications",
                3: "HeadphoneSpecifications",
            };
            const endpoint = endpoints[product.categoryId];
            if (!endpoint) throw new Error("Danh mục không được hỗ trợ");

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
                console.error("Lỗi:", await response.text());
            }
        } catch (error) {
            console.error("Lỗi khi thêm thông số:", error);
        }
    };

    const renderFields = () => {
        const commonFields = [
            { name: "weight", label: "Trọng lượng" },
            { name: "material", label: "Chất liệu" },
        ];

        const fieldsByCategory = {
            1: [
                { name: "screenSize", label: "Kích thước màn hình" },
                { name: "resolution", label: "Độ phân giải" },
                { name: "screenType", label: "Loại màn hình" },
                { name: "cpuModel", label: "Model CPU" },
                { name: "cpuCores", label: "Số nhân CPU", type: "number" },
                { name: "ram", label: "RAM" },
                { name: "internalStorage", label: "Dung lượng lưu trữ" },
                { name: "frontCamera", label: "Camera trước" },
                { name: "rearCamera", label: "Camera sau" },
                { name: "batteryCapacity", label: "Dung lượng pin" },
                { name: "supportsNFC", label: "Hỗ trợ NFC", type: "checkbox" },
            ],
            2: [
                { name: "cpuType", label: "Loại CPU" },
                { name: "cpuNumberOfCores", label: "Số nhân CPU", type: "number" },
                { name: "ram", label: "RAM" },
                { name: "maxRAMSupport", label: "Hỗ trợ RAM tối đa" },
                { name: "ssdStorage", label: "Dung lượng SSD" },
                { name: "screenSize", label: "Kích thước màn hình" },
                { name: "resolution", label: "Độ phân giải" },
                { name: "refreshRate", label: "Tần số quét" },
                { name: "supportsTouch", label: "Hỗ trợ cảm ứng", type: "checkbox" },
            ],
            3: [
                { name: "type", label: "Loại tai nghe" },
                { name: "connectionType", label: "Loại kết nối" },
                { name: "port", label: "Cổng" },
            ],
        };

        const fields = [...commonFields, ...(fieldsByCategory[product?.categoryId] || [])];

        return (
            <Grid container spacing={2}>
                {fields.map(({ name, label, type }) => (
                    <Grid item xs={12} key={name}>
                        {type === "checkbox" ? (
                            <FormControlLabel
                                control={<Checkbox {...register(name)} />}
                                label={label}
                            />
                        ) : (
                            <TextField
                                label={label}
                                type={type || "text"}
                                {...register(name)}
                                fullWidth
                                variant="outlined"
                                sx={{ input: { color: "white" }, label: { color: "gray" } }}
                            />
                        )}
                    </Grid>
                ))}
            </Grid>
        );
    };

    return (
        <Drawer anchor="right" open={isOpen} onClose={onClose}>
            <div className="w-96 p-6 bg-gray-900 h-full text-white">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Thêm thông số kỹ thuật</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-transform hover:scale-110"
                    >
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>{renderFields()}</form>
                <Button type="submit" variant="contained" color="primary" fullWidth className="mt-4">
                    Thêm thông số
                </Button>
            </div>
        </Drawer>
    );
};

export default AddSpecificationDrawer;
