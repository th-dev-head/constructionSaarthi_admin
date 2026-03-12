import React, { useState, useEffect, useRef } from "react";
import {
  EllipsisVertical, Eye, Lock, Ban, X, Loader2,
  ChevronDown, Search, Download, Filter, CreditCard
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiInstance } from "../../../config/axiosInstance";
import DataTable from "../../common/DataTable";

const Subscriptions = () => {
  const [planOpen, setPlanOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const navigate = useNavigate();

  // API state
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("PAID");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const menuRef = useRef(null);

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

  // Fetch subscription plans for dropdown
  const fetchPlans = async () => {
    try {
      const response = await apiInstance.get(`/api/subscription/getSubscriptionPlans`);
      if (response.data.success) {
        setPlans(response.data.data || []);
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
      const params = {
        page: currentPage,
        limit: rowsPerPage,
        status: statusFilter || undefined,
        subscription_plan_id: selectedPlanId || undefined,
        search: searchQuery || undefined
      };

      const response = await apiInstance.get(`/api/subscription/purchases`, { params });

      if (response.data && response.data.success) {
        setPurchases(response.data.data || []);
        setPagination({
          totalRecords: response.data.total || 0,
          totalPages: response.data.totalPages || 1,
          page: response.data.page || currentPage, 
          limit: response.data.limit || rowsPerPage,
        });
      } else {
        setError(response.data?.message || "Failed to fetch purchases");
      }
    } catch (err) {
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
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [selectedPlanId, searchQuery, statusFilter, currentPage, rowsPerPage]);

  const formatDate = (dateString) => {
    if (!dateString) return "--";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    } catch (error) { return dateString; }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0.00";
    return `₹${parseFloat(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const columns = [
    {
      header: "User Identity",
      accessor: "user.full_name",
      cell: (purchase) => (
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#EEF2FF] border-2 border-white shadow-sm flex items-center justify-center text-accent font-black text-lg select-none group-hover:scale-110 transition-transform">
            {(purchase.user?.full_name || "?")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-[#0F172A] group-hover:text-accent transition-colors">{purchase.user?.full_name || "--"}</p>
            <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider">{purchase.user?.company_name || "Personal User"}</p>
          </div>
        </div>
      )
    },
    {
      header: "Contact",
      accessor: "user.phone_number",
      cell: (purchase) => (
        <span className="text-sm font-bold text-[#475569]">
          {purchase.user?.country_code ? `${purchase.user?.country_code} ${purchase.user?.phone_number}` : purchase.user?.phone_number || "--"}
        </span>
      )
    },
    {
      header: "Active Plan",
      accessor: "plan.name",
      cell: (purchase) => (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold ring-1 ring-blue-200">
          {purchase.plan?.name || "--"}
        </div>
      )
    },
    {
      header: "Payment State",
      accessor: "status",
      cell: (purchase) => (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${purchase.status === "PAID"
          ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
          : purchase.status === "PENDING" ? "bg-amber-50 text-amber-600 ring-1 ring-amber-200" : "bg-rose-50 text-rose-600 ring-1 ring-rose-200"
          }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${purchase.status === "PAID" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : purchase.status === "PENDING" ? "bg-amber-500" : "bg-rose-500"}`} />
          {purchase.status || "--"}
        </div>
      )
    },
    {
      header: "Amount",
      accessor: "final_price",
      cell: (purchase) => (
        <span className="text-sm font-black text-[#0F172A] tabular-nums">{formatCurrency(purchase.final_price)}</span>
      )
    },
    {
      header: "Purchase Date",
      accessor: "purchase_date",
      cell: (purchase) => (
        <span className="text-sm font-bold text-[#64748B] tabular-nums">{formatDate(purchase.purchase_date || purchase.createdAt)}</span>
      )
    }
  ];

  const renderActions = (purchase) => (
    <div className="relative" ref={openMenuId === `purchase-${purchase.order_id || purchase.id}` ? menuRef : null}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          const uniqueId = `purchase-${purchase.order_id || purchase.id}`;
          setOpenMenuId(openMenuId === uniqueId ? null : uniqueId);
        }}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${openMenuId === `purchase-${purchase.order_id || purchase.id}` ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-accent'}`}
      >
        <EllipsisVertical size={18} />
      </button>

      {openMenuId === `purchase-${purchase.order_id || purchase.id}` && (
        <div className="absolute right-12 top-0 bg-white border border-[#E2E8F0] shadow-2xl rounded-2xl w-48 z-[100] overflow-hidden animate-in slide-in-from-right-2 duration-300">
          <ul className="text-[#475569] text-sm font-bold">
            <li className="px-4 py-3 flex items-center gap-3 hover:bg-[#F8FAFC] hover:text-accent cursor-pointer transition-colors">
              <Eye size={16} /> View Profile
            </li>
            <li className="px-4 py-3 flex items-center gap-3 hover:bg-[#F8FAFC] hover:text-accent cursor-pointer transition-colors text-rose-600">
              <Ban size={16} /> Suspend User
            </li>
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-8 px-4 sm:px-8 py-4 sm:py-8 bg-[#F8FAFC] w-full min-h-screen" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight leading-none">Subscriptions</h1>
          <p className="text-[#64748B] text-sm mt-1 font-medium">Keep track of all user subscriptions effortlessly</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => navigate("/manage-plans")} className="px-5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm font-bold text-[#475569] hover:bg-[#F8FAFC] transition-all shadow-sm">Manage Plans</button>
          <button onClick={() => navigate("/subscription-description")} className="px-5 py-2.5 bg-[#B02E0C] text-white rounded-xl text-sm font-bold hover:bg-[#8D270B] transition-all shadow-lg active:scale-95">Subscription Desk</button>
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-[#E2E8F0] mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <input type="text" placeholder="Search users/orders..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full pl-12 pr-4 py-3 bg-[#F1F5F9] border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-accent/20 focus:bg-white transition-all outline-none" />
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-[#94A3B8]" />
        </div>

        <div className="relative">
          <button onClick={() => setPlanOpen(!planOpen)} className="px-5 py-3 bg-white border border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#475569] flex items-center gap-2 hover:bg-[#F8FAFC] transition-all">
            <Filter size={18} className="text-[#94A3B8]" />
            <span>{plans.find(p => p.id === selectedPlanId)?.name || 'All Plans'}</span>
            <ChevronDown size={14} className={`transition-transform ${planOpen ? 'rotate-180' : ''}`} />
          </button>
          {planOpen && (
            <div className="absolute top-full mt-2 left-0 bg-white shadow-2xl border border-[#E2E8F0] rounded-2xl w-56 z-[60] py-2 animate-in slide-in-from-top-2 duration-300">
              <ul className="text-[#475569] text-sm font-bold">
                <li onClick={() => { setSelectedPlanId(""); setPlanOpen(false); setCurrentPage(1); }} className="px-4 py-3 hover:bg-[#F8FAFC] hover:text-accent cursor-pointer transition-colors">All Plans</li>
                {plans.map(plan => (
                  <li key={plan.id} onClick={() => { setSelectedPlanId(plan.id); setPlanOpen(false); setCurrentPage(1); }} className="px-4 py-3 hover:bg-[#F8FAFC] hover:text-accent cursor-pointer transition-colors">{plan.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="px-5 py-3 bg-white border border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#475569] outline-none cursor-pointer hover:bg-[#F8FAFC] transition-all">
          <option value="PAID">PAID</option>
          <option value="PENDING">PENDING</option>
          <option value="FAILED">FAILED</option>
          <option value="">All Status</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={purchases}
        loading={loading}
        renderActions={renderActions}
        rowKey={(r) => r.order_id || r.id}
        pagination={pagination}
        onPageChange={setCurrentPage}
        onLimitChange={(l) => { setRowsPerPage(l); setCurrentPage(1); }}
        title="Recent Purchases"
      />
    </div>
  );
};

export default Subscriptions;
