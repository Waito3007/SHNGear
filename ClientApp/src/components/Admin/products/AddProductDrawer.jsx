import { useState } from "react";
import axios from "axios";

const AddProductDrawer = ({ isOpen, onClose, onAddProduct }) => {
    const [product, setProduct] = useState({
        name: "",
        description: "",
        price: 0,
        category: "Electronics",
        stockQuantity: 0,
        images: []
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct({ ...product, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/products", {
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                stockQuantity: product.stockQuantity,
                imageUrls: product.images.map(file => URL.createObjectURL(file))
            });
            onAddProduct(response.data);
            onClose();
        } catch (error) {
            console.error("Failed to add product", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-end">
            <div className="bg-white w-1/3 p-6">
                <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={product.name}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Description</label>
                        <textarea
                            name="description"
                            value={product.description}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Price</label>
                        <input
                            type="number"
                            name="price"
                            value={product.price}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Category</label>
                        <select
                            name="category"
                            value={product.category}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded"
                            required
                        >
                            <option value="Electronics">Electronics</option>
                            <option value="Laptop">Laptop</option>
                            <option value="Headphone">Headphone</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Stock Quantity</label>
                        <input
                            type="number"
                            name="stockQuantity"
                            value={product.stockQuantity}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Images</label>
                        <input
                            type="file"
                            name="images"
                            multiple
                            onChange={(e) => setProduct({ ...product, images: [...e.target.files] })}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button type="button" onClick={onClose} className="mr-4 p-2 bg-gray-500 text-white rounded">
                            Cancel
                        </button>
                        <button type="submit" className="p-2 bg-blue-500 text-white rounded">
                            Add Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductDrawer;