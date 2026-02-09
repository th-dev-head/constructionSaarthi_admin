import { Link, useLocation, useNavigate } from "react-router-dom";
import { MenuItems } from "./MenuItems";
import { X, ChevronDown, ChevronRight, LogOut } from "lucide-react";
import icon from "../../assets/icon.png";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slice/AuthSlice";

export const Sidebar = ({
  isOpen = false,
  onClose = () => {},
  isCollapsed = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    navigate("/");
  };

  const baseClasses =
    "bg-white text-black h-screen fixed top-0 left-0 flex flex-col transition-all duration-300 border-r border-gray-200";
  const mobileStateClass = isOpen ? "translate-x-0" : "-translate-x-full";
  const desktopClass = "lg:translate-x-0";
  const collapsedClass = isCollapsed ? "w-20" : "w-64";

  const renderMenuItem = (item) => {
    const isDropdown = item.submenu && item.submenu.length > 0;
    const isNormal = !item.submenu;

    if (isDropdown) {
      const isOpen = openDropdown === item.name;

      return (
        <div key={item.name} className="flex flex-col">
          <button
            onClick={() => toggleDropdown(item.name)}
            className={`flex items-center gap-3 py-2 hover:bg-gray-100 rounded-lg 
            ${isCollapsed ? "justify-center" : "px-3"}
            ${isOpen ? "text-[#FB4211]" : "text-gray-700"}`}
            title={isCollapsed ? item.name : ""}
          >
            {item.icon}

            {!isCollapsed && (
              <div className="flex justify-between items-center flex-1">
                <span className="font-medium">{item.name}</span>
                {isOpen ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </div>
            )}
          </button>

          {isOpen && !isCollapsed && (
            <div className="ml-8 mt-1 flex flex-col gap-1">
              {item.submenu.map((sub) => (
                <Link
                  key={sub.name}
                  to={sub.link}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className={`flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 transition-all
                  ${
                    location.pathname === sub.link
                      ? "bg-blue-50 text-[#FB4211] border-l-4 border-[#FB4211]"
                      : "text-gray-700"
                  }`}
                >
                  {sub.icon}
                  <span className="text-sm">{sub.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (isNormal) {
      return (
        <Link
          key={item.name}
          to={item.link}
          onClick={() => window.innerWidth < 1024 && onClose()}
          className={`flex items-center gap-3 py-2 hover:bg-gray-100 rounded-lg 
          ${isCollapsed ? "justify-center" : "px-3"}
          ${
            location.pathname === item.link
              ? "bg-blue-50 text-[#FB4211] border-l-4 border-[#FB4211]"
              : "text-gray-700"
          }`}
        >
          {item.icon}
          {!isCollapsed && <span className="font-medium">{item.name}</span>}
        </Link>
      );
    }

    return null;
  };

  return (
    <>
      <div
        className={`${baseClasses} ${mobileStateClass} ${desktopClass} ${collapsedClass}`}
      >
        <div
          className={`flex items-center justify-between ${
            isCollapsed ? "flex-col" : ""
          }`}
        >
          <div
            className={`w-full flex items-center justify-center font-bold 
            ${isCollapsed ? "py-4" : "py-5"}`}
          >
            <img
              src={icon}
              className={isCollapsed ? "w-6 h-6" : "w-8 h-8"}
              alt=""
            />
            {!isCollapsed && <span className="ml-2">Construction Sarthi</span>}
          </div>

          <button className="p-2 lg:hidden" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
          {MenuItems.map(renderMenuItem)}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 py-2 px-3 hover:bg-gray-100 rounded-lg text-red-600 transition-colors ${
              isCollapsed ? "justify-center" : ""
            }`}
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut size={22} />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-10 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
};
