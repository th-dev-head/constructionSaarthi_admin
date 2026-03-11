import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { EllipsisVertical, X, Upload, Plus, Eye, Edit, Trash2, Layout, Image as ImageIcon, ChevronDown } from "lucide-react";
import {
    fetchAllBanners,
    addBanner,
    updateBanner,
    deleteBanner,
} from "../../../redux/slice/BannerSlice";
import DataTable from "../../common/DataTable";

const BannerManagement = () => {
    const dispatch = useDispatch();
    const { banners, loading } = useSelector((state) => state.banner);
    const menuRef = useRef(null);

    const [openMenuId, setOpenMenuId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("add"); // "add" | "edit" | "view" | "delete"
    const [selectedBanner, setSelectedBanner] = useState(null);
    const [formState, setFormState] = useState({
        heading: "",
        sub_heading: "",
        button_text: "",
        button_url: "",
        heading_color: "#FFFFFF",
        sub_heading_color: "#FFFFFF",
        button_color: "#FFFFFF",
        text_alignment: "left",
        type: "header",
        is_active: true,
    });
    const [activeTab, setActiveTab] = useState("all"); // "all" | "header" | "footer"
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                if (!event.target.closest('button[class*="rounded-xl"]')) {
                    setOpenMenuId(null);
                }
            }
        };
        if (openMenuId) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openMenuId]);

    useEffect(() => {
        dispatch(fetchAllBanners());
    }, [dispatch]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormState({ ...formState, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleToggleActive = (e) => {
        setFormState({ ...formState, is_active: e.target.checked });
    };

    const resetForm = () => {
        setFormState({
            heading: "",
            sub_heading: "",
            button_text: "",
            button_url: "",
            heading_color: "#FFFFFF",
            sub_heading_color: "#FFFFFF",
            button_color: "#FFFFFF",
            text_alignment: "left",
            type: "header",
            is_active: true,
        });
        setImageFile(null);
        setImagePreview(null);
        setSelectedBanner(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formState.heading.trim()) return toast.error("Heading is required");

        const formData = new FormData();
        Object.keys(formState).forEach((key) => {
            formData.append(key, formState[key]);
        });
        if (imageFile) {
            formData.append("image", imageFile);
        }

        try {
            if (modalType === "edit" && selectedBanner) {
                const res = await dispatch(updateBanner({ id: selectedBanner.id, formData })).unwrap();
                if (res.success) {
                    toast.success("Banner updated successfully");
                    setShowModal(false);
                    dispatch(fetchAllBanners());
                }
            } else {
                const res = await dispatch(addBanner(formData)).unwrap();
                if (res.success) {
                    toast.success("Banner added successfully");
                    setShowModal(false);
                    dispatch(fetchAllBanners());
                }
            }
        } catch (error) {
            toast.error(error?.message || "Operation failed");
        }
    };

    const handleDelete = async () => {
        try {
            await dispatch(deleteBanner(selectedBanner.id)).unwrap();
            toast.success("Banner deleted successfully");
            setShowModal(false);
            dispatch(fetchAllBanners());
        } catch (error) {
            toast.error(error?.message || "Delete failed");
        }
    };

    const Modal = ({ title, children, onClose }) => (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50 overflow-y-auto pt-20 pb-10">
            <div className="bg-white rounded-xl w-[90%] max-w-2xl p-6 relative max-h-full overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    <X size={20} />
                </button>
                <h2 className="text-xl font-semibold mb-4">{title}</h2>
                {children}
            </div>
        </div>
    );

    const columns = [
        {
            header: "Blueprint",
            accessor: "image_url",
            cell: (r) => (
                <div className="relative group/img overflow-hidden rounded-xl bg-accent/5 aspect-video w-32 border border-accent/10 shadow-sm transition-all hover:shadow-md">
                    <img
                        src={r.image_url}
                        alt="Banner"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                </div>
            ),
        },
        {
            header: "Content Hierarchy",
            accessor: "heading",
            cell: (r) => (
                <div className="max-w-xs">
                    <p className="font-black text-[#0F172A] line-clamp-1">{r.heading}</p>
                    <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest mt-0.5">{r.sub_heading || "No secondary text"}</p>
                </div>
            )
        },
        {
            header: "System Logic",
            accessor: "type",
            cell: (r) => (
                <div className="flex flex-col gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest w-fit inline-block ${r.type === 'header' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                        {r.type}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#94A3B8] uppercase">
                        <Layout size={10} />
                        {r.text_alignment}
                    </div>
                </div>
            )
        },
        {
            header: "Status",
            accessor: "is_active",
            cell: (r) => (
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${r.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${r.is_active ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {r.is_active ? 'Live' : 'Paused'}
                    </span>
                </div>
            )
        },
        {
            header: "Metadata",
            accessor: "createdAt",
            cell: (r) => (
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#475569]">{new Date(r.createdAt).toLocaleDateString()}</span>
                    <span className="text-[10px] text-[#94A3B8] font-medium uppercase">{new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            ),
        },
    ];

    const filteredBanners = banners.filter(b => activeTab === "all" || b.type === activeTab);

    const renderActions = (banner, idx) => (
        <div className="relative" ref={openMenuId === banner.id ? menuRef : null}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === banner.id ? null : banner.id);
                }}
                className={`p-3 rounded-xl transition-all duration-200 cursor-pointer ${openMenuId === banner.id ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'hover:bg-accent/5 text-[#94A3B8] hover:text-accent'}`}
            >
                <EllipsisVertical size={20} />
            </button>
            {openMenuId === banner.id && (
                <div
                    className={`absolute right-12 bg-white border border-[#E2E8F0] shadow-2xl rounded-2xl w-48 z-[100] py-2 animate-in zoom-in-95 duration-200 origin-top-right`}
                    style={{
                        ...(banners.indexOf(banner) > banners.length - 3 ? { bottom: '0', top: 'auto', transformOrigin: 'bottom right' } : { top: '0' })
                    }}
                >
                    <ul className="text-[#475569] text-sm font-bold">
                        <li
                            className="px-4 py-3 flex items-center gap-3 hover:bg-[#F8FAFC] hover:text-accent cursor-pointer transition-all mx-2 rounded-xl"
                            onClick={() => {
                                setSelectedBanner(banner);
                                setModalType("view");
                                setShowModal(true);
                                setOpenMenuId(null);
                            }}
                        >
                            <div className="w-8 h-8 rounded-lg bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
                                <Eye size={16} />
                            </div>
                            Preview
                        </li>
                        <li
                            className="px-4 py-3 flex items-center gap-3 hover:bg-[#F8FAFC] hover:text-accent cursor-pointer transition-all mx-2 rounded-xl"
                            onClick={() => {
                                setSelectedBanner(banner);
                                setFormState({
                                    heading: banner.heading,
                                    sub_heading: banner.sub_heading,
                                    button_text: banner.button_text,
                                    button_url: banner.button_url,
                                    heading_color: banner.heading_color,
                                    sub_heading_color: banner.sub_heading_color,
                                    button_color: banner.button_color,
                                    text_alignment: banner.text_alignment,
                                    type: banner.type,
                                    is_active: banner.is_active,
                                });
                                setImagePreview(banner.image_url);
                                setModalType("edit");
                                setShowModal(true);
                                setOpenMenuId(null);
                            }}
                        >
                            <div className="w-8 h-8 rounded-lg bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
                                <Edit size={16} />
                            </div>
                            Interface
                        </li>
                        <li
                            className="px-4 py-3 flex items-center gap-3 hover:bg-accent/5 hover:text-accent cursor-pointer transition-all mx-2 rounded-xl"
                            onClick={() => {
                                setSelectedBanner(banner);
                                setModalType("delete");
                                setShowModal(true);
                                setOpenMenuId(null);
                            }}
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
    );

    return (
        <div className="space-y-8 p-8 bg-[#F8FAFC] w-full min-h-screen" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Banner-Management</h1>
                    <p className="text-sm font-medium text-[#64748B]">Orchestrate and optimize your application visual banners.</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setModalType("add");
                        setShowModal(true);
                    }}
                    className="px-8 py-4 bg-accent text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#8D270B] shadow-xl shadow-accent/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                    <Plus size={18} strokeWidth={3} />
                    Add Banner
                </button>
            </div>

            {/* Orchestration Tabs */}
            <div className="flex items-center gap-1 bg-[#E2E8F0]/30 p-1 rounded-2xl w-fit">
                {["all", "header", "footer"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-white text-accent shadow-sm" : "text-[#94A3B8] hover:text-[#475569]"}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <DataTable
                columns={columns}
                data={filteredBanners}
                loading={loading}
                renderActions={renderActions}
                rowKey="id"
                showSearch
                pagination={{ page: 1, limit: 10, totalPages: 1, totalRecords: banners.length }}
                onSearch={(q) => { }}
            />

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-[150] p-4 backdrop-blur-md bg-white/30 animate-in fade-in duration-300">
                    <div
                        className="fixed inset-0 transition-opacity"
                        onClick={() => setShowModal(false)}
                    />

                    <div className="relative bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-8 pb-0 flex-shrink-0">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                                        {modalType === "add" ? <Plus size={24} strokeWidth={3} /> :
                                            modalType === "edit" ? <Edit size={24} strokeWidth={2} /> :
                                                modalType === "view" ? <Eye size={24} strokeWidth={2} /> :
                                                    <Trash2 size={24} strokeWidth={2} />}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
                                            {modalType === "add" ? "Initialize Banner" :
                                                modalType === "edit" ? "Modify Interface" :
                                                    modalType === "view" ? "Banner Preview" : "Purge Asset"}
                                        </h2>
                                        <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mt-1">
                                            {modalType === "delete" ? "Irreversible Operation" : "Design Configuration"}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-3 bg-[#F8FAFC] text-[#94A3B8] hover:text-[#0F172A] rounded-2xl transition-all active:scale-95"
                                >
                                    <X size={20} strokeWidth={3} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            {(modalType === "add" || modalType === "edit") && (
                                <form id="banner-form" className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSave}>
                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Primary Heading <span className="text-accent">*</span></label>
                                        <input
                                            type="text"
                                            name="heading"
                                            value={formState.heading}
                                            onChange={handleFormChange}
                                            className="w-full bg-[#F8FAFC] border-2 border-transparent focus:border-accent/20 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-[#0F172A] transition-all outline-none placeholder:text-[#94A3B8]"
                                            required
                                        />
                                    </div>

                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Secondary Narrative</label>
                                        <textarea
                                            name="sub_heading"
                                            value={formState.sub_heading}
                                            onChange={handleFormChange}
                                            className="w-full bg-[#F8FAFC] border-2 border-transparent focus:border-accent/20 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-[#0F172A] transition-all outline-none placeholder:text-[#94A3B8] resize-none"
                                            rows="2"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Action Label</label>
                                        <input
                                            type="text"
                                            name="button_text"
                                            value={formState.button_text}
                                            onChange={handleFormChange}
                                            className="w-full bg-[#F8FAFC] border-2 border-transparent focus:border-accent/20 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-[#0F172A] transition-all outline-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Destination URL</label>
                                        <input
                                            type="text"
                                            name="button_url"
                                            value={formState.button_url}
                                            onChange={handleFormChange}
                                            className="w-full bg-[#F8FAFC] border-2 border-transparent focus:border-accent/20 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-[#0F172A] transition-all outline-none"
                                        />
                                    </div>

                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Color Palette</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {/* Header Color */}
                                            <div className="flex items-center gap-3 bg-[#F8FAFC] p-2.5 rounded-2xl border-2 border-transparent hover:border-accent/10 transition-all group/color">
                                                <div className="relative w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                                                    <input
                                                        type="color"
                                                        name="heading_color"
                                                        value={formState.heading_color}
                                                        onChange={handleFormChange}
                                                        className="absolute -inset-2 w-[150%] h-[150%] cursor-pointer border-none bg-transparent"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-[#475569] uppercase tracking-wider">Header</span>
                                                    <span className="text-[9px] font-bold text-[#94A3B8] font-mono uppercase">{formState.heading_color}</span>
                                                </div>
                                            </div>

                                            {/* Sub-Header Color */}
                                            <div className="flex items-center gap-3 bg-[#F8FAFC] p-2.5 rounded-2xl border-2 border-transparent hover:border-accent/10 transition-all group/color">
                                                <div className="relative w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                                                    <input
                                                        type="color"
                                                        name="sub_heading_color"
                                                        value={formState.sub_heading_color}
                                                        onChange={handleFormChange}
                                                        className="absolute -inset-2 w-[150%] h-[150%] cursor-pointer border-none bg-transparent"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-[#475569] uppercase tracking-wider">Sub-Header</span>
                                                    <span className="text-[9px] font-bold text-[#94A3B8] font-mono uppercase">{formState.sub_heading_color}</span>
                                                </div>
                                            </div>

                                            {/* Action Color */}
                                            <div className="flex items-center gap-3 bg-[#F8FAFC] p-2.5 rounded-2xl border-2 border-transparent hover:border-accent/10 transition-all group/color">
                                                <div className="relative w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                                                    <input
                                                        type="color"
                                                        name="button_color"
                                                        value={formState.button_color}
                                                        onChange={handleFormChange}
                                                        className="absolute -inset-2 w-[150%] h-[150%] cursor-pointer border-none bg-transparent"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-[#475569] uppercase tracking-wider">Button Color</span>
                                                    <span className="text-[9px] font-bold text-[#94A3B8] font-mono uppercase">{formState.button_color}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 col-span-1 md:col-span-2">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Layout Logic</label>
                                            <div className="relative">
                                                <select
                                                    name="text_alignment"
                                                    value={formState.text_alignment}
                                                    onChange={handleFormChange}
                                                    className="w-full appearance-none bg-[#F8FAFC] border-2 border-transparent focus:border-accent/20 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-[#0F172A] transition-all outline-none cursor-pointer"
                                                >
                                                    <option value="left">Left Aligned</option>
                                                    <option value="center">Centered</option>
                                                    <option value="right">Right Aligned</option>
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" size={16} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Banner Type</label>
                                            <div className="relative">
                                                <select
                                                    name="type"
                                                    value={formState.type}
                                                    onChange={handleFormChange}
                                                    className="w-full appearance-none bg-[#F8FAFC] border-2 border-transparent focus:border-accent/20 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-[#0F172A] transition-all outline-none cursor-pointer"
                                                >
                                                    <option value="header">Header Banner</option>
                                                    <option value="footer">Footer Banner</option>
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" size={16} />
                                            </div>
                                        </div>

                                        <div className="space-y-2 flex flex-col">
                                            <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1 mb-2">Visibility Status</label>
                                            <label className="relative inline-flex items-center cursor-pointer mt-2 h-[52px]">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={formState.is_active}
                                                    onChange={handleToggleActive}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[14px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                                                <span className="ml-3 text-sm font-bold text-[#475569] uppercase tracking-wider">
                                                    {formState.is_active ? 'Active' : 'Disabled'}
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Visual Asset</label>
                                        <div
                                            className="border-2 border-dashed border-[#E2E8F0] hover:border-accent/30 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/5 transition-all group"
                                            onClick={() => fileInputRef.current.click()}
                                        >
                                            {imagePreview ? (
                                                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
                                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Plus className="text-white rotate-45" size={32} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <div className="w-16 h-16 bg-[#F8FAFC] rounded-2xl flex items-center justify-center text-[#94A3B8] mb-3 mx-auto group-hover:bg-white transition-all">
                                                        <Upload size={24} />
                                                    </div>
                                                    <p className="text-sm font-bold text-[#0F172A]">Drop identifier or click to upload</p>
                                                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mt-1">PNG, JPG up to 10MB</p>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        </div>
                                    </div>
                                </form>
                            )}

                            {modalType === "view" && selectedBanner && (
                                <div className="space-y-8">
                                    <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-video bg-[#F1F5F9]">
                                        <img
                                            src={selectedBanner.image_url}
                                            alt="Banner"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                                            <h3 className="text-2xl font-black text-white" style={{ color: selectedBanner.heading_color || '#FFFFFF' }}>
                                                {selectedBanner.heading}
                                            </h3>
                                            <p className="font-medium text-sm mt-2 max-w-sm line-clamp-2" style={{ color: selectedBanner.sub_heading_color || '#FFFFFF' }}>
                                                {selectedBanner.sub_heading}
                                            </p>
                                            {selectedBanner.button_text && (
                                                <button className="mt-6 px-6 py-3 rounded-xl font-bold text-sm text-white" style={{ backgroundColor: selectedBanner.button_color || '#B02E0C' }}>
                                                    {selectedBanner.button_text}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 bg-[#F8FAFC] p-6 rounded-3xl border border-[#E2E8F0]">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Logic Placement</p>
                                            <p className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-accent" />
                                                {selectedBanner.type} Interface
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Text Strategy</p>
                                            <p className="text-sm font-bold text-[#0F172A] capitalize">
                                                {selectedBanner.text_alignment} Alignment
                                            </p>
                                        </div>
                                        <div className="col-span-2 space-y-1">
                                            <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Target Path</p>
                                            <p className="text-sm font-bold text-[#475569] break-all">
                                                {selectedBanner.button_url || "Dynamic Routing Disabled"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modalType === "delete" && selectedBanner && (
                                <div className="text-center p-4">
                                    <div className="w-20 h-20 bg-accent/5 rounded-[2.5rem] flex items-center justify-center text-accent mb-6 mx-auto shadow-sm">
                                        <Trash2 size={40} strokeWidth={2} />
                                    </div>
                                    <h3 className="text-2xl font-black text-[#0F172A] tracking-tight mb-2">Eliminate Asset?</h3>
                                    <div className="p-5 bg-accent/5 rounded-3xl border border-accent/10 mt-6 text-left">
                                        <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-2 italic">Impact Assessment</p>
                                        <p className="text-sm font-medium text-[#64748B] leading-relaxed">
                                            Removing <span className="text-accent font-black">"{selectedBanner.heading}"</span> will permanently dismantle its presence across the application. This action cannot be reverted.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t border-[#F1F5F9] bg-[#F8FAFC]/50 flex gap-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-4 px-6 rounded-2xl border-2 border-[#E2E8F0] bg-white text-sm font-black text-[#64748B] uppercase tracking-widest hover:bg-[#F1F5F9] transition-all active:scale-95"
                            >
                                {modalType === "view" ? "Dismiss" : "Abort"}
                            </button>
                            {modalType !== "view" && (
                                <button
                                    form={modalType === "delete" ? undefined : "banner-form"}
                                    onClick={modalType === "delete" ? handleDelete : undefined}
                                    type={modalType === "delete" ? "button" : "submit"}
                                    className="flex-[2] py-4 px-8 bg-accent text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-[#8D270B] shadow-lg shadow-accent/20 transition-all active:scale-95 cursor-pointer"
                                >
                                    {modalType === "add" ? "Deploy Banner" : modalType === "edit" ? "Sync Changes" : "Confirm Purge"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BannerManagement;
