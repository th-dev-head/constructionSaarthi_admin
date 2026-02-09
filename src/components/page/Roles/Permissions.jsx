  import React, { useEffect, useState } from "react";
  import { toast } from "react-toastify";
  import { EllipsisVertical, X } from "lucide-react";
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

  const Permissions = () => {
    const dispatch = useDispatch();
    const { Permissions, loading, error, pagination } = useSelector((state) => state.permission);

    const { Roles } = useSelector((state) => state.role); // get roles from Redux
    const { Features } = useSelector((state) => state.feature); // get features from Redux
  console.log("roles =",Roles);

    const [openMenuId, setOpenMenuId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showOpenModal, setShowOpenModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
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

    const handleSave = async (e) => {
      e.preventDefault();
      if (!formState.role_id || !formState.feature_id) {
        toast.error("Please select role and feature");
        return;
      }

      dispatch(addPermission(formState)).then((res) => {
        if (!res.error) {
          toast.success("Permission added successfully!");
          setShowAddModal(false);
          setFormState({
            role_id: "",
            feature_id: "",
            can_read: true,
            can_edit: true,
            can_delete: true,
            can_create: true,
            can_view: true,
          });
          dispatch(fetchAllPermission({ page, limit, search })); // refresh table
        } else {
          toast.error(res.payload || "Failed to add permission");
        }
      });
    };

    const handleFormChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormState((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    };

    const handleUpdate = (e) => {
      e.preventDefault();

      dispatch(updatePermission({ id: selectedUser.id, payload: formState })).then((res) => {
        if (!res.error) {
          toast.success("Updated Successfully!");
          setShowEditModal(false);
          dispatch(fetchAllPermission({ page, limit, search }));
        }
      });
    };

    const handleDelete = () => {
      dispatch(deletePermission(selectedUser.id)).then((res) => {
        if (!res.error) {
          toast.success("Deleted successfully!");
          setShowDeleteModal(false);
          dispatch(fetchAllPermission({ page, limit, search })); // refresh list
        } else {
          toast.error("Delete failed: " + res.payload);
        }
      });
    };

    const Modal = ({ title, children, onClose }) => (
      <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50">
        <div className="bg-white rounded-xl w-[400px] p-6 relative">
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            {children}
          </div>
        </div>
      </div>
    );

    return (
      <div className="space-y-6 p-4 bg-gray-100 w-full min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Permissions Management</h1>
            <p className="text-gray-600">Manage all user permissions here.</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="mt-4 sm:mt-0 px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]">
            + Add Permissions
          </button>
        </div>

        <DataTable
          showSearch={true}
          onSearch={(q) => { setSearch(q); setPage(1); }}
          columns={[
            { header: "", accessor: "checkbox", key: "checkbox", cell: () => <input type="checkbox" className="form-checkbox text-[#B02E0C] rounded focus:ring-[#B02E0C]" /> },
            { header: "Role", accessor: "role_name", cell: (r) => r.role_name || "-" },
            { header: "Feature", accessor: "feature_name", cell: (r) => r.feature_name || "-" },
            { header: "Read", accessor: "can_read", cell: (r) => (r.can_read ? "Yes" : "No") },
            { header: "Edit", accessor: "can_edit", cell: (r) => (r.can_edit ? "Yes" : "No") },
            { header: "Delete", accessor: "can_delete", cell: (r) => (r.can_delete ? "Yes" : "No") },
            { header: "Create", accessor: "can_create", cell: (r) => (r.can_create ? "Yes" : "No") },
            { header: "View", accessor: "can_view", cell: (r) => (r.can_view ? "Yes" : "No") },
            { header: "Verify", accessor: "can_verify", cell: (r) => (r.can_verify ? "Yes" : "No") },
          ]}
          data={Permissions}
          loading={loading}
          pagination={pagination}
          onPageChange={(p) => setPage(p)}
          onLimitChange={(l) => { setLimit(l); setPage(1); }}
          renderActions={(permission) => (
            <div>
              <button onClick={() => setOpenMenuId(openMenuId === permission.id ? null : permission.id)} className="p-2 rounded hover:bg-gray-100">
                <EllipsisVertical className="text-gray-600" />
              </button>
              {openMenuId === permission.id && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 shadow-md rounded-md w-32 z-50">
                  <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setSelectedUser(permission); setShowOpenModal(true); setOpenMenuId(null); }}>
                    Open
                  </button>
                  <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setSelectedUser(permission); setFormState({ ...permission }); setShowEditModal(true); setOpenMenuId(null); }}>
                    Edit
                  </button>
                  <button className="px-4 py-2 hover:bg-gray-300 w-full cursor-pointer flex gap-2 text-red-600" onClick={() => { setSelectedUser(permission); setShowDeleteModal(true); setOpenMenuId(null); }}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        />

        {/* Add Permission Modal */}
        {showAddModal && (
          <Modal title="Add New Permissions" onClose={() => setShowAddModal(false)}>
            <form className="space-y-4" onSubmit={handleSave}>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select name="role_id" className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B02E0C]" value={formState.role_id} onChange={handleFormChange}>
                <option value="" disabled>Select Role</option>
                {Roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>

              <label className="block text-sm font-medium text-gray-700">Feature</label>
              <select name="feature_id" className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B02E0C]" value={formState.feature_id} onChange={handleFormChange}>
                <option value="" disabled>Select Feature</option>
                {Features.map((feature) => (
                  <option key={feature.id} value={feature.id}>{feature.name}</option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2 mt-4">
                {["can_read","can_edit","can_delete","can_create","can_view"].map((perm) => (
                  <label key={perm} className="flex items-center gap-2">
                    <input type="checkbox" name={perm} checked={formState[perm]} onChange={handleFormChange} className="text-[#B02E0C] focus:ring-[#B02E0C]" />
                    <span>{perm.replace("can_", "").replace("_", " ").toUpperCase()}</span>
                  </label>
                ))}
              </div>

              <div className="pt-4">
                <button type="submit" className="bg-[#B02E0C] text-white px-4 py-2 rounded-md hover:bg-[#8d270b] w-full">Save</button>
              </div>
            </form>
          </Modal>
        )}

        {/* Open Modal */}
        {showOpenModal && selectedUser && (
          <Modal title="View Role Details" onClose={() => setShowOpenModal(false)}>
            <div className="space-y-2">
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>
              <p><strong>Feature:</strong> {selectedUser.feature}</p>
              <p><strong>Read Permission:</strong> {selectedUser.can_read}</p>
              <p><strong>Edit Permission:</strong> {selectedUser.can_edit}</p>
              <p><strong>Delete Permission:</strong> {selectedUser.can_delete}</p>
              <p><strong>Create Permission:</strong> {selectedUser.can_create}</p>
              <p><strong>View Permission:</strong> {selectedUser.can_view}</p>
            </div>
          </Modal>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedUser && (
          <Modal title="Edit Permission" onClose={() => setShowEditModal(false)}>
            <form className="space-y-4" onSubmit={handleUpdate}>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select name="role_id" className="w-full border px-3 py-2 rounded-md" value={formState.role_id} onChange={handleFormChange}>
                {Roles.map((r) => (<option key={r.id} value={r.id}>{r.name}</option>))}
              </select>

              <label>Feature</label>
              <select name="feature_id" className="w-full border px-3 py-2 rounded-md" value={formState.feature_id} onChange={handleFormChange}>
                {Features.map((f) => (<option key={f.id} value={f.id}>{f.name}</option>))}
              </select>

              <div className="grid grid-cols-2 gap-2">
                {["can_read","can_edit","can_delete","can_create","can_view"].map((perm) => (
                  <label key={perm} className="flex items-center gap-2">
                    <input type="checkbox" name={perm} checked={formState[perm]} onChange={handleFormChange} />
                    <span>{perm.replace("can_", "").toUpperCase()}</span>
                  </label>
                ))}
              </div>

              <button className="bg-[#B02E0C] w-full text-white px-4 py-2 rounded-md">Update</button>
            </form>
          </Modal>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedUser && (
          <Modal title="Confirm Delete" onClose={() => setShowDeleteModal(false)}>
            <p>
              Are you sure you want to delete permission for role <strong>{Roles.find((r) => r.id === selectedUser.role_id)?.name || "N/A"}</strong> and feature <strong>{Features.find((f) => f.id === selectedUser.feature_id)?.name || "N/A"}</strong>?
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md">Delete</button>
            </div>
          </Modal>
        )}
      </div>
    );
  };

  export default Permissions;

