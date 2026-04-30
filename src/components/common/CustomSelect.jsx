import React from "react";
import Select from "react-select";
import { ChevronDown } from "lucide-react";

const CustomSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select...", 
  label, 
  className = "",
  isMulti = false,
  isSearchable = true,
  ...props 
}) => {
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "white",
      borderColor: state.isFocused ? "#B02E0C50" : "#E2E8F0",
      borderRadius: "0.75rem", // rounded-xl
      padding: "2px 4px",
      fontSize: "0.875rem",
      fontWeight: "700",
      color: "#0F172A",
      boxShadow: state.isFocused ? "0 0 0 1px #B02E0C20" : "none",
      "&:hover": {
        borderColor: "#CBD5E1",
      },
      cursor: "pointer",
      minHeight: "45px",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#94A3B8",
      fontWeight: "500",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#0F172A",
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "1rem",
      overflow: "hidden",
      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      border: "1px solid #E2E8F0",
      marginTop: "8px",
      zIndex: 100,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? "#B02E0C" 
        : state.isFocused 
          ? "#EEF2FF" 
          : "white",
      color: state.isSelected ? "white" : "#475569",
      padding: "10px 15px",
      fontSize: "0.875rem",
      fontWeight: state.isSelected ? "800" : "600",
      cursor: "pointer",
      "&:active": {
        backgroundColor: "#B02E0C",
      },
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "#94A3B8",
    }),
  };

  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {label && (
        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider ml-1">
          {label}
        </label>
      )}
      <Select
        options={options}
        value={options?.find(opt => opt.value === value) || value}
        onChange={(val) => onChange(isMulti ? val : val.value)}
        placeholder={placeholder}
        styles={customStyles}
        isMulti={isMulti}
        isSearchable={isSearchable}
        components={{
          DropdownIndicator: () => (
            <div className="pr-3 text-[#94A3B8]">
              <ChevronDown size={16} />
            </div>
          ),
        }}
        {...props}
      />
    </div>
  );
};

export default CustomSelect;
