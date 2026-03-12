import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EllipsisVertical, Eye, Lock, Ban, X, Plus, Layers, Calendar, Info, Trash2 } from "lucide-react";
import {
  addFeature,
  deleteFeature,
  fetchAllFeature,
  updateFeature,
} from "../../../redux/slice/RolesPermission/FeatureSlice";
import DataTable from "../../common/DataTable";
import { toast } from "react-toastify";

const Feature = () => {
  const dispatch = useDispatch();
  const { Features, loading, pagination } = useSelector((state) => state.feature);
  const menuRef = useRef(null);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" | "edit" | "view" | "delete"
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [formState, setFormState] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  const [page, setPage] = useState(pagination?.page || 1);
  const [limit, setLimit] = useState(pagination?.limit || 10);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchAllFeature({ page, limit, search }));
  }, [dispatch, page, limit, search]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (!event.target.closest('button[class*="rounded-xl"]')) {
          setOpenMenuId(null);
        }
      }
    };
    if (openMenuId) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formState.name.trim()) return toast.error("Feature Name is required");

    const payload = {
      name: formState.name,
      description: formState.description,
      is_active: formState.is_active,
    };

    if (modalType === "edit" && selectedFeature) {
      dispatch(updateFeature({ id: selectedFeature.id, updatedData: payload }))
        .unwrap()
        .then(() => {
          toast.success("Feature Protocol Modified!");
          setShowModal(false);
          dispatch(fetchAllFeature({ page, limit, search }));
        });
    } else {
      dispatch(addFeature(payload))
        .unwrap()
        .then(() => {
          toast.success("Feature Protocol Initialized!");
          setShowModal(false);
          setFormState({ name: "", description: "", is_active: true });
          dispatch(fetchAllFeature({ page, limit, search }));
        });
    }
  };

  const handleDelete = () => {
    if (!selectedFeature) return;
    dispatch(deleteFeature(selectedFeature.id))
      .unwrap()
      .then(() => {
        toast.success("Feature Protocol Dismantled!");
        setShowModal(false);
        dispatch(fetchAllFeature({ page, limit, search }));
      });
  };

  const columns = [
    {
      header: "Feature Module",
      accessor: "name",
      cell: (r) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
            <Layers size={18} />
          </div>
          <div>
            <p className="font-black text-[#0F172A]">{r.name}</p>
            <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest mt-0.5">Functional Block Entity</p>
          </div>
        </div>
      )
    },
    {
      header: "Description",
      accessor: "description",
      cell: (r) => (
        <p className="text-sm font-medium text-[#64748B] max-w-[250px] truncate">
          {r.description || "No description provided"}
        </p>
      )
    },
    {
      header: "Registry Date",
      accessor: "createdAt",
      cell: (r) => (
        <div className="flex items-center gap-2 text-[#475569] font-bold">
          <Calendar size={14} className="text-[#94A3B8]" />
          {new Date(r.createdAt).toLocaleDateString()}
        </div>
      )
    },
  ];

  const renderActions = (feature) => (
    <div className="relative" ref={openMenuId === feature.id ? menuRef : null}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenuId(openMenuId === feature.id ? null : feature.id);
        }}
        className={`p-3 rounded-xl transition-all duration-200 cursor-pointer ${openMenuId === feature.id ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'hover:bg-accent/5 text-[#94A3B8] hover:text-accent'}`}
      >
        <EllipsisVertical size={20} />
      </button>

      {openMenuId === feature.id && (
        <div className="absolute right-12 top-0 bg-white border border-[#E2E8F0] shadow-2xl rounded-2xl w-48 z-[100] py-2 animate-in zoom-in-95 duration-200 origin-top-right">
          <ul className="text-[#475569] text-sm font-bold">
            <li
              onClick={() => {
                setSelectedFeature(feature);
                setModalType("view");
                setShowModal(true);
                setOpenMenuId(null);
              }}
              className="px-4 py-3 flex items-center gap-3 hover:bg-[#F8FAFC] hover:text-accent cursor-pointer transition-all mx-2 rounded-xl"
            >
              <div className="w-8 h-8 rounded-lg bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
                <Eye size={16} />
              </div>
              Inspect
            </li>
            <li
              onClick={() => {
                setSelectedFeature(feature);
                setFormState({
                  name: feature.name,
                  description: feature.description || "",
                  is_active: feature.is_active ?? true,
                });
                setModalType("edit");
                setShowModal(true);
                setOpenMenuId(null);
              }}
              className="px-4 py-3 flex items-center gap-3 hover:bg-[#F8FAFC] hover:text-accent cursor-pointer transition-all mx-2 rounded-xl"
            >
              <div className="w-8 h-8 rounded-lg bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
                <Lock size={16} />
              </div>
              Configure
            </li>
            <li
              onClick={() => {
                setSelectedFeature(feature);
                setModalType("delete");
                setShowModal(true);
                setOpenMenuId(null);
              }}
              className="px-4 py-3 flex items-center gap-3 hover:bg-accent/5 hover:text-accent cursor-pointer transition-all mx-2 rounded-xl text-accent"
            >
              <div className="w-8 h-8 rounded-lg bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
                <Ban size={16} />
              </div>
              Purge
            </li>
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-8 px-4 sm:px-8 py-4 sm:py-8 bg-[#F8FAFC] w-full min-h-screen" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Feature-Metrix</h1>
          <p className="text-sm font-medium text-[#64748B]">Orchestrate and manage functional modules within the system framework.</p>
        </div>

        <button
          onClick={() => {
            setSelectedFeature(null);
            setFormState({ name: "", description: "", is_active: true });
            setModalType("add");
            setShowModal(true);
          }}
          className="px-8 py-4 bg-accent text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#8D270B] shadow-xl shadow-accent/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} strokeWidth={3} />
          Initialize Feature
        </button>
      </div>

      <DataTable
        columns={columns}
        data={Features}
        loading={loading}
        renderActions={renderActions}
        rowKey={(row) => row.id}
        showSearch
        onSearch={(q) => { setSearch(q); setPage(1); }}
        pagination={pagination}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
      />

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[150] p-4 backdrop-blur-md bg-white/30 animate-in fade-in duration-300">
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="p-8 pb-0 flex-shrink-0">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                    {modalType === "add" ? <Plus size={24} strokeWidth={3} /> : modalType === "edit" ? <Lock size={24} strokeWidth={2} /> : modalType === "view" ? <Eye size={24} /> : <Ban size={24} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
                      {modalType === "add" ? "Initialize Protocol" : modalType === "edit" ? "Modify Principle" : modalType === "view" ? "Feature Intelligence" : "Eliminate Principle"}
                    </h2>
                    <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mt-1">Functional Module Logic</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 bg-[#F8FAFC] text-[#94A3B8] hover:text-[#0F172A] rounded-2xl transition-all active:scale-95 cursor-pointer">
                  <X size={20} strokeWidth={3} />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto">
              {(modalType === "add" || modalType === "edit") && (
                <form id="feature-form" onSubmit={handleSubmitForm} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Functional Identifier <span className="text-accent">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={formState.name}
                      onChange={handleFormChange}
                      className="w-full bg-[#F8FAFC] border-2 border-transparent focus:border-accent/20 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-[#0F172A] transition-all outline-none"
                      placeholder="Enter feature identity..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Scope Descriptor</label>
                    <textarea
                      name="description"
                      value={formState.description}
                      onChange={handleFormChange}
                      className="w-full bg-[#F8FAFC] border-2 border-transparent focus:border-accent/20 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-[#0F172A] transition-all outline-none resize-none"
                      placeholder="Describe functional boundaries..."
                      rows="3"
                    />
                  </div>
                </form>
              )}

              {modalType === "view" && selectedFeature && (
                <div className="space-y-6 bg-[#F8FAFC] p-6 rounded-3xl border border-[#E2E8F0]">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Descriptor Identity</p>
                    <p className="text-lg font-black text-[#0F172A]">{selectedFeature.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">System Telemetry</p>
                    <p className="text-xs font-bold text-[#475569] flex items-center gap-2">
                      <Calendar size={12} />
                      Created: {new Date(selectedFeature.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {selectedFeature.description && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Functional Scope</p>
                      <p className="text-sm font-medium text-[#64748B] italic leading-relaxed">{selectedFeature.description}</p>
                    </div>
                  )}
                </div>
              )}

              {modalType === "delete" && selectedFeature && (
                <div className="flex flex-col text-center">
                  <div className="w-20 h-20 bg-accent/5 rounded-[2.5rem] flex items-center justify-center text-accent mb-6 mx-auto shadow-sm">
                    <Trash2 size={40} strokeWidth={2} />
                  </div>
                  <h3 className="text-2xl font-black text-[#0F172A] tracking-tight mb-2">Eliminate Module?</h3>
                  <div className="p-5 bg-accent/5 rounded-3xl border border-accent/10 mt-6 text-left">
                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-2 italic">Structural Risk Assessment</p>
                    <p className="text-sm font-medium text-[#64748B] leading-relaxed">
                      Removing <span className="text-accent font-black">"{selectedFeature.name}"</span> will permanently dismantle its presence across the functional hierarchy.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-[#F1F5F9] bg-[#F8FAFC]/50 flex gap-4">
              <button onClick={() => setShowModal(false)} className="flex-1 py-4 px-6 rounded-2xl border-2 border-[#E2E8F0] bg-white text-sm font-black text-[#64748B] uppercase tracking-widest hover:bg-[#F1F5F9] transition-all active:scale-95 cursor-pointer">Abort</button>
              {modalType !== "view" && (
                <button
                  form={modalType !== "delete" ? "feature-form" : undefined}
                  onClick={modalType === "delete" ? handleDelete : undefined}
                  className={`flex-[2] py-4 px-8 ${modalType === "delete" ? "bg-accent" : "bg-accent"} text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-accent/20 hover:bg-[#8D270B] transition-all active:scale-95 cursor-pointer`}
                >
                  {modalType === "add" ? "Deploy Logic" : modalType === "edit" ? "Sync Registry" : "Confirm Purge"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feature;
