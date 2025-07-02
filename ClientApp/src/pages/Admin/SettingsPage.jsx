import Header from "@/components/Admin/common/Header";
import ConnectedAccounts from "@/components/Admin/settings/ConnectedAccounts";
import DangerZone from "@/components/Admin/settings/DangerZone";
import Notifications from "@/components/Admin/settings/Notifications";
import Profile from "@/components/Admin/settings/Profile";
import Security from "@/components/Admin/settings/Security";

const SettingsPage = () => {
  return (
    <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
      <Header title="Settings" />
      <main className="max-w-4xl mx-auto py-6 px-4 lg:px-8">
        <Profile />
        <Notifications />
        <Security />
        <ConnectedAccounts />
        <DangerZone />
      </main>
    </div>
  );
};
export default SettingsPage;
