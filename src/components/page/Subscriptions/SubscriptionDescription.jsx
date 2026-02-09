import { useState, useEffect } from "react";
import { apiInstance } from "../../../config/axiosInstance";
import { Loader2, Plus, Trash2, X } from "lucide-react";

const SubscriptionDescription = () => {
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        description: "",
    });

    // Fetch all features
    const fetchFeatures = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiInstance.get(`/api/available-plans`);
            if (response.data && response.data.features) {
                setFeatures(response.data.features);
            } else {
                setError("Failed to fetch features");
            }
        } catch (err) {
            console.error("Error fetching features:", err);
            setError(err.response?.data?.message || "Failed to fetch subscription features");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeatures();
    }, []);

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle add feature
    const handleAddFeature = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const payload = {
                title: formData.title,
                description: formData.description,
            };

            const response = await apiInstance.post(
                `/api/available-plans`,
                payload
            );

            if (response.status === 200 || response.status === 201 || response.data?.success) {
                setSuccess("Feature added successfully!");
                setShowAddModal(false);
                setFormData({ title: "", description: "" });
                fetchFeatures();
                setTimeout(() => {
                    setSuccess(null);
                }, 3000);
            } else {
                setError(response.data?.message || "Failed to add feature");
            }
        } catch (err) {
            console.error("Error adding feature:", err);
            setError(err.response?.data?.message || "Failed to add feature");
        }
    };

    // Handle delete feature
    const handleDeleteFeature = async (featureId) => {
        if (!window.confirm("Are you sure you want to delete this feature?")) {
            return;
        }

        setDeletingId(featureId);
        setError(null);
        setSuccess(null);

        try {
            const response = await apiInstance.delete(
                `/api/available-plans/${featureId}`
            );

            if (response.status === 200 || response.status === 204 || response.data?.success) {
                setSuccess("Feature deleted successfully!");
                fetchFeatures();
                setTimeout(() => {
                    setSuccess(null);
                }, 3000);
            } else {
                setError(response.data?.message || "Failed to delete feature");
            }
        } catch (err) {
            console.error("Error deleting feature:", err);
            setError(err.response?.data?.message || "Failed to delete feature");
        } finally {
            setDeletingId(null);
        }
    };

    // Handle toggle status
    const handleToggleStatus = async (featureId) => {
        setUpdatingStatus(featureId);
        setError(null);
        setSuccess(null);

        try {
            const response = await apiInstance.put(
                `/api/available-plans/toggle/${featureId}`
            );

            if (response.status === 200 || response.status === 201 || response.data?.success) {
                setSuccess("Feature status updated successfully!");
                fetchFeatures();
                setTimeout(() => {
                    setSuccess(null);
                }, 3000);
            } else {
                setError(response.data?.message || "Failed to update feature status");
            }
        } catch (err) {
            console.error("Error updating feature status:", err);
            setError(err.response?.data?.message || "Failed to update feature status");
        } finally {
            setUpdatingStatus(null);
        }
    };

    return (
        <div className="space-y-6 p-4 bg-gray-100 w-full min-h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Subscription Description</h1>
                    <p className="text-gray-600">
                        Manage subscription plan features and descriptions
                    </p>
                </div>
                <div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="mt-4 sm:mt-0 px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b] flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Feature
                    </button>
                </div>
            </div>

            {/* Success/Error Messages */}
            {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}
            {success && (
                <div className="p-3 bg-green-100 text-green-700 rounded-md">
                    {success}
                </div>
            )}

            {/* Table */}
            <div className="bg-white shadow-sm border border-gray-200 mt-4 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="animate-spin text-[#B02E0C]" size={32} />
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">Title</th>
                                    <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">Description</th>
                                    <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">Status</th>
                                    <th className="py-3 px-4 border border-gray-300 text-sm font-semibold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {features.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-gray-500">
                                            No features found. Click "Add Feature" to add one.
                                        </td>
                                    </tr>
                                ) : (
                                    features.map((feature) => (
                                        <tr key={feature.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 border border-gray-300 text-gray-700 font-medium">
                                                {feature.title}
                                            </td>
                                            <td className="py-3 px-4 border border-gray-300 text-gray-700">
                                                {feature.description}
                                            </td>
                                            <td className="py-3 px-4 border border-gray-300">
                                                {updatingStatus === feature.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <Loader2 className="animate-spin text-[#B02E0C]" size={16} />
                                                        <span className="text-xs text-gray-500">Updating...</span>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={() => handleToggleStatus(feature.id)}
                                                        className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer transition-all hover:opacity-80 inline-block ${
                                                            feature.is_active
                                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                        }`}
                                                        title={`Click to ${feature.is_active ? 'deactivate' : 'activate'}`}
                                                    >
                                                        {feature.is_active ? 'Active' : 'Inactive'}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 border border-gray-300 text-center">
                                                {deletingId === feature.id ? (
                                                    <Loader2 className="animate-spin text-red-600 mx-auto" size={18} />
                                                ) : (
                                                    <button
                                                        onClick={() => handleDeleteFeature(feature.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                        title="Delete feature"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Add Feature Modal */}
            {showAddModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50">
                    <div className="bg-white rounded-xl w-[500px] p-6 relative">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Add New Feature</h2>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setFormData({ title: "", description: "" });
                                    setError(null);
                                }}
                            >
                                <X className="text-gray-500 hover:text-gray-700 cursor-pointer" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleAddFeature} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter feature title"
                                    required
                                    className="w-full border rounded-md px-3 py-2 focus:ring-1 focus:ring-[#B02E0C] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-700 mb-1">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter feature description"
                                    rows="4"
                                    required
                                    className="w-full border rounded-md px-3 py-2 focus:ring-1 focus:ring-[#B02E0C] outline-none"
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setFormData({ title: "", description: "" });
                                        setError(null);
                                    }}
                                    className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-md bg-[#B02E0C] text-white hover:bg-[#8d270b] cursor-pointer"
                                >
                                    Add Feature
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionDescription;

