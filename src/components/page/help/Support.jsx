import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { EllipsisVertical, Edit, Trash2, Loader2, Plus, X, ChevronLeft, ChevronRight, ChevronDown, Search, Ticket, MessageSquare, HelpCircle, LayoutGrid } from "lucide-react";
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
import DataTable from "../../common/DataTable";

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
  const [ticketFilters, setTicketFilters] = useState({ status: "", issue_category: "", page: 1, limit: 10 });
  const [ticketTotal, setTicketTotal] = useState(0);
  const [ticketTotalPages, setTicketTotalPages] = useState(1);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({ id: "", status: "Open", admin_note: "" });

  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackFilters, setFeedbackFilters] = useState({ page: 1, limit: 10 });
  const [feedbackTotal, setFeedbackTotal] = useState(0);
  const [feedbackTotalPages, setFeedbackTotalPages] = useState(1);
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
      setTickets(res.data?.data || res.data?.tickets || res.data || []);
      setTicketTotal(res.data?.total || res.data?.totalCount || 0);
      setTicketTotalPages(res.data?.totalPages || 1);
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
    } catch { }
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
      const res = await apiInstance.get(`/api/admin/support/feedbacks`, {
        params: {
          page: feedbackFilters.page,
          limit: feedbackFilters.limit,
        },
      });
      setFeedbacks(res.data?.data || res.data?.feedbacks || res.data || []);
      setFeedbackTotal(res.data?.total || res.data?.totalCount || 0);
      setFeedbackTotalPages(res.data?.totalPages || 1);
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
  }, [location.pathname, ticketFilters.page, ticketFilters.limit, ticketFilters.status, ticketFilters.issue_category, feedbackFilters.page, feedbackFilters.limit]);

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

    try {
      if (modalType === "add") {
        const res = await dispatch(createHelpCategory(payload));
        if (createHelpCategory.fulfilled.match(res)) {
          setShowCategoryModal(false);
          await dispatch(fetchHelpCategories());
        }
      } else {
        const res = await dispatch(
          updateHelpCategory({
            id: selectedCategory?.id,
            ...payload,
            isActive: !!categoryForm.isActive,
          })
        );
        if (updateHelpCategory.fulfilled.match(res)) {
          setShowCategoryModal(false);
          await dispatch(fetchHelpCategories());
        }
      }
    } catch (err) {
      console.error("Failed to save category:", err);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory?.id) return;
    const res = await dispatch(deleteHelpCategory(selectedCategory.id));
    if (deleteHelpCategory.fulfilled.match(res)) {
      setShowDeleteModal(false);
      setSelectedCategory(null);
      await dispatch(fetchHelpCategories());
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
      await dispatch(fetchHelpCategories());
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
      await dispatch(fetchHelpCategories());
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
      await dispatch(fetchHelpCategories());
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
    <div className="space-y-8 p-8 bg-[#F8FAFC] w-full min-h-screen" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      {/* Navigation Tabs */}
      <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-[#E2E8F0]">
        <div className="flex gap-2">
          {[
            { name: "Categories", path: "/help", icon: LayoutGrid },
            { name: "FAQs", path: "/help/faqs", icon: HelpCircle },
            { name: "Tickets", path: "/help/tickets", icon: Ticket },
            { name: "Feedbacks", path: "/help/feedbacks", icon: MessageSquare },
          ].map((tab) => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${location.pathname === tab.path
                ? "bg-accent text-white shadow-lg shadow-accent/20"
                : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                }`}
            >
              <tab.icon size={18} strokeWidth={location.pathname === tab.path ? 3 : 2} />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-accent/5 border-l-4 border-accent text-accent rounded-xl animate-in fade-in duration-300">
          <p className="text-sm font-bold">Error: {error}</p>
          <button
            onClick={() => dispatch(clearError())}
            className="text-xs underline mt-1 font-black uppercase tracking-widest opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {location.pathname === "/help" && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">
                Help Support
              </h1>
              <p className="text-sm font-medium text-[#64748B]">
                Manage help categories shown in app help center.
              </p>
            </div>
            <button
              onClick={openAddCategory}
              className="px-8 py-4 bg-accent text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#8D270B] shadow-xl shadow-accent/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Plus size={18} strokeWidth={3} />
              Add Category
            </button>
          </div>

          <DataTable
            columns={[
              {
                header: "Name",
                accessor: "name",
                cell: (r) => <span className="text-sm font-bold text-[#0F172A]">{r.name || "--"}</span>
              },
              // {
              //   header: "Icon Tag",
              //   accessor: "icon",
              //   cell: (r) => (
              //     <span className="px-3 py-1 bg-[#F1F5F9] rounded-lg text-xs font-black text-[#64748B] italic">
              //       {r.icon || "rocket"}
              //     </span>
              //   )
              // },
              // {
              //   header: "Priority",
              //   accessor: "order",
              //   cell: (r) => <span className="text-sm font-bold text-[#475569]">{r.order ?? "0"}</span>
              // },
              {
                header: "Lifecycle",
                accessor: "isActive",
                cell: (r) => (
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${r.isActive === false ? "bg-accent/5 text-[#64748B] border border-[#E2E8F0]" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
                    {r.isActive === false ? "Inactive" : "Active"}
                  </span>
                )
              }
            ]}
            data={sortedCategories}
            loading={loading}
            showPagination={false}
            renderActions={(cat) => (
              <div className="relative">
                <button
                  onClick={() => setOpenMenuId(openMenuId === cat.id ? null : cat.id)}
                  className={`p-3 rounded-xl transition-all duration-200 cursor-pointer ${openMenuId === cat.id ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'hover:bg-accent/5 text-[#94A3B8] hover:text-accent'}`}
                >
                  <EllipsisVertical size={20} />
                </button>
                {openMenuId === cat.id && (
                  <div className="absolute right-12 top-0 bg-white border border-[#E2E8F0] shadow-2xl rounded-2xl w-48 z-[100] py-2 animate-in zoom-in-95 duration-200 origin-top-right">
                    <ul className="text-[#475569] text-sm font-bold">
                      <li
                        onClick={() => {
                          setOpenMenuId(null);
                          openEditCategory(cat);
                        }}
                        className="px-4 py-3 flex items-center gap-3 hover:bg-[#F8FAFC] hover:text-accent cursor-pointer transition-all mx-2 rounded-xl"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100/50">
                          <Edit size={16} />
                        </div>
                        Modify
                      </li>
                      <li
                        onClick={() => {
                          setOpenMenuId(null);
                          setSelectedCategory(cat);
                          setShowDeleteModal(true);
                        }}
                        className="px-4 py-3 flex items-center gap-3 hover:bg-accent/5 hover:text-accent cursor-pointer transition-all mx-2 rounded-xl text-accent"
                      >
                        <div className="w-8 h-8 rounded-lg bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
                          <Trash2 size={16} />
                        </div>
                        Purge
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          />
        </>
      )}

      {location.pathname === "/help/faqs" && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">
                FAQs
              </h1>
              <p className="text-sm font-medium text-[#64748B]">
                Browse and manage FAQs by category. Use "Add FAQ" buttons below to create new items.
              </p>
            </div>
          </div>

          <div className="bg-white shadow-2xl shadow-gray-200/50 border border-[#E2E8F0] rounded-[2rem] overflow-hidden">
            <div className="p-8 border-b border-[#F1F5F9] bg-[#F8FAFC]/50">
              <h2 className="text-xl font-black text-[#0F172A] tracking-tight">FAQ Repository</h2>
              <p className="text-xs font-black text-[#64748B] uppercase tracking-widest mt-1 opacity-70 italic">Intelligence Distribution Center</p>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              {(sortedCategories || []).map((cat) => {
                const faqs = Array.isArray(cat?.faqs)
                  ? [...cat.faqs].sort((a, b) => Number(a?.order || 0) - Number(b?.order || 0))
                  : [];
                return (
                  <div key={cat.id} className="p-8 group/cat hover:bg-[#F8FAFC] transition-colors">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                          <HelpCircle size={24} />
                        </div>
                        <div>
                          <div className="text-lg font-black text-[#0F172A] tracking-tight group-hover/cat:text-accent transition-colors">{cat.name || "--"}</div>
                          <div className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mt-0.5 opacity-70 italic">Count: {cat.faq_count ?? faqs.length} entries</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setFaqForm({ category_id: String(cat.id || ""), question: "", answer: "", order: faqs.length + 1, isActive: true, id: "" });
                          setFaqModalType("add");
                          setShowFAQModal(true);
                        }}
                        className="px-6 py-3 bg-accent text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#8D270B] shadow-lg shadow-accent/10 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                      >
                        <Plus size={14} strokeWidth={3} /> Add FAQ
                      </button>
                    </div>
                    {faqs.length === 0 ? (
                      <div className="p-8 bg-[#F1F5F9]/30 rounded-3xl border border-dashed border-[#E2E8F0] text-center">
                        <p className="text-sm font-bold text-[#64748B]">Intelligence void detected. Add your first FAQ above.</p>
                      </div>
                    ) : (
                      <div className="border border-[#E2E8F0] rounded-3xl overflow-hidden bg-white shadow-sm">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                              <th className="py-4 px-6 text-[10px] font-black text-[#64748B] uppercase tracking-widest w-20">Order</th>
                              <th className="py-4 px-6 text-[10px] font-black text-[#64748B] uppercase tracking-widest">Inquiry Details</th>
                              <th className="py-4 px-6 text-[10px] font-black text-[#64748B] uppercase tracking-widest">Resolution Content</th>
                              <th className="py-4 px-6 text-[10px] font-black text-[#64748B] uppercase tracking-widest">Status</th>
                              <th className="py-4 px-6 text-[10px] font-black text-[#64748B] uppercase tracking-widest text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F1F5F9]">
                            {faqs.map((f) => (
                              <tr key={f.id} className="group/row hover:bg-[#F8FAFC] transition-colors">
                                <td className="py-4 px-6">
                                  <span className="text-sm font-bold text-[#475569] tabular-nums">{f.order ?? "0"}</span>
                                </td>
                                <td className="py-4 px-6 min-w-[200px]">
                                  <span className="text-sm font-black text-[#0F172A] leading-relaxed line-clamp-2">{f.question || "--"}</span>
                                </td>
                                <td className="py-4 px-6 min-w-[300px]">
                                  <p className="text-sm font-medium text-[#64748B] leading-relaxed line-clamp-2 italic">{f.answer || "--"}</p>
                                </td>
                                <td className="py-4 px-6">
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${f.isActive === false ? "bg-accent/5 text-[#64748B] border border-[#E2E8F0]" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
                                    {f.isActive === false ? "Inactive" : "Active"}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-center">
                                  <div className="flex items-center justify-center gap-2 opacity-100 sm:opacity-0 group-hover/row:opacity-100 transition-all duration-300">
                                    <button
                                      onClick={() => handleEditFAQ(f)}
                                      className="p-2 rounded-lg bg-[#F1F5F9] text-[#64748B] hover:bg-accent/10 hover:text-accent transition-colors cursor-pointer"
                                    >
                                      <Edit size={16} />
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
                                      className={`p-2 rounded-lg transition-colors cursor-pointer ${f.isActive === false ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-[#F1F5F9] text-[#64748B] hover:bg-rose-50 hover:text-rose-600'}`}
                                    >
                                      {f.isActive === false ? <Plus size={16} /> : <X size={16} />}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedFAQ(f);
                                        setShowFAQDeleteModal(true);
                                      }}
                                      className="p-2 rounded-lg bg-accent/5 text-accent hover:bg-accent/10 transition-colors cursor-pointer"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {location.pathname === "/help/tickets" && (
        <div className="bg-white shadow-2xl shadow-gray-200/50 border border-[#E2E8F0] rounded-[2rem] overflow-hidden">
          <div className="p-8 border-b border-[#F1F5F9] bg-[#F8FAFC]/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">Support Tickets</h2>
              <p className="text-xs font-black text-[#64748B] uppercase tracking-widest opacity-70 italic">Client Communication Stream</p>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest pl-1">Status Filter</span>
                <div className="relative">
                  <select
                    value={ticketFilters.status}
                    onChange={(e) => setTicketFilters((p) => ({ ...p, status: e.target.value, page: 1 }))}
                    className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm font-bold text-[#0F172A] focus:ring-accent/20 focus:border-accent transition-all cursor-pointer outline-none shadow-sm min-w-[140px]"
                  >
                    <option value="">All Streams</option>
                    <option value="Open">Open</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest pl-1">Topic/Tag</span>
                <div className="relative">
                  <input
                    type="text"
                    value={ticketFilters.issue_category}
                    onChange={(e) => setTicketFilters((p) => ({ ...p, issue_category: e.target.value, page: 1 }))}
                    className="pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm font-bold text-[#0F172A] focus:ring-accent/20 focus:border-accent transition-all outline-none shadow-sm placeholder-[#94A3B8] w-full max-w-[200px]"
                    placeholder="e.g. Inventory..."
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]">
                    <Search size={16} />
                  </div>
                </div>
              </div>
              <button
                onClick={() => fetchTickets()}
                className="mt-5 p-2.5 bg-accent/10 text-accent rounded-xl hover:bg-accent/20 transition-all active:scale-95 cursor-pointer shadow-sm shadow-accent/5 flex items-center gap-2"
                title="Refresh Stream"
              >
                <Loader2 size={18} className={ticketsLoading ? "animate-spin" : ""} />
                <span className="text-[10px] font-black uppercase tracking-widest">Refresh</span>
              </button>
            </div>
          </div>

          {ticketStats && (
            <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border-b border-[#F1F5F9]">
              {Object.entries(ticketStats).map(([k, v]) => (
                <div key={k} className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl group hover:border-accent/30 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300">
                  <div className="text-[10px] font-black text-[#64748B] uppercase tracking-widest opacity-60 group-hover:text-accent group-hover:opacity-100 transition-colors">{k.replace(/([A-Z])/g, ' $1').trim()}</div>
                  <div className="text-2xl font-black text-[#0F172A] mt-1 tabular-nums group-hover:scale-105 transition-transform origin-left">{String(v)}</div>
                </div>
              ))}
            </div>
          )}

          <DataTable
            columns={[
              {
                header: "UID",
                accessor: "id",
                cell: (r) => <span className="px-3 py-1 bg-[#F1F5F9] rounded-lg text-xs font-black text-[#64748B]">#{r.id}</span>
              },
              {
                header: "Client Identity",
                accessor: "user.full_name",
                cell: (r) => (
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#0F172A]">{r.user?.full_name || r.user_name || "Unknown Identity"}</span>
                    <span className="text-xs font-medium text-[#64748B] tabular-nums">{r.user?.phone_number || r.user_phone || "--"}</span>
                  </div>
                )
              },
              {
                header: "Inquiry Context",
                accessor: "issue_category",
                cell: (r) => <span className="text-sm font-black text-[#475569] uppercase tracking-tight">{r.issue_category || "General"}</span>
              },
              {
                header: "State",
                accessor: "status",
                cell: (r) => (
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${r.status === 'Open' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    r.status === 'InProgress' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                      r.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        'bg-accent/5 text-accent border border-accent/10'
                    }`}>
                    {r.status || "Open"}
                  </span>
                )
              },
              {
                header: "Time Logs",
                accessor: "createdAt",
                cell: (r) => (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#0F172A] uppercase tracking-tighter italic">
                      {new Date(r.createdAt || r.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] font-medium text-[#64748B]">
                      {new Date(r.createdAt || r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )
              }
            ]}
            data={tickets}
            loading={ticketsLoading}
            pagination={{
              page: ticketFilters.page,
              limit: ticketFilters.limit,
              totalPages: ticketTotalPages,
              totalRecords: ticketTotal
            }}
            onPageChange={(p) => setTicketFilters(prev => ({ ...prev, page: p }))}
            onLimitChange={(l) => setTicketFilters(prev => ({ ...prev, limit: l, page: 1 }))}
            renderActions={(t) => (
              <button
                onClick={() => { setStatusForm({ id: String(t.id), status: t.status || "Open", admin_note: "" }); setShowStatusModal(true); }}
                className="px-4 py-2 bg-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#8D270B] shadow-lg shadow-accent/10 transition-all active:scale-95 cursor-pointer"
              >
                Intervene
              </button>
            )}
          />
        </div>
      )}

      {location.pathname === "/help/feedbacks" && (
        <div className="bg-white shadow-2xl shadow-gray-200/50 border border-[#E2E8F0] rounded-[2rem] overflow-hidden">
          <div className="p-8 border-b border-[#F1F5F9] bg-[#F8FAFC]/50">
            <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">User Feedbacks</h2>
            <p className="text-xs font-black text-[#64748B] uppercase tracking-widest mt-1 opacity-70 italic">Platform Experience Logs</p>
          </div>
          <DataTable
            columns={[
              {
                header: "UID",
                accessor: "id",
                cell: (r) => <span className="px-3 py-1 bg-[#F1F5F9] rounded-lg text-xs font-black text-[#64748B]">#{r.id}</span>
              },
              {
                header: "Client Identity",
                accessor: "user.full_name",
                cell: (r) => (
                  <span className="text-sm font-bold text-[#0F172A]">{r.user?.full_name || r.user?.phone_number || r.user_id}</span>
                )
              },
              {
                header: "Rating",
                accessor: "rating",
                cell: (r) => (
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-black text-accent tabular-nums">{r.rating ?? "0"}</span>
                    <span className="text-[#94A3B8] text-[10px] font-bold uppercase tracking-widest">/ 5</span>
                  </div>
                )
              },
              {
                header: "Message Transcript",
                accessor: "message",
                cell: (r) => (
                  <p className="text-sm font-medium text-[#64748B] leading-relaxed italic line-clamp-2 max-w-md">
                    "{r.message || "No commentary provided"}"
                  </p>
                )
              },
              {
                header: "Timestamp",
                accessor: "createdAt",
                cell: (r) => (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#0F172A] uppercase tracking-tighter italic">
                      {new Date(r.createdAt || r.created_at || Date.now()).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] font-medium text-[#64748B]">
                      {new Date(r.createdAt || r.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )
              }
            ]}
            data={feedbacks}
            loading={feedbacksLoading}
            pagination={{
              page: feedbackFilters.page,
              limit: feedbackFilters.limit,
              totalPages: feedbackTotalPages,
              totalRecords: feedbackTotal
            }}
            onPageChange={(p) => setFeedbackFilters(prev => ({ ...prev, page: p }))}
            onLimitChange={(l) => setFeedbackFilters(prev => ({ ...prev, limit: l, page: 1 }))}
          />
        </div>
      )}

      {showStatusModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] p-4 backdrop-blur-md bg-white/30 animate-in fade-in duration-300">
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-[#0F172A] tracking-tight text-center sm:text-left">Intervene Ticket</h2>
                  <p className="text-[10px] font-black text-accent uppercase tracking-widest opacity-70 italic text-center sm:text-left">Operational Status Adjustment</p>
                </div>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] transition-all"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-2 pl-1 italic">Lifecycle State</label>
                  <div className="relative">
                    <select
                      value={statusForm.status}
                      onChange={(e) => setStatusForm((p) => ({ ...p, status: e.target.value }))}
                      className="appearance-none w-full pl-4 pr-10 py-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#0F172A] focus:ring-accent/20 focus:border-accent transition-all cursor-pointer outline-none shadow-sm"
                    >
                      <option value="Open">Open</option>
                      <option value="InProgress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-2 pl-1 italic">Administrative Directive</label>
                  <textarea
                    rows={4}
                    value={statusForm.admin_note}
                    onChange={(e) => setStatusForm((p) => ({ ...p, admin_note: e.target.value }))}
                    className="w-full px-4 py-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#0F172A] focus:ring-accent/20 focus:border-accent transition-all outline-none shadow-sm placeholder-[#94A3B8]"
                    placeholder="Document intervention steps or client resolution notes..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="flex-1 py-4 px-6 rounded-2xl border-2 border-[#E2E8F0] bg-white text-sm font-black text-[#64748B] uppercase tracking-widest hover:bg-[#F1F5F9] transition-all active:scale-95"
                  >
                    Abort
                  </button>
                  <button
                    onClick={updateTicketStatus}
                    className="flex-1 py-4 px-6 bg-accent text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-[#8D270B] shadow-lg shadow-accent/20 transition-all active:scale-95 cursor-pointer"
                  >
                    Commit Change
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] p-4 backdrop-blur-md bg-white/30 animate-in fade-in duration-300">
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center sm:text-left">
              <div className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">{modalType === "add" ? "Define Category" : "Refine Categorization"}</h2>
                  <p className="text-[10px] font-black text-accent uppercase tracking-widest opacity-70 italic">Infrastructure Taxonomy Update</p>
                </div>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] transition-all"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-2 pl-1 italic">Identifier Name</label>
                  <input
                    ref={nameRef}
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-5 py-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#0F172A] focus:ring-accent/20 focus:border-accent transition-all outline-none shadow-sm placeholder-[#94A3B8]"
                    placeholder="Enter symbolic name..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {/* <div>
                    <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-2 pl-1 italic">Visual Icon Tag</label>
                    <input
                      type="text"
                      value={categoryForm.icon}
                      onChange={(e) => setCategoryForm((p) => ({ ...p, icon: e.target.value }))}
                      className="w-full px-5 py-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#0F172A] focus:ring-accent/20 focus:border-accent transition-all outline-none shadow-sm placeholder-[#94A3B8]"
                      placeholder="e.g. rocket"
                    />
                  </div> */}
                  {/* <div>
                    <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-2 pl-1 italic">Display Priority</label>
                    <input
                      type="number"
                      value={categoryForm.order}
                      onChange={(e) => setCategoryForm((p) => ({ ...p, order: e.target.value }))}
                      className="w-full px-5 py-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#0F172A] focus:ring-accent/20 focus:border-accent transition-all outline-none shadow-sm placeholder-[#94A3B8]"
                      placeholder="e.g. 1"
                    />
                  </div> */}
                </div>

                <div className="flex items-center gap-3 p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                  <input
                    id="catActive"
                    type="checkbox"
                    checked={categoryForm.isActive}
                    onChange={(e) => setCategoryForm((p) => ({ ...p, isActive: e.target.checked }))}
                    className="w-5 h-5 rounded-md border-2 border-[#E2E8F0] text-accent focus:ring-accent/20 transition-all cursor-pointer"
                  />
                  <label htmlFor="catActive" className="text-xs font-black text-[#475569] uppercase tracking-widest cursor-pointer select-none italic">Set as Active Entity</label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowCategoryModal(false)}
                    className="flex-1 py-4 px-6 rounded-2xl border-2 border-[#E2E8F0] bg-white text-sm font-black text-[#64748B] uppercase tracking-widest hover:bg-[#F1F5F9] transition-all active:scale-95"
                  >
                    Abort
                  </button>
                  <button
                    onClick={handleSaveCategory}
                    className="flex-1 py-4 px-6 bg-accent text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-[#8D270B] shadow-lg shadow-accent/20 transition-all active:scale-95 cursor-pointer"
                  >
                    {modalType === "add" ? "Initialize" : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] p-4 backdrop-blur-md bg-white/30 animate-in fade-in duration-300">
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="w-20 h-20 bg-accent/5 rounded-[2rem] flex items-center justify-center text-accent mb-6 mx-auto shadow-sm">
                <Trash2 size={40} strokeWidth={2} />
              </div>

              <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">Purge Category?</h2>
                <div className="p-6 bg-accent/5 rounded-3xl border border-accent/10 mt-4">
                  <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-2 italic">Irreversible Deletion Sequence</p>
                  <p className="text-sm font-medium text-[#64748B]">
                    Are you certain you want to erase <span className="text-accent font-black">"{selectedCategory?.name}"</span>? This will dismantle this structural unit.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-4 px-6 rounded-2xl border-2 border-[#E2E8F0] bg-white text-sm font-black text-[#64748B] uppercase tracking-widest hover:bg-[#F1F5F9] transition-all active:scale-95"
                >
                  Abort
                </button>
                <button
                  onClick={handleDeleteCategory}
                  className="flex-1 py-4 px-6 bg-accent text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-[#8D270B] shadow-lg shadow-accent/10 transition-all active:scale-95 cursor-pointer"
                >
                  Confirm Purge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFAQModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] p-4 backdrop-blur-md bg-white/30 animate-in fade-in duration-300">
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95 duration-300 max-h-[95vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">{faqModalType === "add" ? "Add Intelligence Unit" : "Update FAQ Entry"}</h2>
                  <p className="text-[10px] font-black text-accent uppercase tracking-widest opacity-70 italic">Knowledge Base Expansion</p>
                </div>
                <button
                  onClick={() => setShowFAQModal(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] transition-all"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-2 pl-1 italic">Structural Category</label>
                  <div className="relative">
                    <select
                      value={faqForm.category_id}
                      onChange={(e) => setFaqForm((p) => ({ ...p, category_id: e.target.value }))}
                      className="appearance-none w-full pl-4 pr-10 py-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#0F172A] focus:ring-accent/20 focus:border-accent transition-all cursor-pointer outline-none shadow-sm"
                    >
                      <option value="">Select Domain Taxonomy</option>
                      {(sortedCategories || []).map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-2 pl-1 italic">Inquiry Statement</label>
                  <input
                    type="text"
                    value={faqForm.question}
                    onChange={(e) => setFaqForm((p) => ({ ...p, question: e.target.value }))}
                    className="w-full px-5 py-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#0F172A] focus:ring-accent/20 focus:border-accent transition-all outline-none shadow-sm placeholder-[#94A3B8]"
                    placeholder="Enter the primary question..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-2 pl-1 italic">Resolution Transcript</label>
                  <textarea
                    rows={5}
                    value={faqForm.answer}
                    onChange={(e) => setFaqForm((p) => ({ ...p, answer: e.target.value }))}
                    className="w-full px-5 py-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#0F172A] focus:ring-accent/20 focus:border-accent transition-all outline-none shadow-sm placeholder-[#94A3B8]"
                    placeholder="Document the comprehensive answer..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-2 pl-1 italic">Logical Order</label>
                    <input
                      type="number"
                      value={faqForm.order}
                      onChange={(e) => setFaqForm((p) => ({ ...p, order: e.target.value }))}
                      className="w-full px-5 py-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#0F172A] focus:ring-accent/20 focus:border-accent transition-all outline-none shadow-sm placeholder-[#94A3B8]"
                      placeholder="e.g. 1"
                    />
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] mt-auto">
                    <input
                      id="faqActiveModal"
                      type="checkbox"
                      checked={faqForm.isActive}
                      onChange={(e) => setFaqForm((p) => ({ ...p, isActive: e.target.checked }))}
                      className="w-5 h-5 rounded-md border-2 border-[#E2E8F0] text-accent focus:ring-accent/20 transition-all cursor-pointer"
                    />
                    <label htmlFor="faqActiveModal" className="text-xs font-black text-[#475569] uppercase tracking-widest cursor-pointer select-none italic">Active State</label>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    onClick={() => setShowFAQModal(false)}
                    className="flex-1 py-4 px-6 rounded-2xl border-2 border-[#E2E8F0] bg-white text-sm font-black text-[#64748B] uppercase tracking-widest hover:bg-[#F1F5F9] transition-all active:scale-95"
                  >
                    Abort
                  </button>
                  {faqModalType === "add" ? (
                    <button
                      onClick={handleCreateFAQ}
                      className="flex-1 py-4 px-6 bg-accent text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-[#8D270B] shadow-lg shadow-accent/20 transition-all active:scale-95 cursor-pointer"
                    >
                      Initialize FAQ
                    </button>
                  ) : (
                    <button
                      onClick={handleUpdateFAQ}
                      className="flex-1 py-4 px-6 bg-accent text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-[#8D270B] shadow-lg shadow-accent/20 transition-all active:scale-95 cursor-pointer"
                    >
                      Commit Entry
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFAQDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] p-4 backdrop-blur-md bg-white/30 animate-in fade-in duration-300">
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-accent/5 rounded-[2rem] flex items-center justify-center text-accent mb-6 mx-auto shadow-sm">
                <Trash2 size={40} strokeWidth={2} />
              </div>

              <div className="space-y-2 mb-8">
                <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">Erase FAQ Entry?</h2>
                <div className="p-6 bg-accent/5 rounded-3xl border border-accent/10 mt-4">
                  <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-2 italic">Structural Intelligence Removal</p>
                  <p className="text-sm font-medium text-[#64748B]">
                    Are you sure you want to permanently delete this intelligence unit?
                  </p>
                  {selectedFAQ?.question && (
                    <p className="text-xs font-bold text-[#475569] mt-3 italic line-clamp-2 bg-white/60 p-3 rounded-xl border border-accent/10">
                      "{selectedFAQ.question}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowFAQDeleteModal(false);
                    setSelectedFAQ(null);
                  }}
                  className="flex-1 py-4 px-6 rounded-2xl border-2 border-[#E2E8F0] bg-white text-sm font-black text-[#64748B] uppercase tracking-widest hover:bg-[#F1F5F9] transition-all active:scale-95"
                >
                  Abort
                </button>
                <button
                  onClick={handleDeleteFAQ}
                  className="flex-1 py-4 px-6 bg-accent text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-[#8D270B] shadow-lg shadow-accent/10 transition-all active:scale-95 cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
