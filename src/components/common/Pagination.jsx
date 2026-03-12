import React from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

const Pagination = ({
  page = 1,
  limit = 10,
  totalPages = 1,
  totalRecords = 0,
  onPageChange = () => { },
  onLimitChange = () => { },
  pageSizes = [5, 10, 20, 50],
}) => {
  const handlePrev = () => onPageChange(Math.max(1, page - 1));
  const handleNext = () => onPageChange(Math.min(totalPages || 1, page + 1));

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

  if (totalPages <= 0) return null;

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 px-2 sm:px-6 py-4 md:p-6 border-t border-[#F1F5F9] bg-[#FFFFFF]">
      {/* Left: Rows selector */}
      <div className="flex items-center gap-3 order-2 md:order-1">
        <span className="text-[12px] md:text-sm font-medium text-[#6B7280]">Show</span>
        <div className="relative">
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-[12px] md:text-sm font-bold text-[#111827] focus:ring-0 focus:border-[#D1D5DB] transition-all cursor-pointer outline-none shadow-sm"
          >
            {pageSizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]">
            <ChevronDown size={14} />
          </div>
        </div>
        <span className="text-[12px] md:text-sm font-medium text-[#6B7280]">per page</span>
      </div>

      {/* Right: Info and Pagination Group */}
      <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 order-1 md:order-2 w-full md:w-auto">
        {/* Range Info */}
        <div className="text-[12px] md:text-sm font-medium text-[#6B7280] order-2 sm:order-1">
          <span className="tabular-nums">
            {totalRecords === 0 ? "0-0" : `${((page - 1) * limit) + 1}-${Math.min(page * limit, totalRecords)}`}
          </span>
          <span className="mx-1">of</span>
          <span className="text-[#111827] font-bold">{totalRecords}</span>
        </div>

        <div className="flex items-center gap-1 order-1 sm:order-2">
          {/* Prev Arrow */}
          <button
            onClick={handlePrev}
            disabled={Number(page) === 1}
            className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg border border-[#F3F4F6] bg-white text-[#9CA3AF] hover:bg-[#F9FAFB] hover:text-[#4B5563] disabled:opacity-30 disabled:hover:bg-white transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} md:size={18} />
          </button>

          {/* Page List */}
          <div className="flex items-center">
            {getPageNumbers().map((pageNum, index) => {
              if (pageNum === "...") {
                return <span key={`dots-${index}`} className="px-1 md:px-2 text-[#9CA3AF] text-sm">...</span>;
              }
              const isActive = Number(page) === Number(pageNum);
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center text-[12px] md:text-sm font-bold transition-all mx-0.5 cursor-pointer ${isActive
                    ? "bg-[#B02E0C] text-white shadow-md border-[#B02E0C]"
                    : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] border border-transparent"
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
            disabled={Number(page) >= totalPages}
            className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg border border-[#F3F4F6] bg-white text-[#9CA3AF] hover:bg-[#F9FAFB] hover:text-[#4B5563] disabled:opacity-30 disabled:hover:bg-white transition-colors cursor-pointer"
          >
            <ChevronRight size={16} md:size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
