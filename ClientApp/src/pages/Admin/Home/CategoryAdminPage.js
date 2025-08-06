import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategoryAdminPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');
  const [newCategoryIsActive, setNewCategoryIsActive] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/categories`);
      setCategories(response.data);
    } catch (err) {
      setError('Failed to load categories.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      await axios.post('/api/categories', {
        name: newCategoryName,
        description: newCategoryDescription,
        image: newCategoryImage,
        isActive: newCategoryIsActive,
      });
      setNewCategoryName('');
      setNewCategoryDescription('');
      setNewCategoryImage('');
      setNewCategoryIsActive(true);
      fetchCategories();
      alert('Category added successfully!');
    } catch (err) {
      alert('Failed to add category.');
      console.error(err);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryDescription(category.description);
    setNewCategoryImage(category.image);
    setNewCategoryIsActive(category.isActive);
  };

  const handleUpdateCategory = async () => {
    try {
      await axios.put(`/api/categories/${editingCategory.id}`, {
        id: editingCategory.id,
        name: newCategoryName,
        description: newCategoryDescription,
        image: newCategoryImage,
        isActive: newCategoryIsActive,
      });
      setEditingCategory(null);
      setNewCategoryName('');
      setNewCategoryDescription('');
      setNewCategoryImage('');
      setNewCategoryIsActive(true);
      fetchCategories();
      alert('Category updated successfully!');
    } catch (err) {
      alert('Failed to update category.');
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`/api/categories/${id}`);
        fetchCategories();
        alert('Category deleted successfully!');
      } catch (err) {
        alert('Failed to delete category.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="p-4 text-white">Loading categories...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 bg-gray-800 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Manage Categories</h1>

      {/* Add/Edit Category Form */}
      <div className="bg-gray-700 p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Name</label>
            <input
              type="text"
              className="mt-1 block w-full p-2 rounded-md bg-gray-600 border border-gray-500 text-white"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Description</label>
            <textarea
              className="mt-1 block w-full p-2 rounded-md bg-gray-600 border border-gray-500 text-white"
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Image URL</label>
            <input
              type="text"
              className="mt-1 block w-full p-2 rounded-md bg-gray-600 border border-gray-500 text-white"
              value={newCategoryImage}
              onChange={(e) => setNewCategoryImage(e.target.value)}
            />
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={newCategoryIsActive}
              onChange={(e) => setNewCategoryIsActive(e.target.checked)}
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Is Active</span>
          </label>
          <button
            onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
            className="mt-4 px-6 py-3 bg-electric-blue text-primary-dark font-bold rounded-md hover:opacity-90 transition-opacity"
          >
            {editingCategory ? 'Update Category' : 'Add Category'}
          </button>
          {editingCategory && (
            <button
              onClick={() => {
                setEditingCategory(null);
                setNewCategoryName('');
                setNewCategoryDescription('');
                setNewCategoryImage('');
                setNewCategoryIsActive(true);
              }}
              className="ml-4 mt-4 px-6 py-3 bg-gray-500 text-white font-bold rounded-md hover:opacity-90 transition-opacity"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-gray-700 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Existing Categories</h2>
        <ul className="divide-y divide-gray-600">
          {categories.map((category) => (
            <li key={category.id} className="flex justify-between items-center py-3">
              <div>
                <p className="text-lg font-medium text-white">{category.name} {category.isActive ? '(Active)' : '(Inactive)'}</p>
                <p className="text-sm text-gray-400">{category.description}</p>
              </div>
              <div>
                <button
                  onClick={() => handleEditCategory(category)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="ml-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoryAdminPage;
