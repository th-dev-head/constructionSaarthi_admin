import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { EllipsisVertical, X, Upload } from "lucide-react";
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
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

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
            header: "Image",
            accessor: "image_url",
            cell: (r) => (
                <img
                    src={r.image_url}
                    alt="Banner"
                    className="w-16 h-10 object-cover rounded shadow-sm"
                />
            ),
        },
        { header: "Heading", accessor: "heading" },
        { header: "Type", accessor: "type" },
        { header: "Alignment", accessor: "text_alignment" },
        {
            header: "Date",
            accessor: "createdAt",
            cell: (r) => new Date(r.createdAt).toLocaleDateString(),
        },
    ];

    const renderActions = (banner) => (
        <div className="relative">
            <button
                onClick={() => setOpenMenuId(openMenuId === banner.id ? null : banner.id)}
                className="p-2 rounded hover:bg-gray-100"
            >
                <EllipsisVertical />
            </button>
            {openMenuId === banner.id && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 shadow-md rounded-md w-32 z-50">
                    <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        onClick={() => {
                            setSelectedBanner(banner);
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
                            });
                            setImagePreview(banner.image_url);
                            setModalType("edit");
                            setShowModal(true);
                            setOpenMenuId(null);
                        }}
                    >
                        Edit
                    </button>
                    <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                        onClick={() => {
                            setSelectedBanner(banner);
                            setModalType("delete");
                            setShowModal(true);
                            setOpenMenuId(null);
                        }}
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6 p-4 bg-gray-100 w-full min-h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>
                    <p className="text-gray-600">Manage all app banners here.</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setModalType("add");
                        setShowModal(true);
                    }}
                    className="mt-4 sm:mt-0 px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]"
                >
                    + Add Banner
                </button>
            </div>

            <DataTable
                columns={columns}
                data={banners}
                loading={loading}
                renderActions={renderActions}
                rowKey={(row) => row.id}
                showSearch
                onSearch={(q) => {
                    // Implementing local search if needed, or api search
                }}
            />

            {showModal && (
                <Modal
                    title={
                        modalType === "add"
                            ? "Add Banner"
                            : modalType === "edit"
                                ? "Edit Banner"
                                : modalType === "view"
                                    ? "View Banner"
                                    : "Delete Banner"
                    }
                    onClose={() => setShowModal(false)}
                >
                    {(modalType === "add" || modalType === "edit") && (
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSave}>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
                                <input
                                    type="text"
                                    name="heading"
                                    value={formState.heading}
                                    onChange={handleFormChange}
                                    className="w-full border px-3 py-2 rounded-md focus:ring-[#B02E0C] focus:border-[#B02E0C]"
                                    required
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sub Heading</label>
                                <textarea
                                    name="sub_heading"
                                    value={formState.sub_heading}
                                    onChange={handleFormChange}
                                    className="w-full border px-3 py-2 rounded-md focus:ring-[#B02E0C] focus:border-[#B02E0C]"
                                    rows="2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                                <input
                                    type="text"
                                    name="button_text"
                                    value={formState.button_text}
                                    onChange={handleFormChange}
                                    className="w-full border px-3 py-2 rounded-md focus:ring-[#B02E0C] focus:border-[#B02E0C]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Button URL</label>
                                <input
                                    type="text"
                                    name="button_url"
                                    value={formState.button_url}
                                    onChange={handleFormChange}
                                    className="w-full border px-3 py-2 rounded-md focus:ring-[#B02E0C] focus:border-[#B02E0C]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Heading Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        name="heading_color"
                                        value={formState.heading_color}
                                        onChange={handleFormChange}
                                        className="h-10 w-20 border px-1 py-1 rounded-md"
                                    />
                                    <span className="text-xs text-gray-500">{formState.heading_color}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sub Heading Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        name="sub_heading_color"
                                        value={formState.sub_heading_color}
                                        onChange={handleFormChange}
                                        className="h-10 w-20 border px-1 py-1 rounded-md"
                                    />
                                    <span className="text-xs text-gray-500">{formState.sub_heading_color}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Button Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        name="button_color"
                                        value={formState.button_color}
                                        onChange={handleFormChange}
                                        className="h-10 w-20 border px-1 py-1 rounded-md"
                                    />
                                    <span className="text-xs text-gray-500">{formState.button_color}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Text Alignment</label>
                                <select
                                    name="text_alignment"
                                    value={formState.text_alignment}
                                    onChange={handleFormChange}
                                    className="w-full border px-3 py-2 rounded-md focus:ring-[#B02E0C] focus:border-[#B02E0C]"
                                >
                                    <option value="left">Left</option>
                                    <option value="center">Center</option>
                                    <option value="right">Right</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Type</label>
                                <select
                                    name="type"
                                    value={formState.type}
                                    onChange={handleFormChange}
                                    className="w-full border px-3 py-2 rounded-md focus:ring-[#B02E0C] focus:border-[#B02E0C]"
                                >
                                    <option value="header">Header</option>
                                    <option value="footer">Footer</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
                                <div
                                    className="border-2 border-dashed border-gray-300 rounded-md p-2 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="h-20 object-contain" />
                                    ) : (
                                        <div className="text-center">
                                            <Upload className="mx-auto text-gray-400" size={24} />
                                            <span className="text-xs text-gray-500">Click to upload</span>
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

                            <div className="col-span-1 md:col-span-2">
                                <button
                                    type="submit"
                                    className="w-full py-2 bg-[#B02E0C] text-white rounded-md font-semibold hover:bg-[#8d270b] transition-colors mt-4"
                                >
                                    {modalType === "add" ? "Create" : "Update"} Banner
                                </button>
                            </div>
                        </form>
                    )}

                    {modalType === "view" && selectedBanner && (
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <img
                                    src={selectedBanner.image_url}
                                    alt="Banner"
                                    className="w-full max-h-48 object-contain rounded bg-gray-100 p-2"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <div>
                                    <span className="font-semibold text-gray-600">Heading:</span>
                                    <p className="mt-1 text-gray-900">{selectedBanner.heading}</p>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-600">Type:</span>
                                    <p className="mt-1 text-gray-900 capitalize">{selectedBanner.type}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="font-semibold text-gray-600">Sub Heading:</span>
                                    <p className="mt-1 text-gray-900">{selectedBanner.sub_heading || "N/A"}</p>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-600">Button Text:</span>
                                    <p className="mt-1 text-gray-900">{selectedBanner.button_text || "N/A"}</p>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-600">Button URL:</span>
                                    <p className="mt-1 text-gray-900 truncate">{selectedBanner.button_url || "N/A"}</p>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-600">Heading Color:</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-4 h-4 rounded shadow-sm border" style={{ backgroundColor: selectedBanner.heading_color }} />
                                        <span>{selectedBanner.heading_color}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-600">Text Alignment:</span>
                                    <p className="mt-1 text-gray-900 capitalize">{selectedBanner.text_alignment}</p>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-600">Sub Heading Color:</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-4 h-4 rounded shadow-sm border" style={{ backgroundColor: selectedBanner.sub_heading_color }} />
                                        <span>{selectedBanner.sub_heading_color}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-600">Button Color:</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-4 h-4 rounded shadow-sm border" style={{ backgroundColor: selectedBanner.button_color }} />
                                        <span>{selectedBanner.button_color}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-600">Created At:</span>
                                    <p className="mt-1 text-gray-900">{new Date(selectedBanner.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {modalType === "delete" && selectedBanner && (
                        <div>
                            <p className="text-lg">
                                Are you sure you want to delete banner with heading:
                                <br />
                                <strong className="text-red-600">"{selectedBanner.heading}"</strong>?
                            </p>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
};

export default BannerManagement;
