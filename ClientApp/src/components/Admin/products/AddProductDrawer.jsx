import { useState, useEffect } from "react";
import { Drawer } from "@mui/material";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import { X } from "lucide-react";

const ProductDrawer = ({ isOpen, onClose, onAddProduct }) => {
    const { register, handleSubmit, reset, control } = useForm({
        defaultValues: {
            name: "",
            description: "",
            categoryId: "",
            brandId: "",
            images: [],
            variants: [],
        },
    });

    const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
        control,
        name: "images",
    });

    const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
        control,
        name: "variants",
    });

    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageError, setImageError] = useState("");

    // Lấy danh sách categories và brands
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("https://localhost:7107/api/categories");
                setCategories(response.data.$values || response.data || []);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        const fetchBrands = async () => {
            try {
                const response = await axios.get("https://localhost:7107/api/brands");
                setBrands(response.data.$values || response.data || []);
            } catch (error) {
                console.error("Error fetching brands:", error);
            }
        };

        fetchCategories();
        fetchBrands();
    }, []);

    // Xử lý upload ảnh
    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setUploadingImage(true);
        setImageError("");

        try {
            const uploadPromises = files.map(async (file) => {
                const formData = new FormData();
                formData.append("file", file);

                const response = await axios.post("https://localhost:7107/api/upload", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                return {
                    imageUrl: response.data, // Giả sử API trả về URL ảnh
                    isPrimary: imageFields.length === 0, // Ảnh đầu tiên là primary
                };
            });

            const uploadedImages = await Promise.all(uploadPromises);
            uploadedImages.forEach((img) => appendImage(img));
        } catch (error) {
            console.error("Image upload failed:", error);
            setImageError("Tải ảnh thất bại, vui lòng thử lại.");
        } finally {
            setUploadingImage(false);
        }
    };

    // Gửi dữ liệu lên API
    const onSubmit = async (data) => {
        console.log("Submitting data:", data); // Debug dữ liệu gửi lên
        try {
            // Đảm bảo dữ liệu khớp với ProductDto
            const productData = {
                name: data.name,
                description: data.description,
                categoryId: parseInt(data.categoryId), // Chuyển sang số
                brandId: parseInt(data.brandId), // Chuyển sang số
                images: data.images.map((img) => ({
                    imageUrl: img.imageUrl,
                    isPrimary: img.isPrimary,
                })),
                variants: data.variants.map((variant) => ({
                    color: variant.color,
                    storage: variant.storage,
                    price: parseFloat(variant.price), // Chuyển sang số
                    discountPrice: variant.discountPrice ? parseFloat(variant.discountPrice) : null,
                    stockQuantity: parseInt(variant.stockQuantity) || 0, // Chuyển sang số, mặc định 0 nếu không có
                    flashSaleStart: variant.flashSaleStart || null,
                    flashSaleEnd: variant.flashSaleEnd || null,
                })),
            };

            const response = await axios.post("https://localhost:7107/api/Products", productData);
            onAddProduct(response.data); // Trả về dữ liệu sản phẩm mới từ API
            reset(); // Reset form
            onClose(); // Đóng drawer
        } catch (error) {
            console.error("Error adding product:", error.response?.data || error.message);
        }
    };

    return (
        <Drawer anchor="right" open={isOpen} onClose={onClose}>
            <div className="w-96 p-6 bg-gray-900 h-full text-white">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Thêm sản phẩm</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <label className="block text-sm whitespace-nowrap">Tên sản phẩm</label>
                    <input
                        {...register("name", { required: true })}
                        className="w-full p-2 mb-3 bg-gray-800 border border-gray-700 rounded-md"
                        required
                    />

                    <label className="block text-sm whitespace-nowrap">Mô tả</label>
                    <textarea
                        {...register("description", { required: true })}
                        className="w-full p-2 mb-3 bg-gray-800 border border-gray-700 rounded-md"
                        required
                    />

                    <label className="block text-sm whitespace-nowrap">Danh mục</label>
                    <select
                        {...register("categoryId", { required: true })}
                        className="w-full p-2 mb-3 bg-gray-800 border border-gray-700 rounded-md"
                    >
                        <option value="">Chọn danh mục</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>

                    <label className="block text-sm whitespace-nowrap">Thương hiệu</label>
                    <select
                        {...register("brandId", { required: true })}
                        className="w-full p-2 mb-3 bg-gray-800 border border-gray-700 rounded-md"
                    >
                        <option value="">Chọn thương hiệu</option>
                        {brands.map((brand) => (
                            <option key={brand.id} value={brand.id}>
                                {brand.name}
                            </option>
                        ))}
                    </select>

                    <label className="block text-sm whitespace-nowrap">Hình ảnh</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="w-full p-2 mb-3 bg-gray-800 border border-gray-700 rounded-md"
                    />
                    {uploadingImage && <p className="text-gray-400">Đang tải ảnh...</p>}
                    {imageError && <p className="text-red-500">{imageError}</p>}
                    <div className="mt-2">
                        {imageFields.map((img, index) => (
                            <div key={img.id} className="flex items-center space-x-2">
                                <img
                                    src={img.imageUrl}
                                    alt="Uploaded"
                                    className="w-20 h-20 object-cover rounded-md"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="text-red-500"
                                >
                                    Xóa
                                </button>
                            </div>
                        ))}
                    </div>

                    <label className="block text-sm mt-3 whitespace-nowrap">Biến thể sản phẩm</label>
                    {variantFields.map((variant, index) => (
                        <div
                            key={variant.id}
                            className="p-3 mb-3 border border-gray-700 rounded-md"
                        >
                            <label className="block text-xs whitespace-nowrap">Màu sắc</label>
                            <input
                                {...register(`variants.${index}.color`, { required: true })}
                                className="w-full p-1 mb-2 bg-gray-800 border border-gray-700 rounded-md"
                                required
                            />

                            <label className="block text-xs whitespace-nowrap">Dung lượng</label>
                            <input
                                {...register(`variants.${index}.storage`, { required: true })}
                                className="w-full p-1 mb-2 bg-gray-800 border border-gray-700 rounded-md"
                                required
                            />

                            <label className="block text-xs whitespace-nowrap">Giá</label>
                            <input
                                type="number"
                                {...register(`variants.${index}.price`, { required: true })}
                                className="w-full p-1 mb-2 bg-gray-800 border border-gray-700 rounded-md"
                                required
                            />

                            <label className="block text-xs whitespace-nowrap">Giá giảm</label>
                            <input
                                type="number"
                                {...register(`variants.${index}.discountPrice`)}
                                className="w-full p-1 mb-2 bg-gray-800 border border-gray-700 rounded-md"
                            />

                            <label className="block text-xs whitespace-nowrap">Số lượng</label>
                            <input
                                type="number"
                                {...register(`variants.${index}.stockQuantity`, { required: true })}
                                className="w-full p-1 mb-2 bg-gray-800 border border-gray-700 rounded-md"
                                required
                            />

                            <button
                                type="button"
                                onClick={() => removeVariant(index)}
                                className="text-red-500 mt-2 whitespace-nowrap"
                            >
                                Xóa biến thể
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() =>
                            appendVariant({
                                color: "",
                                storage: "",
                                price: 0,
                                discountPrice: null,
                                stockQuantity: 0,
                            })
                        }
                        className="text-blue-500 whitespace-nowrap"
                    >
                        Thêm biến thể
                    </button>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 p-2 rounded-md text-white mt-4 whitespace-nowrap"
                    >
                        Thêm sản phẩm
                    </button>
                </form>
            </div>
        </Drawer>
    );
};

export default ProductDrawer;