import { useState, useEffect } from "react";
import { GrFormEdit } from "react-icons/gr";
import { IoToggle } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { apiInstance } from "../../../config/axiosInstance";
import { Loader2, Trash2, Edit3, X, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { toPascalCase } from "../../../utils/stringUtils";

// Helper function to decode JWT token
const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

const ManagePlan = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const [planDetails, setPlanDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [updatingMember, setUpdatingMember] = useState(false);
    const [updatingCalculation, setUpdatingCalculation] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(null); // Track which plan's status is being updated
    const [deleting, setDeleting] = useState(null); // Track which plan is being deleted
    const [editPlanDetails, setEditPlanDetails] = useState(false); // Toggle edit mode for main plan details
    const [updatingPlan, setUpdatingPlan] = useState(false); // Track full plan update status

    // Form state
    const [formData, setFormData] = useState({
        subscriptionName: "",
        coupon_enable: true,
        billing_period: "",
        price: "",
        free_main_user_role: 0,
        free_main_user_count: 0,
        free_sub_user_count: "",
        free_calculation: "",
        add_member_price_per_member: "",
        add_memberIs_active: true,
        add_member_description: "",
        minimum_calculation: "",
        add_calculation_price_per_member: "",
        add_calculationIs_active: true,
        is_active: true,
    });

    // Fetch subscription plans
    const fetchPlans = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiInstance.get(`/api/subscription/getSubscriptionPlans`);
            if (response.data.success) {
                setPlans(response.data.data || []);
            } else {
                setError(response.data.message || "Failed to fetch plans");
            }
        } catch (err) {
            console.error("Error fetching plans:", err);
            setError(err.response?.data?.message || "Failed to fetch subscription plans");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    // Fetch plan details for editing
    const fetchPlanDetails = async (planId) => {
        setLoadingDetails(true);
        setError(null);
        try {
            const response = await apiInstance.get(`/api/subscription/getAdminSubscriptionDetails/${planId}`);
            if (response.data) {
                setPlanDetails(response.data);
                // Populate form with existing values for full editing
                setFormData({
                    subscriptionName: response.data.plan?.name || "",
                    price: response.data.plan?.price || "",
                    billing_period: response.data.plan?.billing_period || "",
                    free_main_user_role: 0,
                    free_main_user_count: 0,
                    free_sub_user_count: response.data.plan?.free_sub_user_count || "",
                    free_calculation: response.data.plan?.free_calculation || "",
                    coupon_enable: response.data.plan?.coupon_enable !== false,
                    add_member_price_per_member: response.data.addMember?.price_per_member || "",
                    add_memberIs_active: response.data.addMember?.is_active !== false,
                    add_member_description: response.data.addMember?.description || "",
                    minimum_calculation: response.data.addCalc?.minimum_calculation || "",
                    add_calculation_price_per_member: response.data.addCalc?.price_per_member || "",
                    add_calculationIs_active: response.data.addCalc?.is_active !== false,
                    is_active: response.data.plan?.is_active !== false,
                });
            }
        } catch (err) {
            console.error("Error fetching plan details:", err);
            setError(err.response?.data?.message || "Failed to fetch plan details");
        } finally {
            setLoadingDetails(false);
        }
    };

    // Handle edit button click
    const handleEditClick = async (planId) => {
        setSelectedPlanId(planId);
        setEditMode(true);
        setOpen(true);
        setError(null);
        setSuccess(null);
        await fetchPlanDetails(planId);
    };

    // Handle update Add Member
    const handleUpdateMember = async (e) => {
        e.preventDefault();
        if (!selectedPlanId) return;

        setUpdatingMember(true);
        setError(null);
        setSuccess(null);

        try {
            const payload = {
                subscription_id: parseInt(selectedPlanId),
                price_per_member: parseFloat(formData.add_member_price_per_member) || 0,
                description: formData.add_member_description || "",
                is_active: formData.add_memberIs_active,
            };

            const response = await apiInstance.put(
                `/api/subscription/updateAddMember`,
                payload
            );

            if (response.status === 200 || response.status === 201 || response.data?.success) {
                setSuccess("Add Member updated successfully!");
                await fetchPlanDetails(selectedPlanId);
                fetchPlans();
                setTimeout(() => {
                    setSuccess(null);
                }, 3000);
            } else {
                setError(response.data?.message || "Failed to update Add Member");
            }
        } catch (err) {
            console.error("Error updating Add Member:", err);
            setError(err.response?.data?.message || "Failed to update Add Member");
        } finally {
            setUpdatingMember(false);
        }
    };

    // Handle update Add Calculation
    const handleUpdateCalculation = async (e) => {
        e.preventDefault();
        if (!selectedPlanId) return;

        setUpdatingCalculation(true);
        setError(null);
        setSuccess(null);

        try {
            const payload = {
                subscription_id: parseInt(selectedPlanId),
                minimum_calculation: parseInt(formData.minimum_calculation) || 0,
                price_per_member: parseFloat(formData.add_calculation_price_per_member) || 0,
                is_active: formData.add_calculationIs_active,
            };

            const response = await apiInstance.put(
                `/api/subscription/updateAddCalculation`,
                payload
            );

            if (response.status === 200 || response.status === 201 || response.data?.success) {
                setSuccess("Add Calculation updated successfully!");
                await fetchPlanDetails(selectedPlanId);
                fetchPlans();
                setTimeout(() => {
                    setSuccess(null);
                }, 3000);
            } else {
                setError(response.data?.message || "Failed to update Add Calculation");
            }
        } catch (err) {
            console.error("Error updating Add Calculation:", err);
            setError(err.response?.data?.message || "Failed to update Add Calculation");
        } finally {
            setUpdatingCalculation(false);
        }
    };

    // Handle full plan update
    const handleUpdatePlan = async (e) => {
        if (e) e.preventDefault();
        if (!selectedPlanId) return;

        setUpdatingPlan(true);
        setError(null);
        setSuccess(null);

        try {
            const payload = {
                subscriptionName: formData.subscriptionName,
                price: parseFloat(formData.price),
                billing_period: parseFloat(formData.billing_period),
                free_main_user_role: 0,
                free_main_user_count: 0,
                free_sub_user_count: parseInt(formData.free_sub_user_count),
                free_calculation: parseInt(formData.free_calculation),
                add_member_price_per_member: parseFloat(formData.add_member_price_per_member) || 0,
                add_memberIs_active: formData.add_memberIs_active,
                add_member_description: formData.add_member_description || "",
                minimum_calculation: parseInt(formData.minimum_calculation) || 0,
                add_calculation_price_per_member: parseFloat(formData.add_calculation_price_per_member) || 0,
                add_calculationIs_active: formData.add_calculationIs_active,
                coupon_enable: formData.coupon_enable
            };

            const response = await apiInstance.put(
                `/api/subscription/update/${selectedPlanId}`,
                payload
            );

            if (response.status === 200 || response.data?.success) {
                setSuccess("Plan updated successfully!");
                setEditPlanDetails(false);
                await fetchPlanDetails(selectedPlanId);
                fetchPlans();
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(response.data?.message || "Failed to update plan");
            }
        } catch (err) {
            console.error("Error updating plan:", err);
            setError(err.response?.data?.message || "Failed to update plan");
        } finally {
            setUpdatingPlan(false);
        }
    };

    // Handle plan deletion
    const handleDeletePlan = async (planId) => {
        if (!window.confirm("Are you sure you want to delete this subscription plan?")) return;

        setDeleting(planId);
        setError(null);
        setSuccess(null);

        try {
            const response = await apiInstance.delete(`/api/subscription/${planId}`);
            if (response.status === 200 || response.data?.success) {
                setSuccess("Plan deleted successfully!");
                fetchPlans();
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(response.data?.message || "Failed to delete plan");
            }
        } catch (err) {
            console.error("Error deleting plan:", err);
            setError(err.response?.data?.message || "Failed to delete plan");
        } finally {
            setDeleting(null);
        }
    };

    // Handle direct status updates for add-ons
    const handleAddOnStatusUpdate = async (type, planId, status) => {
        setError(null);
        setSuccess(null);

        try {
            const payload = { is_active: !status };
            const endpoint = type === 'member'
                ? `/api/subscription/addMemberStatus/${planId}`
                : `/api/subscription/calculationStatus/${planId}`;

            const response = await apiInstance.put(endpoint, payload);

            if (response.status === 200 || response.data?.success) {
                setSuccess(`${type === 'member' ? 'Member' : 'Calculation'} status updated!`);
                if (selectedPlanId) await fetchPlanDetails(selectedPlanId);
                fetchPlans();
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(response.data?.message || "Failed to update status");
            }
        } catch (err) {
            console.error("Error updating add-on status:", err);
            setError(err.response?.data?.message || "Failed to update status");
        }
    };

    // Handle close modal
    const handleCloseModal = () => {
        setOpen(false);
        setEditMode(false);
        setSelectedPlanId(null);
        setPlanDetails(null);
        setError(null);
        setSuccess(null);
        setEditPlanDetails(false);
        // Reset form
        setFormData({
            subscriptionName: "",
            coupon_enable: true,
            billing_period: "",
            price: "",
            free_main_user_role: 0,
            free_main_user_count: 0,
            free_sub_user_count: "",
            free_calculation: "",
            add_member_price_per_member: "",
            add_memberIs_active: true,
            add_member_description: "",
            minimum_calculation: "",
            add_calculation_price_per_member: "",
            add_calculationIs_active: true,
            is_active: true,
        });
    };

    // Handle subscription status update
    const handleStatusUpdate = async (planId, currentStatus) => {
        setUpdatingStatus(planId);
        setError(null);
        setSuccess(null);

        try {
            const newStatus = !currentStatus;
            const payload = {
                is_active: newStatus
            };

            const response = await apiInstance.put(
                `/api/subscription/subscriptionStatus/${planId}`,
                payload
            );

            if (response.status === 200 || response.status === 201 || response.data?.success) {
                setSuccess(`Subscription ${newStatus ? 'activated' : 'deactivated'} successfully!`);
                // Update the plan in the list immediately
                setPlans(prevPlans =>
                    prevPlans.map(plan =>
                        plan.id === planId
                            ? { ...plan, is_active: newStatus }
                            : plan
                    )
                );
                setTimeout(() => {
                    setSuccess(null);
                }, 3000);
            } else {
                setError(response.data?.message || "Failed to update subscription status");
            }
        } catch (err) {
            console.error("Error updating subscription status:", err);
            setError(err.response?.data?.message || "Failed to update subscription status");
        } finally {
            setUpdatingStatus(null);
        }
    };

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        let finalValue = value;
        if (type === 'number' && value && value.length > 1 && value[0] === '0' && value[1] !== '.') {
            finalValue = value.replace(/^0+/, '');
        }
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'radio' ? value === 'true' : finalValue
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            // Get user ID from token
            const token = localStorage.getItem("token");
            let createdBy = 10; // Default fallback
            if (token) {
                const decoded = decodeToken(token);
                if (decoded && decoded.uid) {
                    createdBy = parseInt(decoded.uid);
                }
            }

            const payload = {
                subscriptionName: formData.subscriptionName,
                coupon_enable: formData.coupon_enable,
                billing_period: parseInt(formData.billing_period),
                price: parseFloat(formData.price),
                free_main_user_role: 0,
                free_main_user_count: 0,
                free_sub_user_count: parseInt(formData.free_sub_user_count),
                free_calculation: parseInt(formData.free_calculation),
                add_member_price_per_member: parseFloat(formData.add_member_price_per_member) || 0,
                add_memberIs_active: formData.add_memberIs_active,
                add_member_description: formData.add_member_description || "",
                minimum_calculation: parseInt(formData.minimum_calculation) || 0,
                add_calculation_price_per_member: parseFloat(formData.add_calculation_price_per_member) || 0,
                add_calculationIs_active: formData.add_calculationIs_active,
                createdBy: createdBy,
            };

            const response = await apiInstance.post(
                `/api/subscription/create`,
                payload
            );

            // Check if request was successful (status 201 or 200, or response.data.success)
            if (response.status === 201 || response.status === 200 || response.data?.success) {
                setSuccess("Subscription created successfully!");
                setOpen(false);
                // Reset form
                setFormData({
                    subscriptionName: "",
                    coupon_enable: true,
                    billing_period: "",
                    price: "",
                    free_main_user_role: 0,
                    free_main_user_count: 0,
                    free_sub_user_count: "",
                    free_calculation: "",
                    add_member_price_per_member: "",
                    add_memberIs_active: true,
                    add_member_description: "",
                    minimum_calculation: "",
                    add_calculation_price_per_member: "",
                    add_calculationIs_active: true,
                    is_active: true,
                });
                // Refresh plans list immediately to show new plan
                fetchPlans();
                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSuccess(null);
                }, 3000);
            } else {
                setError(response.data?.message || "Failed to create plan");
            }
        } catch (err) {
            console.error("Error creating plan:", err);
            setError(err.response?.data?.message || "Failed to create subscription plan");
        } finally {
            setSubmitting(false);
        }
    };

    const addOns = [
        {
            planName: "Single User",
            rs: "999",
            user: "312",
            status: "active"
        },
    ];

    return (
        <div className="space-y-4 sm:space-y-8 px-4 sm:px-8 py-4 sm:py-8 bg-[#F8FAFC] w-full min-h-screen" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/subscriptions")}
                        className="p-2.5 bg-white border border-[#E2E8F0] rounded-2xl text-[#64748B] hover:text-accent hover:border-accent/20 transition-all shadow-sm active:scale-95"
                        title="Back to Subscriptions"
                    >
                        <ArrowLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-[#0F172A] tracking-tight leading-none">Manage Plans</h2>
                        <p className="text-[#64748B] text-sm mt-1 font-medium">Handle all your plans effortlessly at the best rates</p>
                    </div>
                </div>
            </div>

            <div>
                <h1 className="text-2xl font-semibold mb-4">Subscription Plans</h1>
                {error && !loading && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                        {success}
                    </div>
                )}
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="animate-spin text-[#B02E0C]" size={32} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {plans.map((plan) => (
                            <div key={plan.id} className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-lg">{toPascalCase(plan.name)}</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleEditClick(plan.id)}
                                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-[#B02E0C]"
                                            title="Edit Plan"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeletePlan(plan.id)}
                                            disabled={deleting === plan.id}
                                            className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors text-gray-600 hover:text-rose-600 disabled:opacity-50"
                                            title="Delete Plan"
                                        >
                                            {deleting === plan.id ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={18} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600 mb-2">
                                    Billing Period: {plan.billing_period} Days
                                </div>

                                <div className="font-semibold text-[#B02E0C] text-xl mb-2">₹{parseFloat(plan.price).toFixed(2)}</div>
                                <div className="text-sm text-gray-600 mb-1">
                                    Free Users: {parseInt(plan.free_main_user_count || 0) + parseInt(plan.free_sub_user_count || 0)}
                                </div>
                                <div className="text-sm text-gray-600 mb-2">
                                    Free Calculations: {plan.free_calculation}
                                </div>
                                <div className="mt-3 flex gap-1 items-center justify-between">
                                    <div className="text-gray-600 text-sm">Status:</div>
                                    {updatingStatus === plan.id ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="animate-spin text-[#B02E0C]" size={16} />
                                            <span className="text-xs text-gray-500">Updating...</span>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => handleStatusUpdate(plan.id, plan.is_active)}
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all hover:scale-105 active:scale-95 ${plan.is_active
                                                ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                                                : 'bg-rose-50 text-rose-600 ring-1 ring-rose-200'
                                                }`}
                                            title={`Click to ${plan.is_active ? 'deactivate' : 'activate'}`}
                                        >
                                            {plan.is_active ? 'Active' : 'Inactive'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* CARD BUTTON */}
                        <div
                            onClick={() => {
                                setEditMode(false);
                                setSelectedPlanId(null);
                                setPlanDetails(null);
                                setOpen(true);
                            }}
                            className="w-full p-6 border-2 border-dashed border-red-200 rounded-xl 
                bg-white cursor-pointer hover:shadow-md transition"
                        >
                            <div className="flex flex-row gap-2 items-center">
                                <div className="text-[25px] text-black font-semibold">+</div>
                                <p className="text-lg font-semibold text-black">Add New Plan</p>
                            </div>

                            <p className="text-sm text-gray-500 mt-1">
                                Create a new subscription plan and make it active for users.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* blur OVERLAY WHEN SIDEBAR OPEN */}
            {open && (
                <div
                    onClick={handleCloseModal}
                    className="fixed inset-0  z-50 backdrop-blur-[1px] bg-[#b3b3b3]/30"
                ></div>
            )}

            {/* RIGHT SIDEBAR */}
            <div
                className={`fixed top-0 right-0 h-full overflow-y-auto md:w-[740px] w-full bg-white shadow-xl z-50
                transition-transform duration-300 
                ${open ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="bg-white w-full mx-auto rounded-xl shadow-lg pl-[40px] py-[40px] pr-1 relative">
                    {/* Header */}
                    <div className="mb-5">
                        <h2 className="text-xl font-semibold">
                            {editMode ? "Edit Plan" : "Add New Plan"}
                        </h2>
                        <p className="text-gray-500 text-sm">
                            {editMode
                                ? "Update Add Member and Add Calculation details below."
                                : "Fill in all the required details below to create a new plan."
                            }
                        </p>
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-6 right-4 text-4xl text-[#060C12] hover:text-black"
                        >
                            &times;
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
                            {success}
                        </div>
                    )}

                    {loadingDetails ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="animate-spin text-[#B02E0C]" size={32} />
                        </div>
                    ) : editMode && planDetails ? (
                        // Edit Mode - Show Plan Details and Edit Forms
                        <div className="space-y-6 pr-4">
                            {/* Plan Details Card */}
                            <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-[#E2E8F0]">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-[#0F172A]">Plan Details</h3>
                                    <button
                                        onClick={() => setEditPlanDetails(!editPlanDetails)}
                                        className="flex items-center gap-2 text-sm font-bold text-[#B02E0C] hover:underline"
                                    >
                                        {editPlanDetails ? <><X size={14} /> Cancel</> : <><Edit3 size={14} /> Edit Plan</>}
                                    </button>
                                </div>

                                {editPlanDetails ? (
                                    <form onSubmit={handleUpdatePlan} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-black text-[#94A3B8] uppercase tracking-wider mb-1 block">Plan Name</label>
                                                <input
                                                    type="text"
                                                    name="subscriptionName"
                                                    value={formData.subscriptionName}
                                                    onChange={handleInputChange}
                                                    className="w-full border-2 border-[#060C121A] rounded-xl p-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#B02E0C]/20"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-black text-[#94A3B8] uppercase tracking-wider mb-1 block">Price (₹)</label>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handleInputChange}
                                                    step="0.01"
                                                    className="w-full border-2 border-[#060C121A] rounded-xl p-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#B02E0C]/20"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-black text-[#94A3B8] uppercase tracking-wider mb-1 block">Billing Period (Days)</label>
                                                <input
                                                    type="number"
                                                    name="billing_period"
                                                    value={formData.billing_period}
                                                    onChange={handleInputChange}
                                                    className="w-full border-2 border-[#060C121A] rounded-xl p-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#B02E0C]/20"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-black text-[#94A3B8] uppercase tracking-wider mb-1 block">Free User Count</label>
                                                <input
                                                    type="number"
                                                    name="free_sub_user_count"
                                                    value={formData.free_sub_user_count}
                                                    onChange={handleInputChange}
                                                    className="w-full border-2 border-[#060C121A] rounded-xl p-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#B02E0C]/20"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-black text-[#94A3B8] uppercase tracking-wider mb-1 block">Free Calculation</label>
                                                <input
                                                    type="number"
                                                    name="free_calculation"
                                                    value={formData.free_calculation}
                                                    onChange={handleInputChange}
                                                    className="w-full border-2 border-[#060C121A] rounded-xl p-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#B02E0C]/20"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-black text-[#94A3B8] uppercase tracking-wider mb-1 block italic">Coupon Enabled</label>
                                                <div className="flex gap-4 items-center mt-2">
                                                    <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
                                                        <input
                                                            type="radio"
                                                            name="coupon_enable"
                                                            value="true"
                                                            checked={formData.coupon_enable === true}
                                                            onChange={handleInputChange}
                                                            className="w-4 h-4"
                                                            style={{ accentColor: '#B02E0C' }}
                                                        />
                                                        <span>True</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
                                                        <input
                                                            type="radio"
                                                            name="coupon_enable"
                                                            value="false"
                                                            checked={formData.coupon_enable === false}
                                                            onChange={handleInputChange}
                                                            className="w-4 h-4"
                                                            style={{ accentColor: '#B02E0C' }}
                                                        />
                                                        <span>False</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="submit"
                                                disabled={updatingPlan}
                                                className="px-4 py-2 bg-[#B02E0C] text-white rounded-xl text-sm font-bold hover:bg-[#8D270B] transition-all flex items-center gap-2"
                                            >
                                                {updatingPlan ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                                Update Plan
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-12 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[#64748B] font-medium min-w-[100px]">Plan Name:</span>
                                            <span className="font-bold text-[#0F172A]">{toPascalCase(planDetails.plan?.name)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[#64748B] font-medium min-w-[100px]">Price:</span>
                                            <span className="font-bold text-[#0F172A]">₹{parseFloat(planDetails.plan?.price || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[#64748B] font-medium min-w-[100px]">Billing Period:</span>
                                            <span className="font-bold text-[#0F172A]">{planDetails.plan?.billing_period} Days</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[#64748B] font-medium min-w-[100px]">Status:</span>
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${planDetails.plan?.is_active ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' : 'bg-rose-50 text-rose-600 ring-1 ring-rose-100'}`}>
                                                {planDetails.plan?.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Add Member Edit Form */}
                            <form onSubmit={handleUpdateMember} className="space-y-4 border-t border-[#E2E8F0] pt-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-[#0F172A]">Add New Add-ons</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-[#64748B]">Status:</span>
                                        <button
                                            type="button"
                                            onClick={() => handleAddOnStatusUpdate('member', selectedPlanId, formData.add_memberIs_active)}
                                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${formData.add_memberIs_active ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' : 'bg-rose-50 text-rose-600 ring-1 ring-rose-100'}`}
                                        >
                                            {formData.add_memberIs_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black text-[#94A3B8] uppercase tracking-wider mb-1 block">Add Member Price Per Member</label>
                                        <input
                                            type="number"
                                            name="add_member_price_per_member"
                                            value={formData.add_member_price_per_member}
                                            onChange={handleInputChange}
                                            placeholder="Enter Member Price"
                                            step="0.01"
                                            required
                                            className="w-full border-2 border-[#060C121A] rounded-xl p-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-black text-[#94A3B8] uppercase tracking-wider mb-1 block">Add Member Active</label>
                                        <div className="flex gap-6 items-center mt-2.5">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="add_memberIs_active"
                                                    value="true"
                                                    checked={formData.add_memberIs_active === true}
                                                    onChange={handleInputChange}
                                                    className="w-4 h-4 accent-[#B02E0C]"
                                                />
                                                <span className="text-sm font-bold text-[#475569] group-hover:text-[#0F172A]">True</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="add_memberIs_active"
                                                    value="false"
                                                    checked={formData.add_memberIs_active === false}
                                                    onChange={handleInputChange}
                                                    className="w-4 h-4 accent-[#B02E0C]"
                                                />
                                                <span className="text-sm font-bold text-[#475569] group-hover:text-[#0F172A]">False</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-black text-[#94A3B8] uppercase tracking-wider mb-1 block">Add Member Description</label>
                                    <textarea
                                        name="add_member_description"
                                        value={formData.add_member_description}
                                        onChange={handleInputChange}
                                        placeholder="Enter description"
                                        required
                                        className="w-full border-2 h-24 border-[#060C121A] rounded-xl p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                    ></textarea>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-6 py-2.5 bg-[#F1F5F9] text-[#475569] rounded-xl text-sm font-bold hover:bg-[#E2E8F0] transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updatingMember}
                                        className="px-6 py-2.5 bg-[#B02E0C] text-white rounded-xl text-sm font-bold hover:bg-[#8D270B] shadow-lg shadow-[#B02E0C]/20 transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {updatingMember ? (
                                            <>
                                                <Loader2 className="animate-spin" size={16} />
                                                Updating...
                                            </>
                                        ) : (
                                            "Update Add Member"
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Add Calculation Edit Form */}
                            <form onSubmit={handleUpdateCalculation} className="space-y-4 border-t border-[#E2E8F0] pt-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-[#0F172A]">Add New Calculation Pack</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-[#64748B]">Status:</span>
                                        <button
                                            type="button"
                                            onClick={() => handleAddOnStatusUpdate('calculation', selectedPlanId, formData.add_calculationIs_active)}
                                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${formData.add_calculationIs_active ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' : 'bg-rose-50 text-rose-600 ring-1 ring-rose-100'}`}
                                        >
                                            {formData.add_calculationIs_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black text-[#94A3B8] uppercase tracking-wider mb-1 block">Minimum Calculation</label>
                                        <input
                                            type="number"
                                            name="minimum_calculation"
                                            value={formData.minimum_calculation}
                                            onChange={handleInputChange}
                                            placeholder="Enter Minimum Calculation"
                                            required
                                            className="w-full border-2 border-[#060C121A] rounded-xl p-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-black text-[#94A3B8] uppercase tracking-wider mb-1 block">Add Calculation Price Per Member</label>
                                        <input
                                            type="number"
                                            name="add_calculation_price_per_member"
                                            value={formData.add_calculation_price_per_member}
                                            onChange={handleInputChange}
                                            placeholder="Enter Calculation Price"
                                            step="0.01"
                                            required
                                            className="w-full border-2 border-[#060C121A] rounded-xl p-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-black text-[#94A3B8] uppercase tracking-wider mb-1 block">Add Calculation Active</label>
                                        <div className="flex gap-6 items-center mt-2.5 text-[#475569]">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="add_calculationIs_active"
                                                    value="true"
                                                    checked={formData.add_calculationIs_active === true}
                                                    onChange={handleInputChange}
                                                    className="w-4 h-4 accent-[#B02E0C]"
                                                />
                                                <span className="text-sm font-bold group-hover:text-[#0F172A]">True</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="add_calculationIs_active"
                                                    value="false"
                                                    checked={formData.add_calculationIs_active === false}
                                                    onChange={handleInputChange}
                                                    className="w-4 h-4 accent-[#B02E0C]"
                                                />
                                                <span className="text-sm font-bold group-hover:text-[#0F172A]">False</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pb-8">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-6 py-2.5 bg-[#F1F5F9] text-[#475569] rounded-xl text-sm font-bold hover:bg-[#E2E8F0] transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updatingCalculation}
                                        className="px-6 py-2.5 bg-[#B02E0C] text-white rounded-xl text-sm font-bold hover:bg-[#8D270B] shadow-lg shadow-[#B02E0C]/20 transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {updatingCalculation ? (
                                            <>
                                                <Loader2 className="animate-spin" size={16} />
                                                Updating...
                                            </>
                                        ) : (
                                            "Update Add Calculation"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        // Add Mode - Show Full Form
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Plan Name + Price */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                                <div>
                                    <label className="text-[16px] font-medium text-[#060C12]">Plan Name *</label>
                                    <input
                                        type="text"
                                        name="subscriptionName"
                                        value={formData.subscriptionName}
                                        onChange={handleInputChange}
                                        placeholder="Enter plan name"
                                        required
                                        className="mt-1 w-full border-2 border-[#060C121A] rounded-[12px] p-[10px] placeholder:text-[#838588] focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-[16px] font-medium text-[#060C12]">Price *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="₹"
                                        step="0.01"
                                        required
                                        className="mt-1 w-full border-2 border-[#060C121A] rounded-[12px] p-[10px] placeholder:text-[#838588] focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>

                            {/* Billing Period + Coupon Enable */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                                <div>
                                    <label className="text-[16px] font-medium text-[#060C12]">Billing Period (Days) *</label>
                                    <input
                                        type="number"
                                        name="billing_period"
                                        value={formData.billing_period}
                                        onChange={handleInputChange}
                                        placeholder="Enter Billing Period in days"
                                        required
                                        className="mt-1 w-full border-2 border-[#060C121A] rounded-[12px] p-[10px] placeholder:text-[#838588] focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium block mb-2">Coupon Enable *</label>
                                    <div className="flex gap-6 items-center mt-4.5">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="coupon_enable"
                                                value="true"
                                                checked={formData.coupon_enable === true}
                                                onChange={handleInputChange}
                                                className="w-4 h-4"
                                                style={{ accentColor: '#B02E0C' }}
                                            />
                                            <span>True</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="coupon_enable"
                                                value="false"
                                                checked={formData.coupon_enable === false}
                                                onChange={handleInputChange}
                                                className="w-4 h-4"
                                                style={{ accentColor: '#B02E0C' }}
                                            />
                                            <span>False</span>
                                        </label>
                                    </div>
                                </div>
                            </div>



                            {/* Sub User + Free Calculation */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[16px] font-medium text-[#060C12]">Free User Count *</label>
                                    <input
                                        type="number"
                                        name="free_sub_user_count"
                                        value={formData.free_sub_user_count}
                                        onChange={handleInputChange}
                                        placeholder="Enter User Count"
                                        required
                                        className="mt-1 w-full border-2 border-[#060C121A] rounded-[12px] p-[10px] placeholder:text-[#838588] focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-[16px] font-medium text-[#060C12]">Free Calculation *</label>
                                    <input
                                        type="number"
                                        name="free_calculation"
                                        value={formData.free_calculation}
                                        onChange={handleInputChange}
                                        placeholder="Enter Free Calculation"
                                        required
                                        className="mt-1 w-full border-2 border-[#060C121A] rounded-[12px] p-[10px] placeholder:text-[#838588] focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>

                            {/* Add New Add-ons Header */}
                            <div className="flex justify-between items-center mt-4">
                                <h3 className="text-lg font-semibold">Add New Add-ons</h3>
                            </div>

                            {/* Add-ons Inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[16px] font-medium text-[#060C12]">Add Member Price Per Member</label>
                                    <input
                                        type="number"
                                        name="add_member_price_per_member"
                                        value={formData.add_member_price_per_member}
                                        onChange={handleInputChange}
                                        placeholder="Enter Member Price"
                                        step="0.01"
                                        className="mt-1 w-full border-2 border-[#060C121A] rounded-[12px] p-[10px] placeholder:text-[#838588] focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium block mb-2">Add Member Active</label>
                                    <div className="flex gap-6 items-center mt-4.5">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="add_memberIs_active"
                                                value="true"
                                                checked={formData.add_memberIs_active === true}
                                                onChange={handleInputChange}
                                                className="w-4 h-4"
                                                style={{ accentColor: '#B02E0C' }}
                                            />
                                            <span>True</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="add_memberIs_active"
                                                value="false"
                                                checked={formData.add_memberIs_active === false}
                                                onChange={handleInputChange}
                                                className="w-4 h-4"
                                                style={{ accentColor: '#B02E0C' }}
                                            />
                                            <span>False</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Add-ons Description */}
                            <div>
                                <label className="text-[16px] font-medium text-[#060C12]">Add Member Description</label>
                                <textarea
                                    name="add_member_description"
                                    value={formData.add_member_description}
                                    onChange={handleInputChange}
                                    placeholder="Enter description"
                                    className="mt-1 w-full border-2 h-24 border-[#060C121A] rounded-[12px] p-[10px] placeholder:text-[#838588] focus:outline-none focus:ring-2 focus:ring-orange-500"
                                ></textarea>
                            </div>

                            <div className="flex justify-between items-center mt-4">
                                <h3 className="text-lg font-semibold">Add New Calculation Pack</h3>
                            </div>

                            {/* Calculation Pack Inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[16px] font-medium text-[#060C12]">Calculations per Pack</label>
                                    <input
                                        type="number"
                                        name="minimum_calculation"
                                        value={formData.minimum_calculation}
                                        onChange={handleInputChange}
                                        placeholder="Enter Calculations per Pack"
                                        className="mt-1 w-full border-2 border-[#060C121A] rounded-[12px] p-[10px] placeholder:text-[#838588] focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-[16px] font-medium text-[#060C12]">Price per Pack (₹)</label>
                                    <input
                                        type="number"
                                        name="add_calculation_price_per_member"
                                        value={formData.add_calculation_price_per_member}
                                        onChange={handleInputChange}
                                        placeholder="Enter Price per Pack"
                                        step="0.01"
                                        className="mt-1 w-full border-2 border-[#060C121A] rounded-[12px] p-[10px] placeholder:text-[#838588] focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium block mb-2">Add Calculation Active</label>
                                    <div className="flex gap-6 items-center mt-4.5">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="add_calculationIs_active"
                                                value="true"
                                                checked={formData.add_calculationIs_active === true}
                                                onChange={handleInputChange}
                                                className="w-4 h-4"
                                                style={{ accentColor: '#B02E0C' }}
                                            />
                                            <span>True</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="add_calculationIs_active"
                                                value="false"
                                                checked={formData.add_calculationIs_active === false}
                                                onChange={handleInputChange}
                                                className="w-4 h-4"
                                                style={{ accentColor: '#B02E0C' }}
                                            />
                                            <span>False</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Toggle */}
                            <div className="flex items-center gap-4 mt-4">
                                <label className="text-sm font-medium">Plan Active Status</label>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleInputChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#B02E0C] transition-all"></div>
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
                                </label>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={submitting}
                                    className="px-5 py-2 bg-gray-200 rounded-[14px] hover:bg-gray-100 cursor-pointer disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 bg-[#B02E0C] text-white rounded-[14px] hover:bg-orange-800 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="animate-spin" size={16} />
                                            Creating...
                                        </>
                                    ) : (
                                        "Add Plan"
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>


        </div>
    );
};

export default ManagePlan;
