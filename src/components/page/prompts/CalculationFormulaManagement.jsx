import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { EllipsisVertical, Edit, Trash2, Plus, X } from "lucide-react";
import {
  fetchAllFormulas,
  createFormula,
  updateFormula,
  deleteFormula,
  clearError,
} from "../../../redux/slice/CalculationFormulaSlice";
import {
  fetchAllPMFeatures,
  createPMFeature,
} from "../../../redux/slice/PMFeatureSlice";
import DataTable from "../../common/DataTable";
import CustomSelect from "../../common/CustomSelect";


const CalculationFormulaManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Redux state
  const { formulas, loading, error, pagination } = useSelector((state) => state.calculationFormula);
  const { pmFeatures, loading: featuresLoading } = useSelector((state) => state.pmFeature);


  // Local state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" or "edit"
  const [selectedFormula, setSelectedFormula] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [newFeatureName, setNewFeatureName] = useState("");
  const [formState, setFormState] = useState({

    name: "",
    formula: "",
    description: "",
    ref_id: "",
  });

  // Fetch data on mount and when page/limit changes
  useEffect(() => {
    dispatch(fetchAllFormulas({ page: currentPage, limit }));
    dispatch(fetchAllPMFeatures({ limit: 100 })); // Fetch all for dropdown
  }, [dispatch, currentPage, limit]);


  // Open add modal
  const openAddModal = () => {
    setModalType("add");
    setSelectedFormula(null);
    setFormState({ name: "", formula: "", description: "", ref_id: "" });
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (formula) => {
    setModalType("edit");
    setSelectedFormula(formula);
    setFormState({
      name: formula.name || "",
      formula: formula.formula || "",
      description: formula.description || "",
      ref_id: formula.ref_id || "",
    });
    setShowModal(true);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalType === "add") {
        await dispatch(createFormula(formState)).unwrap();
      } else {
        await dispatch(
          updateFormula({
            id: selectedFormula.id,
            ...formState,
          })
        ).unwrap();
      }
      setShowModal(false);
      setFormState({ name: "", formula: "", description: "", ref_id: "" });
      dispatch(fetchAllFormulas({ page: currentPage, limit }));
    } catch (error) {
      console.error("Failed to save formula:", error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedFormula) return;

    try {
      await dispatch(deleteFormula(selectedFormula.id)).unwrap();
      setShowDeleteModal(false);
      setSelectedFormula(null);
      dispatch(fetchAllFormulas({ page: currentPage, limit }));
    } catch (error) {
      console.error("Failed to delete formula:", error);
    }
  };

  // Handle create new feature
  const handleCreateFeature = async (e) => {
    e.preventDefault();
    if (!newFeatureName.trim()) return;

    try {
      const result = await dispatch(createPMFeature({ feature: newFeatureName })).unwrap();
      setShowFeatureModal(false);
      setNewFeatureName("");
      // Update formState with the new feature's name/ID
      setFormState({ ...formState, ref_id: result.data?.feature || result.feature || newFeatureName });
      dispatch(fetchAllPMFeatures({ limit: 100 }));
    } catch (error) {
      console.error("Failed to create feature:", error);
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
            { name: "Calculation Formulas", path: "/prompts/formulas" },
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
          <h1 className="text-2xl md:text-xl font-bold text-[#0F172A] tracking-tight">
            Calculation Formulas
          </h1>
          <p className="text-[12px] md:text-sm font-medium text-[#64748B]">
            Manage dynamic formulas for AI-driven construction calculations.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-6 md:px-8 py-3 md:py-4 bg-accent text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-[#8D270B] shadow-lg md:shadow-xl shadow-accent/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer w-full md:w-auto"
        >
          <Plus size={16} md:size={18} strokeWidth={3} />
          Add Formula
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

      <div className="bg-white shadow-2xl shadow-gray-200/50 border border-[#E2E8F0] rounded-2xl md:rounded-[2rem] overflow-hidden">
        <DataTable
          columns={[
            {
              header: "ID",
              accessor: "id",
              cell: (r) => (
                <span className="px-3 py-1 bg-[#F1F5F9] rounded-lg text-xs font-black text-[#64748B]">
                  #{r.id}
                </span>
              )
            },
            {
              header: "Name",
              accessor: "name",
              cell: (r) => (
                <span className="text-sm font-bold text-[#0F172A]">
                  {r.name || "--"}
                </span>
              )
            },
            {
              header: "Ref ID",
              accessor: "ref_id",
              cell: (r) => (
                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-black uppercase tracking-wider">
                  {r.ref_id || "--"}
                </span>
              )
            },
            {
              header: "Formula",
              accessor: "formula",
              cell: (r) => (
                <code className="text-xs font-mono bg-slate-50 p-1 rounded border border-slate-100 text-slate-600 block max-w-xs truncate">
                  {r.formula || "--"}
                </code>
              )
            },
          ]}
          data={formulas}
          loading={loading}
          pagination={{ 
            page: currentPage, 
            limit, 
            totalPages: pagination.totalPages, 
            totalRecords: pagination.totalItems 
          }}
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
                      Edit
                    </li>
                    <li
                      onClick={() => {
                        setSelectedFormula(f);
                        setShowDeleteModal(true);
                        setOpenMenuId(null);
                      }}
                      className="px-4 py-3 flex items-center gap-3 hover:bg-accent/5 hover:text-accent cursor-pointer transition-all mx-2 rounded-xl text-accent"
                    >
                      <div className="w-8 h-8 rounded-lg bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
                        <Trash2 size={16} />
                      </div>
                      Delete
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        />
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[150] p-4 backdrop-blur-md bg-white/30 animate-in fade-in duration-300">
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-8 pb-0 flex-shrink-0">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                    {modalType === "add" ? <Plus size={24} strokeWidth={3} /> : <Edit size={24} strokeWidth={2} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
                      {modalType === "add" ? "Create New Formula" : "Update Formula"}
                    </h2>
                    <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mt-1">Calculation Engine</p>
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
              <form id="formula-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Formula Name</label>
                    <input
                      type="text"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      placeholder="e.g. Steel Quantity Calculation"
                      className="w-full bg-[#F8FAFC] border-2 border-transparent focus:border-accent/20 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-[#0F172A] transition-all outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <CustomSelect
                      label="Reference ID"
                      options={[
                        { value: "ADD_NEW_FEATURE", label: "+ Add New Feature" },
                        ...pmFeatures.map(f => ({ value: f.feature || f.name, label: f.feature || f.name })),
                      ]}
                      value={formState.ref_id}
                      onChange={(val) => {
                        if (val === "ADD_NEW_FEATURE") {
                          setShowFeatureModal(true);
                        } else {
                          setFormState({ ...formState, ref_id: val });
                        }
                      }}
                      placeholder={featuresLoading ? "Loading..." : "Select Feature"}
                      required
                    />
                  </div>

                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Formula Logic</label>
                  <textarea
                    value={formState.formula}
                    onChange={(e) => setFormState({ ...formState, formula: e.target.value })}
                    placeholder="Total Weight = Length * Unit Weight (D²/162)"
                    className="w-full bg-[#F8FAFC] border-2 border-transparent focus:border-accent/20 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-[#0F172A] transition-all outline-none min-h-[100px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Description</label>
                  <textarea
                    value={formState.description}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                    placeholder="Standard calculation for steel bar weight..."
                    className="w-full bg-[#F8FAFC] border-2 border-transparent focus:border-accent/20 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-[#0F172A] transition-all outline-none min-h-[80px]"
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
                Cancel
              </button>
              <button
                type="submit"
                form="formula-form"
                className="flex-[2] py-4 px-8 bg-accent text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-[#8D270B] shadow-lg shadow-accent/30 transition-all active:scale-95 cursor-pointer"
              >
                {modalType === "add" ? "Save Formula" : "Update Formula"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedFormula && (
        <div className="fixed inset-0 flex items-center justify-center z-[150] p-4 backdrop-blur-md bg-white/30 animate-in fade-in duration-300">
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="w-16 h-16 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 mb-6 mx-auto shadow-sm">
                <Trash2 size={32} strokeWidth={2} />
              </div>

              <div className="text-center space-y-2 mb-8">
                <h2 className="text-xl font-black text-[#0F172A] tracking-tight">Delete Formula?</h2>
                <p className="text-sm font-medium text-[#64748B]">
                  Are you sure you want to delete <span className="text-rose-600 font-black">"{selectedFormula.name}"</span>? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedFormula(null);
                  }}
                  className="flex-1 py-4 px-6 rounded-2xl border-2 border-[#E2E8F0] bg-white text-sm font-black text-[#64748B] uppercase tracking-widest hover:bg-[#F1F5F9] transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-4 px-6 bg-rose-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all active:scale-95 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Feature Modal */}
      {showFeatureModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] p-4 backdrop-blur-md bg-white/30 animate-in fade-in duration-300">
          <div className="relative bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95 duration-300">
            <div className="p-8 pb-0">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                    <Plus size={20} strokeWidth={3} />
                  </div>
                  <h2 className="text-lg font-black text-[#0F172A]">New Platform Feature</h2>
                </div>
                <button
                  onClick={() => setShowFeatureModal(false)}
                  className="p-2 bg-[#F8FAFC] text-[#94A3B8] rounded-xl"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-8">
              <form onSubmit={handleCreateFeature} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Feature Name</label>
                  <input
                    type="text"
                    value={newFeatureName}
                    onChange={(e) => setNewFeatureName(e.target.value)}
                    placeholder="e.g. reinforcement_estimation"
                    className="w-full bg-[#F8FAFC] border-2 border-transparent focus:border-accent/20 focus:bg-white rounded-xl px-4 py-3 text-sm font-bold text-[#0F172A] transition-all outline-none"
                    required
                    autoFocus
                  />
                </div>
                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFeatureModal(false)}
                    className="flex-1 py-3 px-6 rounded-xl border-2 border-[#E2E8F0] bg-white text-xs font-black text-[#64748B] uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-3 px-6 bg-accent text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-accent/20"
                  >
                    Add Feature
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default CalculationFormulaManagement;
