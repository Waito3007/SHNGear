import React from 'react';
import SlidersTable from "../../components/Admin/home/SlidersTable";
import BannersTable from '@/components/Admin/home/BannersTable';
import Header from "../../components/Admin/common/Header";

const ManageHomePage = () => {
  return (
    <div className='flex-1 overflow-auto relative z-10'>
      <Header title='Quản lý trang chủ' />
      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        <SlidersTable />
      </main>
      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        <BannersTable />
      </main>
    </div>
  );
};

export default ManageHomePage;
