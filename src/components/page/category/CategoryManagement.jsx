import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { EllipsisVertical, X } from "lucide-react";
import {
    fetchCategories,
    addCategory,
    updateCategory,
} from "../../../redux/slice/CategorySlice";
import DataTable from "../../common/DataTable";

const CategoryManagement = () => {
    const dispatch = useDispatch();
    const { categories, loading } = useSelector((state) => state.category);

    const [openMenuId, setOpenMenuId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("add"); // "add" | "edit" | "view"
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formState, setFormState] = useState({
        name: "",
    });

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

    const Modal = ({ title, children, onClose }) => (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50">
            <div className="bg-white rounded-xl w-[400px] p-6 relative">
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
        { header: "Category Name", accessor: "name" },
    ];

    const renderActions = (category) => (
        <div className="relative">
            <button
                onClick={() => setOpenMenuId(openMenuId === category.id ? null : category.id)}
                className="p-2 rounded hover:bg-gray-100"
            >
                <EllipsisVertical />
            </button>
            {openMenuId === category.id && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 shadow-md rounded-md w-32 z-50">
                    <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        onClick={() => {
                            setSelectedCategory(category);
                            setModalType("view");
                            setShowModal(true);
                            setOpenMenuId(null);
                        }}
                    >
                        View
                    </button>
                    <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        onClick={() => {
                            setSelectedCategory(category);
                            setFormState({ name: category.name });
                            setModalType("edit");
                            setShowModal(true);
                            setOpenMenuId(null);
                        }}
                    >
                        Edit
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6 p-4 bg-gray-100 w-full min-h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
                    <p className="text-gray-600">Manage global work categories here.</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedCategory(null);
                        setFormState({ name: "" });
                        setModalType("add");
                        setShowModal(true);
                    }}
                    className="mt-4 sm:mt-0 px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]"
                >
                    + Add Category
                </button>
            </div>

            <DataTable
                columns={columns}
                data={categories}
                loading={loading}
                renderActions={renderActions}
                rowKey={(row) => row.id}
                showSearch
                onSearch={(q) => {
                    // Implementing local search or relying on DataTable's built-in filtering if it exists
                }}
            />

            {showModal && (
                <Modal
                    title={
                        modalType === "add"
                            ? "Add Category"
                            : modalType === "edit"
                                ? "Edit Category"
                                : "View Category"
                    }
                    onClose={() => setShowModal(false)}
                >
                    {(modalType === "add" || modalType === "edit") && (
                        <form className="space-y-4" onSubmit={handleSave}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formState.name}
                                    onChange={handleFormChange}
                                    className="w-full border px-3 py-2 rounded-md mt-1"
                                    placeholder="Enter category name"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2 bg-[#B02E0C] text-white rounded-md font-semibold"
                            >
                                {modalType === "add" ? "Create" : "Update"} Category
                            </button>
                        </form>
                    )}

                    {modalType === "view" && selectedCategory && (
                        <div className="space-y-3">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 font-medium">NAME</span>
                                <span className="text-lg text-gray-900">{selectedCategory.name}</span>
                            </div>
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
};

export default CategoryManagement;
