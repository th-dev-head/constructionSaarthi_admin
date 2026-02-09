import React, { useState, useEffect, useCallback } from "react";
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
  const [exportOpen, setExportOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewProfileModal, setShowViewProfileModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const limit = 10;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
        limit,
        search: debouncedSearch,
        role_id: roleId,
      })
    );
  }, [dispatch, activeTab, debouncedSearch, currentPage]);

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

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
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
    if (!selectedUser) {
      return;
    }

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
      // Refresh users list in background to ensure data consistency
      // The immediate state update will show the change right away
      const roleId = activeTab === "All" ? null : getRoleIdByName(activeTab);
      dispatch(
        fetchAllUsers({
          page: currentPage,
          limit,
          search: debouncedSearch,
          role_id: roleId,
        })
      );
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    }
  };

  // Check if user is suspended (based on is_active field)
  const isUserSuspended = (user) => {
    // Check userProfile first (most up-to-date), then user object
    if (userProfile && userProfile.id === (user?.id || user?.uid)) {
      return userProfile.is_active === false;
    }
    return user?.is_active === false;
  };

  // Get user status display
  const getUserStatus = (user) => {
    // Check userProfile first (most up-to-date), then user object
    let isActive;
    if (userProfile && userProfile.id === (user?.id || user?.uid)) {
      isActive = userProfile.is_active;
    } else {
      isActive = user?.is_active;
    }
    // If is_active is explicitly false, show Suspended, otherwise show Active
    return isActive === false ? "Suspended" : "Active";
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      setOpenMenuId(null);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const totalPages = pagination.totalPages;
    const current = pagination.page;
    const pages = [];
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);
      
      if (current <= 3) {
        // Near the start
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (current >= totalPages - 2) {
        // Near the end
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Close modals and reset form
  const handleCloseViewProfileModal = () => {
    setShowViewProfileModal(false);
    setSelectedUser(null);
    dispatch(clearError());
    dispatch(clearUserProfile());
  };

  const handleCloseSuspendModal = () => {
    setShowSuspendModal(false);
    setSelectedUser(null);
    dispatch(clearError());
    dispatch(clearUserProfile());
  };

  // Prepare tabs: "All" + roles from API
  const tabs = ["All", ...Roles.map((role) => role.name)];

  return (
    <div className="space-y-6 p-4 bg-gray-100 w-full min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">
            Manage your application users by role and activity.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-7 items-center border-b-2 border-gray-300 pb-2 overflow-x-auto">
        {rolesLoading ? (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="animate-spin" size={16} />
            <span>Loading roles...</span>
          </div>
        ) : (
          tabs.map((tab) => (
          <h1
            key={tab}
              onClick={() => handleTabChange(tab)}
              className={`cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === tab
                ? "text-[#B02E0C] font-semibold underline"
                : "text-gray-600"
            } hover:text-[#B02E0C] hover:underline`}
          >
            {tab}
          </h1>
          ))
        )}
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm border border-gray-200 mt-4 rounded-lg overflow-hidden">
        {/* Top bar */}
        <div className="flex justify-between items-center border-b border-gray-200 bg-gray-50 relative">
          <h2 className="text-lg font-semibold p-4 text-gray-800">
            Users – {activeTab}
            {pagination.totalRecords > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({pagination.totalRecords} {pagination.totalRecords === 1 ? "user" : "users"})
              </span>
            )}
          </h2>
          <div className="flex items-center gap-3 p-4 relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B02E0C]"
            />
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 flex items-center gap-2 relative"
            >
              Export
            </button>

            {/* Export Dropdown */}
            {exportOpen && (
              <div className="absolute top-14 right-4 bg-white shadow-lg border border-gray-200 rounded-md w-28 z-20">
                <ul className="text-gray-700 text-sm">
                  <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer">
                    PDF
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer">
                    CSV
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
            <p className="font-medium">Error: {error}</p>
            <button
              onClick={() => dispatch(clearError())}
              className="text-sm underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Users Table */}
        {usersLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-[#B02E0C]" size={32} />
            <span className="ml-3 text-gray-600">Loading users...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <>
        <table className="w-full text-left border-t border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 border border-gray-300 text-sm font-semibold"></th>
              <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">
                Name & Role
              </th>
          
              <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">
                Contact Number
              </th>
                  <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">
                    Address
              </th>
              <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">
                Joined
              </th>
                  <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">
                    Status
              </th>
              <th className="py-3 px-4 border border-gray-300 text-sm font-semibold text-center"></th>
            </tr>
          </thead>

          <tbody>
                {users.map((user) => (
                  <tr key={user.id || user.uid}>
                <td className="py-3 px-4 border border-gray-300">
                  <input
                    type="checkbox"
                    className="form-checkbox text-[#B02E0C] rounded focus:ring-[#B02E0C]"
                  />
                </td>
                <td className="py-2 px-4 border border-gray-300">
                  <div>
                        <p className="font-medium text-gray-800">
                          {user.name || user.full_name || "--"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user.role_id
                            ? getRoleNameById(user.role_id)
                            : user.role || "--"}
                        </p>
                  </div>
                </td>
             
                    <td className="py-2 px-4 border border-gray-300 text-gray-700">
                     {user.country_code} {user.contact_number || "--"}
                </td>
                <td className="py-2 px-4 border border-gray-300 text-gray-700">
                      {user.details?.address || "--"}
                </td>
                <td className="py-2 px-4 border border-gray-300 text-gray-700">
                      {formatDate(user.createdAt || user.created_at || user.joined)}
                </td>
                <td className="py-2 px-4 border border-gray-300 text-gray-700">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          getUserStatus(user) === "Suspended"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {getUserStatus(user)}
                      </span>
                </td>
                <td className="py-2 px-4 border border-gray-300 text-center relative">
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === user.id ? null : user.id)
                    }
                    className="p-2 rounded hover:bg-gray-100"
                  >
                    <EllipsisVertical className="text-gray-600" />
                  </button>

                  {/* Dropdown Menu */}
                  {openMenuId === user.id && (
                    <div className="absolute right-4 top-10 bg-white border border-gray-200 shadow-lg rounded-md w-44 z-30">
                      <ul className="text-gray-700 text-sm">
                        <li
                              onClick={() => {
                                handleViewProfile(user);
                                setOpenMenuId(null);
                              }}
                          className="px-4 py-2 flex items-center gap-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <Eye size={16} /> View Profile
                        </li>
                        <li
                              onClick={async () => {
                                setSelectedUser(user);
                            setShowSuspendModal(true);
                            setOpenMenuId(null);
                                // Fetch latest user profile to get current status
                                try {
                                  await dispatch(fetchUserById(user.id || user.uid)).unwrap();
                                } catch (error) {
                                  // If fetch fails, continue with existing user data
                                  console.error("Failed to fetch user profile:", error);
                                }
                              }}
                              className={`px-4 py-2 flex items-center gap-2 hover:bg-gray-50 cursor-pointer ${
                                isUserSuspended(user) ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              <Ban size={16} />{" "}
                              {isUserSuspended(user) ? "Activate User" : "Suspend User"}
                        </li>
                      </ul>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

            {/* Pagination */}
            {pagination.totalPages > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t border-gray-200 bg-gray-50">
                 {/* Records Info */}
                 <div className="text-sm text-gray-600">
                   Showing{" "}
                   <span className="font-semibold text-gray-900">
                     {pagination.totalRecords === 0
                       ? 0
                       : users.length > 0
                       ? (pagination.page - 1) * limit + 1
                       : (pagination.page - 1) * limit + 1}
                   </span>{" "}
                   to{" "}
                   <span className="font-semibold text-gray-900">
                     {pagination.totalRecords === 0
                       ? 0
                       : users.length > 0
                       ? Math.min((pagination.page - 1) * limit + users.length, pagination.totalRecords)
                       : Math.min(pagination.page * limit, pagination.totalRecords)}
                   </span>{" "}
                   of{" "}
                   <span className="font-semibold text-gray-900">
                     {pagination.totalRecords}
                   </span>{" "}
                   {pagination.totalRecords === 1 ? "user" : "users"}
                 </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                  {/* First Button */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-[#B02E0C] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 transition-colors"
                    title="First page"
                  >
                    First
                  </button>

                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-[#B02E0C] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 transition-colors"
                    title="Previous page"
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((pageNum, index) => {
                      if (pageNum === "...") {
                        return (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-2 py-1 text-gray-500"
                          >
                            ...
                          </span>
                        );
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            pagination.page === pageNum
                              ? "bg-[#B02E0C] text-white hover:bg-[#8d270b]"
                              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-[#B02E0C]"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
      </div>

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-[#B02E0C] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 transition-colors"
                    title="Next page"
                  >
                    Next
                  </button>

                  {/* Last Button */}
                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-[#B02E0C] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 transition-colors"
                    title="Last page"
                  >
                    Last
                  </button>
            </div>
          </div>
            )}
          </>
        )}
        </div>

      {/* ----------------- View Profile Modal ----------------- */}
      {showViewProfileModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50">
          <div className="bg-white rounded-xl w-[600px] max-h-[90vh] overflow-y-auto p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">User Profile</h2>
              <button onClick={handleCloseViewProfileModal}>
                <X className="text-gray-500 hover:text-gray-700 cursor-pointer" />
              </button>
            </div>

            {userProfileLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin text-[#B02E0C]" size={32} />
                <span className="ml-3 text-gray-600">Loading profile...</span>
              </div>
            ) : userProfile ? (
            <div className="space-y-4">
                {/* Profile Image */}
                {userProfile.details?.profile && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={userProfile.details.profile}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                    />
                  </div>
                )}

                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Full Name
                    </label>
                    <p className="text-gray-900">
                      {userProfile.full_name || userProfile.name || "--"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Role
                    </label>
                    <p className="text-gray-900">
                      {userProfile.role || "--"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Contact Number
                    </label>
                    <p className="text-gray-900">
                      {userProfile.country_code} {userProfile.phone_number || "--"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Status
                    </label>
                    <p className={`font-medium ${
                      userProfile.is_active === false ? "text-red-600" : "text-green-600"
                    }`}>
                      {userProfile.is_active === false ? "Suspended" : "Active"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Language
                    </label>
                    <p className="text-gray-900">
                      {userProfile.language || "--"}
                    </p>
                  </div>
              <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Joined Date
                </label>
                    <p className="text-gray-900">
                      {formatDate(userProfile.joined)}
                    </p>
                </div>
              </div>

                {/* Company Details */}
                {userProfile.details && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-md font-semibold text-gray-800 mb-3">
                      Company Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {userProfile.details.company_Name && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Company Name
                          </label>
                          <p className="text-gray-900">
                            {userProfile.details.company_Name}
                          </p>
                        </div>
                      )}
                      {userProfile.details.address && (
                        <div className="col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Address
                          </label>
                          <p className="text-gray-900">
                            {userProfile.details.address}
                          </p>
                        </div>
                      )}
                      {userProfile.details.company_tagline && (
                        <div className="col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Company Tagline
                          </label>
                          <p className="text-gray-900">
                            {userProfile.details.company_tagline}
                          </p>
                        </div>
                      )}
                      {userProfile.details.gstin && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            GSTIN
                          </label>
                          <p className="text-gray-900">
                            {userProfile.details.gstin}
                          </p>
                        </div>
                      )}
                      {userProfile.details.pan_card && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            PAN Card
                          </label>
                          <p className="text-gray-900">
                            {userProfile.details.pan_card}
                          </p>
                        </div>
                      )}
                      {userProfile.details.Daily_wage && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Daily Wage
                          </label>
                          <p className="text-gray-900">
                            {userProfile.details.Daily_wage}
                          </p>
                        </div>
                      )}
                      {userProfile.details.adthar_number && (
              <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Aadhaar Number
                </label>
                          <p className="text-gray-900">
                            {userProfile.details.adthar_number}
                          </p>
                        </div>
                      )}
                      {userProfile.details.notes_Description && (
                        <div className="col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Notes/Description
                </label>
                          <p className="text-gray-900">
                            {userProfile.details.notes_Description}
                          </p>
                </div>
                      )}
              </div>
            </div>
                )}

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                    onClick={handleCloseViewProfileModal}
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer"
              >
                    Close
              </button>
            </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No profile data available
            </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- Suspend/Activate User Modal ----------------- */}
      {showSuspendModal && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50">
          <div className="bg-white rounded-lg w-[400px] p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {isUserSuspended(selectedUser) ? "Activate User" : "Suspend User"}
              </h2>
              <button onClick={handleCloseSuspendModal}>
                <X className="text-gray-500 hover:text-gray-700 cursor-pointer" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Are you sure you want to{" "}
              {isUserSuspended(selectedUser) ? "activate" : "suspend"}{" "}
              <strong>{selectedUser.name || selectedUser.full_name}</strong>?
              {!isUserSuspended(selectedUser) && (
                <span className="block mt-1 text-sm">This action can be reversed later.</span>
              )}
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseSuspendModal}
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspendUser}
                className={`px-4 py-2 rounded-md text-white hover:opacity-90 cursor-pointer ${
                  isUserSuspended(selectedUser)
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-[#B02E0C] hover:bg-[#8d270b]"
                }`}
              >
                {isUserSuspended(selectedUser) ? "Activate" : "Suspend"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
