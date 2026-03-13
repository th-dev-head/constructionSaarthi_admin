import { Link, useLocation, useNavigate } from "react-router-dom";
import { MenuItems } from "./MenuItems";
import { X, ChevronDown, ChevronRight, LogOut } from "lucide-react";
import icon from "../../assets/icon.png";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slice/AuthSlice";

export const Sidebar = ({
  isOpen = false,
  onClose = () => { },
  isCollapsed = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const confirmLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    navigate("/");
    setShowLogoutModal(false);
  };

  const baseClasses =
    "bg-white text-black h-screen fixed top-0 left-0 flex flex-col transition-all duration-300 border-r border-gray-200 z-50 shadow-xl shadow-gray-200/50";
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
            ${isOpen ? "text-[#B02E0C]" : "text-gray-700"}`}
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
                  className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-all
                  ${location.pathname === sub.link || (sub.link !== '/' && location.pathname.startsWith(sub.link + '/'))
                      ? "bg-[#B02E0C] text-white hover:bg-[#8d270b]"
                      : "text-gray-700 hover:bg-gray-100"
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
          className={`flex items-center gap-3 py-2 rounded-lg transition-all
          ${isCollapsed ? "justify-center" : "px-3"}
          ${location.pathname === item.link || (item.link !== '/' && location.pathname.startsWith(item.link + '/'))
              ? "bg-[#B02E0C] text-white hover:bg-[#8d270b]"
              : "text-gray-700 hover:bg-gray-100"
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
          className={`flex items-center justify-between h-16 border-b border-gray-100 ${isCollapsed ? "flex-col" : "px-4"
            }`}
        >
          <div
            className={`flex items-center font-bold ${isCollapsed ? "justify-center w-full py-4" : ""}`}
          >
            <img
              src={icon}
              className={isCollapsed ? "w-6 h-6" : "w-8 h-8"}
              alt="Logo"
            />
            {!isCollapsed && <span className="ml-2 whitespace-nowrap">Construction Sarthi</span>}
          </div>

          <button className="p-2 lg:hidden" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto pb-4">
          {MenuItems.map(renderMenuItem)}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={() => setShowLogoutModal(true)}
            className={`w-full flex items-center gap-3 py-2 px-3 hover:bg-gray-100 rounded-lg text-red-600 transition-colors cursor-pointer ${isCollapsed ? "justify-center" : ""
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
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] backdrop-blur-md bg-black/40 animate-in fade-in duration-300 px-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-accent/5 rounded-[2.5rem] flex items-center justify-center text-accent mx-auto mb-6 ring-8 ring-accent/5">
                <LogOut size={36} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-[#0F172A] mb-3 tracking-tight">System Termination?</h3>
              <p className="text-[#64748B] text-sm font-medium leading-relaxed px-4 italic">
                You are about to disconnect from the administrative console. Are you sure?
              </p>
            </div>
            <div className="p-6 bg-gray-50/80 flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-widest text-[#64748B] hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-widest bg-accent text-white shadow-lg shadow-accent/20 hover:bg-[#8D270B] transition-all active:scale-95 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
