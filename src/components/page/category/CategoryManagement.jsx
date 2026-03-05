import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { EllipsisVertical, X, Plus, Eye, Edit, Tag, Layers, Database } from "lucide-react";
import {
    fetchCategories,
    addCategory,
    updateCategory,
} from "../../../redux/slice/CategorySlice";
import DataTable from "../../common/DataTable";

const CategoryManagement = () => {
    const dispatch = useDispatch();
    const { categories, loading } = useSelector((state) => state.category);
    const menuRef = useRef(null);

    const [openMenuId, setOpenMenuId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("add"); // "add" | "edit" | "view"
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formState, setFormState] = useState({
        name: "",
    });

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
        dispatch(fetchCategories());
    }, [dispatch]);

    const handleFormChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formState.name.trim()) return toast.error("Category name is required");

        try {
            if (modalType === "edit" && selectedCategory) {
                const res = await dispatch(updateCategory({ id: selectedCategory.id, payload: { name: formState.name, categoryId: selectedCategory.id } })).unwrap();
                if (res) {
                    toast.success("Category updated successfully");
                    setShowModal(false);
                    dispatch(fetchCategories());
                }
            } else {
                const res = await dispatch(addCategory({ name: formState.name, categoryId: "" })).unwrap();
                if (res) {
                    toast.success("Category added successfully");
                    setShowModal(false);
                    setFormState({ name: "" });
                    dispatch(fetchCategories());
                }
            }
        } catch (error) {
            toast.error(error?.message || "Operation failed");
        }
    };

    const columns = [
        {
            header: "Category Identity",
            accessor: "name",
            cell: (r) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
                        <Tag size={18} />
                    </div>
                    <div>
                        <p className="font-black text-[#0F172A]">{r.name}</p>
                        <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest mt-0.5">Global Taxonomy</p>
                    </div>
                </div>
            )
        },
        {
            header: "Structural Metadata",
            accessor: "id",
            cell: (r) => (
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#94A3B8] uppercase">
                    <Database size={12} />
                    ID: {r.id.slice(0, 8)}...
                </div>
            )
        }
    ];

    const renderActions = (category) => (
        <div className="relative" ref={openMenuId === category.id ? menuRef : null}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === category.id ? null : category.id);
                }}
                className={`p-3 rounded-xl transition-all duration-200 cursor-pointer ${openMenuId === category.id ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'hover:bg-accent/5 text-[#94A3B8] hover:text-accent'}`}
            >
                <EllipsisVertical size={20} />
            </button>
            {openMenuId === category.id && (
                <div
                    className={`absolute right-12 top-0 bg-white border border-[#E2E8F0] shadow-2xl rounded-2xl w-48 z-[100] py-2 animate-in zoom-in-95 duration-200 origin-top-right`}
                >
                    <ul className="text-[#475569] text-sm font-bold">
                        <li
                            className="px-4 py-3 flex items-center gap-3 hover:bg-[#F8FAFC] hover:text-accent cursor-pointer transition-all mx-2 rounded-xl"
                            onClick={() => {
                                setSelectedCategory(category);
                                setModalType("view");
                                setShowModal(true);
                                setOpenMenuId(null);
                            }}
                        >
                            <div className="w-8 h-8 rounded-lg bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
                                <Eye size={16} />
                            </div>
                            Inspect
                        </li>
                        <li
                            className="px-4 py-3 flex items-center gap-3 hover:bg-[#F8FAFC] hover:text-accent cursor-pointer transition-all mx-2 rounded-xl"
                            onClick={() => {
                                setSelectedCategory(category);
                                setFormState({ name: category.name });
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
                    </ul>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-8 p-8 bg-[#F8FAFC] w-full min-h-screen" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Category-Management</h1>
                    <p className="text-sm font-medium text-[#64748B]">Manage organizational work hierarchies and taxonomies.</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedCategory(null);
                        setFormState({ name: "" });
                        setModalType("add");
                        setShowModal(true);
                    }}
                    className="px-8 py-4 bg-accent text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#8D270B] shadow-xl shadow-accent/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                    <Plus size={18} strokeWidth={3} />
                    Add Category
                </button>
            </div>

            <DataTable
                columns={columns}
                data={categories}
                loading={loading}
                renderActions={renderActions}
                rowKey="id"
                showSearch
                pagination={{ page: 1, limit: 10, totalPages: 1, totalRecords: categories.length }}
                onSearch={(q) => { }}
            />

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-[150] p-4 backdrop-blur-md bg-white/30 animate-in fade-in duration-300">
                    <div
                        className="fixed inset-0 transition-opacity"
                        onClick={() => setShowModal(false)}
                    />

                    <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95 duration-300 flex flex-col">
                        {/* Modal Header */}
                        <div className="p-8 pb-0 flex-shrink-0">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                                        {modalType === "add" ? <Plus size={24} strokeWidth={3} /> :
                                            modalType === "edit" ? <Edit size={24} strokeWidth={2} /> :
                                                <Layers size={24} strokeWidth={2} />}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
                                            {modalType === "add" ? "Initialize Category" :
                                                modalType === "edit" ? "Modify Interface" :
                                                    "Category Preview"}
                                        </h2>
                                        <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mt-1">
                                            System Schema Configuration
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
                        <div className="p-8 overflow-y-auto">
                            {(modalType === "add" || modalType === "edit") && (
                                <form id="category-form" className="space-y-6" onSubmit={handleSave}>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Identity Label <span className="text-accent">*</span></label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formState.name}
                                            onChange={handleFormChange}
                                            className="w-full bg-[#F8FAFC] border-2 border-transparent focus:border-accent/20 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-[#0F172A] transition-all outline-none placeholder:text-[#94A3B8]"
                                            placeholder="Enter classification name..."
                                            required
                                        />
                                    </div>
                                </form>
                            )}

                            {modalType === "view" && selectedCategory && (
                                <div className="space-y-6 bg-[#F8FAFC] p-6 rounded-3xl border border-[#E2E8F0]">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Primary Taxonomy</p>
                                        <p className="text-lg font-black text-[#0F172A]">{selectedCategory.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Registry ID</p>
                                        <p className="text-xs font-mono font-bold text-[#475569]">{selectedCategory.id}</p>
                                    </div>
                                    <div className="pt-4 border-t border-[#F1F5F9] flex items-center gap-2 text-xs font-bold text-accent italic">
                                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                        Active Structural Element
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
                                    form="category-form"
                                    type="submit"
                                    className="flex-[2] py-4 px-8 bg-accent text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-[#8D270B] shadow-lg shadow-accent/20 transition-all active:scale-95 cursor-pointer"
                                >
                                    {modalType === "add" ? "Deploy Category" : "Sync Changes"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagement;
