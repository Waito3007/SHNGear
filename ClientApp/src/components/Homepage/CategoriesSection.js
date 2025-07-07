import React from 'react';

const CategoriesSection = ({ data }) => {
  return (
    <section className="py-16 md:py-24 bg-primary-dark">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.items.map((category) => (
            <a
              key={category.id}
              href={category.link}
              className="group block bg-white/5 p-6 rounded-lg border border-white-20 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-electric-blue"
            >
              <div className="flex flex-col items-center text-center">
                <img src={category.image_url} alt={category.name} className="h-24 w-24 object-contain mb-4 filter grayscale group-hover:filter-none transition-all duration-300" />
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

export default CategoriesSection;
