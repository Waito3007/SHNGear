import React from 'react';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';

const DefaultLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-primary-dark">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default DefaultLayout;
