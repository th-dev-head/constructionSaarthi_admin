import React, { useState, useEffect, useRef } from "react";
import { EllipsisVertical, Eye, Lock, Ban, X, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiInstance } from "../../../config/axiosInstance";

const Subscriptions = () => {
  const [planOpen, setPlanOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate();

  // API state
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("PAID");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  
  // Ref for dropdown menu
  const menuRefs = useRef({});

  const handleManagePlans = () => {
    navigate("/manage-plans");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside all dropdown menus
      const clickedInsideAnyMenu = Object.values(menuRefs.current).some(ref => 
        ref && ref.contains(event.target)
      );
      
      if (!clickedInsideAnyMenu) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  // Fetch subscription plans for dropdown
  const fetchPlans = async () => {
    try {
      const response = await apiInstance.get(`/api/subscription/getSubscriptionPlans`);
      if (response.data.success) {
        setPlans(response.data.data || []);
        if (response.data.data && response.data.data.length > 0 && !selectedPlanId) {
          setSelectedPlanId(response.data.data[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
    }
  };

  // Fetch purchases
  const fetchPurchases = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      
      if (selectedPlanId) {
        params.subscription_plan_id = selectedPlanId;
      }
      
      // if (searchQuery && searchQuery.trim() !== "") {
      //   params.search = searchQuery.trim();
      // } else {
      //   params.search = "null";
      // }
      
      params.page = currentPage;
      params.limit = limit;

      const response = await apiInstance.get(`/api/subscription/purchases`, { params });
      
      if (response.data && response.data.success) {
        setPurchases(response.data.data || []);
        setPagination({
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 1,
          page: response.data.page || 1,
          limit: response.data.limit || limit,
        });
      } else {
        setError(response.data?.message || "Failed to fetch purchases");
      }
    } catch (err) {
      console.error("Error fetching purchases:", err);
      setError(err.response?.data?.message || "Failed to fetch subscription purchases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPurchases();
    }, searchQuery ? 500 : 0); // Debounce search by 500ms

    return () => clearTimeout(timeoutId);
  }, [selectedPlanId, searchQuery, currentPage]);

  // Handle plan filter change
  const handlePlanFilter = (planId) => {
    setSelectedPlanId(planId || null);
    setPlanOpen(false);
    setCurrentPage(1);
  };

  // Handle search
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
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

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return `₹${parseFloat(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6 p-4 bg-gray-100 w-full min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-gray-600">
            Keep track of all user subscriptions effortlessly
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleManagePlans()} className="mt-4 sm:mt-0 px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]">
            Manage Plans
          </button>
          <button onClick={() => navigate("/subscription-description")} className="mt-4 sm:mt-0 px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]">
            Subscription Description
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm border border-gray-200 mt-4 rounded-lg overflow-hidden">
        <div className="flex justify-between items-center border-b border-gray-200 bg-gray-50 relative">
          <h2 className="text-lg font-semibold p-4 text-gray-800">Users</h2>
          <div className="flex items-center gap-3 p-4 relative">
            <button
              onClick={() => setPlanOpen(!planOpen)}
              className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 flex items-center gap-2 relative"
            >
              Plan Type
            </button>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B02E0C]"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B02E0C]"
            >
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
              <option value="">All Status</option>
            </select>
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 flex items-center gap-2 relative"
            >
              Export
            </button>

            {/* plan Dropdown */}
            {planOpen && (
              <div className="absolute top-16 bg-white shadow-lg border border-gray-200 rounded-md w-48 z-20 max-h-60 overflow-y-auto">
                <ul className="text-gray-700 text-sm">
                  <li 
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handlePlanFilter("")}
                  >
                    All Plans
                  </li>
                  {plans.map((plan) => (
                    <li 
                      key={plan.id}
                      className={`px-4 py-2 hover:bg-gray-50 cursor-pointer ${
                        selectedPlanId === plan.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handlePlanFilter(plan.id)}
                    >
                      {plan.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
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

        {/* Users Table */}
        <table className="w-full text-left border-t border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 border border-gray-300 text-sm font-semibold"></th>
              <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">
                Name
              </th>
              <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">
                Contact Number
              </th>
              <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">
                Plan
              </th>
              <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">
                Status
              </th>
              <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">
                Amount
              </th>
              <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">
                joined
              </th>
              <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">
                Billing Period
              </th>
              <th className="py-3 px-4 border border-gray-300 text-sm font-semibold text-center"></th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="py-8 text-center">
                  <Loader2 className="animate-spin text-[#B02E0C] mx-auto" size={32} />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="9" className="py-8 text-center text-red-600">
                  {error}
                </td>
              </tr>
            ) : purchases.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-8 text-center text-gray-500">
                  No purchases found
                </td>
              </tr>
            ) : (
              purchases.map((purchase) => {
                const user = purchase.user || {};
                const plan = purchase.plan || {};
                return (
              <tr key={purchase.order_id || purchase.id}>
                <td className="py-3 px-4 border border-gray-300">
                  <input
                    type="checkbox"
                    className="form-checkbox text-[#B02E0C] rounded focus:ring-[#B02E0C]"
                  />
                </td>
                <td className="py-2 px-4 border border-gray-300">
                  <div>
                    <p className="font-medium text-gray-800">{user.full_name || "--"}</p>
                    <p className="text-xs text-gray-500">{user.company_name || "--"}</p>
                  </div>
                </td>
                <td className="py-2 px-4 border border-gray-300 text-gray-700">
                  {user.country_code ? `${user.country_code} ${user.phone_number}` : user.phone_number || "--"}
                </td>
                <td className="py-2 px-4 border border-gray-300 text-gray-700">
                  {plan.name || "--"}
                </td>
                <td className="py-2 px-4 border border-gray-300 text-gray-700">
                  <div className={`px-2.5 py-1.5 border-2 rounded-full flex flex-row gap-1 ${
                    purchase.status === "PAID"
                      ? "border-green-300 bg-green-100"
                      : purchase.status === "PENDING"
                      ? "border-yellow-300 bg-yellow-100"
                      : "border-red-300 bg-red-100"
                  }`}>
                    <div className={`rounded-full mt-[0.6rem] w-2 h-2 ${
                      purchase.status === "PAID"
                        ? "bg-[#04B440]"
                        : purchase.status === "PENDING"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}></div>
                    <span className={`font-semibold ${
                      purchase.status === "PAID"
                        ? "text-[#04B440]"
                        : purchase.status === "PENDING"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}>
                      {purchase.status || "--"}
                    </span>
                  </div>
                </td>
                <td className="py-2 px-4 border border-gray-300 text-gray-700">
                  {formatCurrency(purchase.final_price)}
                </td>
                <td className="py-2 px-4 border border-gray-300 text-gray-700">
                  {formatDate(user.registration_date || purchase.purchase_date)}
                </td>
                <td className="py-2 px-4 border border-gray-300 text-gray-700">
                  {plan.billing_period ? `${plan.billing_period} days` : "--"}
                </td>
                <td className="py-2 px-4 border border-gray-300 text-center relative" ref={(el) => {
                  const uniqueId = `purchase-${purchase.order_id || purchase.id}`;
                  if (el) {
                    menuRefs.current[uniqueId] = el;
                  }
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const uniqueId = `purchase-${purchase.order_id || purchase.id}`;
                      setOpenMenuId(openMenuId === uniqueId ? null : uniqueId);
                    }}
                    className="p-2 rounded hover:bg-gray-100"
                  >
                    <EllipsisVertical className="text-gray-600" />
                  </button>

                  {/* Dropdown Menu */}
                  {openMenuId === `purchase-${purchase.order_id || purchase.id}` && (
                    <div 
                      className="absolute right-4 top-10 bg-white border border-gray-200 shadow-lg rounded-md w-44 z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ul className="text-gray-700 text-sm">
                        <li
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                            setOpenMenuId(null);
                          }}
                          className="px-4 py-2 flex items-center gap-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <Eye size={16} /> View Profile
                        </li>
                        <li
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowResetModal(true);
                            setOpenMenuId(null);
                          }}
                          className="px-4 py-2 flex items-center gap-2 hover:bg-gray-50 cursor-pointer"
                        > 
                          <Lock size={16} /> Reset Password
                        </li>
                        <li
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowSuspendModal(true);
                            setOpenMenuId(null);
                          }}
                          className="px-4 py-2 flex items-center gap-2 text-red-600 hover:bg-gray-50 cursor-pointer"
                        >
                          <Ban size={16} /> Suspend User
                        </li>
                      </ul>
                    </div>
                  )}
                </td>
              </tr>
                );
              })
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* {selectedUser && (
        <div className="w-1/3 bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden ml-6">
          <div className="p-6">
            <h2 className="text-2xl font-semibold">{selectedUser.name}</h2>
            <p className="text-gray-600">{selectedUser.role}</p>
            <div className="mt-4">
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedUser.phone}
              </p>
              <p>
                <strong>Joined:</strong> {selectedUser.joined}
              </p>
            </div>
          </div>
        </div>
      )} */}

      {/* ----------------- Reset Password Modal ----------------- */}
      {showResetModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50">
          <div className="bg-white rounded-xl w-[400px] p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Reset Password</h2>
              <button onClick={() => setShowResetModal(false)}>
                <X className="text-gray-500 hover:text-gray-700 cursor-pointer" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Enter password"
                    className="w-full border rounded-md px-3 py-2 focus:ring-1 focus:ring-[#B02E0C] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
                  >
                    {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={confirmPasswordVisible ? "text" : "password"}
                    placeholder="Enter password"
                    className="w-full border rounded-md px-3 py-2 focus:ring-1 focus:ring-[#B02E0C] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmPasswordVisible(!confirmPasswordVisible)
                    }
                    className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
                  >
                    {confirmPasswordVisible ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button className="px-4 py-2 rounded-md bg-[#B02E0C] text-white hover:bg-[#8d270b] cursor-pointer">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- Suspend User Modal ----------------- */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-xs">
          <div className="bg-white rounded-lg w-[400px] p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Suspend User</h2>
              <button onClick={() => setShowSuspendModal(false)}>
                <X className="text-gray-500 hover:text-gray-700 cursor-pointer" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Are you sure you want to suspend this user? This action is
              irreversible.
            </p>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Reason for Suspend*
              </label>
              <textarea
                placeholder="Enter reason"
                rows="3"
                className="w-full border rounded-md px-3 py-2 focus:ring-1 focus:ring-[#B02E0C] outline-none"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSuspendModal(false)}
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button className="px-4 py-2 rounded-md bg-[#B02E0C] text-white hover:bg-[#8d270b] cursor-pointer">
                Suspend
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
