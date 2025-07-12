import Header from "../../components/Admin/common/Header";
import LuckySpinManager from "../../components/Admin/luckyspin/LuckySpinManager";

const LuckySpinPage = () => {
  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Quản lý Vòng Quay May Mắn" />
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <LuckySpinManager />
      </main>
    </div>
  );
};

export default LuckySpinPage;
