import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { EllipsisVertical, Edit, Trash2, Loader2, Plus, X, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import {
  fetchAllPromptReferences,
  createPromptReference,
  updatePromptReference,
  deletePromptReference,
  clearError,
} from "../../../redux/slice/PromptReferenceSlice";
import DataTable from "../../common/DataTable";

const PromptReferenceManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Redux state
  const { promptReferences, loading, error, total, totalPages, currentPage: reduxCurrentPage } = useSelector(
    (state) => state.promptReference
  );

  // Local state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" or "edit"
  const [selectedReference, setSelectedReference] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    details: "",
  });

  // Fetch data on mount and page change
  useEffect(() => {
    dispatch(fetchAllPromptReferences({ page: currentPage, limit }));
  }, [dispatch, currentPage, limit]);

  // Open add modal
  const openAddModal = () => {
    setModalType("add");
    setSelectedReference(null);
    setFormState({ name: "", details: "" });
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (reference) => {
    setModalType("edit");
    setSelectedReference(reference);
    setFormState({
      name: reference.name || "",
      details: reference.details || "",
    });
    setShowModal(true);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalType === "add") {
        await dispatch(createPromptReference(formState)).unwrap();
      } else {
        await dispatch(
          updatePromptReference({
            id: selectedReference.id,
            name: formState.name,
            details: formState.details,
          })
        ).unwrap();
      }
      setShowModal(false);
      setFormState({ name: "", details: "" });
      dispatch(fetchAllPromptReferences({ page: currentPage, limit }));
    } catch (error) {
      console.error("Failed to save reference:", error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedReference) return;

    try {
      await dispatch(deletePromptReference(selectedReference.id)).unwrap();
      setShowDeleteModal(false);
      setSelectedReference(null);
      dispatch(fetchAllPromptReferences({ page: currentPage, limit }));
    } catch (error) {
      console.error("Failed to delete reference:", error);
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
            Prompt References
          </h1>
          <p className="text-sm font-medium text-[#64748B]">
            Configure and manage global variables for your AI prompt generation logic.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-8 py-4 bg-accent text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#8D270B] shadow-xl shadow-accent/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} strokeWidth={3} />
          Add Reference
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
          <p className="font-medium">Error: {error}</p>
          <button
            onClick={() => dispatch(clearError())}
            className="text-sm underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      <DataTable
        columns={[
          {
            header: "Reference ID",
            accessor: "id",
            cell: (r) => (
              <span className="px-3 py-1 bg-[#F1F5F9] rounded-lg text-xs font-black text-[#64748B] group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
                #{r.id}
              </span>
            )
          },
          {
            header: "Technical Name",
            accessor: "name",
            cell: (r) => (
              <span className="text-sm font-bold text-[#0F172A] font-mono bg-orange-50/50 px-2 py-0.5 rounded border border-orange-100/50 w-fit">
                {r.name || "--"}
              </span>
            )
          },
          {
            header: "Context Details",
            accessor: "details",
            cell: (r) => (
              <p className="text-sm text-[#475569] font-medium leading-relaxed max-w-md line-clamp-1 italic opacity-80">
                {r.details || "No description provided"}
              </p>
            )
          },
        ]}
        data={promptReferences}
        loading={loading}
        pagination={{ page: currentPage, limit, totalPages, totalRecords: total }}
        onPageChange={(p) => setCurrentPage(p)}
        onLimitChange={(l) => { setLimit(l); setCurrentPage(1); }}
        renderActions={(reference) => (
          <div className="relative">
            <button
              onClick={() => setOpenMenuId(openMenuId === reference.id ? null : reference.id)}
              className={`p-3 rounded-xl transition-all duration-200 cursor-pointer ${openMenuId === reference.id ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'hover:bg-accent/5 text-[#94A3B8] hover:text-accent'}`}
            >
              <EllipsisVertical size={20} />
            </button>
            {openMenuId === reference.id && (
              <div className="absolute right-12 top-0 bg-white border border-[#E2E8F0] shadow-2xl rounded-2xl w-48 z-[100] py-2 animate-in zoom-in-95 duration-200 origin-top-right">
                <ul className="text-[#475569] text-sm font-bold">
                  <li
                    onClick={() => {
                      openEditModal(reference);
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
                      setSelectedReference(reference);
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
                      {modalType === "add" ? "Create Reference" : "Modify Reference"}
                    </h2>
                    <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mt-1">Data Configuration</p>
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
              <form id="ref-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">Technical Handle</label>
                    <span className="text-[10px] font-black text-accent uppercase italic">* Required</span>
                  </div>
                  <input
                    type="text"
                    value={formState.name}
                    onChange={(e) =>
                      setFormState({ ...formState, name: e.target.value })
                    }
                    placeholder="e.g. steel_price_index_2024"
                    className="w-full bg-[#F8FAFC] border-2 border-transparent focus:border-accent/20 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-[#0F172A] transition-all outline-none placeholder:text-[#94A3B8] placeholder:font-medium"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Logic Definition & Context</label>
                  <textarea
                    value={formState.details}
                    onChange={(e) =>
                      setFormState({ ...formState, details: e.target.value })
                    }
                    placeholder="Define how this variable interacts with the prompt logic..."
                    rows="4"
                    className="w-full bg-[#F8FAFC] border-2 border-transparent focus:border-accent/20 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-[#0F172A] transition-all outline-none placeholder:text-[#94A3B8] placeholder:font-medium"
                  />
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
                form="ref-form"
                className="flex-[2] py-4 px-8 bg-accent text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-[#8D270B] shadow-lg shadow-accent/30 transition-all active:scale-95 cursor-pointer"
              >
                {modalType === "add" ? "Initialize Variable" : "Sync Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedReference && (
        <div className="fixed inset-0 flex items-center justify-center z-[150] p-4 backdrop-blur-md bg-white/30 animate-in fade-in duration-300">
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="w-16 h-16 bg-accent/5 rounded-[2rem] flex items-center justify-center text-accent mb-6 mx-auto shadow-sm">
                <Trash2 size={32} strokeWidth={2} />
              </div>

              <div className="text-center space-y-2 mb-8">
                <h2 className="text-xl font-black text-[#0F172A] tracking-tight">Purge Reference?</h2>
                <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10 mt-4">
                  <p className="text-xs font-black text-accent uppercase tracking-widest mb-1 italic">Technical Impact Warning</p>
                  <p className="text-sm font-medium text-[#64748B]">
                    Removing <span className="text-accent font-black">"{selectedReference.name}"</span> may cause failures in prompt generation logic using this key.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedReference(null);
                  }}
                  className="flex-1 py-4 px-6 rounded-2xl border-2 border-[#E2E8F0] bg-white text-sm font-black text-[#64748B] uppercase tracking-widest hover:bg-[#F1F5F9] transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-4 px-6 bg-accent text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-[#8D270B] shadow-lg shadow-accent/10 transition-all active:scale-95 cursor-pointer"
                >
                  Purge Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptReferenceManagement;

