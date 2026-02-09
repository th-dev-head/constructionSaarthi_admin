import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { EllipsisVertical, Edit, Trash2, Loader2, Plus, X } from "lucide-react";
import {
  fetchAllPromptReferences,
  createPromptReference,
  updatePromptReference,
  deletePromptReference,
  clearError,
} from "../../../redux/slice/PromptReferenceSlice";

const PromptReferenceManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Redux state
  const { promptReferences, loading, error } = useSelector(
    (state) => state.promptReference
  );

  // Local state
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" or "edit"
  const [selectedReference, setSelectedReference] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    details: "",
  });

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchAllPromptReferences());
  }, [dispatch]);

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
      dispatch(fetchAllPromptReferences());
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
      dispatch(fetchAllPromptReferences());
    } catch (error) {
      console.error("Failed to delete reference:", error);
    }
  };

  return (
    <div className="space-y-6 p-4 bg-gray-100 w-full min-h-screen">
      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => navigate("/prompts")}
            className={`px-6 py-3 font-medium text-sm ${
              location.pathname === "/prompts"
                ? "text-[#B02E0C] border-b-2 border-[#B02E0C]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Prompts
          </button>
          <button
            onClick={() => navigate("/prompts/features")}
            className={`px-6 py-3 font-medium text-sm ${
              location.pathname === "/prompts/features"
                ? "text-[#B02E0C] border-b-2 border-[#B02E0C]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            PM Features
          </button>
          <button
            onClick={() => navigate("/prompts/references")}
            className={`px-6 py-3 font-medium text-sm ${
              location.pathname === "/prompts/references"
                ? "text-[#B02E0C] border-b-2 border-[#B02E0C]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Prompt References
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Prompt References Management
          </h1>
          <p className="text-gray-600">Manage all prompt references here.</p>
        </div>
        <button
          onClick={openAddModal}
          className="mt-4 sm:mt-0 px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b] flex items-center gap-2"
        >
          <Plus size={20} /> Add Reference
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

      {/* References Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-[#B02E0C]" size={32} />
            <span className="ml-3 text-gray-600">Loading references...</span>
          </div>
        ) : promptReferences.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-12">
            <p className="text-gray-500 mb-4">No references found</p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b] flex items-center gap-2"
            >
              <Plus size={20} /> Create First Reference
            </button>
          </div>
        ) : (
          <table className="w-full text-left border-t border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">
                  ID
                </th>
                <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">
                  Name
                </th>
                <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">
                  Details
                </th>
                <th className="py-3 px-4 border border-gray-300 text-sm font-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {promptReferences.map((reference) => (
                <tr key={reference.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border border-gray-300 text-gray-700">
                    {reference.id}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    <p className="font-medium text-gray-800">
                      {reference.name || "--"}
                    </p>
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {reference.details || "--"}
                    </p>
                  </td>
                  <td className="py-3 px-4 border border-gray-300 text-center relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === reference.id ? null : reference.id
                        )
                      }
                      className="p-2 rounded hover:bg-gray-100"
                    >
                      <EllipsisVertical className="text-gray-600" />
                    </button>

                    {/* Dropdown Menu */}
                    {openMenuId === reference.id && (
                      <div className="absolute right-4 top-10 bg-white border border-gray-200 shadow-lg rounded-md w-44 z-30">
                        <ul className="text-gray-700 text-sm">
                          <li
                            onClick={() => {
                              openEditModal(reference);
                              setOpenMenuId(null);
                            }}
                            className="px-4 py-2 flex items-center gap-2 hover:bg-gray-50 cursor-pointer"
                          >
                            <Edit size={16} /> Edit
                          </li>
                          <li
                            onClick={() => {
                              setSelectedReference(reference);
                              setShowDeleteModal(true);
                              setOpenMenuId(null);
                            }}
                            className="px-4 py-2 flex items-center gap-2 text-red-600 hover:bg-gray-50 cursor-pointer"
                          >
                            <Trash2 size={16} /> Delete
                          </li>
                        </ul>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50">
          <div className="bg-white rounded-lg w-[500px] p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {modalType === "add"
                  ? "Add Prompt Reference"
                  : "Edit Prompt Reference"}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="text-gray-500 hover:text-gray-700 cursor-pointer" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(e) =>
                    setFormState({ ...formState, name: e.target.value })
                  }
                  placeholder="e.g., estimated_completion_date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B02E0C]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Details
                </label>
                <textarea
                  value={formState.details}
                  onChange={(e) =>
                    setFormState({ ...formState, details: e.target.value })
                  }
                  placeholder="Description of this reference"
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B02E0C]"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-[#B02E0C] text-white hover:bg-[#8d270b] cursor-pointer"
                >
                  {modalType === "add" ? "Create" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedReference && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50">
          <div className="bg-white rounded-lg w-[400px] p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Delete Reference</h2>
              <button onClick={() => setShowDeleteModal(false)}>
                <X className="text-gray-500 hover:text-gray-700 cursor-pointer" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the reference{" "}
              <strong>{selectedReference.name}</strong>? This action cannot be
              undone.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedReference(null);
                }}
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptReferenceManagement;

