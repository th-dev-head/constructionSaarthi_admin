import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { EllipsisVertical, Edit, Trash2, Loader2, Plus, X } from "lucide-react";
import {
  fetchAllPMFeatures,
  createPMFeature,
  updatePMFeature,
  deletePMFeature,
  clearError,
} from "../../../redux/slice/PMFeatureSlice";

const PMFeatureManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Redux state
  const { pmFeatures, loading, error } = useSelector((state) => state.pmFeature);

  // Local state
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
    dispatch(fetchAllPMFeatures());
  }, [dispatch]);

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
          <h1 className="text-2xl font-bold text-gray-900">PM Features Management</h1>
          <p className="text-gray-600">Manage all PM features here.</p>
        </div>
        <button
          onClick={openAddModal}
          className="mt-4 sm:mt-0 px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b] flex items-center gap-2"
        >
          <Plus size={20} /> Add Feature
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

      {/* Features Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-[#B02E0C]" size={32} />
            <span className="ml-3 text-gray-600">Loading features...</span>
          </div>
        ) : pmFeatures.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-12">
            <p className="text-gray-500 mb-4">No features found</p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b] flex items-center gap-2"
            >
              <Plus size={20} /> Create First Feature
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
                  Feature Name
                </th>
                <th className="py-3 px-4 border border-gray-300 text-sm font-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pmFeatures.map((feature) => (
                <tr key={feature.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border border-gray-300 text-gray-700">
                    {feature.id}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    <p className="font-medium text-gray-800">
                      {feature.feature || feature.name || "--"}
                    </p>
                  </td>
                  <td className="py-3 px-4 border border-gray-300 text-center relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === feature.id ? null : feature.id
                        )
                      }
                      className="p-2 rounded hover:bg-gray-100"
                    >
                      <EllipsisVertical className="text-gray-600" />
                    </button>

                    {/* Dropdown Menu */}
                    {openMenuId === feature.id && (
                      <div className="absolute right-4 top-10 bg-white border border-gray-200 shadow-lg rounded-md w-44 z-30">
                        <ul className="text-gray-700 text-sm">
                          <li
                            onClick={() => {
                              openEditModal(feature);
                              setOpenMenuId(null);
                            }}
                            className="px-4 py-2 flex items-center gap-2 hover:bg-gray-50 cursor-pointer"
                          >
                            <Edit size={16} /> Edit
                          </li>
                          <li
                            onClick={() => {
                              setSelectedFeature(feature);
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
                {modalType === "add" ? "Add PM Feature" : "Edit PM Feature"}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="text-gray-500 hover:text-gray-700 cursor-pointer" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Feature Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formState.feature}
                  onChange={(e) =>
                    setFormState({ ...formState, feature: e.target.value })
                  }
                  placeholder="e.g., generate_documents"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B02E0C]"
                  required
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
      {showDeleteModal && selectedFeature && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50">
          <div className="bg-white rounded-lg w-[400px] p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Delete Feature</h2>
              <button onClick={() => setShowDeleteModal(false)}>
                <X className="text-gray-500 hover:text-gray-700 cursor-pointer" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the feature{" "}
              <strong>{selectedFeature.feature || selectedFeature.name}</strong>?
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedFeature(null);
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

export default PMFeatureManagement;

