import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { EllipsisVertical, Eye, Lock, Ban, X, Plus, ShieldCheck, Calendar, Info, Trash2 } from "lucide-react";
import {
  createRole,
  deleteRole,
  fetchAllRoles,
  updateRole,
} from "../../../redux/slice/RolesPermission/RolesSlice";
import DataTable from "../../common/DataTable";

const Roles = () => {
  const dispatch = useDispatch();
  const { Roles, loading, error, pagination } = useSelector((state) => state.role);
  const menuRef = useRef(null);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  const [page, setPage] = useState(pagination?.page || 1);
  const [limit, setLimit] = useState(pagination?.limit || 10);

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
    dispatch(fetchAllRoles({ page, limit }));
  }, [dispatch, page, limit]);

  const openAddModal = () => {
    setSelectedRole(null);
    setFormState({
      name: "",
      description: "",
      is_active: true,
    });
    setShowRoleModal(true);
  };

  const openEditModal = (role) => {
    setSelectedRole(role);
    setFormState({
      name: role.name,
      description: role.description || "",
    });
    setShowRoleModal(true);
  };

  const handleSubmitRole = (e) => {
    e.preventDefault();

    const payload = {
      name: formState.name,
      description: formState.description,
      is_active: formState.is_active,
    };

    if (selectedRole) {
      dispatch(updateRole({ id: selectedRole.id, updatedData: payload }))
        .unwrap()
        .then(() => {
          toast.success("Role updated successfully");
          setShowRoleModal(false);
          dispatch(fetchAllRoles({ page, limit }));
        })
        .catch((err) => {
          toast.error(err.message || err.error || "Failed to update role");
        });
    } else {
      dispatch(createRole(payload))
        .unwrap()
        .then(() => {
          toast.success("Role initialized successfully");
          setShowRoleModal(false);
          dispatch(fetchAllRoles({ page, limit }));
        })
        .catch((err) => {
          toast.error(err.message || err.error || "Failed to initialize role");
        });
    }
  };

  const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50">
      <div className="bg-white rounded-xl w-[400px] p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-8 px-4 sm:px-8 py-4 sm:py-8 bg-[#F8FAFC] w-full min-h-screen" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Roles-Management</h1>
          <p className="text-sm font-medium text-[#64748B]">Configure and deploy organizational access control layers.</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-8 py-4 bg-accent text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#8D270B] shadow-xl shadow-accent/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} strokeWidth={3} />
          Initialize Role
        </button>
      </div>

      <DataTable
        columns={[
          {
            header: "Security Principal",
            accessor: "name",
            cell: (r) => (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="font-black text-[#0F172A]">{r.name}</p>
                  <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest mt-0.5">Access Matrix Entity</p>
                </div>
              </div>
            )
          },
          {
            header: "Deployment Date",
            accessor: "createdAt",
            cell: (r) => (
              <div className="flex items-center gap-2 text-[#475569] font-bold">
                <Calendar size={14} className="text-[#94A3B8]" />
                {new Date(r.createdAt).toLocaleDateString()}
              </div>
            )
          },
        ]}
        data={Roles}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
        renderActions={(role) => (
          <div className="relative" ref={openMenuId === role.id ? menuRef : null}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(openMenuId === role.id ? null : role.id);
              }}
              className={`p-3 rounded-xl transition-all duration-200 cursor-pointer ${openMenuId === role.id ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'hover:bg-accent/5 text-[#94A3B8] hover:text-accent'}`}
            >
              <EllipsisVertical size={20} />
            </button>

            {openMenuId === role.id && (
              <div className="absolute right-12 top-0 bg-white border border-[#E2E8F0] shadow-2xl rounded-2xl w-48 z-[100] py-2 animate-in zoom-in-95 duration-200 origin-top-right">
                <ul className="text-[#475569] text-sm font-bold">
                  <li
                    onClick={() => {
                      setSelectedRole(role);
                      setShowOpenModal(true);
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
                    onClick={() => { openEditModal(role); setOpenMenuId(null); }}
                    className="px-4 py-3 flex items-center gap-3 hover:bg-[#F8FAFC] hover:text-accent cursor-pointer transition-all mx-2 rounded-xl"
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
                      <Lock size={16} />
                    </div>
                    Configure
                  </li>
                  <li
                    onClick={() => { setSelectedRole(role); setShowDeleteModal(true); setOpenMenuId(null); }}
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
        )}
      />

      {showRoleModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[150] p-4 backdrop-blur-md bg-white/30 animate-in fade-in duration-300">
          <div className="fixed inset-0 transition-opacity" onClick={() => setShowRoleModal(false)} />
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="p-8 pb-0 flex-shrink-0">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                    {selectedRole ? <Lock size={24} strokeWidth={2} /> : <Plus size={24} strokeWidth={3} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#0F172A] tracking-tight">{selectedRole ? "Modify Principle" : "Initialize Identity"}</h2>
                    <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mt-1">Access Logic Configuration</p>
                  </div>
                </div>
                <button onClick={() => setShowRoleModal(false)} className="p-3 bg-[#F8FAFC] text-[#94A3B8] hover:text-[#0F172A] rounded-2xl transition-all active:scale-95">
                  <X size={20} strokeWidth={3} />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto">
              <form id="role-form" onSubmit={handleSubmitRole} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Identity Label <span className="text-accent">*</span></label>
                  <input
                    type="text"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full bg-[#F8FAFC] border-2 border-transparent focus:border-accent/20 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-[#0F172A] transition-all outline-none"
                    placeholder="Enter security label..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Functional Boundary</label>
                  <textarea
                    value={formState.description}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                    className="w-full bg-[#F8FAFC] border-2 border-transparent focus:border-accent/20 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-[#0F172A] transition-all outline-none resize-none"
                    placeholder="Describe access limitations..."
                    rows="3"
                  />
                </div>
              </form>
            </div>

            <div className="p-8 border-t border-[#F1F5F9] bg-[#F8FAFC]/50 flex gap-4">
              <button onClick={() => setShowRoleModal(false)} className="flex-1 py-4 px-6 rounded-2xl border-2 border-[#E2E8F0] bg-white text-sm font-black text-[#64748B] uppercase tracking-widest hover:bg-[#F1F5F9] transition-all">Abort</button>
              <button form="role-form" type="submit" className="flex-[2] py-4 px-8 bg-accent text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-accent/20 hover:bg-[#8D270B] transition-all">{selectedRole ? "Registry Sync" : "Deploy Logic"}</button>
            </div>
          </div>
        </div>
      )}

      {showOpenModal && selectedRole && (
        <div className="fixed inset-0 flex items-center justify-center z-[150] p-4 backdrop-blur-md bg-white/30 animate-in fade-in duration-300">
          <div className="fixed inset-0 transition-opacity" onClick={() => setShowOpenModal(false)} />
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95 duration-300 p-8 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                  <Eye size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#0F172A] tracking-tight">Identity Inspection</h2>
                  <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mt-1">Read-Only Principal Metadata</p>
                </div>
              </div>
              <button onClick={() => setShowOpenModal(false)} className="p-3 bg-[#F8FAFC] text-[#94A3B8] hover:text-[#0F172A] rounded-2xl transition-all">
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <div className="space-y-6 bg-[#F8FAFC] p-6 rounded-3xl border border-[#E2E8F0]">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Descriptor</p>
                <p className="text-lg font-black text-[#0F172A]">{selectedRole.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Telemetry Log</p>
                <p className="text-xs font-bold text-[#475569] flex items-center gap-2">
                  <Calendar size={12} />
                  Registry Entry: {new Date(selectedRole.createdAt).toLocaleString()}
                </p>
              </div>
              {selectedRole.description && (
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Logic Constraint</p>
                  <p className="text-sm font-medium text-[#64748B] italic">{selectedRole.description}</p>
                </div>
              )}
            </div>

            <button onClick={() => setShowOpenModal(false)} className="mt-8 w-full py-4 bg-accent text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-accent/20 transition-all">Dismiss Preview</button>
          </div>
        </div>
      )}

      {showDeleteModal && selectedRole && (
        <div className="fixed inset-0 flex items-center justify-center z-[150] p-4 backdrop-blur-md bg-white/30 animate-in fade-in duration-300">
          <div className="fixed inset-0 transition-opacity" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95 duration-300 p-8 flex flex-col text-center">
            <div className="w-20 h-20 bg-accent/5 rounded-[2.5rem] flex items-center justify-center text-accent mb-6 mx-auto shadow-sm">
              <Trash2 size={40} strokeWidth={2} />
            </div>
            <h3 className="text-2xl font-black text-[#0F172A] tracking-tight mb-2">Eliminate Principal?</h3>
            <div className="p-5 bg-accent/5 rounded-3xl border border-accent/10 mt-6 text-left">
              <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-2 italic">Security Assessment</p>
              <p className="text-sm font-medium text-[#64748B] leading-relaxed">
                Removing <span className="text-accent font-black">"{selectedRole.name}"</span> will permanently dismantle its presence across the authorization matrix. Existing users may lose system access.
              </p>
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 px-6 rounded-2xl border-2 border-[#E2E8F0] bg-white text-sm font-black text-[#64748B] uppercase tracking-widest hover:bg-[#F1F5F9] transition-all">Abort</button>
              <button onClick={() => {
                dispatch(deleteRole(selectedRole.id))
                  .unwrap()
                  .then(() => {
                    toast.success("Principal eliminated successfully");
                    setShowDeleteModal(false);
                    dispatch(fetchAllRoles({ page, limit }));
                  })
                  .catch((err) => {
                    toast.error(err.message || err.error || "Failed to purge principal");
                  });
              }} className="flex-[2] py-4 px-8 bg-accent text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-accent/20 hover:bg-[#8D270B] transition-all">Confirm Purge</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
