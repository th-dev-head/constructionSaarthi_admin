import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { EllipsisVertical, Edit, Trash2, Loader2, Plus, X } from "lucide-react";
import {
  fetchHelpCategories,
  createHelpCategory,
  updateHelpCategory,
  deleteHelpCategory,
  createHelpFAQ,
  updateHelpFAQ,
  deleteHelpFAQ,
  clearError,
} from "../../../redux/slice/HelpSlice";
import { apiInstance } from "../../../config/axiosInstance";

const Support = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { categories, loading, error } = useSelector((s) => s.help);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [faqModalType, setFaqModalType] = useState("add");
  const [showFAQDeleteModal, setShowFAQDeleteModal] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState(null);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    icon: "",
    order: "",
    isActive: true,
  });

  const [faqForm, setFaqForm] = useState({
    category_id: "",
    question: "",
    answer: "",
    order: "",
    isActive: true,
    id: "",
  });

  const [tickets, setTickets] = useState([]);
  const [ticketStats, setTicketStats] = useState(null);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState(null);
  const [ticketFilters, setTicketFilters] = useState({ status: "", issue_category: "", page: 1, limit: 20 });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({ id: "", status: "Open", admin_note: "" });

  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);
  const [feedbacksError, setFeedbacksError] = useState(null);

  const fetchTickets = async () => {
    setTicketsLoading(true);
    setTicketsError(null);
    try {
      const res = await apiInstance.get(`/api/admin/support/tickets`, {
        params: {
          status: ticketFilters.status || undefined,
          issue_category: ticketFilters.issue_category || undefined,
          page: ticketFilters.page,
          limit: ticketFilters.limit,
        },
      });
      setTickets(res.data?.data || res.data || []);
    } catch (err) {
      setTicketsError(err.response?.data?.message || err.message);
    } finally {
      setTicketsLoading(false);
    }
  };

  const fetchTicketStats = async () => {
    try {
      const res = await apiInstance.get(`/api/admin/support/tickets/stats`);
      setTicketStats(res.data?.data || res.data || null);
    } catch {}
  };

  const updateTicketStatus = async () => {
    const id = statusForm.id;
    if (!id) return;
    try {
      await apiInstance.put(`/api/admin/support/ticket/${id}/status`, {
        status: statusForm.status,
        admin_note: statusForm.admin_note,
      });
      setShowStatusModal(false);
      setStatusForm({ id: "", status: "Open", admin_note: "" });
      fetchTickets();
      fetchTicketStats();
    } catch (err) {
      setTicketsError(err.response?.data?.message || err.message);
    }
  };

  const fetchFeedbacks = async () => {
    setFeedbacksLoading(true);
    setFeedbacksError(null);
    try {
      const res = await apiInstance.get(`/api/admin/support/feedbacks`);
      setFeedbacks(res.data?.data || res.data || []);
    } catch (err) {
      setFeedbacksError(err.response?.data?.message || err.message);
    } finally {
      setFeedbacksLoading(false);
    }
  };

  useEffect(() => {
    if (location.pathname === "/help/tickets") {
      fetchTickets();
      fetchTicketStats();
    } else if (location.pathname === "/help/feedbacks") {
      fetchFeedbacks();
    }
  }, [location.pathname, ticketFilters.page, ticketFilters.limit, ticketFilters.status, ticketFilters.issue_category]);

  const nameRef = useRef(null);

  useEffect(() => {
    dispatch(fetchHelpCategories());
  }, [dispatch]);

  useEffect(() => {
    if (showCategoryModal) setTimeout(() => nameRef.current?.focus(), 0);
  }, [showCategoryModal]);

  const sortedCategories = useMemo(() => {
    const arr = Array.isArray(categories)
      ? categories
      : Array.isArray(categories?.data)
        ? categories.data
        : [];
    return arr.slice().sort((a, b) => {
      const ao = Number(a?.order || 0);
      const bo = Number(b?.order || 0);
      return ao - bo;
    });
  }, [categories]);

  const openAddCategory = () => {
    setModalType("add");
    setSelectedCategory(null);
    setCategoryForm({ name: "", icon: "", order: "", isActive: true });
    setShowCategoryModal(true);
  };

  const openEditCategory = (cat) => {
    setModalType("edit");
    setSelectedCategory(cat);
    setCategoryForm({
      name: cat?.name || "",
      icon: cat?.icon || "",
      order: String(cat?.order ?? ""),
      isActive: cat?.isActive !== false,
    });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async () => {
    const payload = {
      name: categoryForm.name?.trim(),
      icon: categoryForm.icon?.trim(),
      order: Number(categoryForm.order || 0),
    };
    if (!payload.name) return;
    if (modalType === "add") {
      const res = await dispatch(createHelpCategory(payload));
      if (createHelpCategory.fulfilled.match(res)) setShowCategoryModal(false);
    } else {
      const res = await dispatch(
        updateHelpCategory({
          id: selectedCategory?.id,
          ...payload,
          isActive: !!categoryForm.isActive,
        })
      );
      if (updateHelpCategory.fulfilled.match(res)) setShowCategoryModal(false);
    }
    dispatch(fetchHelpCategories());
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory?.id) return;
    const res = await dispatch(deleteHelpCategory(selectedCategory.id));
    if (deleteHelpCategory.fulfilled.match(res)) {
      setShowDeleteModal(false);
      setSelectedCategory(null);
      dispatch(fetchHelpCategories());
    }
  };

  const handleCreateFAQ = async () => {
    const payload = {
      category_id: Number(faqForm.category_id),
      question: faqForm.question?.trim(),
      answer: faqForm.answer?.trim(),
      order: Number(faqForm.order || 0),
    };
    if (!payload.category_id || !payload.question || !payload.answer) return;
    const res = await dispatch(createHelpFAQ(payload));
    if (createHelpFAQ.fulfilled.match(res)) {
      setFaqForm({ category_id: "", question: "", answer: "", order: "", isActive: true, id: "" });
      setShowFAQModal(false);
      dispatch(fetchHelpCategories());
    }
  };

  const handleUpdateFAQ = async () => {
    const idNum = Number(faqForm.id);
    if (!idNum) return;
    const payload = {
      id: idNum,
      category_id: Number(faqForm.category_id) || undefined,
      question: faqForm.question?.trim(),
      answer: faqForm.answer?.trim(),
      order: faqForm.order !== "" ? Number(faqForm.order) : undefined,
      isActive: !!faqForm.isActive,
    };
    const res = await dispatch(updateHelpFAQ(payload));
    if (updateHelpFAQ.fulfilled.match(res)) {
      setFaqForm({ category_id: "", question: "", answer: "", order: "", isActive: true, id: "" });
      setShowFAQModal(false);
      dispatch(fetchHelpCategories());
    }
  };

  const handleDeleteFAQ = async () => {
    const idNum = Number(selectedFAQ?.id);
    if (!idNum) return;
    const res = await dispatch(deleteHelpFAQ(idNum));
    if (deleteHelpFAQ.fulfilled.match(res)) {
      setFaqForm({ category_id: "", question: "", answer: "", order: "", isActive: true, id: "" });
      setShowFAQModal(false);
      setShowFAQDeleteModal(false);
      setSelectedFAQ(null);
      dispatch(fetchHelpCategories());
    }
  };
  const handleEditFAQ = (faq) => {
    if (!faq?.id) return;
    setFaqForm({
      id: String(faq.id),
      category_id: String(faq.category_id || ""),
      question: faq.question || "",
      answer: faq.answer || "",
      order: String(faq.order ?? ""),
      isActive: faq.isActive !== false,
    });
    setFaqModalType("edit");
    setShowFAQModal(true);
  };

  return (
    <div className="space-y-6 p-4 bg-gray-100 w-full min-h-screen">
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => navigate("/help")}
            className={`px-6 py-3 font-medium text-sm ${location.pathname === "/help"
              ? "text-[#B02E0C] border-b-2 border-[#B02E0C]"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Categories
          </button>
          <button
            onClick={() => navigate("/help/faqs")}
            className={`px-6 py-3 font-medium text-sm ${location.pathname === "/help/faqs"
              ? "text-[#B02E0C] border-b-2 border-[#B02E0C]"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            FAQs
          </button>
          <button
            onClick={() => navigate("/help/tickets")}
            className={`px-6 py-3 font-medium text-sm ${location.pathname === "/help/tickets"
              ? "text-[#B02E0C] border-b-2 border-[#B02E0C]"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Tickets
          </button>
          <button
            onClick={() => navigate("/help/feedbacks")}
            className={`px-6 py-3 font-medium text-sm ${location.pathname === "/help/feedbacks"
              ? "text-[#B02E0C] border-b-2 border-[#B02E0C]"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Feedbacks
          </button>
        </div>
      </div>

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

      {location.pathname === "/help" && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Help Support</h1>
              <p className="text-gray-600">Manage help categories shown in app help center.</p>
            </div>
            <button
              onClick={openAddCategory}
              className="mt-4 sm:mt-0 px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b] flex items-center gap-2"
            >
              <Plus size={20} /> Add Category
            </button>
          </div>

          <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin text-[#B02E0C]" size={32} />
                <span className="ml-3 text-gray-600">Loading categories...</span>
              </div>
            ) : (sortedCategories || []).length === 0 ? (
              <div className="flex flex-col justify-center items-center py-12">
                <p className="text-gray-500 mb-4">No categories found</p>
                <button
                  onClick={openAddCategory}
                  className="px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b] flex items-center gap-2"
                >
                  <Plus size={20} /> Create First Category
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 rounded-t-lg">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedCategories.map((cat) => (
                    <tr key={cat.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{cat.name || "--"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{cat.icon || "--"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{cat.order ?? "--"}</td>
                      <td className={`px-6 py-4 text-sm font-medium ${cat.isActive === false ? "text-red-600" : "text-green-600"}`}>
                        {cat.isActive === false ? "Inactive" : "Active"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === cat.id ? null : cat.id)}
                            className="p-2 rounded hover:bg-gray-100"
                          >
                            <EllipsisVertical />
                          </button>
                          {openMenuId === cat.id && (
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 shadow-md rounded-md w-40 z-50">
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  openEditCategory(cat);
                                }}
                                className="px-4 py-2 w-full flex items-center gap-2 hover:bg-gray-50"
                              >
                                <Edit size={16} /> Edit
                              </button>
                              <button
                                onClick={async () => {
                                  setOpenMenuId(null);
                                  await dispatch(updateHelpCategory({
                                    id: cat.id,
                                    name: cat.name,
                                    icon: cat.icon,
                                    order: cat.order,
                                    isActive: !(cat.isActive === false),
                                  }));
                                  dispatch(fetchHelpCategories());
                                }}
                                className="px-4 py-2 w-full flex items-center gap-2 hover:bg-gray-50"
                              >
                                {cat.isActive === false ? "Activate" : "Deactivate"}
                              </button>
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setSelectedCategory(cat);
                                  setShowDeleteModal(true);
                                }}
                                className="px-4 py-2 w-full flex items-center gap-2 hover:bg-gray-50 text-red-600"
                              >
                                <Trash2 size={16} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {location.pathname === "/help/faqs" && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">FAQs</h1>
              <p className="text-gray-600">Browse and manage FAQs by category. Use "Add FAQ" buttons below to create new items.</p>
            </div>
          </div>

          <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">FAQ List</h2>
              <p className="text-sm text-gray-600">All FAQs grouped by category</p>
            </div>
            <div className="divide-y divide-gray-200">
              {(sortedCategories || []).map((cat) => {
                const faqs = Array.isArray(cat?.faqs)
                  ? [...cat.faqs].sort((a, b) => Number(a?.order || 0) - Number(b?.order || 0))
                  : [];
                return (
                  <div key={cat.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-md font-semibold text-gray-900">{cat.name || "--"}</div>
                        <div className="text-xs text-gray-600">FAQs: {cat.faq_count ?? faqs.length}</div>
                      </div>
                      <button
                        onClick={() => {
                          setFaqForm({ category_id: String(cat.id || ""), question: "", answer: "", order: faqs.length + 1, isActive: true, id: "" });
                          setFaqModalType("add");
                          setShowFAQModal(true);
                        }}
                        className="px-3 py-1.5 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]"
                      >
                        Add FAQ
                      </button>
                    </div>
                    {faqs.length === 0 ? (
                      <div className="text-sm text-gray-500">No FAQs</div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-gray-50 rounded-t-lg">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answer</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {faqs.map((f) => (
                            <tr key={f.id}>
                              <td className="px-4 py-2 text-sm text-gray-700">{f.order ?? "--"}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{f.question || "--"}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">{f.answer || "--"}</td>
                              <td className={`px-4 py-2 text-sm font-medium ${f.isActive === false ? "text-red-600" : "text-green-600"}`}>
                                {f.isActive === false ? "Inactive" : "Active"}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditFAQ(f)}
                                    className="px-3 py-1.5 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center gap-2"
                                  >
                                    <Edit size={16} /> Edit
                                  </button>
                                  <button
                                    onClick={async () => {
                                      await dispatch(updateHelpFAQ({
                                        id: Number(f.id),
                                        category_id: Number(f.category_id),
                                        isActive: !(f.isActive === false),
                                      }));
                                      dispatch(fetchHelpCategories());
                                    }}
                                    className="px-3 py-1.5 bg-gray-100 rounded-md hover:bg-gray-200"
                                  >
                                    {f.isActive === false ? "Activate" : "Deactivate"}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedFAQ(f);
                                      setShowFAQDeleteModal(true);
                                    }}
                                    className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                                  >
                                    <Trash2 size={16} /> Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {location.pathname === "/help/tickets" && (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Support Tickets</h2>
            <p className="text-sm text-gray-600">View and manage support tickets</p>
          </div>
          <div className="p-6 flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-600">Status</label>
              <select value={ticketFilters.status} onChange={(e)=>setTicketFilters((p)=>({ ...p, status: e.target.value, page: 1 }))} className="border border-gray-300 rounded-md px-3 py-2">
                <option value="">All</option>
                <option value="Open">Open</option>
                <option value="InProgress">InProgress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600">Issue Category</label>
              <input type="text" value={ticketFilters.issue_category} onChange={(e)=>setTicketFilters((p)=>({ ...p, issue_category: e.target.value, page: 1 }))} className="border border-gray-300 rounded-md px-3 py-2" placeholder="e.g. Inventory"/>
            </div>
            <div className="ml-auto">
              <button onClick={()=>fetchTickets()} className="px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]">Refresh</button>
            </div>
          </div>
          {ticketStats && (
            <div className="px-6 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(ticketStats).map(([k,v])=> (
                <div key={k} className="bg-gray-50 rounded-md p-3 text-sm">
                  <div className="text-gray-600 capitalize">{k}</div>
                  <div className="text-gray-900 font-semibold">{String(v)}</div>
                </div>
              ))}
            </div>
          )}
          {ticketsLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-[#B02E0C]" size={32} />
              <span className="ml-3 text-gray-600">Loading tickets...</span>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">No tickets found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tickets.map((t)=> (
                  <tr key={t.id}>
                    <td className="px-4 py-2 text-sm">{t.id}</td>
                    <td className="px-4 py-2 text-sm">{t.issue_category || "--"}</td>
                    <td className="px-4 py-2 text-sm">{t.status || "Open"}</td>
                    <td className="px-4 py-2 text-sm">{t.user?.full_name || t.user_name || "--"}<span className="text-xs text-gray-500 ml-1">{t.user?.phone_number || t.user_phone || ""}</span></td>
                    <td className="px-4 py-2 text-sm">{new Date(t.createdAt || t.created_at || Date.now()).toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm">
                      <button onClick={()=>{ setStatusForm({ id: String(t.id), status: t.status || "Open", admin_note: "" }); setShowStatusModal(true); }} className="px-3 py-1.5 bg-gray-100 rounded-md hover:bg-gray-200">Update Status</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="p-4 flex justify-between items-center">
            <button disabled={ticketFilters.page<=1} onClick={()=>setTicketFilters((p)=>({ ...p, page: Math.max(1, p.page-1) }))} className="px-3 py-1.5 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50">Prev</button>
            <div className="text-sm text-gray-600">Page {ticketFilters.page}</div>
            <button onClick={()=>setTicketFilters((p)=>({ ...p, page: p.page+1 }))} className="px-3 py-1.5 bg-gray-100 rounded-md hover:bg-gray-200">Next</button>
          </div>
        </div>
      )}

      {location.pathname === "/help/feedbacks" && (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">User Feedbacks</h2>
            <p className="text-sm text-gray-600">Ratings and comments from users</p>
          </div>
          {feedbacksLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-[#B02E0C]" size={32} />
              <span className="ml-3 text-gray-600">Loading feedbacks...</span>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">No feedbacks found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {feedbacks.map((f)=> (
                  <tr key={f.id}>
                    <td className="px-4 py-2 text-sm">{f.id}</td>
                    <td className="px-4 py-2 text-sm">{f.user?.full_name || f.user?.phone_number || f.user_id}</td>
                    <td className="px-4 py-2 text-sm">{f.rating ?? "--"}</td>
                    <td className="px-4 py-2 text-sm">{f.message || "--"}</td>
                    <td className="px-4 py-2 text-sm">{new Date(f.createdAt || f.created_at || Date.now()).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showStatusModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50">
          <div className="bg-white rounded-xl w-[420px] p-6 relative">
            <button onClick={()=> setShowStatusModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">Update Ticket Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={statusForm.status} onChange={(e)=> setStatusForm((p)=>({ ...p, status: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="Open">Open</option>
                  <option value="InProgress">InProgress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Note</label>
                <textarea rows={3} value={statusForm.admin_note} onChange={(e)=> setStatusForm((p)=>({ ...p, admin_note: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Add note" />
              </div>
              <button onClick={updateTicketStatus} className="px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]">Save</button>
            </div>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50">
          <div className="bg-white rounded-xl w-[420px] p-6 relative">
            <button
              onClick={() => setShowCategoryModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">{modalType === "add" ? "Add Category" : "Edit Category"}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  ref={nameRef}
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <input
                  type="text"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, icon: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  placeholder="e.g. rocket"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <input
                  type="number"
                  value={categoryForm.order}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, order: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  placeholder="e.g. 1"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="catActive"
                  type="checkbox"
                  checked={categoryForm.isActive}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, isActive: e.target.checked }))}
                />
                <label htmlFor="catActive" className="text-sm text-gray-700">Active</label>
              </div>
              <button
                onClick={handleSaveCategory}
                className="px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]"
              >
                {modalType === "add" ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50">
          <div className="bg-white rounded-xl w-[420px] p-6 relative">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">Delete Category</h2>
            <p className="text-gray-700 mb-4">Are you sure you want to delete “{selectedCategory?.name}”?</p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCategory}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showFAQModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50">
          <div className="bg-white rounded-xl w-[500px] p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowFAQModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">{faqModalType === "add" ? "Add FAQ" : "Edit FAQ"}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={faqForm.category_id}
                  onChange={(e) => setFaqForm((p) => ({ ...p, category_id: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="">Select category</option>
                  {(sortedCategories || []).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                <input
                  type="text"
                  value={faqForm.question}
                  onChange={(e) => setFaqForm((p) => ({ ...p, question: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  placeholder="Enter question"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                <textarea
                  rows={4}
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm((p) => ({ ...p, answer: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  placeholder="Enter answer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <input
                  type="number"
                  value={faqForm.order}
                  onChange={(e) => setFaqForm((p) => ({ ...p, order: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  placeholder="e.g. 1"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="faqActiveModal"
                  type="checkbox"
                  checked={faqForm.isActive}
                  onChange={(e) => setFaqForm((p) => ({ ...p, isActive: e.target.checked }))}
                />
                <label htmlFor="faqActiveModal" className="text-sm text-gray-700">Active</label>
              </div>
              <div className="flex gap-3 pt-2">
                {faqModalType === "add" ? (
                  <button
                    onClick={handleCreateFAQ}
                    className="px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]"
                  >
                    Create FAQ
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleUpdateFAQ}
                      className="px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]"
                    >
                      Update FAQ
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFAQ(faqForm);
                        setShowFAQDeleteModal(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Delete FAQ
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowFAQModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFAQDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50">
          <div className="bg-white rounded-xl w-[420px] p-6 relative">
            <button
              onClick={() => {
                setShowFAQDeleteModal(false);
                setSelectedFAQ(null);
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">Delete FAQ</h2>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this FAQ?</p>
            {selectedFAQ?.question && (
              <p className="text-sm text-gray-500 mb-6 italic border-l-4 border-gray-200 pl-3">
                "{selectedFAQ.question}"
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleDeleteFAQ}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowFAQDeleteModal(false);
                  setSelectedFAQ(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
