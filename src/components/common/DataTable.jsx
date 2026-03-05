import React, { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  pagination = { page: 1, limit: 10, totalPages: 1, totalRecords: 0 },
  onPageChange = () => { },
  onLimitChange = () => { },
  renderActions = null,
  pageSizes = [5, 10, 20, 50],
  showSearch = false,
  onSearch = null,
  rowKey = (r) => r.id,
}) => {
  const { page, limit, totalPages, totalRecords } = pagination;
  const [search, setSearch] = useState("");

  const handlePrev = () => onPageChange(Math.max(1, page - 1));
  const handleNext = () => onPageChange(Math.min(totalPages || 1, page + 1));
  const handleFirst = () => onPageChange(1);
  const handleLast = () => onPageChange(totalPages || 1);

  const computedColumns = useMemo(() => columns, [columns]);

  const handleSearchChange = (value) => {
    setSearch(value);
    if (onSearch) onSearch(value);
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page <= 3) {
        for (let i = 2; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push("...");
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="bg-white shadow-2xl shadow-gray-200/50 border border-[#E2E8F0] rounded-[2rem] overflow-hidden transition-all duration-500">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-b border-[#F1F5F9] gap-4">
        {showSearch ? (
          <div className="relative w-full sm:w-72 group">
            <input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search records..."
              className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border-2 border-transparent focus:border-accent/20 focus:bg-white rounded-2xl text-sm font-bold text-[#0F172A] transition-all outline-none placeholder:text-[#94A3B8] placeholder:font-medium"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-accent transition-colors" size={18} />
          </div>
        ) : (
          <div />
        )}
      </div>

      <div className="overflow-x-auto overflow-y-visible">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC]">
              {computedColumns.map((col) => (
                <th key={col.key || col.accessor} className={`py-5 px-8 text-[10px] font-black text-[#64748B] uppercase tracking-widest border-b border-[#F1F5F9] ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
              {renderActions && (
                <th className="py-5 px-8 text-[10px] font-black text-[#64748B] uppercase tracking-widest border-b border-[#F1F5F9] text-center">Actions</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#F1F5F9]">
            {loading ? (
              <tr>
                <td colSpan={computedColumns.length + (renderActions ? 1 : 0)} className="py-24 px-8 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
                    <span className="text-xs font-black text-accent uppercase tracking-widest animate-pulse">Fetching Intelligence...</span>
                  </div>
                </td>
              </tr>
            ) : data && data.length > 0 ? (
              data.map((row, idx) => (
                <tr key={typeof rowKey === "function" ? rowKey(row, idx) : (row[rowKey] || idx)} className="group hover:bg-[#F8FAFC] transition-all duration-300">
                  {computedColumns.map((col) => (
                    <td key={col.key || col.accessor} className={`py-5 px-8 text-sm font-medium text-[#475569] ${col.cellClass || ""}`}>
                      {col.cell ? col.cell(row, idx) : (row[col.accessor] ?? "--")}
                    </td>
                  ))}
                  {renderActions && (
                    <td className="py-5 px-8 text-center relative overflow-visible">
                      {renderActions(row, idx)}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={computedColumns.length + (renderActions ? 1 : 0)} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 bg-[#F8FAFC] rounded-2xl flex items-center justify-center text-[#94A3B8]">
                      <Search size={32} />
                    </div>
                    <p className="text-[#64748B] font-bold">No records found matching your criteria</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Area - Optimized to match Users style */}
      {totalPages > 0 && (
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 p-6 border-t border-[#F1F5F9] bg-[#FFFFFF]">
          {/* Left: Rows selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[#6B7280]">Show</span>
            <div className="relative">
              <select
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-sm font-bold text-[#111827] focus:ring-0 focus:border-[#D1D5DB] transition-all cursor-pointer outline-none shadow-sm"
              >
                {pageSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]">
                <ChevronDown size={14} />
              </div>
            </div>
            <span className="text-sm font-medium text-[#6B7280]">per page</span>
          </div>

          {/* Right: Info and Pagination Group */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Range Info */}
            <div className="text-sm font-medium text-[#6B7280]">
              <span className="tabular-nums">
                {((page - 1) * limit) + 1}-{Math.min(page * limit, totalRecords)}
              </span>
              <span className="mx-1">of</span>
              <span className="text-[#111827] font-bold">{totalRecords}</span>
            </div>

            <div className="flex items-center gap-1">
              {/* Prev Arrow */}
              <button
                onClick={handlePrev}
                disabled={page === 1}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#F3F4F6] bg-white text-[#9CA3AF] hover:bg-[#F9FAFB] hover:text-[#4B5563] disabled:opacity-30 disabled:hover:bg-white transition-colors cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Page List */}
              <div className="flex items-center">
                {getPageNumbers().map((pageNum, index) => {
                  if (pageNum === "...") {
                    return <span key={`dots-${index}`} className="px-2 text-[#9CA3AF] text-sm">...</span>;
                  }
                  const isActive = page === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all sm:mx-0.5 cursor-pointer ${isActive
                        ? "border border-[#F3F4F6] text-[#111827] bg-[#FFFFFF] shadow-sm"
                        : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB]"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Arrow */}
              <button
                onClick={handleNext}
                disabled={page >= totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#F3F4F6] bg-white text-[#9CA3AF] hover:bg-[#F9FAFB] hover:text-[#4B5563] disabled:opacity-30 disabled:hover:bg-white transition-colors cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;

