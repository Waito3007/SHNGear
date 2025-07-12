import React, { useState, useEffect } from "react";
import axios from "axios";
import CategoryImage from "../shared/CategoryImage";

const FeaturedCategories = ({ data }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Fetch categories from the new API endpoint
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/categories`
        );
        // Filter for active categories if the API doesn't do it by default
        // (Our new API does, but keeping this for robustness)
        setCategories(response.data);
      } catch (err) {
        setError("Failed to load categories.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-primary-dark">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="block bg-white/5 p-6 rounded-lg border border-white-20 backdrop-blur-sm animate-pulse"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="h-24 w-24 mb-4 bg-white/10 rounded"></div>
                  <div className="h-6 w-24 bg-white/10 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <section className="py-16 md:py-24 bg-primary-dark">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <a
              key={category.id}
              href={`/ProductList?categoryId=${category.id}`}
              className="group block bg-white/5 p-6 rounded-lg border border-white-20 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-electric-blue"
            >
              <div className="flex flex-col items-center text-center">
                <CategoryImage
                  category={category}
                  className="h-24 w-24 mb-4 filter grayscale group-hover:filter-none transition-all duration-300"
                />
                <h3 className="font-display text-xl font-bold text-white transition-colors duration-300 group-hover:text-electric-blue">
                  {category.name}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
