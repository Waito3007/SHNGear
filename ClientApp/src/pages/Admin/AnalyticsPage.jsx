import Header from "../../components/Admin/common/Header";
import OverviewCards from "../../components/Admin/analytics/OverviewCards";
import RevenueChart from "../../components/Admin/analytics/RevenueChart";
import ChannelPerformance from "../../components/Admin/analytics/ChannelPerformance";
import ProductPerformance from "../../components/Admin/analytics/ProductPerformance";
import UserRetention from "../../components/Admin/analytics/UserRetention";
import CustomerSegmentation from "../../components/Admin/analytics/CustomerSegmentation";
import AIPoweredInsights from "../../components/Admin/analytics/AIPoweredInsights";

const AnalyticsPage = () => {
	return (
		<div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
			<Header title={"Phân tích dữ liệu"} />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				<OverviewCards />
				<RevenueChart />

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
					<ChannelPerformance />
					<ProductPerformance />
					<UserRetention />
					<CustomerSegmentation />
				</div>

				<AIPoweredInsights />
			</main>
		</div>
	);
};
export default AnalyticsPage;
