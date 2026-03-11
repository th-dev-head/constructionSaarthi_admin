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
        <div className="pb-10 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight leading-none">
                        Subscription Description
                    </h1>
                    <p className="text-[#64748B] text-sm mt-2 font-medium">
                        Manage subscription plan features and descriptions for your users
                    </p>
                </div>
                <div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-5 py-2.5 bg-[#B02E0C] text-white rounded-xl text-sm font-bold hover:bg-[#8d270b] transition-all shadow-lg shadow-[#B02E0C]/20 flex items-center gap-2 active:scale-95 cursor-pointer"
                    >
                        <Plus size={18} />
                        Add Feature
                    </button>
                </div>
            </div>

            {/* Success/Error Notifications (Toast style placeholder - using your existing logic but updated UI) */}
            <div className="space-y-3 mb-6">
                {error && (
                    <div className="p-4 bg-accent/5 border border-accent/10 text-accent rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 text-accent">
                            <X size={16} />
                        </div>
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <Plus size={16} className="rotate-45" />
                        </div>
                        <p className="text-sm font-medium">{success}</p>
                    </div>
                )}
            </div>

            {/* Main Content Card */}
            <div className="bg-white shadow-sm ring-1 ring-[#E2E8F0] rounded-3xl overflow-hidden transition-all duration-500">
                <div className="bg-[#FFFFFF] p-5 border-b border-[#F1F5F9]">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-accent rounded-full" />
                        <h2 className="text-lg font-bold text-[#0F172A]">Available Features</h2>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="animate-spin text-accent" size={40} />
                            <p className="text-[#64748B] text-sm mt-4 font-medium italic">Loading features...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F8FAFC]">
                                    <th className="py-4 px-6 text-[10px] font-black text-[#64748B] uppercase tracking-widest border-b border-[#F1F5F9]">Title</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-[#64748B] uppercase tracking-widest border-b border-[#F1F5F9]">Description</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-[#64748B] uppercase tracking-widest border-b border-[#F1F5F9]">Status</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-[#64748B] uppercase tracking-widest border-b border-[#F1F5F9] text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F1F5F9]">
                                {features.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-20 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center text-[#94A3B8]">
                                                    <Plus size={32} />
                                                </div>
                                                <p className="text-[#64748B] font-medium">No features added yet</p>
                                                <button
                                                    onClick={() => setShowAddModal(true)}
                                                    className="text-accent text-sm font-bold hover:underline"
                                                >
                                                    Add your first feature
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    features.map((feature, idx) => (
                                        <tr key={feature.id} className="group hover:bg-[#F8FAFC] transition-colors">
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center text-accent font-black text-xs select-none group-hover:scale-110 transition-transform">
                                                        {idx + 1}
                                                    </div>
                                                    <p className="font-medium text-[#0F172A] group-hover:text-accent transition-colors">
                                                        {feature.title}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <p className="text-sm text-[#475569] leading-relaxed max-w-md">
                                                    {feature.description}
                                                </p>
                                            </td>
                                            <td className="py-5 px-6">
                                                {updatingStatus === feature.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <Loader2 className="animate-spin text-accent" size={16} />
                                                        <span className="text-xs text-[#94A3B8] font-bold uppercase">Updating...</span>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={() => handleToggleStatus(feature.id)}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all hover:scale-105 active:scale-95 ${feature.is_active
                                                            ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 shadow-sm shadow-emerald-100'
                                                            : 'bg-accent/5 text-accent ring-1 ring-accent/10'
                                                            }`}
                                                    >
                                                        <div className={`w-1.5 h-1.5 rounded-full ${feature.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-accent'}`} />
                                                        {feature.is_active ? 'Active' : 'Inactive'}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-5 px-6 text-center">
                                                {deletingId === feature.id ? (
                                                    <Loader2 className="animate-spin text-accent mx-auto" size={18} />
                                                ) : (
                                                    <button
                                                        onClick={() => handleDeleteFeature(feature.id)}
                                                        className="w-9 h-9 flex items-center justify-center text-[#94A3B8] hover:text-accent hover:bg-accent/5 rounded-xl transition-all cursor-pointer active:scale-90"
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

            {/* Styled Add Feature Modal */}
            {showAddModal && (
                <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 text-center sm:p-0">
                    <div
                        className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                        onClick={() => setShowAddModal(false)}
                    />

                    <div className="relative bg-white rounded-[2rem] text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-in zoom-in-95 duration-300 ring-1 ring-[#E2E8F0]">
                        <div className="bg-white px-6 pt-6 pb-2">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                                        <Plus size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Add Feature</h3>
                                        <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest mt-0.5">Subscription Plan Details</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setFormData({ title: "", description: "" });
                                        setError(null);
                                    }}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#F8FAFC] text-[#94A3B8] hover:text-[#0F172A] transition-all cursor-pointer"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAddFeature} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-[#64748B] uppercase tracking-widest ml-1">
                                        Feature Title <span className="text-accent">*</span>
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 24/7 Priority Support"
                                            required
                                            className="w-full bg-[#F8FAFC] border-2 border-[#F1F5F9] rounded-2xl px-4 py-3.5 text-sm font-bold text-[#0F172A] placeholder:text-[#94A3B8] focus:border-accent focus:bg-white outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-[#64748B] uppercase tracking-widest ml-1">
                                        Full Description <span className="text-accent">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Briefly explain what this feature provides..."
                                        rows="4"
                                        required
                                        className="w-full bg-[#F8FAFC] border-2 border-[#F1F5F9] rounded-2xl px-4 py-3.5 text-sm font-bold text-[#0F172A] placeholder:text-[#94A3B8] focus:border-accent focus:bg-white outline-none transition-all resize-none"
                                    ></textarea>
                                </div>

                                <div className="flex gap-4 mt-8 pb-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-6 py-4 rounded-2xl border-2 border-[#F1F5F9] text-sm font-black text-[#64748B] uppercase tracking-widest hover:bg-[#F8FAFC] transition-all cursor-pointer active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-4 rounded-2xl bg-[#B02E0C] text-white text-sm font-black uppercase tracking-widest hover:bg-[#8D270B] shadow-lg shadow-[#B02E0C]/20 transition-all cursor-pointer active:scale-95"
                                    >
                                        Add Feature
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionDescription;

