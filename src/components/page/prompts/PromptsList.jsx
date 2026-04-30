import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { EllipsisVertical, Eye, Edit, Trash2, Loader2, Plus, X, Search, Filter, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import CustomSelect from "../../common/CustomSelect";
import {
  fetchAllPrompts,
  deletePrompt,
  clearError,
} from "../../../redux/slice/PromptSlice";
import {
  fetchAllPMFeatures,
} from "../../../redux/slice/PMFeatureSlice";
import DataTable from "../../common/DataTable";

const PromptsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  // Redux state
  const { prompts, loading, error, total, totalPages, currentPage: reduxCurrentPage } = useSelector((state) => state.prompt);
  const { pmFeatures, loading: featuresLoading } = useSelector(
    (state) => state.pmFeature
  );

  // Local state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchAllPMFeatures());
  }, [dispatch]);

  // Fetch prompts when feature filter changes
  useEffect(() => {
    dispatch(
      fetchAllPrompts({
        includeDeleted: false,
        onlyActive: true,
        feature_id: selectedFeature || null,
        page: currentPage,
        limit,
      })
    );
  }, [dispatch, selectedFeature, currentPage, limit]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        const isEllipsisButton = event.target.closest('button[class*="rounded-xl"]');
        if (!isEllipsisButton) {
          setOpenMenuId(null);
        }
      }
    };

    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  // Handle delete
  const handleDelete = async () => {
    if (!selectedPrompt) return;

    try {
      await dispatch(deletePrompt(selectedPrompt.prompt_id)).unwrap();
      setShowDeleteModal(false);
      setSelectedPrompt(null);
      dispatch(
        fetchAllPrompts({
          includeDeleted: false,
          onlyActive: true,
          feature_id: selectedFeature || null,
        })
      );
    } catch (error) {
      console.error("Failed to delete prompt:", error);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-8 px-4 sm:px-8 py-4 sm:py-8 bg-[#F8FAFC] w-full min-h-screen" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      {/* Navigation Tabs */}
      <div className="bg-white p-1 md:p-2 rounded-2xl md:rounded-[2rem] shadow-sm border border-[#E2E8F0] overflow-x-auto no-scrollbar">
        <div className="flex gap-1 md:gap-2 min-w-max">
          {[
            { name: "Prompts", path: "/prompts" },
            { name: "PM Features", path: "/prompts/features" },
            { name: "Prompt References", path: "/prompts/references" },
          ].map((tab) => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-bold text-[12px] md:text-sm transition-all duration-300 whitespace-nowrap ${location.pathname === tab.path
                ? "bg-accent text-white shadow-md md:shadow-lg shadow-accent/20"
                : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">
            Intelligence Hub
          </h1>
          <p className="text-[12px] md:text-sm font-medium text-[#64748B]">
            Orchestrate and optimize your AI generation prompts and templates.
          </p>
        </div>
        <button
          onClick={() => navigate("/prompts/create")}
          className="px-6 md:px-8 py-3 md:py-4 bg-accent text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-[#8D270B] shadow-lg md:shadow-xl shadow-accent/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer w-full md:w-auto"
        >
          <Plus size={16} md:size={18} strokeWidth={3} />
          Forge New Prompt
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border border-[#E2E8F0] flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-full md:min-w-[300px] relative">
          <CustomSelect
            options={[
              { value: "", label: "All Active Modules" },
              ...pmFeatures.map(f => ({ value: String(f.id), label: f.feature || f.name }))
            ]}
            value={selectedFeature}
            onChange={(val) => setSelectedFeature(val)}
            placeholder={featuresLoading ? "Loading system modules..." : "Select Module"}
            isDisabled={featuresLoading}
            label="Module Filter"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-accent/5 border-l-4 border-accent text-accent rounded-xl animate-in fade-in duration-300">
          <p className="text-sm font-bold">Error: {error}</p>
          <button
            onClick={() => dispatch(clearError())}
            className="text-xs underline mt-1 font-black uppercase tracking-widest opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white shadow-2xl shadow-gray-200/50 border border-[#E2E8F0] rounded-2xl md:rounded-[2rem] overflow-hidden">
        <DataTable
        columns={[
          {
            header: "Template Intelligence",
            accessor: "title",
            cell: (r) => (
              <div className="space-y-1">
                <p className="font-bold text-[#0F172A] group-hover:text-accent transition-colors">{r.title}</p>
                <p className="text-xs text-[#64748B] font-medium line-clamp-2 max-w-md leading-relaxed italic opacity-80">
                  {typeof r.prompt === 'string' ? r.prompt : ''}
                </p>
              </div>
            )
          },
          {
            header: "Blueprint Type",
            accessor: "type",
            cell: (r) => (
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-blue-100/50 shadow-sm shadow-blue-500/5">
                {r.type || "DOCUMENTS"}
              </span>
            )
          },
          {
            header: "Module",
            accessor: "feature_id",
            cell: (r) => {
              const feature = pmFeatures.find(f => String(f.id) === String(r.feature_id));
              return (
                <div className="flex items-center gap-2 text-sm font-bold text-[#475569]">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  {feature ? feature.feature || feature.name : "Core System"}
                </div>
              );
            }
          },
          {
            header: "Dynamic Keys",
            accessor: "variables",
            cell: (r) => (
              <div className="flex flex-wrap gap-2 max-w-xs">
                {r.variables && r.variables.length > 0 ? (
                  <>
                    {r.variables.slice(0, 2).map((v, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-[#F1F5F9] text-[#64748B] rounded font-mono text-[10px] font-bold border border-[#E2E8F0] shadow-sm">
                        ${v.name}
                      </span>
                    ))}
                    {r.variables.length > 2 && (
                      <span className="px-2 py-0.5 bg-accent/10 text-accent rounded font-black text-[10px] border border-accent/10">
                        +{r.variables.length - 2} KEYS
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-[10px] font-black text-[#94A3B8] uppercase italic">Static Logic</span>
                )}
              </div>
            )
          }
        ]}
        data={prompts}
        loading={loading}
        pagination={{ page: currentPage, limit, totalPages, totalRecords: total }}
        onPageChange={(p) => setCurrentPage(p)}
        onLimitChange={(l) => { setLimit(l); setCurrentPage(1); }}
        renderActions={(prompt) => (
          <div className="relative" ref={openMenuId === prompt.prompt_id ? menuRef : null}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(openMenuId === prompt.prompt_id ? null : prompt.prompt_id);
              }}
              className={`p-3 rounded-xl transition-all duration-200 cursor-pointer relative z-10 ${openMenuId === prompt.prompt_id ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'hover:bg-accent/5 text-[#94A3B8] hover:text-accent'}`}
            >
              <EllipsisVertical size={20} />
            </button>
            {openMenuId === prompt.prompt_id && (
              <div className="absolute right-12 top-0 bg-white border border-[#E2E8F0] shadow-2xl rounded-2xl w-48 z-[100] py-2 animate-in zoom-in-95 duration-200 origin-top-right">
                <ul className="text-[#475569] text-sm font-bold">
                  <li
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/prompts/view/${prompt.prompt_id}`);
                      setOpenMenuId(null);
                    }}
                    className="px-4 py-3 flex items-center gap-3 hover:bg-[#F8FAFC] hover:text-accent cursor-pointer transition-all mx-2 rounded-xl"
                  >
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 border border-green-100/50">
                      <Eye size={16} />
                    </div>
                    Preview
                  </li>
                  <li
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/prompts/edit/${prompt.prompt_id}`);
                      setOpenMenuId(null);
                    }}
                    className="px-4 py-3 flex items-center gap-3 hover:bg-[#F8FAFC] hover:text-accent cursor-pointer transition-all mx-2 rounded-xl"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100/50">
                      <Edit size={16} />
                    </div>
                    Configure
                  </li>
                  <li
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPrompt(prompt);
                      setShowDeleteModal(true);
                      setOpenMenuId(null);
                    }}
                    className="px-4 py-3 flex items-center gap-3 hover:bg-accent/5 hover:text-accent cursor-pointer transition-all mx-2 rounded-xl text-accent"
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
                      <Trash2 size={16} />
                    </div>
                    Destroy
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      />
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPrompt && (
        <div className="fixed inset-0 flex items-center justify-center z-[150] p-4 backdrop-blur-md bg-white/30 animate-in fade-in duration-300">
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="w-16 h-16 bg-accent/5 rounded-[2rem] flex items-center justify-center text-accent mb-6 mx-auto shadow-sm">
                <Trash2 size={32} strokeWidth={2} />
              </div>

              <div className="text-center space-y-2 mb-8">
                <h2 className="text-xl font-black text-[#0F172A] tracking-tight">Destroy Logic Template?</h2>
                <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10 mt-4">
                  <p className="text-xs font-black text-accent uppercase tracking-widest mb-1 italic">Mission Critical Warning</p>
                  <p className="text-sm font-medium text-[#64748B]">
                    Are you sure you want to permanently erase <span className="text-accent font-black">"{selectedPrompt.title}"</span>? This will dismantle this intelligence blueprint.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedPrompt(null);
                  }}
                  className="flex-1 py-4 px-6 rounded-2xl border-2 border-[#E2E8F0] bg-white text-sm font-black text-[#64748B] uppercase tracking-widest hover:bg-[#F1F5F9] transition-all active:scale-95"
                >
                  Abort
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-4 px-6 bg-accent text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-[#8D270B] shadow-lg shadow-accent/20 transition-all active:scale-95 cursor-pointer"
                >
                  Confirm Destroy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptsList;
