import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { EllipsisVertical, Eye, Edit, Trash2, Loader2, Plus, X } from "lucide-react";
import {
  fetchAllPrompts,
  deletePrompt,
  clearError,
} from "../../../redux/slice/PromptSlice";
import {
  fetchAllPMFeatures,
} from "../../../redux/slice/PMFeatureSlice";

const PromptsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  // Redux state
  const { prompts, loading, error } = useSelector((state) => state.prompt);
  const { pmFeatures, loading: featuresLoading } = useSelector(
    (state) => state.pmFeature
  );

  // Local state
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchAllPMFeatures());
  }, [dispatch]);

  // Fetch prompts when feature filter changes
  useEffect(() => {
    dispatch(
      fetchAllPrompts({
        includeDeleted: false,
        onlyActive: true,
        feature_id: selectedFeature || null,
      })
    );
  }, [dispatch, selectedFeature]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        // Check if click is not on the ellipsis button
        const isEllipsisButton = event.target.closest('button[class*="p-2"]');
        if (!isEllipsisButton) {
          setOpenMenuId(null);
        }
      }
    };

    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  // Handle delete
  const handleDelete = async () => {
    if (!selectedPrompt) return;

    try {
      await dispatch(deletePrompt(selectedPrompt.prompt_id)).unwrap();
      setShowDeleteModal(false);
      setSelectedPrompt(null);
      // Refresh prompts
      dispatch(
        fetchAllPrompts({
          includeDeleted: false,
          onlyActive: true,
          feature_id: selectedFeature || null,
        })
      );
    } catch (error) {
      console.error("Failed to delete prompt:", error);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "--";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
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
          <h1 className="text-2xl font-bold text-gray-900">Prompts Management</h1>
          <p className="text-gray-600">Manage all prompts, features, and references here.</p>
        </div>
        <button
          onClick={() => navigate("/prompts/create")}
          className="mt-4 sm:mt-0 px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b] flex items-center gap-2"
        >
          <Plus size={20} /> Add Prompt
        </button>
      </div>
      {/* Filters */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter by Feature
            </label>
            <select
              value={selectedFeature}
              onChange={(e) => setSelectedFeature(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B02E0C]"
            >
              <option value="">All Features</option>
              {featuresLoading ? (
                <option>Loading features...</option>
              ) : (
                pmFeatures.map((feature) => (
                  <option key={feature.id} value={feature.id}>
                    {feature.feature || feature.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
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

      {/* Prompts Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-visible">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-[#B02E0C]" size={32} />
            <span className="ml-3 text-gray-600">Loading prompts...</span>
          </div>
        ) : prompts.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-12">
            <p className="text-gray-500 mb-4">No prompts found</p>
            <button
              onClick={() => navigate("/prompts/create")}
              className="px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b] flex items-center gap-2"
            >
              <Plus size={20} /> Create First Prompt
            </button>
          </div>
        ) : (
          <table className="w-full text-left border-t border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">
                  Title
                </th>
                <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">
                  Type
                </th>
                <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">
                  Feature
                </th>
                <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">
                  Variables
                </th>
                <th className="py-3 px-4 border border-gray-300 text-sm font-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {prompts.map((prompt) => {
                const feature = pmFeatures.find(
                  (f) => String(f.id) === String(prompt.feature_id)
                );
                return (
                  <tr key={prompt.prompt_id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border border-gray-300">
                      <div>
                        <p className="font-medium text-gray-800">{prompt.title}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {typeof prompt.prompt === 'string' ? (prompt.prompt.length > 100 ? prompt.prompt.substring(0, 100) + '...' : prompt.prompt) : ''}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 border border-gray-300">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {prompt.type || "documnets"}
                      </span>
                    </td>
                    
                    <td className="py-3 px-4 border border-gray-300 text-gray-700">
                      {feature ? feature.feature || feature.name : prompt.feature_id || "--"}
                    </td>
                    <td className="py-3 px-4 border border-gray-300">
                      <div className="flex flex-wrap gap-1">
                        {prompt.variables && prompt.variables.length > 0 ? (
                          prompt.variables.slice(0, 3).map((variable, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {variable.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">No variables</span>
                        )}
                        {prompt.variables && prompt.variables.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            +{prompt.variables.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 border border-gray-300 text-center relative" ref={openMenuId === prompt.prompt_id ? menuRef : null}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(
                            openMenuId === prompt.prompt_id ? null : prompt.prompt_id
                          );
                        }}
                        className="p-2 rounded hover:bg-gray-100 relative z-10"
                      >
                        <EllipsisVertical className="text-gray-600" />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === prompt.prompt_id && (
                        <div 
                          className="absolute right-0 top-full mt-1 bg-white border border-gray-200 shadow-lg rounded-md w-44 z-50"
                          onClick={(e) => e.stopPropagation()}
                          style={{ 
                            // For last row, position upward if needed
                            ...(prompts.indexOf(prompt) === prompts.length - 1 ? {
                              bottom: '100%',
                              top: 'auto',
                              marginTop: 0,
                              marginBottom: '4px'
                            } : {})
                          }}
                        >
                          <ul className="text-gray-700 text-sm">
                            <li
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/prompts/view/${prompt.prompt_id}`);
                                setOpenMenuId(null);
                              }}
                              className="px-4 py-2 flex items-center gap-2 hover:bg-gray-50 cursor-pointer"
                            >
                              <Eye size={16} /> View
                            </li>
                            <li
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/prompts/edit/${prompt.prompt_id}`);
                                setOpenMenuId(null);
                              }}
                              className="px-4 py-2 flex items-center gap-2 hover:bg-gray-50 cursor-pointer"
                            >
                              <Edit size={16} /> Edit
                            </li>
                            <li
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPrompt(prompt);
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
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPrompt && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50">
          <div className="bg-white rounded-lg w-[400px] p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Delete Prompt</h2>
              <button onClick={() => setShowDeleteModal(false)}>
                <X className="text-gray-500 hover:text-gray-700 cursor-pointer" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the prompt{" "}
              <strong>{selectedPrompt.title}</strong>? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPrompt(null);
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

export default PromptsList;

