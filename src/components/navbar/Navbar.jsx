import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import arrowClose from "../../assets/arrowClose.png";
import arrowOpen from "../../assets/arrowOpen.png";
import { useSelector } from "react-redux";

export const Navbar = ({
  toggleSidebar,
  isSidebarOpen,
  isSidebarCollapsed,
  onToggleCollapse,
}) => {
  const { user } = useSelector((state) => state.auth);

  // Helper to get initials from name
  const getInitials = (name) => {
    if (!name) return "AD";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 h-16 flex items-center px-4 md:px-8 justify-between sticky top-0 z-40 transition-all duration-300">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 lg:hidden"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Desktop Collapse Toggle Button */}
        <button
          className="hover:bg-gray-100 rounded-lg transition-colors duration-200 hidden lg:flex items-center justify-center w-8 h-8 cursor-pointer z-50"
          onClick={onToggleCollapse}
          aria-label={
            isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
          }
        >
          {isSidebarCollapsed ? (
            <img src={arrowOpen} className="w-5 h-5 object-contain" alt="expand" />
          ) : (
            <img src={arrowClose} className="w-5 h-5 object-contain" alt="collapse" />
          )}
        </button>

        <h1 className="text-xl font-bold text-gray-800 capitalize tracking-tight">
          {window.location.pathname.split("/")[1]?.replace(/-/g, " ") || "Dashboard"}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <div className="font-semibold text-sm text-gray-900 leading-tight">
              {user?.name || "Admin"}
            </div>
            <div className="text-xs text-gray-500 font-medium">
              {user?.role_name || "System Admin"}
            </div>
          </div>
          <div className="w-10 h-10 bg-[#B02E0C] rounded-full flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white">
            {getInitials(user?.name || "Admin")}
          </div>
        </div>
      </div>
    </header>
  );
};
