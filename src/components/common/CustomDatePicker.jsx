import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";

const CustomDatePicker = ({ 
  selected, 
  onChange, 
  placeholderText = "Select Date", 
  label, 
  minDate, 
  maxDate,
  className = "",
  ...props 
}) => {
  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {label && (
        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <DatePicker
          selected={selected}
          onChange={onChange}
          placeholderText={placeholderText}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm font-bold text-[#0F172A] outline-none focus:border-accent/30 transition-all cursor-pointer shadow-sm hover:border-[#CBD5E1]"
          dateFormat="dd-MM-yyyy"
          minDate={minDate}
          maxDate={maxDate}
          {...props}
        />
        <Calendar 
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-accent transition-colors z-10" 
          size={16} 
        />
        
        <style>{`
          .react-datepicker-wrapper {
            width: 100%;
          }
          .react-datepicker {
            font-family: inherit;
            border: 1px solid #E2E8F0;
            border-radius: 1rem;
            box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
            overflow: hidden;
            z-index: 100;
          }
          .react-datepicker__header {
            background-color: #F8FAFC;
            border-bottom: 1px solid #E2E8F0;
            padding-top: 1rem;
          }
          .react-datepicker__current-month {
            font-weight: 800;
            color: #0F172A;
            text-transform: uppercase;
            letter-spacing: 0.025em;
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
          }
          .react-datepicker__day-name {
            color: #64748B;
            font-weight: 700;
            font-size: 0.75rem;
            width: 2.25rem;
          }
          .react-datepicker__day {
            width: 2.25rem;
            line-height: 2.25rem;
            border-radius: 0.75rem;
            color: #334155;
            font-weight: 600;
            transition: all 0.2s;
          }
          .react-datepicker__day:hover {
            background-color: #EEF2FF;
            color: #B02E0C;
          }
          .react-datepicker__day--selected {
            background-color: #B02E0C !important;
            color: white !important;
            font-weight: 800;
          }
          .react-datepicker__day--keyboard-selected {
            background-color: #FEF2F2;
            color: #B02E0C;
          }
          .react-datepicker__navigation {
            top: 1rem;
          }
          .react-datepicker__navigation-icon::before {
            border-color: #94A3B8;
            border-width: 2px 2px 0 0;
          }
        `}</style>
      </div>
    </div>
  );
};

export default CustomDatePicker;
