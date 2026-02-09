import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import arrowClose from "../../assets/arrowClose.png";
import arrowOpen from "../../assets/arrowOpen.png";
export const Navbar = ({
  toggleSidebar,
  isSidebarOpen,
  isSidebarCollapsed,
  onToggleCollapse,
}) => {
  return (
    <header className="w-full bg-white shadow-sm h-16 flex items-center px-6 justify-between sticky top-0">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 lg:hidden"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Desktop Collapse Toggle Button - Also in navbar for easy access */}
        <button
          className="hover:bg-gray-100 rounded-lg transition-colors duration-200 hidden lg:flex -ml-9 cursor-pointer"
          onClick={onToggleCollapse}
          aria-label={
            isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
          }
        >
          {isSidebarCollapsed ? (
            <img src={arrowOpen} size={20} />
          ) : (
            <img src={arrowClose} size={20} />
          )}
        </button>

        <h1 className="text-xl font-semibold text-gray-800 capitalize">
          {window.location.pathname.split("/")[1] || "Dashboard"}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Add user profile, notifications etc. here */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="font-medium text-gray-800">John Doe</div>
            <div className="text-sm text-gray-500">Admin</div>
          </div>
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
            JD
          </div>
        </div>
      </div>
    </header>
  );
};
