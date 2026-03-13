import React, { useState, useRef, useEffect } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handlePrev = () => onPageChange(Math.max(1, page - 1));
  const handleNext = () => onPageChange(Math.min(totalPages || 1, page + 1));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 px-4 md:px-8 py-4 md:p-6 border-t border-[#F1F5F9] bg-[#FFFFFF]">
      {/* Left: Custom Rows selector */}
      <div className="flex items-center gap-3 order-2 md:order-1">
        <span className="text-[12px] md:text-sm font-medium text-[#6B7280]">Show</span>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E2E8F0] hover:border-accent/40 rounded-xl text-[12px] md:text-sm font-bold text-[#0F172A] transition-all cursor-pointer shadow-sm min-w-[60px] justify-between group"
          >
            {limit}
            <ChevronDown size={14} className={`text-[#94A3B8] transition-transform duration-300 ${isOpen ? "rotate-180 text-accent" : "group-hover:text-accent"}`} />
          </button>

          {isOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-[#E2E8F0] rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.1)] overflow-hidden z-[60] animate-in fade-in slide-in-from-bottom-2 duration-200">
              {pageSizes.map(size => (
                <button
                  key={size}
                  onClick={() => {
                    onLimitChange(Number(size));
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm font-bold transition-all ${limit === size
                    ? "bg-accent/5 text-accent"
                    : "text-[#475569] hover:bg-gray-50 hover:text-[#0F172A]"
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
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
          <span className="mx-1 font-normal opacity-60">of</span>
          <span className="text-[#111827] font-bold">{totalRecords}</span>
        </div>

        <div className="flex items-center gap-1 order-1 sm:order-2">
          {/* Prev Arrow */}
          <button
            onClick={handlePrev}
            disabled={Number(page) === 1}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#F1F5F9] bg-white text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-accent disabled:opacity-30 disabled:hover:text-[#94A3B8] disabled:hover:bg-white transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Page List */}
          <div className="flex items-center">
            {getPageNumbers().map((pageNum, index) => {
              if (pageNum === "...") {
                return <span key={`dots-${index}`} className="px-1 md:px-2 text-[#94A3B8] text-sm font-black italic">...</span>;
              }
              const isActive = Number(page) === Number(pageNum);
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-[12px] md:text-sm font-black transition-all mx-0.5 cursor-pointer shadow-sm active:scale-95 ${isActive
                    ? "shadow-lg shadow-accent/20 ring-2 ring-accent ring-offset-2"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-white border border-[#F1F5F9] bg-gray-50/30"
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
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#F1F5F9] bg-white text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-accent disabled:opacity-30 disabled:hover:text-[#94A3B8] disabled:hover:bg-white transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
