import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { EllipsisVertical, Edit, Trash2, Loader2, Plus, X, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import {
  fetchAllPMFeatures,
  createPMFeature,
  updatePMFeature,
  deletePMFeature,
  clearError,
} from "../../../redux/slice/PMFeatureSlice";
import DataTable from "../../common/DataTable";

const PMFeatureManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Redux state
  const { pmFeatures, loading, error, total, totalPages, currentPage: reduxCurrentPage } = useSelector((state) => state.pmFeature);

  // Local state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" or "edit"
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formState, setFormState] = useState({
    feature: "",
  });

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchAllPMFeatures({ page: currentPage, limit }));
  }, [dispatch, currentPage, limit]);

  // Open add modal
  const openAddModal = () => {
    setModalType("add");
    setSelectedFeature(null);
    setFormState({ feature: "" });
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (feature) => {
    setModalType("edit");
    setSelectedFeature(feature);
    setFormState({
      feature: feature.feature || feature.name || "",
    });
    setShowModal(true);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalType === "add") {
        await dispatch(createPMFeature(formState)).unwrap();
      } else {
        await dispatch(
          updatePMFeature({
            id: selectedFeature.id,
            feature: formState.feature,
          })
        ).unwrap();
      }
      setShowModal(false);
      setFormState({ feature: "" });
      dispatch(fetchAllPMFeatures());
    } catch (error) {
      console.error("Failed to save feature:", error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedFeature) return;

    try {
      await dispatch(deletePMFeature(selectedFeature.id)).unwrap();
      setShowDeleteModal(false);
      setSelectedFeature(null);
      dispatch(fetchAllPMFeatures());
    } catch (error) {
      console.error("Failed to delete feature:", error);
    }
  };

  return (
    <div className="space-y-8 p-8 bg-[#F8FAFC] w-full min-h-screen" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      {/* Navigation Tabs */}
      <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-[#E2E8F0]">
        <div className="flex gap-2">
          {[
            { name: "Prompts", path: "/prompts" },
            { name: "PM Features", path: "/prompts/features" },
            { name: "Prompt References", path: "/prompts/references" },
          ].map((tab) => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${location.pathname === tab.path
                ? "bg-accent text-white shadow-lg shadow-accent/20"
                : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">
            PM Features
          </h1>
          <p className="text-sm font-medium text-[#64748B]">
            Categorize and manage core system modules for prompt engineering.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-8 py-4 bg-accent text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#8D270B] shadow-xl shadow-accent/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} strokeWidth={3} />
          Add Feature
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-50 border-l-4 border-rose-400 text-rose-700 rounded-lg animate-in fade-in duration-300">
          <p className="text-sm font-bold">Error: {error}</p>
          <button
            onClick={() => dispatch(clearError())}
            className="text-xs underline mt-1 font-black uppercase tracking-widest opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      <DataTable
        columns={[
          {
            header: "Feature ID",
            accessor: "id",
            cell: (r) => (
              <span className="px-3 py-1 bg-[#F1F5F9] rounded-lg text-xs font-black text-[#64748B] group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
                #{r.id}
              </span>
            )
          },
          {
            header: "Operational Title",
            accessor: "feature",
            cell: (r) => (
              <span className="text-sm font-bold text-[#0F172A]">
                {r.feature || r.name || "--"}
              </span>
            )
          },
        ]}
        data={pmFeatures}
        loading={loading}
        pagination={{ page: currentPage, limit, totalPages, totalRecords: total }}
        onPageChange={(p) => setCurrentPage(p)}
        onLimitChange={(l) => { setLimit(l); setCurrentPage(1); }}
        renderActions={(f) => (
          <div className="relative">
            <button
              onClick={() => setOpenMenuId(openMenuId === f.id ? null : f.id)}
              className={`p-3 rounded-xl transition-all duration-200 cursor-pointer ${openMenuId === f.id ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'hover:bg-accent/5 text-[#94A3B8] hover:text-accent'}`}
            >
              <EllipsisVertical size={20} />
            </button>
            {openMenuId === f.id && (
              <div className="absolute right-12 top-0 bg-white border border-[#E2E8F0] shadow-2xl rounded-2xl w-48 z-[100] py-2 animate-in zoom-in-95 duration-200 origin-top-right">
                <ul className="text-[#475569] text-sm font-bold">
                  <li
                    onClick={() => {
                      openEditModal(f);
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
                    onClick={() => {
                      setSelectedFeature(f);
                      setShowDeleteModal(true);
                      setOpenMenuId(null);
                    }}
                    className="px-4 py-3 flex items-center gap-3 hover:bg-accent/5 hover:text-accent cursor-pointer transition-all mx-2 rounded-xl text-accent"
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
                      <Trash2 size={16} />
                    </div>
                    Purge
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      />

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[150] p-4 backdrop-blur-md bg-white/30 animate-in fade-in duration-300">
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-8 pb-0 flex-shrink-0">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                    {modalType === "add" ? <Plus size={24} strokeWidth={3} /> : <Edit size={24} strokeWidth={2} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
                      {modalType === "add" ? "New Platform Feature" : "Modify Feature Hub"}
                    </h2>
                    <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mt-1">Feature Repository</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-3 bg-[#F8FAFC] text-[#94A3B8] hover:text-[#0F172A] rounded-2xl transition-all active:scale-95"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar">
              <form id="feat-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">Operational Feature Name</label>
                    <span className="text-[10px] font-black text-accent uppercase italic">* Required</span>
                  </div>
                  <input
                    type="text"
                    value={formState.feature}
                    onChange={(e) =>
                      setFormState({ ...formState, feature: e.target.value })
                    }
                    placeholder="e.g. generate_documents"
                    className="w-full bg-[#F8FAFC] border-2 border-transparent focus:border-accent/20 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-[#0F172A] transition-all outline-none placeholder:text-[#94A3B8] placeholder:font-medium"
                    required
                  />
                  <p className="text-[10px] text-[#94A3B8] font-bold italic px-1">Tip: Use snake_case for technical features or Title Case for UI features.</p>
                </div>
              </form>
            </div>

            <div className="p-8 border-t border-[#F1F5F9] bg-[#F8FAFC]/50 flex gap-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-4 px-6 rounded-2xl border-2 border-[#E2E8F0] bg-white text-sm font-black text-[#64748B] uppercase tracking-widest hover:bg-[#F1F5F9] transition-all active:scale-95"
              >
                Back
              </button>
              <button
                type="submit"
                form="feat-form"
                className="flex-[2] py-4 px-8 bg-accent text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-[#8D270B] shadow-lg shadow-accent/30 transition-all active:scale-95 cursor-pointer"
              >
                {modalType === "add" ? "Register Feature" : "Sync Lifecycle"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedFeature && (
        <div className="fixed inset-0 flex items-center justify-center z-[150] p-4 backdrop-blur-md bg-white/30 animate-in fade-in duration-300">
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="w-16 h-16 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 mb-6 mx-auto shadow-sm">
                <Trash2 size={32} strokeWidth={2} />
              </div>

              <div className="text-center space-y-2 mb-8">
                <h2 className="text-xl font-black text-[#0F172A] tracking-tight">Decommission Feature?</h2>
                <div className="p-4 bg-rose-50/30 rounded-2xl border border-rose-100 mt-4">
                  <p className="text-xs font-black text-rose-600 uppercase tracking-widest mb-1 italic">Structural Impact Warning</p>
                  <p className="text-sm font-medium text-[#64748B]">
                    Removing <span className="text-rose-600 font-black">"{selectedFeature.feature || selectedFeature.name}"</span> will orphan all prompts currently mapped to this module.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedFeature(null);
                  }}
                  className="flex-1 py-4 px-6 rounded-2xl border-2 border-[#E2E8F0] bg-white text-sm font-black text-[#64748B] uppercase tracking-widest hover:bg-[#F1F5F9] transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-4 px-6 bg-rose-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all active:scale-95 cursor-pointer"
                >
                  Terminate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PMFeatureManagement;
