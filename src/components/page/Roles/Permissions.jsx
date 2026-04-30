import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { EllipsisVertical, X, Plus, Calendar, ShieldCheck, Eye, Edit, Trash2, Info, CheckCircle2, XCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllPermission,
  addPermission,
  updatePermission,
  deletePermission,
} from "../../../redux/slice/RolesPermission/PermissionSlice";
import { fetchAllRoles } from "../../../redux/slice/RolesPermission/RolesSlice";
import { fetchAllFeature } from "../../../redux/slice/RolesPermission/FeatureSlice";
import DataTable from "../../common/DataTable";
import CustomSelect from "../../common/CustomSelect";

const Permissions = () => {
  const dispatch = useDispatch();
  const { Permissions, loading, pagination } = useSelector((state) => state.permission);
  const { Roles } = useSelector((state) => state.role);
  const { Features } = useSelector((state) => state.feature);
  const menuRef = useRef(null);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" | "edit" | "view" | "delete"
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [formState, setFormState] = useState({
    role_id: "",
    feature_id: "",
    can_read: true,
    can_edit: true,
    can_delete: true,
    can_create: true,
    can_view: true,
  });

  const [page, setPage] = useState(pagination?.page || 1);
  const [limit, setLimit] = useState(pagination?.limit || 10);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchAllRoles());
    dispatch(fetchAllFeature());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAllPermission({ page, limit, search }));
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
    const { name, value, type, checked } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.role_id || !formState.feature_id) {
      return toast.error("Please select role and feature");
    }

    if (modalType === "edit" && selectedPermission) {
      dispatch(updatePermission({ id: selectedPermission.id, payload: formState })).then((res) => {
        if (!res.error) {
          toast.success("Permission Protocol Modified!");
          setShowModal(false);
          dispatch(fetchAllPermission({ page, limit, search }));
        }
      });
    } else {
      dispatch(addPermission(formState)).then((res) => {
        if (!res.error) {
          toast.success("Permission Protocol Initialized!");
          setShowModal(false);
          setFormState({
            role_id: "",
            feature_id: "",
            can_read: true,
            can_edit: true,
            can_delete: true,
            can_create: true,
            can_view: true,
          });
          dispatch(fetchAllPermission({ page, limit, search }));
        } else {
          toast.error(res.payload || "Initialization Failed");
        }
      });
    }
  };

  const handleDelete = () => {
    if (!selectedPermission) return;
    dispatch(deletePermission(selectedPermission.id)).then((res) => {
      if (!res.error) {
        toast.success("Permission Protocol Dismantled!");
        setShowModal(false);
        dispatch(fetchAllPermission({ page, limit, search }));
      } else {
        toast.error("Elimination Failed");
      }
    });
  };

  const PermissionBadge = ({ active, label }) => (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
      {active ? <CheckCircle2 size={12} strokeWidth={3} /> : <XCircle size={12} strokeWidth={3} />}
      <span className="text-[10px] font-black uppercase tracking-tight leading-none">{label}</span>
    </div>
  );

  const columns = [
    {
      header: "Access Matrix",
      accessor: "role_name",
      cell: (r) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="font-black text-[#0F172A]">{r.role_name || "Unassigned"}</p>
            <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest mt-0.5">{r.feature_name || "Global Scope"}</p>
          </div>
        </div>
      )
    },
    {
      header: "Authorized Capabilities",
      accessor: "capabilities",
      cell: (r) => (
        <div className="flex flex-wrap gap-2 max-w-[300px]">
          <PermissionBadge active={r.can_read} label="Read" />
          <PermissionBadge active={r.can_create} label="Write" />
          <PermissionBadge active={r.can_edit} label="Modify" />
          <PermissionBadge active={r.can_delete} label="Purge" />
          <PermissionBadge active={r.can_view} label="Inspect" />
        </div>
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

  const renderActions = (permission) => (
    <div className="relative" ref={openMenuId === permission.id ? menuRef : null}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenuId(openMenuId === permission.id ? null : permission.id);
        }}
        className={`p-3 rounded-xl transition-all duration-200 cursor-pointer ${openMenuId === permission.id ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'hover:bg-accent/5 text-[#94A3B8] hover:text-accent'}`}
      >
        <EllipsisVertical size={20} />
      </button>

      {openMenuId === permission.id && (
        <div className="absolute right-12 top-0 bg-white border border-[#E2E8F0] shadow-2xl rounded-2xl w-48 z-[100] py-2 animate-in zoom-in-95 duration-200 origin-top-right">
          <ul className="text-[#475569] text-sm font-bold">
            <li
              onClick={() => {
                setSelectedPermission(permission);
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
                setSelectedPermission(permission);
                setFormState({ ...permission });
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
                setSelectedPermission(permission);
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
    <div className="space-y-4 sm:space-y-8 px-4 sm:px-8 py-4 sm:py-8 bg-[#F8FAFC] w-full min-h-screen" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">Permission-Matrix</h1>
          <p className="text-sm font-medium text-[#64748B]">Configure access hierarchies and functional authorization protocols.</p>
        </div>

        <button
          onClick={() => {
            setSelectedPermission(null);
            setFormState({
              role_id: "",
              feature_id: "",
              can_read: true,
              can_edit: true,
              can_delete: true,
              can_create: true,
              can_view: true,
            });
            setModalType("add");
            setShowModal(true);
          }}
          className="px-8 py-4 bg-accent text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#8D270B] shadow-xl shadow-accent/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} strokeWidth={3} />
          Initialize Access
        </button>
      </div>

      <DataTable
        columns={columns}
        data={Permissions}
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
                    {modalType === "add" ? <Plus size={24} strokeWidth={3} /> : modalType === "edit" ? <Edit size={24} /> : modalType === "view" ? <Eye size={24} /> : <Trash2 size={24} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#0F172A] tracking-tight text-center sm:text-left">
                      {modalType === "add" ? "Initialize Access" : modalType === "edit" ? "Modify Access" : modalType === "view" ? "Access Intelligence" : "Eliminate Access"}
                    </h2>
                    <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mt-1 italic">Security Authorization Node</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 bg-[#F8FAFC] text-[#94A3B8] hover:text-[#0F172A] rounded-2xl transition-all active:scale-95 cursor-pointer">
                  <X size={20} strokeWidth={3} />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto">
              {(modalType === "add" || modalType === "edit") && (
                <form id="permission-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <CustomSelect
                        options={Roles.map(r => ({ value: String(r.id), label: r.name }))}
                        value={String(formState.role_id)}
                        onChange={(val) => setFormState(prev => ({ ...prev, role_id: val }))}
                        label="Authority Role"
                        placeholder="Select Role"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <CustomSelect
                        options={Features.map(f => ({ value: String(f.id), label: f.name }))}
                        value={String(formState.feature_id)}
                        onChange={(val) => setFormState(prev => ({ ...prev, feature_id: val }))}
                        label="Target Feature"
                        placeholder="Select Feature"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Authorization Matrix</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: "can_read", label: "Read Access" },
                        { key: "can_create", label: "Write Access" },
                        { key: "can_edit", label: "Modify Access" },
                        { key: "can_delete", label: "Purge Access" },
                        { key: "can_view", label: "Inspect Access" },
                      ].map((perm) => (
                        <label key={perm.key} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${formState[perm.key] ? 'bg-accent/5 border-accent text-accent shadow-sm' : 'bg-[#F8FAFC] border-transparent text-[#94A3B8]'}`}>
                          <span className="text-xs font-black uppercase tracking-tight">{perm.label}</span>
                          <input type="checkbox" name={perm.key} checked={formState[perm.key]} onChange={handleFormChange} className="sr-only" />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formState[perm.key] ? 'border-accent bg-accent text-white' : 'border-[#CBD5E1] bg-white text-transparent'}`}>
                            {formState[perm.key] && <CheckCircle2 size={12} strokeWidth={4} />}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </form>
              )}

              {modalType === "view" && selectedPermission && (
                <div className="space-y-6">
                  <div className="bg-[#F8FAFC] p-6 rounded-3xl border border-[#E2E8F0] space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
                      <div>
                        <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Authority Role</p>
                        <p className="text-lg font-black text-[#0F172A]">{selectedPermission.role_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Target Feature</p>
                        <p className="text-lg font-black text-[#0F172A]">{selectedPermission.feature_name}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Capability Ledger</p>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { label: "Read Access", active: selectedPermission.can_read },
                          { label: "Write Access", active: selectedPermission.can_create },
                          { label: "Modify Access", active: selectedPermission.can_edit },
                          { label: "Purge Access", active: selectedPermission.can_delete },
                          { label: "Inspect Access", active: selectedPermission.can_view },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#E2E8F0]">
                            <span className="text-xs font-bold text-[#475569]">{item.label}</span>
                            {item.active ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-rose-400" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {modalType === "delete" && selectedPermission && (
                <div className="flex flex-col text-center">
                  <div className="w-20 h-20 bg-accent/5 rounded-[2.5rem] flex items-center justify-center text-accent mb-6 mx-auto shadow-sm">
                    <Trash2 size={40} strokeWidth={2} />
                  </div>
                  <h3 className="text-2xl font-black text-[#0F172A] tracking-tight mb-2">Eliminate Authorization?</h3>
                  <div className="p-5 bg-accent/5 rounded-3xl border border-accent/10 mt-6 text-left">
                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-2 italic">Security Risk Assessment</p>
                    <p className="text-sm font-medium text-[#64748B] leading-relaxed">
                      Dismantling this access matrix for <span className="text-accent font-black">"{selectedPermission.role_name}"</span> on <span className="text-accent font-black">"{selectedPermission.feature_name}"</span> will immediately terminate all associated functional privileges.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-[#F1F5F9] bg-[#F8FAFC]/50 flex gap-4">
              <button onClick={() => setShowModal(false)} className="flex-1 py-4 px-6 rounded-2xl border-2 border-[#E2E8F0] bg-white text-sm font-black text-[#64748B] uppercase tracking-widest hover:bg-[#F1F5F9] transition-all active:scale-95 cursor-pointer">Abort</button>
              {modalType !== "view" && (
                <button
                  form={modalType !== "delete" ? "permission-form" : undefined}
                  onClick={modalType === "delete" ? handleDelete : undefined}
                  className={`flex-[2] py-4 px-8 bg-accent text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-accent/20 hover:bg-[#8D270B] transition-all active:scale-95 cursor-pointer`}
                >
                  {modalType === "add" ? "Deploy Protocol" : modalType === "edit" ? "Update Ledger" : "Confirm Purge"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Permissions;
