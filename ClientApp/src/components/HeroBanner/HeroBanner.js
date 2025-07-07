import React from 'react';

const HeroBanner = ({ data }) => {
  return (
    <section className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden">
      {data.background_type === 'video' ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          src={data.background_url}
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        <div
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${data.background_url})` }}
        ></div>
      )}

      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-10"></div>

      <div className="relative z-20 flex flex-col items-center px-4">
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl uppercase font-bold tracking-wider mb-4">
          {data.headline}
        </h1>
        <p className="font-sans text-lg md:text-xl text-light-gray mb-8 max-w-2xl">
          {data.slogan}
        </p>
        <a
          href={data.cta_link}
          className="font-sans uppercase font-semibold tracking-widest px-8 py-3 border-2 border-electric-blue text-white transition-all duration-300 hover:bg-electric-blue hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-electric-blue focus:ring-opacity-50"
        >
          {data.cta_text}
        </a>
      </div>
    </section>
  );
};

export default HeroBanner;
