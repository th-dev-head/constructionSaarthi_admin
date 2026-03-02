import { useState, useEffect } from "react";
import {
  Eye,
  X,
  Pencil,
  Trash2,
  Plus,
  Loader2,
} from "lucide-react";
import { Search } from "lucide-react";
import { apiInstance } from "../../../config/axiosInstance";

const CouponManagement = () => {

  const [showAddModal, setShowAddModal] = useState(false);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedCoupon, setSelectedCoupon] = useState(null);

  // Coupon Criteria state
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);
  const [criteria, setCriteria] = useState([]);
  const [loadingCriteria, setLoadingCriteria] = useState(false);
  const [errorCriteria, setErrorCriteria] = useState(null);
  const [successCriteria, setSuccessCriteria] = useState(null);
  const [showAddCriteriaModal, setShowAddCriteriaModal] = useState(false);
  const [showEditCriteriaModal, setShowEditCriteriaModal] = useState(false);
  const [selectedCriteria, setSelectedCriteria] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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
  const fetchCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const response = await apiInstance.get("/api/coupon/all");
      if (response.data.success || response.data.message === "Coupons retrieved successfully") {
        setCoupons(response.data.data || []);
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

  // Fetch Coupon Types
  const fetchCouponTypes = async () => {
    setLoadingTypes(true);
    try {
      const response = await apiInstance.get("/api/coupon-type/getAllCoupon?page=1&limit=10");
      if (response.data.message === "All Coupon Types fetched successfully") {
        setCouponTypes(response.data.couponTypes || []);
      }
    } catch (err) {
      console.error("Error fetching coupon types:", err);
    } finally {
      setLoadingTypes(false);
    }
  };

  const fetchUsersList = async () => {
    setLoadingUsers(true);
    try {
      const response = await apiInstance.get("/api/coupon/admin/users");
      if (response.data.data) {
        setAllUsers(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch subscription plans
  const fetchPlans = async () => {
    try {
      const response = await apiInstance.get(`/api/subscription/getSubscriptionPlans`);
      if (response.data.success) {
        setPlans(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
    }
  };

  // Fetch coupon criteria
  const fetchCriteria = async () => {
    setLoadingCriteria(true);
    setErrorCriteria(null);
    try {
      const response = await apiInstance.get(`/api/coupon`);
      if (response.data && response.data.data) {
        setCriteria(response.data.data);
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
        fetchCriteria();
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
        fetchCriteria();
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
    if (!window.confirm("Are you sure you want to delete this coupon criteria?")) {
      return;
    }

    setDeletingId(criteriaId);
    setErrorCriteria(null);
    setSuccessCriteria(null);

    try {
      const response = await apiInstance.delete(`/api/coupon/${criteriaId}`);

      if (response.status === 200 || response.status === 204 || response.data?.success) {
        setSuccessCriteria("Coupon criteria deleted successfully!");
        fetchCriteria();
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
    setCouponFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked :
        type === "number" ? Number(value) : value,
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
        fetchCoupons();
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
        fetchCoupons();
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
  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Assuming the endpoint accepts the ID as a query param or body, or route param.
      // Based on typical express patterns if the route is exact '/delete':
      const response = await apiInstance.delete(`/api/coupon/delete`, {
        data: { couponId: couponId }
      });

      if (response.status === 200 || response.status === 201 || response.data?.success) {
        setSuccess("Coupon deleted successfully!");
        fetchCoupons();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.data?.message || "Failed to delete coupon");
      }
    } catch (err) {
      console.error("Error deleting coupon:", err);
      // Fallback try with route param if the above fails with 404
      if (err.response && err.response.status === 404) {
        try {
          const response2 = await apiInstance.delete(`/api/coupon/delete/${couponId}`);
          if (response2.status === 200 || response2.status === 201 || response2.data?.success) {
            setSuccess("Coupon deleted successfully!");
            fetchCoupons();
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
      global_usage_limit: coupon.tiering?.[0]?.tier_details?.[0]?.current_tiering_limit || "",
      can_combine_with_referral_credit: coupon.can_combine_with_referral_credit,
      coupon_type_id: coupon.coupon_type_id || 1,
      financial_value: coupon.financial_value || "",
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
    <div className="space-y-6 p-4 bg-gray-100 w-full min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Coupon Management{" "}
          </h1>
          <p className="text-gray-600">
            Manage discount coupon codes for platform subscriptions or
            purchases.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowAddModal(true);
              fetchPlans();
              fetchCriteria();
            }}
            className="mt-4 sm:mt-0 px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]"
          >
            + Create New Coupon
          </button>
          <button
            onClick={() => {
              setShowCriteriaModal(true);
              fetchCriteria();
            }}
            className="mt-4 sm:mt-0 px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]"
          >
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

      <div className="bg-white shadow-sm border border-gray-200 mt-4 rounded-lg">
        <div className="w-full p-4 bg-white flex items-center justify-between">
          {/* Left Title */}
          <h2 className="text-md font-semibold">
            Coupons <span className="text-gray-400 font-normal">- All ({coupons.length})</span>
          </h2>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Subscription Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Subscription Active</span>

              {/* Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-[#B02E0C] transition-all"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
              </label>
            </div>

            {/* Status Dropdown */}
            <select className="border border-gray-300 rounded-md focus:outline-none px-1 py-1 text-sm bg-white">
              <option>Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2 top-2 w-4 h-4 text-gray-400" />

              <input
                type="text"
                placeholder="Search Coupons"
                className="border border-gray-300 rounded-md focus:outline-none px-1 py-1 text-sm w-52 pl-7 placeholder:text-[#060C12]"
              />
            </div>
          </div>
        </div>
        <table className=" overflow-x-auto overflow-scroll text-left border-t border-gray-200">
          <thead className="bg-gray-50 w-10">
            <tr>
              <th className="py-3 px-4 border border-gray-300 text-sm"></th>
              <th className="py-3 px-4 border border-gray-300 text-gray-700 font-normal">
                Coupon Code
              </th>
              <th className="py-3 px-4 border border-gray-300 text-gray-700 font-normal">
                Title
              </th>
              <th className="py-3 px-4 border border-gray-300 text-gray-700 font-normal">
                Financial Value
              </th>
              <th className="py-3 px-4 border border-gray-300 text-gray-700 font-normal">
                Valid From
              </th>
              <th className="py-3 px-4 border border-gray-300 text-gray-700 font-normal">
                Expiry Date
              </th>
              <th className="py-3 px-4 border border-gray-300 text-gray-700 font-normal">
                Usage Limit
              </th>
              <th className="py-3 px-4 border border-gray-300 text-gray-700 font-normal">
                Used Count
              </th>
              <th className="py-3 px-4 border border-gray-300 text-gray-700 font-normal">
                Status
              </th>
              <th className="py-3 px-4 border border-gray-300 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingCoupons ? (
              <tr>
                <td colSpan="10" className="py-8 text-center">
                  <div className="flex justify-center">
                    <Loader2 className="animate-spin text-[#B02E0C]" size={32} />
                  </div>
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan="10" className="py-8 text-center text-gray-500">
                  No coupons found.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => {
                const tier = coupon.tiering?.[0];
                const tierDetail = tier?.tier_details?.[0];
                return (
                  <tr key={coupon.id}>
                    <td className="py-3 px-4 border border-gray-300">
                      <input
                        type="checkbox"
                        className="form-checkbox text-[#B02E0C] rounded focus:ring-[#B02E0C]"
                      />
                    </td>
                    <td className="py-2 px-4 border border-gray-300 text-[#060C12] font-semibold">
                      {coupon.code}
                    </td>
                    <td className="py-2 px-4 border border-gray-300 text-gray-700">
                      {coupon.title}
                    </td>
                    <td className="py-2 px-4 border border-gray-300 text-gray-700">
                      {coupon.financial_value}
                    </td>
                    <td className="py-2 px-4 border border-gray-300 text-gray-700">
                      {coupon.start_date ? new Date(coupon.start_date).toLocaleDateString() : "-"}
                    </td>
                    <td className="py-2 px-4 border border-gray-300 text-gray-700">
                      {coupon.end_date ? new Date(coupon.end_date).toLocaleDateString() : "-"}
                    </td>
                    <td className="py-2 px-4 border border-gray-300 text-gray-700">
                      {tierDetail?.current_tiering_limit || "-"}
                    </td>
                    <td className="py-2 px-4 border border-gray-300 text-gray-700">
                      {tier?.used_total || 0}
                    </td>
                    <td className="py-2 px-4 border border-gray-300">
                      <div className={`px-2.5 py-1 middle none center rounded-full border ${coupon.status ? 'border-green-300 bg-green-100' : 'border-red-300 bg-red-100'} flex items-center gap-1 w-fit`}>
                        <div className={`rounded-full w-2 h-2 ${coupon.status ? 'bg-[#04B440]' : 'bg-red-500'}`}></div>
                        <span className={`${coupon.status ? 'text-[#04B440]' : 'text-red-500'} font-semibold text-xs`}>
                          {coupon.status ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-4 border border-gray-300 text-gray-700">
                      <div className="flex flex-row gap-4">
                        <Eye
                          className="w-5 h-5 text-gray-600 cursor-pointer hover:text-[#B02E0C]"
                          onClick={() => {
                            setSelectedCoupon(coupon);
                            setShowOpenModal(true);
                          }}
                        />
                        <Pencil
                          className="w-5 h-5 text-gray-600 cursor-pointer hover:text-[#B02E0C]"
                          onClick={() => handleEditCouponClick(coupon)}
                        />
                        <Trash2
                          className="w-5 h-5 text-gray-600 cursor-pointer hover:text-red-500"
                          onClick={() => handleDeleteCoupon(coupon.id)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Coupon Criteria Modal */}
      {showCriteriaModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-xl w-[90%] max-w-6xl p-6 relative my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Coupon Criteria</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddCriteriaModal(true);
                    resetCriteriaForm();
                  }}
                  className="px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b] flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add Criteria
                </button>
                <button
                  onClick={() => {
                    setShowCriteriaModal(false);
                    setErrorCriteria(null);
                    setSuccessCriteria(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
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

            {/* Criteria Table */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                {loadingCriteria ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="animate-spin text-[#B02E0C]" size={32} />
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">ID</th>
                        <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">Attach Phone</th>
                        <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">Attach Email</th>
                        <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">Reason Place ID</th>
                        <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">Date Range</th>
                        <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">For New</th>
                        <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">For Existing (Condition)</th>
                        <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">For Existing (Non-Condition)</th>
                        <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">Map Existing User</th>
                        <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">Map Upcoming User</th>
                        <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">Status</th>
                        <th className="py-3 px-4 border border-gray-300 text-sm font-semibold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {criteria.length === 0 ? (
                        <tr>
                          <td colSpan="12" className="py-8 text-center text-gray-500">
                            No criteria found. Click "Add Criteria" to add one.
                          </td>
                        </tr>
                      ) : (
                        criteria.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 border border-gray-300 text-gray-700">{item.id}</td>
                            <td className="py-3 px-4 border border-gray-300 text-gray-700">
                              {item.attach_phone ? "Yes" : "No"}
                            </td>
                            <td className="py-3 px-4 border border-gray-300 text-gray-700">
                              {item.attach_email ? "Yes" : "No"}
                            </td>
                            <td className="py-3 px-4 border border-gray-300 text-gray-700">
                              {item.reason_place_id ? "Yes" : "No"}
                            </td>
                            <td className="py-3 px-4 border border-gray-300 text-gray-700">
                              {item.date_range ? "Yes" : "No"}
                            </td>
                            <td className="py-3 px-4 border border-gray-300 text-gray-700">
                              {item.for_new ? "Yes" : "No"}
                            </td>
                            <td className="py-3 px-4 border border-gray-300 text-gray-700">
                              {item.for_existing_with_condition ? "Yes" : "No"}
                            </td>
                            <td className="py-3 px-4 border border-gray-300 text-gray-700">
                              {item.for_existing_non_condition ? "Yes" : "No"}
                            </td>
                            <td className="py-3 px-4 border border-gray-300 text-gray-700">
                              {item.need_map_existing_user ? "Yes" : "No"}
                            </td>
                            <td className="py-3 px-4 border border-gray-300 text-gray-700">
                              {item.need_map_upcoming_user ? "Yes" : "No"}
                            </td>
                            <td className="py-3 px-4 border border-gray-300">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${item.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                                }`}>
                                {item.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-3 px-4 border border-gray-300 text-center">
                              <div className="flex justify-center gap-2">
                                {deletingId === item.id ? (
                                  <Loader2 className="animate-spin text-red-600" size={18} />
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleEditClick(item)}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                      title="Edit"
                                    >
                                      <Pencil size={18} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCriteria(item.id)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </>
                                )}
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
        </div>
      )}

      {/* Add Criteria Modal */}
      {showAddCriteriaModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-xl w-[90%] max-w-3xl p-6 relative my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Coupon Criteria</h2>
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
                  <div className="grid grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-2 gap-4">
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
                  setShowAddCriteriaModal(false);
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
                  handleCreateCriteria(e);
                }}
                className="px-10 py-3 rounded-xl bg-[#B02E0C] text-white hover:bg-[#8d270b] hover:shadow-lg hover:shadow-[#B02E0C]/30 transition-all text-sm font-bold cursor-pointer"
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
                  <div className="grid grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-2 gap-4">
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

      {/* Create New Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-8 relative shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
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
                <div className="grid grid-cols-2 gap-6">
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

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={couponFormData.start_date}
                      onChange={handleCouponInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B02E0C]/20 focus:border-[#B02E0C] transition-all bg-gray-50/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={couponFormData.end_date}
                      onChange={handleCouponInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B02E0C]/20 focus:border-[#B02E0C] transition-all bg-gray-50/50"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Coupon Type
                    </label>
                    <select
                      name="coupon_type_id"
                      value={couponFormData.coupon_type_id}
                      onChange={(e) => {
                        const { name, value } = e.target;
                        setCouponFormData(prev => ({
                          ...prev,
                          [name]: Number(value)
                        }));
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B02E0C]/20 focus:border-[#B02E0C] transition-all bg-gray-50/50 appearance-none cursor-pointer"
                      required
                    >
                      <option value="">Select Type</option>
                      {couponTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
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

                <div className="grid grid-cols-2 gap-6">
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
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Criteria Configuration
                    </label>
                    <select
                      name="CouponTypeCriteriaId"
                      value={couponFormData.CouponTypeCriteriaId}
                      onChange={handleCouponInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B02E0C]/20 focus:border-[#B02E0C] transition-all bg-gray-50/50 appearance-none cursor-pointer"
                      required
                    >
                      <option value="">Select Criteria</option>
                      {criteria.map((c) => {
                        const critId = c.id || c.coupon_type_criteria_id;
                        return (
                          <option key={critId} value={String(critId)}>
                            Criteria #{critId}
                          </option>
                        );
                      })}
                    </select>
                  </div>
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
                  <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto p-1 custom-scrollbar">
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

                <div className="grid grid-cols-2 gap-6 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
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

            <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-100 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  resetCouponForm();
                  setError(null);
                }}
                className="px-8 py-3 rounded-xl border-2 border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200 transition-all text-sm font-bold cursor-pointer"
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
                className="px-10 py-3 rounded-xl bg-[#B02E0C] text-white hover:bg-[#8d270b] hover:shadow-lg hover:shadow-[#B02E0C]/30 transition-all text-sm font-bold cursor-pointer flex items-center gap-3 disabled:opacity-70"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? "Processing..." : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Coupon Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-8 relative shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
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
                <div className="grid grid-cols-2 gap-6">
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

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={couponFormData.start_date}
                      onChange={handleCouponInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B02E0C]/20 focus:border-[#B02E0C] transition-all bg-gray-50/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={couponFormData.end_date}
                      onChange={handleCouponInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B02E0C]/20 focus:border-[#B02E0C] transition-all bg-gray-50/50"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Coupon Type
                    </label>
                    <select
                      name="coupon_type_id"
                      value={couponFormData.coupon_type_id}
                      onChange={(e) => {
                        const { name, value } = e.target;
                        setCouponFormData(prev => ({
                          ...prev,
                          [name]: Number(value)
                        }));
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B02E0C]/20 focus:border-[#B02E0C] transition-all bg-gray-50/50 appearance-none cursor-pointer"
                      required
                    >
                      <option value="">Select Type</option>
                      {couponTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
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

                <div className="grid grid-cols-2 gap-6">
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
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Criteria Configuration
                    </label>
                    <select
                      name="CouponTypeCriteriaId"
                      value={String(couponFormData.CouponTypeCriteriaId || "")}
                      onChange={handleCouponInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B02E0C]/20 focus:border-[#B02E0C] transition-all bg-gray-50/50 appearance-none cursor-pointer"
                      required
                    >
                      <option value="">Select Criteria</option>
                      {criteria.map((c) => {
                        const critId = c.id || c.coupon_type_criteria_id;
                        return (
                          <option key={critId} value={String(critId)}>
                            Criteria #{critId}
                          </option>
                        );
                      })}
                    </select>
                  </div>
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
                  <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto p-1 custom-scrollbar">
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

                <div className="grid grid-cols-2 gap-6 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
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

            <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-100 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCoupon(null);
                  resetCouponForm();
                  setError(null);
                }}
                className="px-8 py-3 rounded-xl border-2 border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200 transition-all text-sm font-bold cursor-pointer"
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
                className="px-10 py-3 rounded-xl bg-[#B02E0C] text-white hover:bg-[#8d270b] hover:shadow-lg hover:shadow-[#B02E0C]/30 transition-all text-sm font-bold cursor-pointer flex items-center gap-3 disabled:opacity-70"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? "Processing..." : "Update Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showOpenModal && selectedCoupon && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-xl w-[90%] max-w-2xl p-6 relative my-8">
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

            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
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
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${selectedCoupon.status ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
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
      )}
    </div >
  );
};

export default CouponManagement;
