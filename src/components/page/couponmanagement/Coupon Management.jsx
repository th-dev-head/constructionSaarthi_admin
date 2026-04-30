import { useState, useEffect } from "react";
import {
  Eye,
  X,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  Ticket,
  EllipsisVertical,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { apiInstance } from "../../../config/axiosInstance";
import DataTable from "../../common/DataTable";
import CustomDatePicker from "../../common/CustomDatePicker";
import CustomSelect from "../../common/CustomSelect";
import {
  buildRequestKey,
  getCachedResponse,
  setCachedResponse,
} from "../../../redux/utils/fetchCache";

const CouponManagement = () => {

  const [showAddModal, setShowAddModal] = useState(false);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [criteria, setCriteria] = useState([]);

  // Coupon Criteria state
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [loadingCriteria, setLoadingCriteria] = useState(false);
  const [errorCriteria, setErrorCriteria] = useState(null);
  const [successCriteria, setSuccessCriteria] = useState(null);
  const [showAddCriteriaModal, setShowAddCriteriaModal] = useState(false);
  const [showEditCriteriaModal, setShowEditCriteriaModal] = useState(false);
  const [selectedCriteria, setSelectedCriteria] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCriteriaId, setDeletingCriteriaId] = useState(null);
  const [showCouponDeleteModal, setShowCouponDeleteModal] = useState(false);
  const [deletingCouponId, setDeletingCouponId] = useState(null);

  // Form state for criteria
  const [criteriaFormData, setCriteriaFormData] = useState({
    attach_phone: false,
    attach_email: false,
    reason_place_id: false,
    date_range: false,
    for_new: false,
    for_existing_with_condition: false,
    for_existing_non_condition: false,
    need_map_existing_user: false,
    need_map_upcoming_user: false,
    existing_user_ids: "",
  });

  // Coupon form state
  const [couponFormData, setCouponFormData] = useState({
    code: "",
    title: "",
    description: "",
    status: true,
    start_date: "",
    end_date: "",
    subscription_id: [],
    global_usage_limit: "",
    can_combine_with_referral_credit: true,
    coupon_type_id: 1,
    financial_value: "",
    CouponTypeCriteriaId: "",
    existing_user_ids: "",
  });

  const [plans, setPlans] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [couponTypes, setCouponTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const couponmanagement = [
    {
      id: 1,
      name: "SAVE20",
      discounttype: "Percentage",
      discountvalue: "20%",
      validfrom: "01 Oct 2025",
      expirydate: "30 Oct 2025",
      usagelimit: "100 uses",
      usedcount: "45",
      status: "active",
      description: "Admin",
      createdAt: "903-759-6505",
    },
    // {
    //   id: 2,
    //   name: "Jatin Shah",
    //   description: "Supervisor",
    //   createdAt: "903-759-6505",
    // },
    // {
    //   id: 3,
    //   name: "Ramesh Patel",
    //   description: "Builder",
    //   createdAt: "903-759-6505",
    // },
    // {
    //   id: 4,
    //   name: "Satish Patel",
    //   description: "Admin",
    //   createdAt: "903-759-6505",
    // },
  ];

  // Fetch Coupons
  const fetchCoupons = async ({ force = false } = {}) => {
    const requestKey = buildRequestKey("couponManagement/fetchCoupons", {});
    if (!force) {
      const cached = getCachedResponse(requestKey);
      if (Array.isArray(cached)) {
        setCoupons(cached);
        return;
      }
    }

    setLoadingCoupons(true);
    try {
      const response = await apiInstance.get("/api/coupon/all");
      if (response.data.success || response.data.message === "Coupons retrieved successfully") {
        const nextCoupons = response.data.data || [];
        setCoupons(nextCoupons);
        setCachedResponse(requestKey, nextCoupons);
      }
    } catch (err) {
      console.error("Error fetching coupons:", err);
      setError("Failed to fetch coupons");
    } finally {
      setLoadingCoupons(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchPlans();
    fetchCriteria();
    fetchCouponTypes();
    fetchUsersList();
  }, []);

  // Effect to close the action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest('.action-menu-container')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  // Fetch Coupon Types
  const fetchCouponTypes = async ({ force = false } = {}) => {
    const requestKey = buildRequestKey("couponManagement/fetchCouponTypes", {});
    if (!force) {
      const cached = getCachedResponse(requestKey);
      if (Array.isArray(cached)) {
        setCouponTypes(cached);
        return;
      }
    }

    setLoadingTypes(true);
    try {
      const response = await apiInstance.get("/api/coupon-type/getAllCoupon?page=1&limit=10");
      if (response.data.message === "All Coupon Types fetched successfully") {
        const nextCouponTypes = response.data.couponTypes || [];
        setCouponTypes(nextCouponTypes);
        setCachedResponse(requestKey, nextCouponTypes);
      }
    } catch (err) {
      console.error("Error fetching coupon types:", err);
    } finally {
      setLoadingTypes(false);
    }
  };

  const fetchUsersList = async ({ force = false } = {}) => {
    const requestKey = buildRequestKey("couponManagement/fetchUsersList", {});
    if (!force) {
      const cached = getCachedResponse(requestKey);
      if (Array.isArray(cached)) {
        setAllUsers(cached);
        return;
      }
    }

    setLoadingUsers(true);
    try {
      const response = await apiInstance.get("/api/coupon/admin/users");
      if (response.data.data) {
        const nextUsers = response.data.data || [];
        setAllUsers(nextUsers);
        setCachedResponse(requestKey, nextUsers);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch subscription plans
  const fetchPlans = async ({ force = false } = {}) => {
    const requestKey = buildRequestKey("couponManagement/fetchPlans", {});
    if (!force) {
      const cached = getCachedResponse(requestKey);
      if (Array.isArray(cached)) {
        setPlans(cached);
        return;
      }
    }

    try {
      const response = await apiInstance.get(`/api/subscription/getSubscriptionPlans`);
      if (response.data.success) {
        const nextPlans = response.data.data || [];
        setPlans(nextPlans);
        setCachedResponse(requestKey, nextPlans);
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
    }
  };

  // Fetch coupon criteria
  const fetchCriteria = async ({ force = false } = {}) => {
    const requestKey = buildRequestKey("couponManagement/fetchCriteria", {});
    if (!force) {
      const cached = getCachedResponse(requestKey);
      if (Array.isArray(cached)) {
        setCriteria(cached);
        return;
      }
    }

    setLoadingCriteria(true);
    setErrorCriteria(null);
    try {
      const response = await apiInstance.get(`/api/coupon`);
      if (response.data && response.data.data) {
        const nextCriteria = response.data.data;
        setCriteria(nextCriteria);
        setCachedResponse(requestKey, nextCriteria);
      } else {
        setErrorCriteria("Failed to fetch coupon criteria");
      }
    } catch (err) {
      console.error("Error fetching criteria:", err);
      setErrorCriteria(err.response?.data?.message || "Failed to fetch coupon criteria");
    } finally {
      setLoadingCriteria(false);
    }
  };

  // Handle input change for criteria form
  const handleCriteriaInputChange = (e) => {
    const { name, type, checked } = e.target;
    setCriteriaFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : e.target.value
    }));
  };

  // Handle create criteria
  const handleCreateCriteria = async (e) => {
    e.preventDefault();
    setErrorCriteria(null);
    setSuccessCriteria(null);

    try {
      const dataToSubmit = {
        ...criteriaFormData,
        existing_user_ids: criteriaFormData.existing_user_ids
          ? criteriaFormData.existing_user_ids.split(',').map(id => id.trim()).filter(id => id !== "")
          : []
      };

      const response = await apiInstance.post(
        `/api/coupon/createCouponCriteria`,
        dataToSubmit
      );

      if (response.status === 200 || response.status === 201 || response.data?.success) {
        setSuccessCriteria("Coupon criteria created successfully!");
        setShowAddCriteriaModal(false);
        resetCriteriaForm();
        fetchCriteria({ force: true });
        setTimeout(() => {
          setSuccessCriteria(null);
        }, 3000);
      } else {
        setErrorCriteria(response.data?.message || "Failed to create coupon criteria");
      }
    } catch (err) {
      console.error("Error creating criteria:", err);
      setErrorCriteria(err.response?.data?.message || "Failed to create coupon criteria");
    }
  };

  // Handle update criteria
  const handleUpdateCriteria = async (e) => {
    e.preventDefault();
    if (!selectedCriteria) return;

    setErrorCriteria(null);
    setSuccessCriteria(null);

    try {
      const dataToSubmit = {
        ...criteriaFormData,
        existing_user_ids: criteriaFormData.existing_user_ids
          ? String(criteriaFormData.existing_user_ids).split(',').map(id => id.trim()).filter(id => id !== "")
          : []
      };

      const response = await apiInstance.put(
        `/api/coupon/${selectedCriteria.id}`,
        dataToSubmit
      );

      if (response.status === 200 || response.status === 201 || response.data?.success) {
        setSuccessCriteria("Coupon criteria updated successfully!");
        setShowEditCriteriaModal(false);
        setSelectedCriteria(null);
        resetCriteriaForm();
        fetchCriteria({ force: true });
        setTimeout(() => {
          setSuccessCriteria(null);
        }, 3000);
      } else {
        setErrorCriteria(response.data?.message || "Failed to update coupon criteria");
      }
    } catch (err) {
      console.error("Error updating criteria:", err);
      setErrorCriteria(err.response?.data?.message || "Failed to update coupon criteria");
    }
  };

  // Handle delete criteria
  const handleDeleteCriteria = async (criteriaId) => {
    setDeletingCriteriaId(criteriaId);
    setShowDeleteModal(true);
  };

  const confirmDeleteCriteria = async () => {
    const criteriaId = deletingCriteriaId;
    if (!criteriaId) return;

    setDeletingId(criteriaId);
    setErrorCriteria(null);
    setSuccessCriteria(null);
    setShowDeleteModal(false);

    try {
      const response = await apiInstance.delete(`/api/coupon/${criteriaId}`);

      if (response.status === 200 || response.status === 204 || response.data?.success) {
        setSuccessCriteria("Coupon criteria deleted successfully!");
        fetchCriteria({ force: true });
        setTimeout(() => {
          setSuccessCriteria(null);
        }, 3000);
      } else {
        setErrorCriteria(response.data?.message || "Failed to delete coupon criteria");
      }
    } catch (err) {
      console.error("Error deleting criteria:", err);
      setErrorCriteria(err.response?.data?.message || "Failed to delete coupon criteria");
    } finally {
      setDeletingId(null);
    }
  };

  // Handle edit click
  const handleEditClick = (criteriaItem) => {
    setSelectedCriteria(criteriaItem);
    setCriteriaFormData({
      attach_phone: criteriaItem.attach_phone || false,
      attach_email: criteriaItem.attach_email || false,
      reason_place_id: criteriaItem.reason_place_id || false,
      date_range: criteriaItem.date_range || false,
      for_new: criteriaItem.for_new || false,
      for_existing_non_condition: criteriaItem.for_existing_non_condition || false,
      need_map_existing_user: criteriaItem.need_map_existing_user || false,
      need_map_upcoming_user: criteriaItem.need_map_upcoming_user || false,
      existing_user_ids: Array.isArray(criteriaItem.existing_user_ids) ? criteriaItem.existing_user_ids.join(', ') : "",
    });
    setShowEditCriteriaModal(true);
  };

  // Reset criteria form
  const resetCriteriaForm = () => {
    setCriteriaFormData({
      attach_phone: false,
      attach_email: false,
      reason_place_id: false,
      date_range: false,
      for_new: false,
      for_existing_with_condition: false,
      need_map_existing_user: false,
      need_map_upcoming_user: false,
      existing_user_ids: "",
    });
  };


  // Handle coupon input change
  const handleCouponInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = value;

    if (type === "number" && value) {
      if (value.length > 1 && value[0] === '0' && value[1] !== '.') {
        finalValue = value.replace(/^0+/, '');
      }
    }

    setCouponFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked :
        type === "number" ? (finalValue === "" ? "" : Number(finalValue)) : finalValue,
    }));
  };

  // Handle subscription multi-select
  const handleSubscriptionChange = (id) => {
    setCouponFormData(prev => {
      const current = prev.subscription_id;
      if (current.includes(id)) {
        return { ...prev, subscription_id: current.filter(i => i !== id) };
      } else {
        return { ...prev, subscription_id: [...current, id] };
      }
    });
  };

  // Reset coupon form
  const resetCouponForm = () => {
    setCouponFormData({
      code: "",
      title: "",
      description: "",
      status: true,
      start_date: "",
      end_date: "",
      subscription_id: [],
      global_usage_limit: "",
      can_combine_with_referral_credit: true,
      coupon_type_id: 1,
      financial_value: "",
      CouponTypeCriteriaId: "",
      existing_user_ids: "",
    });
  };

  // Handle create coupon
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const dataToSubmit = {
        ...couponFormData,
        existing_user_ids: couponFormData.existing_user_ids
          ? String(couponFormData.existing_user_ids).split(',').map(id => id.trim()).filter(id => id !== "")
          : []
      };

      const response = await apiInstance.post("/api/coupon/create", dataToSubmit);

      if (response.status === 200 || response.status === 201 || response.data?.success) {
        setSuccess("Coupon created successfully!");
        setShowAddModal(false);
        resetCouponForm();
        fetchCoupons({ force: true });
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.data?.message || "Failed to create coupon");
      }
    } catch (err) {
      console.error("Error creating coupon:", err);
      setError(err.response?.data?.message || "Failed to create coupon");
    } finally {
      setLoading(false);
    }
  };

  // Handle update coupon
  const handleUpdateCoupon = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const dataToSubmit = {
        ...couponFormData,
        existing_user_ids: couponFormData.existing_user_ids
          ? String(couponFormData.existing_user_ids).split(',').map(id => id.trim()).filter(id => id !== "")
          : [],
        couponId: selectedCoupon.id
      };

      const response = await apiInstance.put(`/api/coupon/update/${selectedCoupon.id}`, dataToSubmit);

      if (response.status === 200 || response.status === 201 || response.data?.success) {
        setSuccess("Coupon updated successfully!");
        setShowEditModal(false);
        setSelectedCoupon(null);
        resetCouponForm();
        fetchCoupons({ force: true });
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.data?.message || "Failed to update coupon");
      }
    } catch (err) {
      console.error("Error updating coupon:", err);
      setError(err.response?.data?.message || "Failed to update coupon");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete coupon
  const handleDeleteCoupon = (couponId) => {
    setDeletingCouponId(couponId);
    setShowCouponDeleteModal(true);
  };

  const confirmDeleteCoupon = async () => {
    const couponId = deletingCouponId;
    if (!couponId) return;

    setShowCouponDeleteModal(false);
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiInstance.delete(`/api/coupon/delete`, {
        data: { couponId: couponId }
      });

      if (response.status === 200 || response.status === 201 || response.data?.success) {
        setSuccess("Coupon deleted successfully!");
        fetchCoupons({ force: true });
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.data?.message || "Failed to delete coupon");
      }
    } catch (err) {
      console.error("Error deleting coupon:", err);
      if (err.response && err.response.status === 404) {
        try {
          const response2 = await apiInstance.delete(`/api/coupon/delete/${couponId}`);
          if (response2.status === 200 || response2.status === 201 || response2.data?.success) {
            setSuccess("Coupon deleted successfully!");
            fetchCoupons({ force: true });
            setTimeout(() => setSuccess(null), 3000);
            return;
          }
        } catch (err2) {
          console.error("Error deleting coupon with param:", err2);
        }
      }
      setError(err.response?.data?.message || "Failed to delete coupon");
    } finally {
      setLoading(false);
      setDeletingCouponId(null);
    }
  };

  // Handle edit coupon click
  const handleEditCouponClick = (coupon) => {
    setSelectedCoupon(coupon);
    setCouponFormData({
      code: coupon.code || "",
      title: coupon.title || "",
      description: coupon.description || "",
      status: coupon.status,
      start_date: coupon.start_date ? coupon.start_date.split('T')[0] : "",
      end_date: coupon.end_date ? coupon.end_date.split('T')[0] : "",
      subscription_id: coupon.subscription_mappings ? coupon.subscription_mappings.map(m => m.subscription_plan_id) : [],
      global_usage_limit: coupon.tiering?.[0]?.tier_details?.[0]?.current_tiering_limit ? parseInt(coupon.tiering[0].tier_details[0].current_tiering_limit) : "",
      can_combine_with_referral_credit: coupon.can_combine_with_referral_credit,
      coupon_type_id: coupon.coupon_type_id || 1,
      financial_value: coupon.financial_value ? parseFloat(coupon.financial_value) : "",
      CouponTypeCriteriaId: String(
        coupon.CouponTypeCriteriaId ||
        coupon.coupon_type_criteria_id ||
        coupon.coupon_criteria_id ||
        coupon.criteria_id ||
        coupon.coupon_type_criteria?.id ||
        coupon.coupon_criteria?.id ||
        ""
      ),
      existing_user_ids: Array.isArray(coupon.existing_user_ids) ? coupon.existing_user_ids.join(', ') : "",
    });
    fetchPlans();
    fetchCriteria();
    setShowEditModal(true);
  };

  const filteredCoupons = coupons.filter(c =>
    c.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      header: "COUPON IDENTITY",
      accessor: "code",
      cell: (coupon) => (
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#EEF2FF] border-2 border-white shadow-sm flex items-center justify-center text-[#B02E0C] font-black text-lg select-none">
            <Ticket size={20} />
          </div>
          <div>
            <p className="font-black text-[#0F172A]">{coupon.code}</p>
            <p className="text-[10px] text-[#94A3B8] font-black uppercase tracking-widest mt-0.5">
              {coupon.title || "No Title"}
            </p>
          </div>
        </div>
      )
    },
    {
      header: "FINANCIAL VALUE",
      accessor: "financial_value",
      cell: (coupon) => (
        <span className="text-sm font-black text-[#334155]">
          ₹{coupon.financial_value || "0"}
        </span>
      )
    },
    {
      header: "VALIDITY PERIOD",
      accessor: "start_date",
      cell: (coupon) => (
        <div className="flex flex-col">
          <p className="text-xs font-bold text-[#475569]">
            {coupon.start_date ? new Date(coupon.start_date).toLocaleDateString() : "-"}
          </p>
          <p className="text-[10px] text-[#94A3B8] font-black italic">
            to {coupon.end_date ? new Date(coupon.end_date).toLocaleDateString() : "-"}
          </p>
        </div>
      )
    },
    {
      header: "USAGE METRICS",
      accessor: "usage",
      cell: (coupon) => {
        const tier = coupon.tiering?.[0];
        const tierDetail = tier?.tier_details?.[0];
        const limit = tierDetail?.current_tiering_limit || "-";
        const used = tier?.used_total || 0;
        return (
          <div className="flex flex-col">
            <p className="text-sm font-bold text-[#334155] tabular-nums">{used} / {limit}</p>
            <p className="text-[10px] text-[#94A3B8] font-black uppercase tracking-tighter">Usage Logged</p>
          </div>
        );
      }
    },
    {
      header: "ACCOUNT STATE",
      accessor: "status",
      cell: (coupon) => (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${coupon.status
          ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
          : "bg-red-50 text-red-600 ring-1 ring-red-100"
          }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${coupon.status ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
          {coupon.status ? "Active" : "Inactive"}
        </div>
      )
    }
  ];

  const renderActions = (coupon) => (
    <div className="relative action-menu-container">
      <button
        onClick={(e) => {
          setOpenMenuId(openMenuId === coupon.id ? null : coupon.id);
        }}
        className={`p-2.5 rounded-xl border border-transparent transition-all active:scale-95 ${openMenuId === coupon.id ? 'bg-[#B02E0C] text-white shadow-lg shadow-[#B02E0C]/20' : 'hover:border-[#E2E8F0] hover:bg-white text-[#94A3B8]'}`}
      >
        <EllipsisVertical size={18} />
      </button>

      {openMenuId === coupon.id && (
        <div className="absolute right-14 top-0 bg-white border border-[#E2E8F0] shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-2xl w-52 z-[100] p-2 animate-in fade-in zoom-in slide-in-from-right-2 duration-300">
          <div className="px-3 py-2 border-b border-[#F1F5F9] mb-1">
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Coupon Node Actions</span>
          </div>
          <ul className="text-[#475569] text-sm font-bold space-y-1">
            <li>
              <button
                onClick={() => {
                  setSelectedCoupon(coupon);
                  setShowOpenModal(true);
                  setOpenMenuId(null);
                }}
                className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-[#F1F5F9] rounded-xl transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 ring-1 ring-indigo-100">
                  <Eye size={16} />
                </div>
                Inspect
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  handleEditCouponClick(coupon);
                  setOpenMenuId(null);
                }}
                className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-[#F1F5F9] rounded-xl transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 ring-1 ring-amber-100">
                  <Pencil size={16} />
                </div>
                Modify
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  handleDeleteCoupon(coupon.id);
                  setOpenMenuId(null);
                }}
                className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-red-50 rounded-xl transition-all text-[#B02E0C]"
              >
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 ring-1 ring-red-200">
                  <Trash2 size={16} />
                </div>
                Purge
              </button>
            </li>
          </ul>
        </div>
      )}

      {/* Coupon Delete Confirmation Modal */}
      {showCouponDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] backdrop-blur-md bg-black/40 animate-in fade-in duration-300 px-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-accent/5 rounded-[2.5rem] flex items-center justify-center text-accent mx-auto mb-6 ring-8 ring-accent/5">
                <Trash2 size={36} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-[#0F172A] mb-3 tracking-tight">Purge Coupon?</h3>
              <p className="text-[#64748B] text-sm font-medium leading-relaxed px-4 italic">
                This action will permanently dismantle the coupon code from the registry. Continue?
              </p>
            </div>
            <div className="p-6 bg-gray-50/80 flex gap-3">
              <button
                onClick={() => setShowCouponDeleteModal(false)}
                className="flex-1 py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-widest text-[#64748B] hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all cursor-pointer"
              >
                Abort
              </button>
              <button
                onClick={confirmDeleteCoupon}
                className="flex-1 py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-widest bg-accent text-white shadow-lg shadow-accent/20 hover:bg-[#8D270B] transition-all active:scale-95 cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50">
      <div className="bg-white rounded-xl w-[400px] p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
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
    <div className="space-y-4 sm:space-y-8 px-4 sm:px-8 py-4 sm:py-8 bg-[#F8FAFC] w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">
            Coupon Management
          </h1>
          <p className="text-[#64748B] text-sm mt-1 font-medium">
            Manage discount coupon codes for platform subscriptions or
            purchases.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              setShowAddModal(true);
              fetchPlans();
              fetchCriteria();
            }}
            className="px-5 py-2.5 bg-[#B02E0C] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#B02E0C]/20 hover:bg-[#8d270b] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus size={18} strokeWidth={3} />
            Create New Coupon
          </button>
          <button
            onClick={() => {
              setShowCriteriaModal(true);
              fetchCriteria();
            }}
            className="px-5 py-2.5 bg-white border border-[#E2E8F0] text-[#475569] rounded-xl text-sm font-bold shadow-sm hover:bg-[#F8FAFC] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <AlertCircle size={18} />
            Coupon Criteria
          </button>
        </div>
      </div>

      {success && (
        <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg border border-green-200" role="alert">
          <span className="font-medium">Success!</span> {success}
        </div>
      )}

      {error && !showAddModal && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200" role="alert">
          <span className="font-medium">Error!</span> {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={filteredCoupons}
        loading={loadingCoupons}
        renderActions={renderActions}
        rowKey="id"
        showSearch
        onSearch={setSearchQuery}
        pagination={{
          page: currentPage,
          limit: rowsPerPage,
          totalPages: Math.ceil(filteredCoupons.length / rowsPerPage),
          totalRecords: filteredCoupons.length
        }}
        onPageChange={setCurrentPage}
        onLimitChange={(l) => { setRowsPerPage(l); setCurrentPage(1); }}
      />

      {/* Coupon Criteria Modal */}
      {showCriteriaModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl p-4 md:p-8 relative shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300">
            <div className="flex flex-col gap-4 mb-6 sticky top-0 bg-white z-10 pb-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex justify-between items-center w-full">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Coupon Criteria</h2>
                <button
                  onClick={() => {
                    setShowCriteriaModal(false);
                    setErrorCriteria(null);
                    setSuccessCriteria(null);
                    setShowRules(false);
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowRules(!showRules)}
                  className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${showRules ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-50"}`}
                >
                  <Info size={18} />
                  Rules & Guide
                </button>
                <button
                  onClick={() => {
                    setShowAddCriteriaModal(true);
                    resetCriteriaForm();
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-accent text-white rounded-xl hover:opacity-90 flex items-center justify-center gap-2 text-xs font-bold shadow-lg shadow-accent/20 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus size={18} />
                  Add Criteria
                </button>
              </div>
            </div>

            {errorCriteria && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {errorCriteria}
              </div>
            )}
            {successCriteria && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                {successCriteria}
              </div>
            )}

            <div className="flex flex-col lg:flex-row items-start gap-6 flex-grow overflow-y-auto custom-scrollbar pr-1">
              <div className={`transition-all duration-300 min-w-0 w-full ${showRules ? 'lg:w-[60%]' : 'w-full'}`}>

                {/* Criteria Table */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    {loadingCriteria ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="animate-spin text-[#B02E0C]" size={32} />
                      </div>
                    ) : (
                      <table className="w-full text-left">
                        <thead className="bg-[#B02E0C]/5">
                          <tr>
                            <th className="py-2.5 px-3 border border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-tighter text-center">ID</th>
                            <th className="py-2.5 px-3 border border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-tighter text-center">Phone</th>
                            <th className="py-2.5 px-3 border border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-tighter text-center">Email</th>
                            <th className="py-2.5 px-3 border border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-tighter text-center">Range</th>
                            <th className="py-2.5 px-3 border border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-tighter text-center">New</th>
                            <th className="py-2.5 px-3 border border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-tighter text-center">Cond</th>
                            <th className="py-2.5 px-3 border border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-tighter text-center">Non</th>
                            <th className="py-2.5 px-3 border border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-tighter text-center">Exist</th>
                            <th className="py-2.5 px-3 border border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-tighter text-center">Upcom</th>
                            <th className="py-2.5 px-3 border border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-tighter text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {criteria.length === 0 ? (
                            <tr>
                              <td colSpan="11" className="py-8 text-center text-gray-500 italic text-sm">No criteria found.</td>
                            </tr>
                          ) : (
                            [...criteria].sort((a, b) => a.id - b.id).map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50/80 transition-colors border-b border-gray-100 last:border-0">
                                <td className="py-2 px-3 text-xs font-bold text-gray-700 border-x border-gray-100 text-center">{item.id}</td>
                                <td className="py-2 px-3 text-sm text-center border-r border-gray-100">{item.attach_phone ? "✅" : "❌"}</td>
                                <td className="py-2 px-3 text-sm text-center border-r border-gray-100">{item.attach_email ? "✅" : "❌"}</td>
                                <td className="py-2 px-3 text-sm text-center border-r border-gray-100">{item.date_range ? "✅" : "❌"}</td>
                                <td className="py-2 px-3 text-sm text-center border-r border-gray-100">{item.for_new ? "✅" : "❌"}</td>
                                <td className="py-2 px-3 text-sm text-center border-r border-gray-100">{item.for_existing_with_condition ? "✅" : "❌"}</td>
                                <td className="py-2 px-3 text-sm text-center border-r border-gray-100">{item.for_existing_non_condition ? "✅" : "❌"}</td>
                                <td className="py-2 px-3 text-sm text-center border-r border-gray-100">{item.need_map_existing_user ? "✅" : "❌"}</td>
                                <td className="py-2 px-3 text-sm text-center border-r border-gray-100">{item.need_map_upcoming_user ? "✅" : "❌"}</td>
                                <td className="py-2 px-3 text-sm text-center border-r border-gray-100">
                                  <div className="flex justify-center gap-1.5">
                                    <button
                                      onClick={() => handleEditClick(item)}
                                      className="p-1 text-blue-600 hover:bg-blue-100 rounded-md transition-all shadow-sm bg-white border border-blue-100"
                                      title="Edit"
                                    >
                                      <Pencil size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCriteria(item.id)}
                                      className="p-1 text-[#B02E0C] hover:bg-red-100 rounded-md transition-all shadow-sm bg-white border border-red-100"
                                      disabled={deletingId === item.id}
                                      title="Delete"
                                    >
                                      {deletingId === item.id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <Trash2 size={14} />
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>

              {showRules && (
                <div className="w-full lg:w-[40%] flex-shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-y-auto lg:max-h-[75vh] animate-in slide-in-from-bottom lg:slide-in-from-right duration-300">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Info size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-gray-900 leading-tight">Criteria Guide</h3>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic">Operational Logic Handbook</p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <section>
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 border-l-4 border-blue-500 pl-3">૧. મુખ્ય સેટિંગ્સ (Criteria Settings)</h4>
                        <ul className="space-y-4">
                          <li className="flex gap-3">
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <span className="font-bold text-gray-900 block mb-0.5">Attach Phone (ફોન જોડવો)</span>
                              <span className="text-gray-600 leading-relaxed italic">આ કૂપન ફક્ત એવા જ યુઝર્સ વાપરી શકશે જેમના ફોન નંબર તમે લિસ્ટમાં નાખશો.</span>
                            </div>
                          </li>
                          <li className="flex gap-3">
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <span className="font-bold text-gray-900 block mb-0.5">Attach Email (ઈમેલ જોડવો)</span>
                              <span className="text-gray-600 leading-relaxed italic">આ કૂપન ફક્ત ચોક્કસ ઈમેલ આઈડી વાળા યુઝર્સ માટે જ રહેશે.</span>
                            </div>
                          </li>
                          <li className="flex gap-3">
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <span className="font-bold text-gray-900 block mb-0.5">Reason Place ID (વિસ્તાર મુજબ)</span>
                              <span className="text-gray-600 leading-relaxed italic">ચોક્કસ વિસ્તાર અથવા લોકેશન (સીટી કે એરિયા) માટે કૂપન રાખવી હોય ત્યારે વપરાય છે.</span>
                            </div>
                          </li>
                          <li className="flex gap-3">
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <span className="font-bold text-gray-900 block mb-0.5">Date Range (તારીખનો સમયગાળો)</span>
                              <span className="text-gray-600 leading-relaxed italic">કૂપન કઈ તારીખ થી કઈ તારીખ સુધી ચાલશે તે નક્કી કરવા માટે.</span>
                            </div>
                          </li>
                          <li className="flex gap-3">
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <span className="font-bold text-gray-900 block mb-0.5">For New - First Purchase</span>
                              <span className="text-gray-600 leading-relaxed italic">ફક્ત એવા જ લોકો વાપરી શકશે જેઓ પહેલીવાર પેમેન્ટ કરી રહ્યા હોય.</span>
                            </div>
                          </li>
                          <li className="flex gap-3">
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <span className="font-bold text-gray-900 block mb-0.5">Existing - Condition (જૂના યુઝર્સ)</span>
                              <span className="text-gray-600 leading-relaxed italic">જૂના યુઝર્સ જે અમુક લિમિટ પૂરી કરી હોય તેવી શરત પાળતા હોય તેમના માટે.</span>
                            </div>
                          </li>
                          <li className="flex gap-3">
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <span className="font-bold text-gray-900 block mb-0.5">Existing - Non-Condition</span>
                              <span className="text-gray-600 leading-relaxed italic">બધા જ જૂના યુઝર્સ કોઈપણ શરત વગર આ કૂપન વાપરી શકશે.</span>
                            </div>
                          </li>
                          <li className="flex gap-3">
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <span className="font-bold text-gray-900 block mb-0.5">Enable User Selection</span>
                              <span className="text-gray-600 leading-relaxed italic">જાતે લિસ્ટમાંથી યુઝર્સને સિલેક્ટ કરી શકો છો કે કોને ડિસ્કાઉન્ટ આપવું છે.</span>
                            </div>
                          </li>
                          <li className="flex gap-3">
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <span className="font-bold text-gray-900 block mb-0.5">Target Upcoming Users</span>
                              <span className="text-gray-600 leading-relaxed italic">જે યુઝર્સ ભવિષ્યમાં રજિસ્ટર થશે તેમને પણ કૂપન આપોઆપ લાગુ પડશે.</span>
                            </div>
                          </li>
                        </ul>
                      </section>

                      <section className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-200">
                        <div className="flex items-center gap-2 mb-4">
                          <AlertCircle size={18} />
                          <h4 className="text-xs font-black uppercase tracking-widest">૨. લોજિક ગાઈડ (Combinations)</h4>
                        </div>
                        <div className="space-y-4">
                          <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                            <span className="font-bold block text-sm mb-1 underline">Target All (બધા માટે)</span>
                            <p className="text-xs italic leading-relaxed">અત્યારના અને હવે પછી આવનારા બધા માટે: Select Specific Users + Target Future Users બંને ચાલુ રાખવા.</p>
                          </div>
                          <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                            <span className="font-bold block text-sm mb-1 underline">Pure New (તદ્દન નવા માટે)</span>
                            <p className="text-xs italic leading-relaxed">ફક્ત નવા રજિસ્ટર થનારા: For New + Target Upcoming ચાલુ કરવા.</p>
                          </div>
                          <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                            <span className="font-bold block text-sm mb-1 underline">Specific (ચોક્કસ માટે)</span>
                            <p className="text-xs italic leading-relaxed">ફક્ત ખાસ યુઝર્સ: Selection ચાલુ કરી તેમના આઈડી પસંદ કરવા.</p>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] backdrop-blur-md bg-black/40 animate-in fade-in duration-300 px-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-accent/5 rounded-full flex items-center justify-center text-accent mx-auto mb-6 ring-8 ring-accent/5">
                <Trash2 size={40} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Eradicate Criteria?</h3>
              <p className="text-[#64748B] text-sm font-medium leading-relaxed px-4">
                Are you absolutely sure? This action will permanently remove <span className="text-accent font-black italic">Criteria #{deletingCriteriaId}</span> from the neural core.
              </p>
            </div>
            <div className="p-6 bg-gray-50/80 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-widest text-[#64748B] hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all cursor-pointer"
              >
                Abort
              </button>
              <button
                onClick={confirmDeleteCriteria}
                className="flex-1 py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-widest bg-accent text-white shadow-lg shadow-accent/20 hover:bg-[#8D270B] transition-all active:scale-95 cursor-pointer"
              >
                Execute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Criteria Modal */}
      {showAddCriteriaModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] backdrop-blur-xs bg-black/50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-3xl p-6 md:p-8 relative shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4 flex-shrink-0">
              <h2 className="text-2xl font-black text-gray-900">Add Coupon Criteria</h2>
              <button
                onClick={() => {
                  setShowAddCriteriaModal(false);
                  resetCriteriaForm();
                  setErrorCriteria(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {errorCriteria && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {errorCriteria}
              </div>
            )}

            <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow">
              <form onSubmit={handleCreateCriteria} className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Basic Requirements</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { name: 'attach_phone', label: 'Require Phone Number' },
                      { name: 'attach_email', label: 'Require Email Address' },
                      { name: 'reason_place_id', label: 'Reason Place ID' },
                      { name: 'date_range', label: 'Date Range (Eligibility)' },
                      { name: 'for_new', label: 'New Users Only' },
                      { name: 'for_existing_with_condition', label: 'Existing (Conditional)' },
                      { name: 'for_existing_non_condition', label: 'All Existing Users' },
                      { name: 'need_map_existing_user', label: 'Select Specific Users' },
                      { name: 'need_map_upcoming_user', label: 'Target Future Users' },
                    ].map((item) => (
                      <label key={item.name} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${criteriaFormData[item.name] ? 'bg-white border-[#B02E0C] shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                        <input
                          type="checkbox"
                          name={item.name}
                          checked={criteriaFormData[item.name]}
                          onChange={handleCriteriaInputChange}
                          className="w-5 h-5 accent-[#B02E0C]"
                        />
                        <span className={`text-sm font-bold ${criteriaFormData[item.name] ? 'text-[#B02E0C]' : 'text-gray-700'}`}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {criteriaFormData.need_map_existing_user && (
                  <div className="space-y-3 bg-[#B02E0C]/5 p-5 rounded-2xl border border-[#B02E0C]/10 transition-all animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-bold text-[#B02E0C] uppercase tracking-wider">
                        Specific User Access
                      </label>
                      <span className="text-[10px] bg-[#B02E0C] text-white px-2 py-0.5 rounded-full font-bold">Selection Required</span>
                    </div>
                    <div className="border border-[#B02E0C]/20 rounded-xl overflow-hidden bg-white shadow-sm">
                      <div className="max-h-48 overflow-y-auto p-2 custom-scrollbar">
                        {loadingUsers ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="animate-spin text-[#B02E0C]" size={24} />
                          </div>
                        ) : allUsers.length > 0 ? (
                          <div className="grid grid-cols-1 gap-1">
                            {allUsers.map((user) => {
                              const userId = String(user.id || user.uid);
                              const isSelected = criteriaFormData.existing_user_ids
                                ? criteriaFormData.existing_user_ids.split(',').map(id => id.trim()).includes(userId)
                                : false;

                              return (
                                <label key={userId} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-[#B02E0C]/10' : 'hover:bg-gray-50'}`}>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      let currentIds = criteriaFormData.existing_user_ids
                                        ? criteriaFormData.existing_user_ids.split(',').map(id => id.trim()).filter(id => id !== "")
                                        : [];

                                      if (e.target.checked) {
                                        if (!currentIds.includes(userId)) currentIds.push(userId);
                                      } else {
                                        currentIds = currentIds.filter(id => id !== userId);
                                      }
                                      setCriteriaFormData(prev => ({ ...prev, existing_user_ids: currentIds.join(', ') }));
                                    }}
                                    className="w-5 h-5 accent-[#B02E0C]"
                                  />
                                  <div className="flex flex-col min-w-0">
                                    <span className={`text-sm font-bold truncate ${isSelected ? 'text-[#B02E0C]' : 'text-gray-800'}`}>
                                      {user.name}
                                    </span>
                                    <span className="text-[11px] text-gray-500 font-medium">
                                      ID: {user.id} • {user.number} • {user.role}
                                    </span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">No users found.</p>
                        )}
                      </div>
                    </div>
                    {criteriaFormData.existing_user_ids && (
                      <div className="bg-white/50 p-2 rounded-lg border border-[#B02E0C]/10">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Selected IDs</p>
                        <p className="text-xs text-[#B02E0C] font-bold break-all">{criteriaFormData.existing_user_ids}</p>
                      </div>
                    )}
                  </div>
                )}
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <div className="bg-blue-600 p-1 rounded-lg text-white">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider">Logic Guide</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-blue-900 border-b border-blue-200 pb-1 mb-1 italic">COMMON LOGIC</p>
                      <p className="text-[10px] text-blue-800 leading-tight">• <span className="font-bold">Target All:</span> Enable <span className="italic">Selection</span> + <span className="italic">Future</span> (Keep IDs empty)</p>
                      <p className="text-[10px] text-blue-800 leading-tight">• <span className="font-bold">Pure New:</span> Enable <span className="italic">For New</span> + <span className="italic">Target Future</span></p>
                      <p className="text-[10px] text-blue-800 leading-tight">• <span className="font-bold">Specific:</span> Enable <span className="italic">Selection</span> + Select IDs</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-blue-900 border-b border-blue-200 pb-1 mb-1 italic">FIELD TIPS</p>
                      <p className="text-[10px] text-blue-700 leading-tight">• <span className="font-bold">For New:</span> Register AFTER creation</p>
                      <p className="text-[10px] text-blue-700 leading-tight">• <span className="font-bold">Existing:</span> All historical users</p>
                      <p className="text-[10px] text-blue-700 leading-tight">• <span className="font-bold">Future:</span> Auto-assign new members</p>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-4 border-t border-gray-100 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowAddCriteriaModal(false);
                  resetCriteriaForm();
                  setErrorCriteria(null);
                }}
                className="px-8 py-3 rounded-xl border-2 border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200 transition-all text-sm font-bold cursor-pointer w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  handleCreateCriteria(e);
                }}
                className="px-10 py-3 rounded-xl bg-[#B02E0C] text-white hover:bg-[#8d270b] hover:shadow-lg hover:shadow-[#B02E0C]/30 transition-all text-sm font-bold cursor-pointer w-full sm:w-auto"
              >
                Create Criteria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Criteria Modal */}
      {showEditCriteriaModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-8 relative shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-800">Update Coupon Criteria</h2>
              <button
                onClick={() => {
                  setShowEditCriteriaModal(false);
                  setSelectedCriteria(null);
                  resetCriteriaForm();
                  setErrorCriteria(null);
                }}
                className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {errorCriteria && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {errorCriteria}
              </div>
            )}

            <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow">
              <form onSubmit={handleUpdateCriteria} className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Criteria Settings</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { name: 'attach_phone', label: 'Attach Phone' },
                      { name: 'attach_email', label: 'Attach Email' },
                      { name: 'reason_place_id', label: 'Reason Place ID' },
                      { name: 'date_range', label: 'Date Range' },
                      { name: 'for_new', label: 'For New (First Purchase)' },
                      { name: 'for_existing_with_condition', label: 'Existing (Condition)' },
                      { name: 'for_existing_non_condition', label: 'Existing (Non-Condition)' },
                      { name: 'need_map_existing_user', label: 'Enable User Selection' },
                      { name: 'need_map_upcoming_user', label: 'Target Upcoming Users' },
                    ].map((item) => (
                      <label key={item.name} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${criteriaFormData[item.name] ? 'bg-white border-[#B02E0C] shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                        <input
                          type="checkbox"
                          name={item.name}
                          checked={criteriaFormData[item.name]}
                          onChange={handleCriteriaInputChange}
                          className="w-5 h-5 accent-[#B02E0C]"
                        />
                        <span className={`text-sm font-bold ${criteriaFormData[item.name] ? 'text-[#B02E0C]' : 'text-gray-700'}`}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {criteriaFormData.need_map_existing_user && (
                  <div className="space-y-3 bg-[#B02E0C]/5 p-5 rounded-2xl border border-[#B02E0C]/10 transition-all animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-bold text-[#B02E0C] uppercase tracking-wider">
                        Specific User Access
                      </label>
                    </div>
                    <div className="border border-[#B02E0C]/20 rounded-xl overflow-hidden bg-white shadow-sm">
                      <div className="max-h-48 overflow-y-auto p-2 custom-scrollbar">
                        {loadingUsers ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="animate-spin text-[#B02E0C]" size={24} />
                          </div>
                        ) : allUsers.length > 0 ? (
                          <div className="grid grid-cols-1 gap-1">
                            {allUsers.map((user) => {
                              const userId = String(user.id || user.uid);
                              const isSelected = criteriaFormData.existing_user_ids
                                ? String(criteriaFormData.existing_user_ids).split(',').map(id => id.trim()).includes(userId)
                                : false;

                              return (
                                <label key={userId} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-[#B02E0C]/10' : 'hover:bg-gray-50'}`}>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      let currentIds = criteriaFormData.existing_user_ids
                                        ? String(criteriaFormData.existing_user_ids).split(',').map(id => id.trim()).filter(id => id !== "")
                                        : [];

                                      if (e.target.checked) {
                                        if (!currentIds.includes(userId)) currentIds.push(userId);
                                      } else {
                                        currentIds = currentIds.filter(id => id !== userId);
                                      }
                                      setCriteriaFormData(prev => ({ ...prev, existing_user_ids: currentIds.join(', ') }));
                                    }}
                                    className="w-5 h-5 accent-[#B02E0C]"
                                  />
                                  <div className="flex flex-col min-w-0">
                                    <span className={`text-sm font-bold truncate ${isSelected ? 'text-[#B02E0C]' : 'text-gray-800'}`}>
                                      {user.name}
                                    </span>
                                    <span className="text-[11px] text-gray-500 font-medium">
                                      ID: {user.id} • {user.number} • {user.role}
                                    </span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">No users found.</p>
                        )}
                      </div>
                    </div>
                    {criteriaFormData.existing_user_ids && (
                      <div className="bg-white/50 p-2 rounded-lg border border-[#B02E0C]/10">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Selected IDs</p>
                        <p className="text-xs text-[#B02E0C] font-bold break-all">{criteriaFormData.existing_user_ids}</p>
                      </div>
                    )}
                  </div>
                )}
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <div className="bg-blue-600 p-1 rounded-lg text-white">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider">Logic Guide</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-blue-900 border-b border-blue-200 pb-1 mb-1 italic">COMMON LOGIC</p>
                      <p className="text-[10px] text-blue-800 leading-tight">• <span className="font-bold">Target All:</span> Enable <span className="italic">Selection</span> + <span className="italic">Future</span> (Keep IDs empty)</p>
                      <p className="text-[10px] text-blue-800 leading-tight">• <span className="font-bold">Pure New:</span> Enable <span className="italic">For New</span> + <span className="italic">Target Future</span></p>
                      <p className="text-[10px] text-blue-800 leading-tight">• <span className="font-bold">Specific:</span> Enable <span className="italic">Selection</span> + Select IDs</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-blue-900 border-b border-blue-200 pb-1 mb-1 italic">FIELD TIPS</p>
                      <p className="text-[10px] text-blue-700 leading-tight">• <span className="font-bold">For New:</span> Register AFTER creation</p>
                      <p className="text-[10px] text-blue-700 leading-tight">• <span className="font-bold">Existing:</span> All historical users</p>
                      <p className="text-[10px] text-blue-700 leading-tight">• <span className="font-bold">Future:</span> Auto-assign new members</p>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-100 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowEditCriteriaModal(false);
                  setSelectedCriteria(null);
                  resetCriteriaForm();
                  setErrorCriteria(null);
                }}
                className="px-8 py-3 rounded-xl border-2 border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200 transition-all text-sm font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  handleUpdateCriteria(e);
                }}
                className="px-10 py-3 rounded-xl bg-[#B02E0C] text-white hover:bg-[#8d270b] hover:shadow-lg hover:shadow-[#B02E0C]/30 transition-all text-sm font-bold cursor-pointer"
              >
                Update Criteria
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add Coupon Modal */}

      {/* Create New Coupon Modal */}
      {
        showAddModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/60 p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-2xl p-6 md:p-8 relative shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-800">Create New Coupon</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetCouponForm();
                    setError(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow space-y-6">
                <form onSubmit={handleCreateCoupon} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Coupon Code
                      </label>
                      <input
                        type="text"
                        name="code"
                        value={couponFormData.code}
                        onChange={handleCouponInputChange}
                        placeholder="e.g. DIWALI50"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B02E0C]/20 focus:border-[#B02E0C] transition-all bg-gray-50/50"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={couponFormData.title}
                        onChange={handleCouponInputChange}
                        placeholder="e.g. Festival Season Offer"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B02E0C]/20 focus:border-[#B02E0C] transition-all bg-gray-50/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={couponFormData.description}
                      onChange={handleCouponInputChange}
                      rows="2"
                      placeholder="Provide details about this coupon..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B02E0C]/20 focus:border-[#B02E0C] transition-all bg-gray-50/50 resize-none"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <CustomDatePicker
                      selected={couponFormData.start_date ? new Date(couponFormData.start_date) : null}
                      onChange={(date) => {
                        setCouponFormData(prev => ({
                          ...prev,
                          start_date: date ? date.toISOString().split('T')[0] : ""
                        }));
                      }}
                      label="Start Date"
                      required
                    />
                    <CustomDatePicker
                      selected={couponFormData.end_date ? new Date(couponFormData.end_date) : null}
                      onChange={(date) => {
                        setCouponFormData(prev => ({
                          ...prev,
                          end_date: date ? date.toISOString().split('T')[0] : ""
                        }));
                      }}
                      label="End Date"
                      required
                      minDate={couponFormData.start_date ? new Date(couponFormData.start_date) : null}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                    <CustomSelect
                      options={couponTypes.map(t => ({ value: t.id, label: t.name }))}
                      value={couponFormData.coupon_type_id}
                      onChange={(val) => {
                        setCouponFormData(prev => ({
                          ...prev,
                          coupon_type_id: Number(val)
                        }));
                      }}
                      label="Coupon Type"
                      placeholder="Select Type"
                      required
                    />
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        {couponTypes.find(t => Number(t.id) === Number(couponFormData.coupon_type_id))?.name || "Financial Value"}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="financial_value"
                          value={couponFormData.financial_value}
                          onChange={handleCouponInputChange}
                          placeholder={Number(couponFormData.coupon_type_id) === 2 ? "e.g. 10" : "e.g. 120"}
                          className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B02E0C]/20 focus:border-[#B02E0C] transition-all bg-gray-50/50 ${Number(couponFormData.coupon_type_id) === 2 ? "pr-10" : ""}`}
                          required
                        />
                        {Number(couponFormData.coupon_type_id) === 2 && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">
                            %
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Global Usage Limit
                      </label>
                      <input
                        type="number"
                        name="global_usage_limit"
                        value={couponFormData.global_usage_limit}
                        onChange={handleCouponInputChange}
                        placeholder="e.g. 100"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B02E0C]/20 focus:border-[#B02E0C] transition-all bg-gray-50/50"
                        required
                      />
                    </div>
                    <CustomSelect
                      options={criteria.map((c) => {
                        const critId = c.id || c.coupon_type_criteria_id;
                        return { value: String(critId), label: `Criteria #${critId}` };
                      })}
                      value={couponFormData.CouponTypeCriteriaId}
                      onChange={(val) => {
                        setCouponFormData(prev => ({
                          ...prev,
                          CouponTypeCriteriaId: val
                        }));
                      }}
                      label="Criteria Configuration"
                      placeholder="Select Criteria"
                      required
                    />
                  </div>

                  {/* Conditional User Selection List for Create Modal */}
                  {(() => {
                    const selectedCrit = criteria.find(c => String(c.id || c.coupon_type_criteria_id) === String(couponFormData.CouponTypeCriteriaId));
                    if (selectedCrit?.need_map_existing_user) {
                      return (
                        <div className="space-y-3 bg-[#B02E0C]/5 p-5 rounded-2xl border border-[#B02E0C]/10 transition-all animate-in fade-in slide-in-from-top-4">
                          <div className="flex justify-between items-center">
                            <label className="block text-sm font-bold text-[#B02E0C] uppercase tracking-wider">
                              Map To Specific Users
                            </label>
                            <span className="text-[10px] bg-[#B02E0C] text-white px-2 py-0.5 rounded-full font-bold">Optional</span>
                          </div>
                          <div className="border border-[#B02E0C]/20 rounded-xl overflow-hidden bg-white shadow-sm">
                            <div className="max-h-48 overflow-y-auto p-2 custom-scrollbar">
                              {loadingUsers ? (
                                <div className="flex items-center justify-center py-8">
                                  <Loader2 className="animate-spin text-[#B02E0C]" size={28} />
                                </div>
                              ) : allUsers.length > 0 ? (
                                <div className="grid grid-cols-1 gap-1">
                                  {allUsers.map((user) => {
                                    const userId = String(user.id);
                                    const isSelected = couponFormData.existing_user_ids
                                      ? String(couponFormData.existing_user_ids).split(',').map(id => id.trim()).includes(userId)
                                      : false;

                                    return (
                                      <label key={userId} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-[#B02E0C]/10 border border-[#B02E0C]/20' : 'hover:bg-gray-50 border border-transparent'}`}>
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={(e) => {
                                            let currentIds = couponFormData.existing_user_ids
                                              ? String(couponFormData.existing_user_ids).split(',').map(id => id.trim()).filter(id => id !== "")
                                              : [];

                                            if (e.target.checked) {
                                              if (!currentIds.includes(userId)) currentIds.push(userId);
                                            } else {
                                              currentIds = currentIds.filter(id => id !== userId);
                                            }
                                            setCouponFormData(prev => ({ ...prev, existing_user_ids: currentIds.join(', ') }));
                                          }}
                                          className="w-5 h-5 accent-[#B02E0C]"
                                        />
                                        <div className="flex flex-col min-w-0">
                                          <span className={`text-sm font-bold truncate ${isSelected ? 'text-[#B02E0C]' : 'text-gray-800'}`}>
                                            {user.name}
                                          </span>
                                          <span className="text-[11px] text-gray-500 font-medium">
                                            ID: {user.id} • {user.number} • {user.role}
                                          </span>
                                        </div>
                                      </label>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 text-center py-4">No users found.</p>
                              )}
                            </div>
                          </div>
                          <p className="text-[11px] text-[#B02E0C] font-semibold italic flex items-center gap-1.5 px-1">
                            <span className="w-1.5 h-1.5 bg-[#B02E0C] rounded-full animate-pulse"></span>
                            Note: Leaving this empty will target ALL existing users.
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="space-y-3 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Applicable Subscription Plans
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto p-1 custom-scrollbar">
                      {plans.map((plan) => {
                        const isSelected = (couponFormData.subscription_id || []).some(id => String(id) === String(plan.id));
                        return (
                          <label key={plan.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? 'bg-white border-[#B02E0C] shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSubscriptionChange(plan.id)}
                              className="w-5 h-5 accent-[#B02E0C]"
                            />
                            <span className={`text-sm font-bold ${isSelected ? 'text-[#B02E0C]' : 'text-gray-700'}`}>
                              {plan.name || `Plan #${plan.id}`}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="status"
                          checked={couponFormData.status}
                          onChange={handleCouponInputChange}
                          className="w-6 h-6 accent-[#B02E0C] cursor-pointer"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">Internal Status</span>
                        <span className="text-[10px] text-gray-500 font-medium">Toggle active/inactive</span>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="can_combine_with_referral_credit"
                          checked={couponFormData.can_combine_with_referral_credit}
                          onChange={handleCouponInputChange}
                          className="w-6 h-6 accent-[#B02E0C] cursor-pointer"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">Combine Referral</span>
                        <span className="text-[10px] text-gray-500 font-medium">Stack with referral credit</span>
                      </div>
                    </label>
                  </div>
                </form>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-4 border-t border-gray-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetCouponForm();
                    setError(null);
                  }}
                  className="px-8 py-3 rounded-xl border-2 border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200 transition-all text-sm font-bold cursor-pointer w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    handleCreateCoupon(e);
                  }}
                  disabled={loading}
                  className="px-10 py-3 rounded-xl bg-[#B02E0C] text-white hover:bg-[#8d270b] hover:shadow-lg hover:shadow-[#B02E0C]/30 transition-all text-sm font-bold cursor-pointer flex items-center justify-center gap-3 disabled:opacity-70 w-full sm:w-auto"
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {loading ? "Processing..." : "Create Coupon"}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Update Coupon Modal */}
      {
        showEditModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/60 p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-2xl p-4 md:p-8 relative shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-800">Update Coupon</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCoupon(null);
                    resetCouponForm();
                    setError(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow space-y-6">
                <form onSubmit={handleUpdateCoupon} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Coupon Code
                      </label>
                      <input
                        type="text"
                        name="code"
                        value={couponFormData.code}
                        onChange={handleCouponInputChange}
                        placeholder="e.g. DIWALI50"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B02E0C]/20 focus:border-[#B02E0C] transition-all bg-gray-50/50"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={couponFormData.title}
                        onChange={handleCouponInputChange}
                        placeholder="e.g. Festival Season Offer"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B02E0C]/20 focus:border-[#B02E0C] transition-all bg-gray-50/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={couponFormData.description}
                      onChange={handleCouponInputChange}
                      rows="2"
                      placeholder="Provide details about this coupon..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B02E0C]/20 focus:border-[#B02E0C] transition-all bg-gray-50/50 resize-none"
                    ></textarea>
                  </div>

                    <CustomDatePicker
                      selected={couponFormData.start_date ? new Date(couponFormData.start_date) : null}
                      onChange={(date) => {
                        setCouponFormData(prev => ({
                          ...prev,
                          start_date: date ? date.toISOString().split('T')[0] : ""
                        }));
                      }}
                      label="Start Date"
                      required
                    />
                    <CustomDatePicker
                      selected={couponFormData.end_date ? new Date(couponFormData.end_date) : null}
                      onChange={(date) => {
                        setCouponFormData(prev => ({
                          ...prev,
                          end_date: date ? date.toISOString().split('T')[0] : ""
                        }));
                      }}
                      label="End Date"
                      required
                      minDate={couponFormData.start_date ? new Date(couponFormData.start_date) : null}
                    />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                    <CustomSelect
                      options={couponTypes.map(t => ({ value: t.id, label: t.name }))}
                      value={couponFormData.coupon_type_id}
                      onChange={(val) => {
                        setCouponFormData(prev => ({
                          ...prev,
                          coupon_type_id: Number(val)
                        }));
                      }}
                      label="Coupon Type"
                      placeholder="Select Type"
                      required
                    />
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        {couponTypes.find(t => Number(t.id) === Number(couponFormData.coupon_type_id))?.name || "Financial Value"}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="financial_value"
                          value={couponFormData.financial_value}
                          onChange={handleCouponInputChange}
                          placeholder={Number(couponFormData.coupon_type_id) === 2 ? "e.g. 10" : "e.g. 120"}
                          className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B02E0C]/20 focus:border-[#B02E0C] transition-all bg-gray-50/50 ${Number(couponFormData.coupon_type_id) === 2 ? "pr-10" : ""}`}
                          required
                        />
                        {Number(couponFormData.coupon_type_id) === 2 && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">
                            %
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Global Usage Limit
                      </label>
                      <input
                        type="number"
                        name="global_usage_limit"
                        value={couponFormData.global_usage_limit}
                        onChange={handleCouponInputChange}
                        placeholder="e.g. 100"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B02E0C]/20 focus:border-[#B02E0C] transition-all bg-gray-50/50"
                        required
                      />
                    </div>
                    <CustomSelect
                      options={criteria.map((c) => {
                        const critId = c.id || c.coupon_type_criteria_id;
                        return { value: String(critId), label: `Criteria #${critId}` };
                      })}
                      value={String(couponFormData.CouponTypeCriteriaId || "")}
                      onChange={(val) => {
                        setCouponFormData(prev => ({
                          ...prev,
                          CouponTypeCriteriaId: val
                        }));
                      }}
                      label="Criteria Configuration"
                      placeholder="Select Criteria"
                      required
                    />
                  </div>

                  {/* Conditional User Selection List for Update Modal */}
                  {(() => {
                    const selectedCrit = criteria.find(c => String(c.id || c.coupon_type_criteria_id) === String(couponFormData.CouponTypeCriteriaId));
                    if (selectedCrit?.need_map_existing_user) {
                      return (
                        <div className="space-y-3 bg-[#B02E0C]/5 p-5 rounded-2xl border border-[#B02E0C]/10 transition-all animate-in fade-in slide-in-from-top-4">
                          <div className="flex justify-between items-center">
                            <label className="block text-sm font-bold text-[#B02E0C] uppercase tracking-wider">
                              Map To Specific Users
                            </label>
                            <span className="text-[10px] bg-[#B02E0C] text-white px-2 py-0.5 rounded-full font-bold">Optional</span>
                          </div>
                          <div className="border border-[#B02E0C]/20 rounded-xl overflow-hidden bg-white shadow-sm">
                            <div className="max-h-40 md:max-h-48 overflow-y-auto p-2 custom-scrollbar">
                              {loadingUsers ? (
                                <div className="flex items-center justify-center py-8">
                                  <Loader2 className="animate-spin text-[#B02E0C]" size={28} />
                                </div>
                              ) : allUsers.length > 0 ? (
                                <div className="grid grid-cols-1 gap-1">
                                  {allUsers.map((user) => {
                                    const userId = String(user.id);
                                    const isSelected = couponFormData.existing_user_ids
                                      ? String(couponFormData.existing_user_ids).split(',').map(id => id.trim()).includes(userId)
                                      : false;

                                    return (
                                      <label key={userId} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-[#B02E0C]/10 border border-[#B02E0C]/20' : 'hover:bg-gray-50 border border-transparent'}`}>
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={(e) => {
                                            let currentIds = couponFormData.existing_user_ids
                                              ? String(couponFormData.existing_user_ids).split(',').map(id => id.trim()).filter(id => id !== "")
                                              : [];

                                            if (e.target.checked) {
                                              if (!currentIds.includes(userId)) currentIds.push(userId);
                                            } else {
                                              currentIds = currentIds.filter(id => id !== userId);
                                            }
                                            setCouponFormData(prev => ({ ...prev, existing_user_ids: currentIds.join(', ') }));
                                          }}
                                          className="w-5 h-5 accent-[#B02E0C]"
                                        />
                                        <div className="flex flex-col min-w-0">
                                          <span className={`text-sm font-bold truncate ${isSelected ? 'text-[#B02E0C]' : 'text-gray-800'}`}>
                                            {user.name}
                                          </span>
                                          <span className="text-[11px] text-gray-500 font-medium">
                                            ID: {user.id} • {user.number} • {user.role}
                                          </span>
                                        </div>
                                      </label>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 text-center py-4">No users found.</p>
                              )}
                            </div>
                          </div>
                          <p className="text-[11px] text-[#B02E0C] font-semibold italic flex items-center gap-1.5 px-1">
                            <span className="w-1.5 h-1.5 bg-[#B02E0C] rounded-full animate-pulse"></span>
                            Note: Leaving this empty will target ALL existing users.
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="space-y-3 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Applicable Subscription Plans
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto p-1 custom-scrollbar">
                      {plans.map((plan) => {
                        const isSelected = (couponFormData.subscription_id || []).some(id => String(id) === String(plan.id));
                        return (
                          <label key={plan.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? 'bg-white border-[#B02E0C] shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSubscriptionChange(plan.id)}
                              className="w-5 h-5 accent-[#B02E0C]"
                            />
                            <span className={`text-sm font-bold ${isSelected ? 'text-[#B02E0C]' : 'text-gray-700'}`}>
                              {plan.name || `Plan #${plan.id}`}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="status"
                          checked={couponFormData.status}
                          onChange={handleCouponInputChange}
                          className="w-6 h-6 accent-[#B02E0C] cursor-pointer"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">Internal Status</span>
                        <span className="text-[10px] text-gray-500 font-medium">Toggle active/inactive</span>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="can_combine_with_referral_credit"
                          checked={couponFormData.can_combine_with_referral_credit}
                          onChange={handleCouponInputChange}
                          className="w-6 h-6 accent-[#B02E0C] cursor-pointer"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">Combine Referral</span>
                        <span className="text-[10px] text-gray-500 font-medium">Stack with referral credit</span>
                      </div>
                    </label>
                  </div>
                </form>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-4 border-t border-gray-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCoupon(null);
                    resetCouponForm();
                    setError(null);
                  }}
                  className="px-8 py-3 rounded-xl border-2 border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200 transition-all text-sm font-bold cursor-pointer w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    handleUpdateCoupon(e);
                  }}
                  disabled={loading}
                  className="px-10 py-3 rounded-xl bg-[#B02E0C] text-white hover:bg-[#8d270b] hover:shadow-lg hover:shadow-[#B02E0C]/30 transition-all text-sm font-bold cursor-pointer flex items-center justify-center gap-3 disabled:opacity-70 w-full sm:w-auto"
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {loading ? "Processing..." : "Update Coupon"}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {
        showOpenModal && selectedCoupon && (
          <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-6 md:p-8 relative shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900">Coupon Details</h2>
                <button
                  onClick={() => {
                    setShowOpenModal(false);
                    setSelectedCoupon(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Coupon Code</p>
                  <p className="text-lg font-bold text-[#B02E0C]">{selectedCoupon.code}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</p>
                  <p className="text-base text-gray-900 font-medium">{selectedCoupon.title || "N/A"}</p>
                </div>

                <div className="col-span-2 space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</p>
                  <p className="text-base text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {selectedCoupon.description || "No description provided."}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Financial Value</p>
                  <p className="text-base font-bold text-gray-900">{selectedCoupon.financial_value}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${selectedCoupon.status
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-red-100 text-red-700 border-red-200'
                    }`}>
                    {selectedCoupon.status ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date</p>
                  <p className="text-base text-gray-900">{selectedCoupon.start_date ? new Date(selectedCoupon.start_date).toLocaleDateString(undefined, { dateStyle: 'long' }) : "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">End Date</p>
                  <p className="text-base text-gray-900">{selectedCoupon.end_date ? new Date(selectedCoupon.end_date).toLocaleDateString(undefined, { dateStyle: 'long' }) : "N/A"}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Usage Limit</p>
                  <p className="text-base text-gray-900 font-medium">
                    {selectedCoupon.tiering?.[0]?.tier_details?.[0]?.current_tiering_limit || "Unlimited"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Used Count</p>
                  <p className="text-base text-gray-900 font-medium">{selectedCoupon.tiering?.[0]?.used_total || 0}</p>
                </div>

                <div className="col-span-2 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Subscriptions</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCoupon.subscription_mappings && selectedCoupon.subscription_mappings.length > 0 ? (
                      selectedCoupon.subscription_mappings.map((mapping, idx) => {
                        const mappingPlanId = mapping.subscription_plan_id || mapping.SubscriptionPlanId || mapping.subscriptionPlanId;
                        const plan = plans.find(p => String(p.id) === String(mappingPlanId));
                        return (
                          <span key={idx} className="bg-gray-100 text-[#B02E0C] px-3 py-1.5 rounded-md text-sm font-semibold border border-gray-200">
                            {plan ? plan.name : `Plan ID: ${mappingPlanId}`}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-sm text-gray-500 italic">No specific plans assigned (Global Coupon).</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Can Combine with Referral</p>
                  <p className="text-base text-gray-900 font-medium">{selectedCoupon.can_combine_with_referral_credit ? "Yes" : "No"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Created At</p>
                  <p className="text-sm text-gray-900">{new Date(selectedCoupon.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t flex justify-end">
                <button
                  onClick={() => {
                    setShowOpenModal(false);
                    setSelectedCoupon(null);
                  }}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors font-medium cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
};

export default CouponManagement;
