import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EllipsisVertical, Eye, Lock, Ban, X } from "lucide-react";
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
          setShowRoleModal(false);
          dispatch(fetchAllRoles());
        });
    } else {
      dispatch(createRole(payload))
        .unwrap()
        .then(() => {
          setShowRoleModal(false);
          dispatch(fetchAllRoles());
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
    <div className="space-y-6 p-4 bg-gray-100 w-full min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles Management</h1>
          <p className="text-gray-600">Manage all user roles here.</p>
        </div>

        <button
          onClick={openAddModal}
          className="mt-4 sm:mt-0 px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]"
        >
          + Add Role
        </button>
      </div>

      <DataTable
        columns={[
          { header: "", accessor: "checkbox", key: "checkbox", cell: () => <input type="checkbox" className="form-checkbox text-[#B02E0C] rounded focus:ring-[#B02E0C]" /> },
          { header: "Name", accessor: "name" },
          { header: "Date", accessor: "createdAt", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
        ]}
        data={Roles}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
        renderActions={(role) => (
          <div>
            <button
              onClick={() => setOpenMenuId(openMenuId === role.id ? null : role.id)}
              className="p-2 rounded hover:bg-gray-100"
            >
              <EllipsisVertical />
            </button>

            {openMenuId === role.id && (
              <div className="absolute right-2 top-14 bg-white border-2 border-gray-300 shadow-lg rounded-md w-40 z-50">
                <ul className="text-sm">
                  <li
                    onClick={() => {
                      setSelectedRole(role);
                      setShowOpenModal(true);
                      setOpenMenuId(null);
                    }}
                    className="px-4 py-2 hover:bg-gray-300 cursor-pointer flex gap-2"
                  >
                    <Eye size={16} /> Open
                  </li>
                  <li
                    onClick={() => { openEditModal(role); setOpenMenuId(null); }}
                    className="px-4 py-2 hover:bg-gray-300 cursor-pointer flex gap-2"
                  >
                    <Lock size={16} /> Edit
                  </li>
                  <li
                    onClick={() => { setSelectedRole(role); setShowDeleteModal(true); setOpenMenuId(null); }}
                    className="px-4 py-2 hover:bg-gray-300 cursor-pointer flex gap-2 text-red-600"
                  >
                    <Ban size={16} /> Delete
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      />

      {showRoleModal && (
        <Modal
          title={selectedRole ? "Edit Role" : "Add New Role"}
          onClose={() => setShowRoleModal(false)}
        >
          <form onSubmit={handleSubmitRole} className="space-y-4">
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              value={formState.name}
              onChange={(e) =>
                setFormState({ ...formState, name: e.target.value })
              }
              className="w-full border px-3 py-2 rounded-md"
              autoFocus
            />

            <label className="block text-sm font-medium">Description</label>
            <input
              type="text"
              value={formState.description}
              onChange={(e) =>
                setFormState({ ...formState, description: e.target.value })
              }
              className="w-full border px-3 py-2 rounded-md"
            />

            <button
              type="submit"
              className="bg-[#B02E0C] text-white px-4 py-2 rounded-md w-full"
            >
              {selectedRole ? "Update Role" : "Create Role"}
            </button>
          </form>
        </Modal>
      )}

      {showOpenModal && selectedRole && (
        <Modal
          title="View Role Details"
          onClose={() => setShowOpenModal(false)}
        >
          <p>
            <strong>Name:</strong> {selectedRole.name}
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {new Date(selectedRole.createdAt).toLocaleString()}
          </p>
        </Modal>
      )}

      {showDeleteModal && selectedRole && (
        <Modal title="Confirm Delete" onClose={() => setShowDeleteModal(false)}>
          <p>
            Are you sure you want to delete <strong>{selectedRole.name}</strong>
            ?
          </p>

          <div className="flex justify-end mt-6 gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 bg-gray-200 rounded-md"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                dispatch(deleteRole(selectedRole.id)).then(() => {
                  setShowDeleteModal(false);
                  dispatch(fetchAllRoles({ page, limit }));
                });
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Roles;
