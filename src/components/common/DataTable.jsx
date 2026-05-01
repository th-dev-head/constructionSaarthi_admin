import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import Pagination from "./Pagination";

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
  const page = pagination.page || pagination.currentPage || 1;
  const { limit, totalPages, totalRecords } = pagination;
  const [search, setSearch] = useState("");

  const handleSearchChange = (value) => {
    setSearch(value);
    if (onSearch) onSearch(value);
  };

  return (
    <div className="bg-white shadow-2xl shadow-gray-200/50 border border-[#E2E8F0] rounded-[1rem] sm:rounded-[2rem] overflow-hidden transition-all duration-500">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 border-b border-[#F1F5F9] gap-4">
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
              {columns.map((col) => (
                <th key={col.key || col.accessor} className={`py-4 md:py-5 px-3 sm:px-4 md:px-4 lg:px-8 text-[10px] font-black text-[#64748B] uppercase tracking-widest border-b border-[#F1F5F9] ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
              {renderActions && (
                <th className="py-4 md:py-5 px-3 sm:px-4 md:px-4 lg:px-8 text-[10px] font-black text-[#64748B] uppercase tracking-widest border-b border-[#F1F5F9] text-center">Actions</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#F1F5F9]">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (renderActions ? 1 : 0)} className="py-24 px-8 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
                    <span className="text-xs font-black text-accent uppercase tracking-widest animate-pulse">Fetching Intelligence...</span>
                  </div>
                </td>
              </tr>
            ) : data && data.length > 0 ? (
              data.map((row, idx) => (
                <tr key={typeof rowKey === "function" ? rowKey(row, idx) : (row[rowKey] || idx)} className="group hover:bg-[#F8FAFC] transition-all duration-300">
                  {columns.map((col) => (
                    <td key={col.key || col.accessor} className={`py-4 md:py-5 px-3 sm:px-4 md:px-4 lg:px-8 text-sm font-medium text-[#475569] ${col.cellClass || ""}`}>
                      {col.cell ? col.cell(row, idx) : (row[col.accessor] ?? "--")}
                    </td>
                  ))}
                  {renderActions && (
                    <td className="py-4 md:py-5 px-3 sm:px-4 md:px-4 lg:px-8 text-center relative overflow-visible">
                      {renderActions(row, idx)}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (renderActions ? 1 : 0)} className="py-20 text-center">
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

      <Pagination
        page={page}
        limit={limit}
        totalPages={totalPages}
        totalRecords={totalRecords}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        pageSizes={pageSizes}
      />
    </div>
  );
};

export default DataTable;




