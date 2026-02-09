import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { X, Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";
import {
  createPrompt,
  updatePrompt,
  fetchPromptById,
  clearError,
} from "../../../redux/slice/PromptSlice";
import {
  fetchAllPromptReferences,
  createPromptReference,
} from "../../../redux/slice/PromptReferenceSlice";
import {
  fetchAllPMFeatures,
  createPMFeature,
} from "../../../redux/slice/PMFeatureSlice";

const CreatePrompt = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const isViewMode = window.location.pathname.includes("/view/");

  // Redux state
  const { loading: promptLoading, error: promptError, currentPrompt } = useSelector(
    (state) => state.prompt
  );
  const {
    promptReferences,
    loading: referenceLoading,
  } = useSelector((state) => state.promptReference);
  const {
    pmFeatures,
    loading: featureLoading,
  } = useSelector((state) => state.pmFeature);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    prompt: "",
    type: "documnets",
    feature_id: "",
  });

  const [variables, setVariables] = useState([
    { name: "", promptReferenceId: "" },
  ]);

  // New reference form
  const [showNewReferenceModal, setShowNewReferenceModal] = useState(false);
  const [newReference, setNewReference] = useState({
    name: "",
    details: "",
  });

  // New feature form
  const [showNewFeatureModal, setShowNewFeatureModal] = useState(false);
  const [newFeature, setNewFeature] = useState({
    feature: "",
  });

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchAllPromptReferences());
    dispatch(fetchAllPMFeatures());
    
    // Fetch prompt data if editing or viewing
    if ((isEditMode || isViewMode) && id) {
      dispatch(fetchPromptById(id));
    }
  }, [dispatch, id, isEditMode, isViewMode]);

  // Populate form when prompt data is loaded
  useEffect(() => {
    if ((isEditMode || isViewMode) && currentPrompt) {
      setFormData({
        title: currentPrompt.title || "",
        prompt: currentPrompt.prompt || "",
        type: currentPrompt.type || "documnets",
        feature_id: currentPrompt.feature_id ? String(currentPrompt.feature_id) : "",
      });
      
      if (currentPrompt.variables && currentPrompt.variables.length > 0) {
        // Map variables, handling both promptReferenceId and referenceName
        const mappedVariables = currentPrompt.variables.map((v) => {
          let promptReferenceId = "";
          
          // If promptReferenceId exists, use it
          if (v.promptReferenceId) {
            promptReferenceId = String(v.promptReferenceId);
          } 
          // If referenceName exists, find the matching reference by name
          else if (v.referenceName && promptReferences && promptReferences.length > 0) {
            const matchingRef = promptReferences.find(
              (ref) => ref.name === v.referenceName || ref.name?.toLowerCase() === v.referenceName?.toLowerCase()
            );
            if (matchingRef && matchingRef.id) {
              promptReferenceId = String(matchingRef.id);
            }
          }
          
          return {
            name: v.name || "",
            promptReferenceId: promptReferenceId,
          };
        });
        
        setVariables(mappedVariables);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPrompt, isEditMode, isViewMode]);
  
  // Update variables when promptReferences load (if they weren't available initially)
  useEffect(() => {
    if ((isEditMode || isViewMode) && currentPrompt && currentPrompt.variables && promptReferences && promptReferences.length > 0) {
      // Check if any variable needs reference mapping
      const needsMapping = currentPrompt.variables.some(
        (v) => !v.promptReferenceId && v.referenceName
      );
      
      if (needsMapping) {
        const mappedVariables = currentPrompt.variables.map((v) => {
          let promptReferenceId = "";
          
          // If promptReferenceId exists, use it
          if (v.promptReferenceId) {
            promptReferenceId = String(v.promptReferenceId);
          } 
          // If referenceName exists, find the matching reference by name
          else if (v.referenceName) {
            const matchingRef = promptReferences.find(
              (ref) => ref.name === v.referenceName || ref.name?.toLowerCase() === v.referenceName?.toLowerCase()
            );
            if (matchingRef && matchingRef.id) {
              promptReferenceId = String(matchingRef.id);
            }
          }
          
          return {
            name: v.name || "",
            promptReferenceId: promptReferenceId,
          };
        });
        
        setVariables(mappedVariables);
      }
    }
    // Use length instead of array to avoid dependency array size changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptReferences?.length, currentPrompt, isEditMode, isViewMode]);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle variable change
  const handleVariableChange = (index, field, value) => {
    const updatedVariables = [...variables];
    updatedVariables[index] = {
      ...updatedVariables[index],
      [field]: value,
    };
    setVariables(updatedVariables);
  };

  // Add new variable
  const handleAddVariable = () => {
    setVariables([...variables, { name: "", promptReferenceId: "" }]);
  };

  // Remove variable
  const handleRemoveVariable = (index) => {
    if (variables.length > 1) {
      setVariables(variables.filter((_, i) => i !== index));
    }
  };

  // Handle create new reference
  const handleCreateReference = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createPromptReference(newReference)).unwrap();
      toast.success("Prompt reference created successfully!");
      setShowNewReferenceModal(false);
      setNewReference({ name: "", details: "" });
      dispatch(fetchAllPromptReferences());
    } catch (error) {
      console.error("Failed to create reference:", error);
      toast.error(error?.message || "Failed to create reference");
    }
  };

  // Handle create new feature
  const handleCreateFeature = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createPMFeature(newFeature)).unwrap();
      toast.success("PM feature created successfully!");
      setShowNewFeatureModal(false);
      setNewFeature({ feature: "" });
      dispatch(fetchAllPMFeatures());
    } catch (error) {
      console.error("Failed to create feature:", error);
      toast.error(error?.message || "Failed to create feature");
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isViewMode) {
      return; // Don't submit in view mode
    }

    // Validate form
    if (!formData.title || !formData.prompt || !formData.type) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate variables
    const validVariables = variables.filter(
      (v) => v.name.trim() !== ""
    );

    if (validVariables.length === 0) {
      toast.error("Please add at least one variable");
      return;
    }

    // Prepare variables array
    const variablesToSubmit = validVariables.map((v) => ({
      name: v.name.trim(),
      promptReferenceId: v.promptReferenceId ? parseInt(v.promptReferenceId) : null,
    }));

    try {
      if (isEditMode) {
        // Update prompt
        await dispatch(
          updatePrompt({
            id: id,
            updatedData: {
              title: formData.title,
              prompt: formData.prompt,
              variables: variablesToSubmit,
              type: formData.type,
              feature_id: formData.feature_id ? parseInt(formData.feature_id) : null,
            },
          })
        ).unwrap();
        toast.success("Prompt updated successfully!");
      } else {
        // Create prompt
        await dispatch(
          createPrompt({
            title: formData.title,
            prompt: formData.prompt,
            variables: variablesToSubmit,
            type: formData.type,
            feature_id: formData.feature_id ? parseInt(formData.feature_id) : null,
          })
        ).unwrap();
        toast.success("Prompt created successfully!");
      }
      navigate("/prompts");
    } catch (error) {
      console.error(`Failed to ${isEditMode ? "update" : "create"} prompt:`, error);
      toast.error(error || `Failed to ${isEditMode ? "update" : "create"} prompt`);
    }
  };

  return (
    <div className="space-y-6 p-4 bg-gray-100 w-full min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            onClick={() => navigate("/prompts")}
            className="flex items-center gap-2 text-gray-600 hover:text-[#B02E0C] mb-2"
          >
            <ArrowLeft size={20} /> Back to Prompts
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isViewMode ? "View Prompt" : isEditMode ? "Edit Prompt" : "Create Prompt"}
          </h1>
          <p className="text-gray-600">
            {isViewMode 
              ? "View prompt details, variables, and feature mapping."
              : isEditMode
              ? "Edit prompt with variables and feature mapping."
              : "Create a new prompt with variables and feature mapping."}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {promptError && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
          <p className="font-medium">Error: {promptError}</p>
          <button
            onClick={() => dispatch(clearError())}
            className="text-sm underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {promptLoading && isEditMode && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-[#B02E0C]" size={32} />
            <span className="ml-3 text-gray-600">Loading prompt...</span>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form Fields */}
          <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-[#B02E0C] rounded-full"></div>
              Basic Information
            </h2>
            <div className="space-y-5">
              {/* Feature Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Feature <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    name="feature_id"
                    value={formData.feature_id}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className={`flex-1 border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B02E0C] focus:ring-2 focus:ring-[#B02E0C]/20 transition-all ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  >
                    <option value="">Select Feature</option>
                    {featureLoading ? (
                      <option>Loading features...</option>
                    ) : (
                      pmFeatures.map((feature) => (
                        <option key={feature.id} value={feature.id}>
                          {feature.feature || feature.name}
                        </option>
                      ))
                    )}
                  </select>
                  {!isViewMode && (
                    <button
                      type="button"
                      onClick={() => setShowNewFeatureModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-100 border border-gray-200 flex items-center gap-2 font-medium transition-all"
                    >
                      <Plus size={18} /> NEW
                    </button>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Builder Project Proposal"
                  disabled={isViewMode}
                  readOnly={isViewMode}
                  className={`w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B02E0C] focus:ring-2 focus:ring-[#B02E0C]/20 transition-all ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  className={`w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B02E0C] focus:ring-2 focus:ring-[#B02E0C]/20 transition-all ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  required
                >
                  <option value="documnets">documnets</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Prompt Content Card */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#B02E0C] rounded-full"></div>
                Prompt Content
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Use {"{{variable_name}}"} for variables
              </div>
            </div>
            <div className="relative">
              <textarea
                name="prompt"
                value={formData.prompt}
                onChange={handleInputChange}
                placeholder="You are an expert construction contract writer in India. Using the provided project data, create a professional JSON document as per the required structure.&#10;&#10;Project Data:&#10;site_name: {{site_name}}, builder_name: {{builder_name}}..."
                rows="12"
                disabled={isViewMode}
                readOnly={isViewMode}
                className={`w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#B02E0C] focus:ring-2 focus:ring-[#B02E0C]/20 transition-all font-mono text-sm bg-gray-50/50 ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                required
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {formData.prompt.length} characters
              </div>
            </div>
            {/* Variable Helper */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 font-medium mb-1">
                💡 Variable Format:
              </p>
              <code className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
                {"{{variable_name}}"}
              </code>
            </div>
          </div>

          {/* Variables Card */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#B02E0C] rounded-full"></div>
                Variables Configuration
                <span className="text-red-500">*</span>
              </h2>
              {!isViewMode && (
                <button
                  type="button"
                  onClick={handleAddVariable}
                  className="px-4 py-2 bg-gradient-to-r from-[#B02E0C] to-[#8d270b] text-white rounded-lg hover:from-[#8d270b] hover:to-[#B02E0C] flex items-center gap-2 text-sm font-medium shadow-sm transition-all"
                >
                  <Plus size={18} /> Add Variable
                </button>
              )}
            </div>

            <div className="space-y-3">
              {variables.map((variable, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-start p-4 border-2 border-gray-100 rounded-lg hover:border-[#B02E0C]/30 hover:bg-gray-50/50 transition-all group"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Variable Name
                      </label>
                      <input
                        type="text"
                        value={variable.name}
                        onChange={(e) =>
                          handleVariableChange(index, "name", e.target.value)
                        }
                        placeholder="e.g., site_name"
                        disabled={isViewMode}
                        readOnly={isViewMode}
                        className={`w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B02E0C] focus:ring-2 focus:ring-[#B02E0C]/20 transition-all font-mono ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      />
                    </div>
                    <div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-gray-700 mb-2">
                            Prompt Reference
                          </label>
                          <select
                            value={variable.promptReferenceId}
                            onChange={(e) =>
                              handleVariableChange(
                                index,
                                "promptReferenceId",
                                e.target.value
                              )
                            }
                            disabled={isViewMode}
                            className={`w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B02E0C] focus:ring-2 focus:ring-[#B02E0C]/20 transition-all ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          >
                            <option value="">Select Reference</option>
                            {referenceLoading ? (
                              <option>Loading...</option>
                            ) : (
                              promptReferences.map((ref) => (
                                <option key={ref.id} value={ref.id}>
                                  {ref.name}
                                </option>
                              ))
                            )}
                          </select>
                        </div>
                        {!isViewMode && (
                          <button
                            type="button"
                            onClick={() => setShowNewReferenceModal(true)}
                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-xs mt-7 border border-gray-200 transition-all"
                            title="Create New Reference"
                          >
                            <Plus size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {!isViewMode && variables.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveVariable(index)}
                      className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg mt-7 transition-all opacity-0 group-hover:opacity-100"
                      title="Remove Variable"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {variables.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No variables added yet</p>
                <p className="text-xs mt-1">Click "Add Variable" to get started</p>
              </div>
            )}
          </div>
          </div>

          {/* Right Column - Preview & Info */}
          <div className="lg:col-span-1 space-y-6">
          {/* Preview Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 shadow-lg border border-gray-700 rounded-xl p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-[#B02E0C] rounded-full"></div>
              Preview
            </h3>
            <div className="bg-gray-950 rounded-lg p-4 border border-gray-700">
              <div className="text-xs text-gray-400 mb-2 font-mono">
                {formData.title || "Untitled Prompt"}
              </div>
              <div className="text-sm text-gray-300 font-mono whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
                {formData.prompt || (
                  <span className="text-gray-500 italic">
                    Your prompt will appear here...
                  </span>
                )}
              </div>
            </div>
            {variables.filter((v) => v.name.trim()).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-400 mb-2">Variables:</div>
                <div className="flex flex-wrap gap-2">
                  {variables
                    .filter((v) => v.name.trim())
                    .map((v, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-[#B02E0C]/20 text-[#B02E0C] rounded text-xs font-mono border border-[#B02E0C]/30"
                      >
                        {"{{" + v.name + "}}"}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              💡 Tips
            </h4>
            <ul className="text-xs text-blue-800 space-y-1.5">
              <li>• Use descriptive variable names</li>
              <li>• Match variables in prompt text</li>
              <li>• Link variables to references</li>
              <li>• Test your prompt before saving</li>
            </ul>
          </div>
          </div>
        </div>
        
        {/* Submit Button */}
        {!isViewMode && (
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  title: "",
                  prompt: "",
                  type: "documnets",
                  feature_id: "",
                });
                setVariables([{ name: "", promptReferenceId: "" }]);
              }}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-all"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={promptLoading}
              className="px-8 py-3 bg-gradient-to-r from-[#B02E0C] to-[#8d270b] text-white rounded-lg hover:from-[#8d270b] hover:to-[#B02E0C] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg transition-all"
            >
              {promptLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEditMode ? "Update Prompt" : "Create Prompt"
              )}
            </button>
          </div>
        )}
      </form>

      {/* New Reference Modal */}
      {showNewReferenceModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50">
          <div className="bg-white rounded-xl w-[500px] p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Create Prompt Reference</h2>
              <button onClick={() => setShowNewReferenceModal(false)}>
                <X className="text-gray-500 hover:text-gray-700 cursor-pointer" />
              </button>
            </div>

            <form onSubmit={handleCreateReference} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newReference.name}
                  onChange={(e) =>
                    setNewReference({ ...newReference, name: e.target.value })
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
                  value={newReference.details}
                  onChange={(e) =>
                    setNewReference({ ...newReference, details: e.target.value })
                  }
                  placeholder="Description of this reference"
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B02E0C]"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewReferenceModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Feature Modal */}
      {showNewFeatureModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50">
          <div className="bg-white rounded-xl w-[500px] p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Create PM Feature</h2>
              <button onClick={() => setShowNewFeatureModal(false)}>
                <X className="text-gray-500 hover:text-gray-700 cursor-pointer" />
              </button>
            </div>

            <form onSubmit={handleCreateFeature} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Feature <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newFeature.feature}
                  onChange={(e) =>
                    setNewFeature({ ...newFeature, feature: e.target.value })
                  }
                  placeholder="e.g., generate_documents"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B02E0C]"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewFeatureModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePrompt;

