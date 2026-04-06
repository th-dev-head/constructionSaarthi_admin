import React, { useState, useEffect } from "react";
import {
  Eye, X, Loader2, ChevronDown, Search, Download, Filter, CreditCard,
  User, Calendar, Hash, ArrowRight, ShieldCheck, Layers, Tag, History, Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiInstance } from "../../../config/axiosInstance";
import DataTable from "../../common/DataTable";

const Subscriptions = () => {
  const [exportOpen, setExportOpen] = useState(false);
  const navigate = useNavigate();

  // API state
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [planOpen, setPlanOpen] = useState(false);

  // Detail Modal State
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [userHistory, setUserHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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
        status: statusFilter === "ALL" ? undefined : (statusFilter || undefined),
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

  const fetchUserHistory = async (phoneNumber) => {
    if (!phoneNumber) return;
    setHistoryLoading(true);
    try {
      const params = {
        search: phoneNumber,
        status: undefined, // "ALL" would fail on backend enum cast, omitting it returns all history
        limit: 50 // Fetch recent history for this specific user
      };
      const response = await apiInstance.get(`/api/subscription/purchases`, { params });
      if (response.data && response.data.success) {
        setUserHistory(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching user history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

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
      header: "Purchase Details",
      accessor: "purchase_type",
      cell: (purchase) => (
        <div className="flex flex-col gap-1 shrink-0">
          <div className={`w-fit inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-normal ${
            purchase.purchase_type === "Main Plan" 
              ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100" 
              : "bg-amber-50 text-amber-600 ring-1 ring-amber-100"
          }`}>
            {purchase.purchase_type === "Main Plan" ? "Standard Plan" : "Add-on Purchase"}
          </div>
          <div className="text-sm font-bold text-[#475569] pl-0.5">
            {purchase.purchase_type === "Main Plan" 
              ? (purchase.plan?.name || "--")
              : (
                <span className="flex items-center gap-1.5">
                  {purchase.addons_purchased?.extra_members > 0 && `+${purchase.addons_purchased.extra_members} User Slots`}
                  {purchase.addons_purchased?.extra_calculations > 0 && `+${purchase.addons_purchased.extra_calculations} Calculations`}
                  {!purchase.addons_purchased?.extra_members && !purchase.addons_purchased?.extra_calculations && "Subscription Extension"}
                </span>
              )
            }
          </div>
        </div>
      )
    },
    {
      header: "Payment State",
      accessor: "status",
      cell: (purchase) => (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${purchase.status === "PAID"
          ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
          : purchase.status === "PENDING" ? "bg-amber-50 text-amber-600 ring-1 ring-amber-200" : purchase.status === "EXPIRED" ? "bg-blue-50 text-blue-600 ring-1 ring-blue-200" : "bg-rose-50 text-rose-600 ring-1 ring-rose-200"
          }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${purchase.status === "PAID" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : purchase.status === "PENDING" ? "bg-amber-500" : purchase.status === "EXPIRED" ? "bg-blue-500" : "bg-rose-500"}`} />
          {purchase.status || "--"}
        </div>
      )
    },
    {
      header: "Amount",
      accessor: "total_amount",
      cell: (purchase) => {
        const isFree = parseFloat(purchase.total_amount) === 0;
        const isWalletOnly = parseFloat(purchase.wallet_used) >= parseFloat(purchase.total_amount) && !isFree;
        
        return (
          <div className="flex flex-col gap-1 items-start">
            <span className="text-sm font-black text-[#0F172A] tabular-nums">
              {formatCurrency(purchase.total_amount || purchase.final_price)}
            </span>
            {isWalletOnly ? (
              <span className="px-2 py-0.5 bg-violet-100 text-violet-600 text-[11px] font-normal rounded-full">
                Paid via Wallet
              </span>
            ) : parseFloat(purchase.wallet_used) > 0 ? (
              <span className="text-[9px] font-bold text-violet-500 italic">
                (inc. {formatCurrency(purchase.wallet_used)} Wallet)
              </span>
            ) : isFree ? (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[9px] font-black rounded-md uppercase tracking-tighter">
                Referral Bonus
              </span>
            ) : null}
          </div>
        );
      }
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
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          setSelectedPurchase(purchase);
          setShowDetailModal(true);
          fetchUserHistory(purchase.user?.phone_number);
        }}
        className="p-2 hover:bg-accent/10 rounded-xl text-accent transition-all active:scale-95 group"
        title="View Detailed Report"
      >
        <Eye size={18} className="group-hover:scale-110 transition-transform" />
      </button>
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
          <option value="ALL">ALL (Paid & Expired)</option>
          <option value="PAID">PAID</option>
          <option value="EXPIRED">EXPIRED</option>
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

      {/* ----------------- Subscription Detail Modal ----------------- */}
      {showDetailModal && selectedPurchase && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] p-4 backdrop-blur-md bg-white/30 animate-in fade-in duration-300">
          <div className="relative bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-[#E2E8F0] animate-in zoom-in duration-300 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#0F172A]">Purchase Intelligence</h2>
                  <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Detailed transaction Breakdown</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedPurchase(null);
                }}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <X className="text-gray-400 group-hover:text-gray-900 transition-colors" />
              </button>
            </div>

            {/* Content Body */}
            <div className="overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {/* Order Status Ribbon */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#F8FAFC] p-4 rounded-[24px] ring-1 ring-[#F1F5F9]">
                <div className="space-y-1 text-center md:text-left">
                  <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Order Reference</p>
                  <h3 className="text-2xl font-black text-[#0F172A]">#{selectedPurchase.order_id}</h3>
                </div>
                <div className="flex flex-col items-center md:items-end gap-2">
                  <div className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${selectedPurchase.status === "PAID"
                    ? "bg-emerald-500 text-white shadow-emerald-500/20"
                    : selectedPurchase.status === "EXPIRED"
                      ? "bg-blue-500 text-white shadow-blue-500/20"
                      : selectedPurchase.status === "PENDING"
                        ? "bg-amber-500 text-white shadow-amber-500/20"
                        : "bg-rose-500 text-white shadow-rose-500/20"
                    }`}>
                    {selectedPurchase.final_price === 0 && selectedPurchase.wallet_used > 0 ? "PAID (WALLET)" : selectedPurchase.status}
                  </div>
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                    {formatDate(selectedPurchase.purchase_date)}
                  </p>
                </div>
              </div>

              {/* Grid Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* User Information */}
                <div className="space-y-6">
                  <h4 className="flex items-center gap-2 text-[11px] font-black text-accent uppercase tracking-widest border-b border-accent/10 pb-2">
                    <User size={14} /> User Identity
                  </h4>
                  <div className="space-y-4 px-2">
                    <div>
                      <p className="text-[10px] text-[#94A3B8] font-bold mb-1">Full Name</p>
                      <p className="text-md font-black text-[#334155]">{selectedPurchase.user?.full_name || "--"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#94A3B8] font-bold mb-1">Contact Number</p>
                      <p className="text-md font-black text-[#334155]">
                        {selectedPurchase.user?.country_code} {selectedPurchase.user?.phone_number}
                      </p>
                    </div>
                    {selectedPurchase.user?.company_name && (
                      <div>
                        <p className="text-[10px] text-[#94A3B8] font-bold mb-1">Company Profile</p>
                        <p className="text-md font-black text-[#334155]">{selectedPurchase.user.company_name}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] text-[#94A3B8] font-bold mb-1">Member Since</p>
                      <p className="text-md font-black text-[#334155]">{formatDate(selectedPurchase.user?.registration_date)}</p>
                    </div>
                  </div>
                </div>

                {/* Plan Information */}
                <div className="space-y-6">
                  <h4 className="flex items-center gap-2 text-[11px] font-black text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-2">
                    <Layers size={14} /> Subscription Plan
                  </h4>
                  <div className="space-y-4 px-2">
                    <div>
                      <p className="text-[10px] text-[#94A3B8] font-bold mb-1">Selected Plan</p>
                      <p className="text-md font-black text-[#334155]">{selectedPurchase.plan?.name || "--"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#94A3B8] font-bold mb-1">Billing Period</p>
                      <p className="text-md font-black text-[#334155]">{selectedPurchase.plan?.billing_period} Days</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#94A3B8] font-bold mb-1">Plan ID Reference</p>
                      <p className="text-md font-black text-[#64748B] tabular-nums">#{selectedPurchase.plan?.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extras & Pricing */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-black text-[#1E293B] uppercase tracking-widest mb-4 border-l-4 border-accent pl-4 flex items-center gap-2">
                  Financial Reconciliation
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                   {/* Entitlements */}
                   <div className="bg-[#F8FAFC] p-6 rounded-2xl ring-1 ring-[#F1F5F9] space-y-4">
                      <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-2 flex items-center gap-2">
                        <ShieldCheck size={12} /> Entitlements Included
                      </p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-[#64748B]">Bonus User Slots</span>
                        <span className="font-black text-[#0F172A]">{selectedPurchase.extra_user_count || 0} Users</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-[#64748B]">Bonus Calculations</span>
                        <span className="font-black text-[#0F172A]">{selectedPurchase.extra_calculation_count || 0} Units</span>
                      </div>
                   </div>

                   {/* Price Breakdown */}
                   <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-[#64748B]">Base Subscription</span>
                        <span className="font-black text-[#334155]">{formatCurrency(selectedPurchase.base_price)}</span>
                      </div>
                      {selectedPurchase.discount_amount > 0 && (
                        <div className="flex justify-between items-center text-sm text-emerald-600">
                          <span className="font-medium flex items-center gap-1.5 underline decoration-emerald-100 decoration-2 underline-offset-4">
                            <Tag size={12} /> Discount Applied {selectedPurchase.coupon_code && `(${selectedPurchase.coupon_code})`}
                          </span>
                          <span className="font-black">-{formatCurrency(selectedPurchase.discount_amount)}</span>
                        </div>
                      )}
                      {parseFloat(selectedPurchase.wallet_used) > 0 && (
                        <div className="flex justify-between items-center text-sm text-violet-600">
                          <span className="font-medium flex items-center gap-1.5">
                            Wallet Used
                          </span>
                          <span className="font-black">-{formatCurrency(selectedPurchase.wallet_used)}</span>
                        </div>
                      )}
                      <div className="h-px bg-[#F1F5F9] my-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-[#0F172A] uppercase tracking-wide">Final Net Amount</span>
                        <span className="text-xl font-black text-accent">{formatCurrency(selectedPurchase.final_price)}</span>
                      </div>
                   </div>
                </div>
              </div>

                {/* Subscription Timeline / History */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black text-[#1E293B] uppercase tracking-widest border-l-4 border-accent pl-4 flex items-center gap-2">
                      <History size={16} className="text-accent" />
                       Professional Evolution Timeline
                    </h3>
                    <div className="px-4 py-1.5 rounded-full bg-[#F1F5F9] text-[#64748B] text-[10px] font-black uppercase tracking-widest ring-1 ring-[#E2E8F0]">
                      Total Expired Plans: {Math.max(0, userHistory.filter(h => h.status === 'PAID' || h.status === 'EXPIRED').length - (selectedPurchase.status === 'PAID' || selectedPurchase.status === 'EXPIRED' ? 1 : 0))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {historyLoading ? (
                      <div className="flex items-center justify-center py-10 gap-3 text-[#94A3B8]">
                        <Loader2 className="animate-spin text-accent" size={18} />
                        <span className="text-xs font-bold uppercase tracking-wider">Syncing history...</span>
                      </div>
                    ) : userHistory.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {userHistory.map((history, idx) => (
                          <div key={idx} className={`p-5 rounded-2xl border flex items-center justify-between transition-all hover:shadow-md ${history.order_id === selectedPurchase.order_id ? 'bg-accent/5 border-accent/20 ring-1 ring-accent/10' : 'bg-white border-gray-100'}`}>
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${history.order_id === selectedPurchase.order_id ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                                {history.order_id === selectedPurchase.order_id ? <ShieldCheck size={20} /> : <Clock size={18} />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-black text-[#0F172A]">{history.plan?.name || "Unknown Plan"}</h4>
                                  {history.order_id === selectedPurchase.order_id && (
                                    <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[8px] font-black uppercase tracking-widest">Active Focus</span>
                                  )}
                                </div>
                                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                                  <Calendar size={10} />
                                  Ordered on {formatDate(history.purchase_date)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-black text-[#0F172A] tabular-nums">{formatCurrency(history.final_price)}</p>
                              <div className={`text-[8px] font-black uppercase tracking-tighter mt-1 px-2 py-0.5 rounded-md inline-block ${history.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : history.status === 'EXPIRED' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                {history.order_id === selectedPurchase.order_id ? 'CURRENT' : (history.status === 'PAID' || history.status === 'EXPIRED') ? 'EXPIRED' : history.status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-[#F8FAFC] rounded-2xl border border-dashed border-[#E2E8F0]">
                        <p className="text-[#94A3B8] text-[10px] font-black uppercase tracking-widest italic">No prior transaction found</p>
                      </div>
                    )}
                  </div>
                </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 bg-[#F8FAFC] border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 z-10">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedPurchase(null);
                }}
                className="px-10 py-3.5 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl text-sm font-black text-[#475569] hover:bg-gray-50 transition-all active:scale-95"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
