import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EllipsisVertical, Eye, Ban, X, Loader2 } from "lucide-react";
import { fetchAllRoles } from "../../../redux/slice/RolesPermission/RolesSlice";
import {
  fetchAllUsers,
  suspendUser,
  fetchUserById,
  clearError,
  clearUserProfile,
} from "../../../redux/slice/UserSlice";
import DataTable from "../../common/DataTable";
import { toPascalCase } from "../../../utils/stringUtils";

const Users = () => {
  const dispatch = useDispatch();

  // Redux state
  const { Roles, loading: rolesLoading } = useSelector((state) => state.role);
  const {
    users,
    loading: usersLoading,
    error,
    pagination,
    userProfile,
    userProfileLoading,
  } = useSelector((state) => state.user);

  // Local state
  const [activeTab, setActiveTab] = useState("All");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewProfileModal, setShowViewProfileModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const menuRef = useRef(null);

  // Fetch roles on component mount
  useEffect(() => {
    dispatch(fetchAllRoles({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Fetch users when filters change
  useEffect(() => {
    const roleId = activeTab === "All" ? null : getRoleIdByName(activeTab);
    dispatch(
      fetchAllUsers({
        page: currentPage,
        limit: rowsPerPage,
        search: searchQuery,
        role_id: roleId,
      })
    );
  }, [dispatch, activeTab, searchQuery, currentPage, rowsPerPage]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (!event.target.closest('button[class*="rounded-xl"]')) {
          setOpenMenuId(null);
        }
      }
    };
    if (openMenuId) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  // Get role ID by name
  const getRoleIdByName = (roleName) => {
    const role = Roles.find(
      (r) => r.name.toLowerCase() === roleName.toLowerCase()
    );
    return role ? role.id : null;
  };

  // Get role name by ID
  const getRoleNameById = (roleId) => {
    const role = Roles.find((r) => r.id === String(roleId));
    return role ? role.name : "Unknown";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "--";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setOpenMenuId(null);
  };

  // Handle view profile
  const handleViewProfile = async (user) => {
    setSelectedUser(user);
    setShowViewProfileModal(true);
    try {
      await dispatch(fetchUserById(user.id || user.uid)).unwrap();
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  // Handle suspend/activate user
  const handleSuspendUser = async () => {
    if (!selectedUser) return;
    const action = isUserSuspended(selectedUser) ? "activate" : "suspend";
    try {
      await dispatch(
        suspendUser({
          userId: selectedUser.id || selectedUser.uid,
          action,
        })
      ).unwrap();
      setShowSuspendModal(false);
      setSelectedUser(null);
      const roleId = activeTab === "All" ? null : getRoleIdByName(activeTab);
      dispatch(
        fetchAllUsers({
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery,
          role_id: roleId,
        })
      );
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    }
  };

  const isUserSuspended = (user) => {
    if (userProfile && userProfile.id === (user?.id || user?.uid)) {
      return userProfile.is_active === false;
    }
    return user?.is_active === false;
  };

  const getUserStatus = (user) => {
    let isActive;
    if (userProfile && userProfile.id === (user?.id || user?.uid)) {
      isActive = userProfile.is_active;
    } else {
      isActive = user?.is_active;
    }
    return isActive === false ? "Suspended" : "Active";
  };

  const columns = [
    {
      header: "Professional Identity",
      accessor: "name",
      cell: (user) => (
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#EEF2FF] border-2 border-white shadow-sm flex items-center justify-center text-accent font-black text-lg select-none group-hover:scale-110 transition-transform">
            {(user.name || user.full_name || "?")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-[#0F172A] group-hover:text-accent transition-colors">
              {toPascalCase(user.name || user.full_name) || "--"}
            </p>
            <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider">
              {toPascalCase(user.role_id ? getRoleNameById(user.role_id) : user.role) || "--"}
            </p>
          </div>
        </div>
      )
    },
    {
      header: "Communication",
      accessor: "contact_number",
      cell: (user) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-[#64748B]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          </div>
          <span className="text-sm font-bold text-[#334155]">
            {user.country_code} {user.contact_number || "--"}
          </span>
        </div>
      )
    },
    {
      header: "Primary Address",
      accessor: "details.address",
      cell: (user) => (
        <p className="text-sm font-medium text-[#64748B] max-w-[180px] truncate group-hover:text-[#334155] transition-colors">
          {user.details?.address || "Location unavailable"}
        </p>
      )
    },
    {
      header: "Registration",
      accessor: "createdAt",
      cell: (user) => (
        <p className="text-sm font-bold text-[#475569]">
          {formatDate(user.createdAt || user.created_at || user.joined)}
        </p>
      )
    },
    {
      header: "Account State",
      accessor: "is_active",
      cell: (user) => (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getUserStatus(user) === "Suspended"
          ? "bg-accent/5 text-accent ring-1 ring-accent/10"
          : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
          }`}>
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${getUserStatus(user) === "Suspended" ? "bg-accent" : "bg-emerald-500"}`} />
          {getUserStatus(user)}
        </div>
      )
    }
  ];

  const renderActions = (user) => (
    <div className="relative" ref={openMenuId === (user.id || user.uid) ? menuRef : null}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenuId(openMenuId === (user.id || user.uid) ? null : (user.id || user.uid));
        }}
        className={`p-2.5 rounded-xl border border-transparent transition-all active:scale-95 ${openMenuId === (user.id || user.uid) ? 'bg-accent text-white shadow-lg' : 'hover:border-[#E2E8F0] hover:bg-white text-[#94A3B8]'}`}
      >
        <EllipsisVertical size={18} />
      </button>

      {openMenuId === (user.id || user.uid) && (
        <div className="absolute right-14 top-0 bg-white border border-[#E2E8F0] shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-2xl w-52 z-[100] p-2 animate-in fade-in zoom-in slide-in-from-right-2 duration-300">
          <div className="px-3 py-2 border-b border-[#F1F5F9] mb-1">
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Available Actions</span>
          </div>
          <ul className="text-[#475569] text-sm font-bold space-y-1">
            <li>
              <button
                onClick={() => {
                  handleViewProfile(user);
                  setOpenMenuId(null);
                }}
                className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-[#F1F5F9] rounded-xl transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 ring-1 ring-indigo-100">
                  <Eye size={16} />
                </div>
                View Profile
              </button>
            </li>
            <li>
              <button
                onClick={async () => {
                  setSelectedUser(user);
                  setShowSuspendModal(true);
                  setOpenMenuId(null);
                  try {
                    await dispatch(fetchUserById(user.id || user.uid)).unwrap();
                  } catch (error) {
                    console.error("Failed to fetch user profile:", error);
                  }
                }}
                className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-accent/5 rounded-xl transition-all"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ring-1 ${isUserSuspended(user) ? "bg-emerald-50 text-emerald-600 ring-emerald-100" : "bg-accent/5 text-accent ring-accent/10"
                  }`}>
                  <Ban size={16} />
                </div>
                <span className={isUserSuspended(user) ? "text-emerald-600" : "text-accent"}>
                  {isUserSuspended(user) ? "Activate User" : "Suspend User"}
                </span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );

  const tabs = ["All", ...Roles.map((role) => role.name)];

  return (
    <div className="space-y-4 sm:space-y-8 px-4 sm:px-8 py-4 sm:py-8 bg-[#F8FAFC] w-full min-h-screen" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Users Management</h1>
          <p className="text-[#64748B] mt-1 text-sm font-medium">Monitor and manage your platform's growing community of professionals</p>
        </div>
      </div>

      <div className="flex gap-2 items-center border-b border-[#E2E8F0] overflow-x-auto no-scrollbar">
        {rolesLoading ? (
          <div className="flex items-center gap-3 text-[#64748B] py-3 px-2 font-medium">
            <Loader2 className="animate-spin text-accent" size={18} />
            <span>Syncing roles...</span>
          </div>
        ) : (
          tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`relative px-6 py-4 text-[13px] font-bold transition-all duration-300 tracking-wide ${activeTab === tab ? "text-accent" : "text-[#64748B] hover:text-[#0F172A]"}`}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-accent rounded-t-full" />}
            </button>
          ))
        )}
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={usersLoading}
        renderActions={renderActions}
        rowKey={(r) => r.id || r.uid}
        showSearch
        onSearch={(q) => { setSearchQuery(q); setCurrentPage(1); }}
        pagination={pagination}
        onPageChange={setCurrentPage}
        onLimitChange={(l) => { setRowsPerPage(l); setCurrentPage(1); }}
        title={`${activeTab} Users`}
      />

      {error && (
        <div className="fixed bottom-10 right-10 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between text-rose-700 shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3">
            <X size={18} className="cursor-pointer" onClick={() => dispatch(clearError())} />
            <p className="font-bold text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* ----------------- View Profile Modal ----------------- */}
      {showViewProfileModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] p-4 backdrop-blur-md bg-white/30 animate-in fade-in duration-300">
          <div className="relative bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-[#E2E8F0] animate-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Eye size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#0F172A]">Detailed User Profile</h2>
                  <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Comprehensive identity verification</p>
                </div>
              </div>
              <button onClick={() => { setShowViewProfileModal(false); dispatch(clearUserProfile()); }} className="p-2 rounded-xl hover:bg-gray-100 transition-colors"><X className="text-gray-400 hover:text-gray-900" /></button>
            </div>

            <div className="overflow-y-auto p-8">
              {userProfileLoading ? (
                <div className="flex flex-col justify-center items-center py-16 gap-4">
                  <Loader2 className="animate-spin text-accent" size={40} />
                  <span className="text-[#64748B] font-bold">Retrieving profile metadata...</span>
                </div>
              ) : userProfile ? (
                <div className="space-y-10">
                  <div className="flex flex-col md:flex-row items-center gap-8 bg-[#F8FAFC] p-8 rounded-[24px] ring-1 ring-[#F1F5F9]">
                    <div className="relative">
                      {userProfile.details?.profile ? (
                        <img src={userProfile.details.profile} alt="User" className="w-32 h-32 rounded-[24px] object-cover ring-4 ring-white shadow-xl" />
                      ) : (
                        <div className="w-32 h-32 rounded-[24px] bg-white shadow-xl flex items-center justify-center text-accent text-5xl font-black italic">
                          {(userProfile.full_name || userProfile.name || "?")[0]}
                        </div>
                      )}
                      <div className={`absolute -bottom-2 -right-2 p-2 rounded-xl ring-4 ring-white shadow-lg ${userProfile.is_active === false ? "bg-accent" : "bg-emerald-500"}`}>
                        <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                      </div>
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-3xl font-black text-[#0F172A] mb-1">{toPascalCase(userProfile.full_name || userProfile.name)}</h3>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                        <span className="px-4 py-1.5 rounded-full bg-accent text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent/20">{toPascalCase(userProfile.role)}</span>
                        <span className="px-4 py-1.5 rounded-full bg-white text-[#64748B] text-[10px] font-black uppercase tracking-widest ring-1 ring-[#E2E8F0]">ID: {userProfile.id?.slice(-8).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                      <h4 className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-4">Core Contact</h4>
                      <p className="text-[10px] text-[#94A3B8] font-bold mb-0.5">Mobile Registry</p>
                      <p className="text-lg font-black text-[#334155]">{userProfile.country_code} {userProfile.phone_number}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-4">Activity Log</h4>
                      <p className="text-[10px] text-[#94A3B8] font-bold mb-0.5">Onboarding Date</p>
                      <p className="text-lg font-black text-[#334155]">{formatDate(userProfile.joined)}</p>
                    </div>
                  </div>

                  {userProfile.details && (
                    <div className="pt-10 border-t border-gray-100">
                      <h3 className="text-sm font-black text-[#1E293B] uppercase tracking-widest mb-8 border-l-4 border-accent pl-4">Business Credentials</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {userProfile.details.company_Name && (
                          <div>
                            <p className="text-[10px] text-[#94A3B8] font-black uppercase tracking-widest mb-1">Enterprise Brand</p>
                            <p className="text-xl font-black text-[#0F172A]">{toPascalCase(userProfile.details.company_Name)}</p>
                          </div>
                        )}
                        {userProfile.details.gstin && (
                          <div>
                            <p className="text-[10px] text-[#94A3B8] font-black uppercase tracking-widest mb-1">GSTIN Master</p>
                            <p className="text-xl font-black text-[#0F172A] tabular-nums font-mono">{userProfile.details.gstin}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 bg-[#F8FAFC] rounded-[32px] border-2 border-dashed border-[#E2E8F0]">
                  <p className="text-[#94A3B8] font-black uppercase tracking-widest">Metadata Empty</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-[#F8FAFC] border-t border-gray-100 flex justify-end">
              <button onClick={() => { setShowViewProfileModal(false); dispatch(clearUserProfile()); }} className="px-8 py-3 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl text-sm font-black text-[#475569] hover:bg-gray-50 transition-all">Close Profile</button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- Suspend/Activate Modal ----------------- */}
      {showSuspendModal && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] p-4 backdrop-blur-md bg-white/30 animate-in fade-in duration-300">
          <div className="bg-white rounded-[28px] w-full max-w-sm overflow-hidden relative shadow-2xl animate-in zoom-in duration-300 border border-[#E2E8F0]">
            <div className={`h-2 w-full ${isUserSuspended(selectedUser) ? "bg-emerald-500" : "bg-accent"}`} />
            <div className="p-8 text-center">
              <div className={`w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center ${isUserSuspended(selectedUser) ? "bg-emerald-50 text-emerald-600 shadow-xl shadow-emerald-100" : "bg-accent/5 text-accent shadow-xl shadow-accent/10"}`}>
                <Ban size={40} />
              </div>
              <h2 className="text-2xl font-black text-[#0F172A] mb-3">{isUserSuspended(selectedUser) ? "Restore Access?" : "Confirm Suspension?"}</h2>
              <p className="text-[#64748B] font-medium">Modify account status for <strong className="text-[#1E293B] font-black">{selectedUser.name || selectedUser.full_name}</strong>.</p>
            </div>
            <div className="p-6 pt-0 flex flex-col gap-3">
              <button onClick={handleSuspendUser} className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-white shadow-xl transition-all ${isUserSuspended(selectedUser) ? "bg-emerald-500 hover:bg-emerald-600" : "bg-accent hover:opacity-90"}`}>{isUserSuspended(selectedUser) ? "Activate Now" : "Confirm Suspension"}</button>
              <button onClick={() => setShowSuspendModal(false)} className="w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-[#64748B] hover:bg-[#F8FAFC]">Abort Action</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
