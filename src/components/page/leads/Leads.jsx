import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Loader2, Calendar, Filter, Download } from "lucide-react";
import { fetchAllLeads, clearError } from "../../../redux/slice/LeadSlice";
import DataTable from "../../common/DataTable";
import { toPascalCase } from "../../../utils/stringUtils";

const Leads = () => {
  const dispatch = useDispatch();

  // Redux state
  const { leads, loading, error, pagination } = useSelector((state) => state.lead);

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch leads when filters change
  useEffect(() => {
    dispatch(
      fetchAllLeads({
        page: currentPage,
        limit: rowsPerPage,
        search: searchQuery,
        startDate,
        endDate,
      })
    );
  }, [dispatch, searchQuery, currentPage, rowsPerPage, startDate, endDate]);

  // Format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return "--";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return dateString;
    }
  };

  const columns = [
    {
      header: "Lead Detail",
      accessor: "name",
      cell: (lead) => (
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#EEF2FF] border-2 border-white shadow-sm flex items-center justify-center text-accent font-black text-lg select-none group-hover:scale-110 transition-transform">
            {(lead.name || lead.firstName || "?")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-[#0F172A] group-hover:text-accent transition-colors">
              {toPascalCase(lead.name || `${lead.firstName || ""} ${lead.lastName || ""}`.trim()) || "--"}
            </p>
            <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider">
              {lead.email || "No Email"}
            </p>
          </div>
        </div>
      ),
    },
 
    {
      header: "Organization",
      accessor: "company",
      cell: (lead) => (
        <div>
          <p className="text-sm font-bold text-[#334155] max-w-[150px] truncate group-hover:text-accent transition-colors">
            {lead.company || lead.company_name || "--"}
          </p>
          <p className="text-[10px] font-medium text-[#94A3B8] italic">
            Source: {lead.source_website || "Direct"}
          </p>
        </div>
      ),
    },
    {
      header: "Marketing & Campaign",
      accessor: "utm_source",
      cell: (lead) => (
        <div className="flex flex-wrap gap-1.5 max-w-[300px]">
          {lead.utm_source && (
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider border border-blue-100">
              Src: {lead.utm_source}
            </span>
          )}
          {lead.utm_medium && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-100">
              Med: {lead.utm_medium}
            </span>
          )}
          {lead.utm_campaign && (
            <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-wider border border-purple-100">
              Cmp: {lead.utm_campaign}
            </span>
          )}
          {lead.utm_content && (
            <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-wider border border-orange-100">
              Cnt: {lead.utm_content}
            </span>
          )}
          {lead.utm_term && (
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider border border-indigo-100">
              Trm: {lead.utm_term}
            </span>
          )}
          {lead.utm_adset && (
            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-wider border border-rose-100">
              Adset: {lead.utm_adset}
            </span>
          )}
          {lead.utm_ad && (
            <span className="px-2 py-0.5 rounded-md bg-pink-50 text-pink-600 text-[10px] font-black uppercase tracking-wider border border-pink-100">
              Ad: {lead.utm_ad}
            </span>
          )}
          {!lead.utm_source && !lead.utm_medium && !lead.utm_campaign && (
            <span className="text-xs text-gray-400 font-medium italic">No Marketing Tags</span>
          )}
        </div>
      ),
    },
    {
      header: "Registration",
      accessor: "createdAt",
      cell: (lead) => (
        <div className="max-w-[120px]">
          <p className="text-sm font-bold text-[#475569]">
            {formatDateTime(lead.createdAt || lead.created_at)}
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6 px-4 lg:px-10 py-4 md:py-8 bg-[#F8FAFC] w-full min-h-screen" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Leads Management</h1>
            <span className="px-3 py-1 bg-accent/10 text-accent text-sm font-black rounded-full border border-accent/20">
              {pagination.totalRecords} Total
            </span>
          </div>
          <p className="text-[#64748B] mt-1 text-sm font-medium">Review and track incoming leads from marketing campaigns</p>
        </div>

        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="space-y-1.5 w-full sm:w-auto">
            <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider ml-1">Start Date</label>
            <div className="relative group">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm font-bold text-[#0F172A] outline-none focus:border-accent/30 transition-all cursor-pointer shadow-sm"
              />
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-accent transition-colors" size={16} />
            </div>
          </div>

          <div className="space-y-1.5 w-full sm:w-auto">
            <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider ml-1">End Date</label>
            <div className="relative group">
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm font-bold text-[#0F172A] outline-none focus:border-accent/30 transition-all cursor-pointer shadow-sm"
              />
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-accent transition-colors" size={16} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setCurrentPage(1);
                }}
                className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors border border-rose-100 shadow-sm"
                title="Clear Filters"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={leads}
        loading={loading}
        rowKey={(r) => r.id || r._id}
        showSearch
        onSearch={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        pagination={pagination}
        onPageChange={setCurrentPage}
        onLimitChange={(l) => {
          setRowsPerPage(l);
          setCurrentPage(1);
        }}
        title="Incoming Leads"
      />

      {error && (
        <div className="fixed bottom-10 right-10 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between text-rose-700 shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3">
            <X size={18} className="cursor-pointer" onClick={() => dispatch(clearError())} />
            <p className="font-bold text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
