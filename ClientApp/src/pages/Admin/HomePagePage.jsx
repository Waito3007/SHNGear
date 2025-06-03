import Header from "../../components/Admin/common/Header";
import HomePageManagement from "../../components/Admin/homepage/HomePageManagement";

const HomePagePage = () => {
	return (
		<div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
			<Header title='Quản lý Trang chủ' />
			<main className='max-w-6xl mx-auto py-6 px-4 lg:px-8'>
				<HomePageManagement />
			</main>
		</div>
	);
};

export default HomePagePage;
