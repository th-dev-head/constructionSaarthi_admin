import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { EllipsisVertical, X, Plus, Calendar, Film, Trash2, Edit, Eye, Info } from "lucide-react";
import {
  addMedia,
  fetchAllMedia,
  updateMedia,
  deleteMedia,
} from "../../../redux/slice/Types/MediaSlice";
import DataTable from "../../common/DataTable";

const MediaType = () => {
  const dispatch = useDispatch();
  const { mediaTypes, loading, pagination } = useSelector((state) => state.media);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" | "edit" | "view" | "delete"
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [formState, setFormState] = useState({ name: "", description: "" });
  const nameRef = useRef(null);
  const menuRef = useRef(null);

  const [page, setPage] = useState(pagination?.page || 1);
  const [limit, setLimit] = useState(pagination?.limit || 10);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchAllMedia({ page, limit, search }));
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

  useEffect(() => {
    if (showModal && (modalType === "add" || modalType === "edit")) {
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [showModal, modalType]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formState.name) return toast.error("Name is required");
    dispatch(addMedia(formState)).then((res) => {
      if (!res.error) {
        toast.success("Media added successfully!");
        setShowModal(false);
        setFormState({ name: "", description: "" });
        dispatch(fetchAllMedia({ page, limit, search }));
      }
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    dispatch(updateMedia({ id: selectedMedia.id, updatedData: formState })).then((res) => {
      if (!res.error) {
        toast.success("Media updated successfully!");
        setShowModal(false);
        dispatch(fetchAllMedia({ page, limit, search }));
      }
    });
  };

  const handleDelete = () => {
    dispatch(deleteMedia(selectedMedia.id)).then((res) => {
      if (!res.error) {
        toast.success("Media deleted successfully!");
        setShowModal(false);
        dispatch(fetchAllMedia({ page, limit, search }));
      }
    });
  };

  const columns = [
    {
      header: "Media Asset Type",
      accessor: "name",
      cell: (r) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
            <Film size={18} />
          </div>
          <div>
            <p className="font-black text-[#0F172A]">{r.name}</p>
            <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest mt-0.5">Content Category</p>
          </div>
        </div>
      )
    },
    {
      header: "Descriptor",
      accessor: "description",
      cell: (r) => <span className="text-sm font-medium text-[#64748B] line-clamp-1 max-w-xs">{r.description || "No description provided"}</span>
    },
    {
      header: "Registry Date",
      accessor: "createdAt",
      cell: (r) => (
        <div className="flex items-center gap-2 text-[#64748B] font-bold text-xs">
          <Calendar size={14} className="text-[#94A3B8]" />
          {new Date(r.createdAt || r.created_at).toLocaleDateString()}
        </div>
      )
    },
  ];

  const renderActions = (media) => (
    <div className="relative" ref={openMenuId === media.id ? menuRef : null}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenuId(openMenuId === media.id ? null : media.id);
        }}
        className={`p-3 rounded-xl transition-all duration-200 cursor-pointer ${openMenuId === media.id ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'hover:bg-accent/5 text-[#94A3B8] hover:text-accent'}`}
      >
        <EllipsisVertical size={20} />
      </button>

      {openMenuId === media.id && (
        <div className="absolute right-12 top-0 bg-white border border-[#E2E8F0] shadow-2xl rounded-2xl w-48 z-[100] py-2 animate-in zoom-in-95 duration-200 origin-top-right">
          <ul className="text-[#475569] text-sm font-bold">
            <li
              onClick={() => {
                setSelectedMedia(media);
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
                setSelectedMedia(media);
                setFormState({ ...media });
                setModalType("edit");
                setShowModal(true);
                setOpenMenuId(null);
              }}
              className="px-4 py-3 flex items-center gap-3 hover:bg-[#F8FAFC] hover:text-accent cursor-pointer transition-all mx-2 rounded-xl"
            >
              <div className="w-8 h-8 rounded-lg bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
                <Edit size={16} />
              </div>
              Modify
            </li>
            <li
              onClick={() => {
                setSelectedMedia(media);
                setModalType("delete");
                setShowModal(true);
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
  );

  return (
    <div className="space-y-8 p-8 bg-[#F8FAFC] w-full min-h-screen" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Media-Types</h1>
          <p className="text-sm font-medium text-[#64748B]">Digital asset classification and management.</p>
        </div>

        <button
          onClick={() => {
            setSelectedMedia(null);
            setFormState({ name: "", description: "" });
            setModalType("add");
            setShowModal(true);
          }}
          className="px-8 py-4 bg-accent text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#8D270B] shadow-xl shadow-accent/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} strokeWidth={3} />
          Initialize Media
        </button>
      </div>

      <DataTable
        columns={columns}
        data={mediaTypes}
        loading={loading}
        renderActions={renderActions}
        rowKey={(row) => row.id}
        showSearch
        onSearch={(q) => {
          setSearch(q);
          setPage(1);
        }}
        pagination={pagination}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
      />

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] p-4 backdrop-blur-md bg-white/30 animate-in fade-in duration-300">
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-[#0F172A] tracking-tight text-center sm:text-left">
                    {modalType === "add" ? "Initialize Media" : modalType === "edit" ? "Modify Media" : modalType === "view" ? "Media Intelligence" : "Eliminate Media"}
                  </h2>
                  <p className="text-[10px] font-black text-accent uppercase tracking-widest opacity-70 italic">Infrastructure Asset Node</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] transition-all"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              {(modalType === "add" || modalType === "edit") && (
                <form className="space-y-6" onSubmit={modalType === "add" ? handleSave : handleUpdate}>
                  <div>
                    <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-2 pl-1 italic">Asset Descriptor Name</label>
                    <input
                      type="text"
                      name="name"
                      ref={nameRef}
                      value={formState.name}
                      onChange={handleFormChange}
                      className="w-full px-5 py-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#0F172A] focus:ring-accent/20 focus:border-accent transition-all outline-none shadow-sm placeholder-[#94A3B8]"
                      placeholder="Enter media handle..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-2 pl-1 italic">Contextual Description</label>
                    <textarea
                      name="description"
                      value={formState.description}
                      onChange={handleFormChange}
                      rows={4}
                      className="w-full px-5 py-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#0F172A] focus:ring-accent/20 focus:border-accent transition-all outline-none shadow-sm placeholder-[#94A3B8]"
                      placeholder="Define the scope of this media type..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-5 bg-accent text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-accent/20 hover:bg-[#8D270B] transition-all active:scale-95 cursor-pointer mt-4"
                  >
                    {modalType === "add" ? "Commit Initialization" : "Commit Modifications"}
                  </button>
                </form>
              )}

              {modalType === "view" && selectedMedia && (
                <div className="p-6 bg-[#F8FAFC] rounded-3xl border border-[#E2E8F0] space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/5 flex items-center justify-center text-accent border border-accent/10 shrink-0">
                      <Film size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Asset Identity</p>
                      <p className="text-xl font-black text-[#0F172A]">{selectedMedia.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/5 flex items-center justify-center text-accent border border-accent/10 shrink-0">
                      <Info size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Defined Scope</p>
                      <p className="text-sm font-medium text-[#475569] leading-relaxed">{selectedMedia.description || "Unspecified protocol parameters."}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-[#64748B] text-xs font-bold font-mono">
                    <span>ASSET ID: {selectedMedia.id}</span>
                    <span>LOGGED: {new Date(selectedMedia.createdAt || selectedMedia.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              )}

              {modalType === "delete" && selectedMedia && (
                <div className="flex flex-col text-center">
                  <div className="w-20 h-20 bg-accent/5 rounded-[2.5rem] flex items-center justify-center text-accent mb-6 mx-auto shadow-sm">
                    <Trash2 size={40} strokeWidth={2} />
                  </div>
                  <h3 className="text-2xl font-black text-[#0F172A] tracking-tight mb-2">Eliminate Media Asset?</h3>
                  <div className="p-5 bg-accent/5 rounded-3xl border border-accent/10 mt-6 text-left">
                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-2 italic">Security Assessment</p>
                    <p className="text-sm font-medium text-[#64748B] leading-relaxed">
                      Removing <span className="text-accent font-black">"{selectedMedia.name}"</span> will permanently dismantle its presence across the digital asset matrix.
                    </p>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-4 px-6 rounded-2xl border-2 border-[#E2E8F0] bg-white text-sm font-black text-[#64748B] uppercase tracking-widest hover:bg-[#F1F5F9] transition-all cursor-pointer">Abort</button>
                    <button onClick={handleDelete} className="flex-[2] py-4 px-8 bg-accent text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-accent/20 hover:bg-[#8D270B] transition-all cursor-pointer">Confirm Purge</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaType;
