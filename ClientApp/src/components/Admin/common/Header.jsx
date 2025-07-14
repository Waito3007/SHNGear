const Header = ({ title }) => {
  return (
    <header className="admin-header bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg border-b border-gray-700 relative z-10">
      <div className="max-w-7xl mx-auto py-3 md:py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-100 truncate pr-4">
            {title}
          </h1>
          <div className="admin-hide-mobile flex items-center space-x-4">
            {/* Admin status indicator */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">Admin Active</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
