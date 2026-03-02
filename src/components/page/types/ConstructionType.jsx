import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { EllipsisVertical, X } from "lucide-react";
import {
    fetchConstructions,
    addConstruction,
    updateConstruction,
    deleteConstruction,
} from "../../../redux/slice/Types/ConstructionSlice";
import DataTable from "../../common/DataTable";
import Modal from "../../common/Modal";

const ConstructionType = () => {
    const dispatch = useDispatch();
    const { constructions, loading } = useSelector((state) => state.construction);

    const [openMenuId, setOpenMenuId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("add"); // "add" | "edit" | "view" | "delete"
    const [selectedConstruction, setSelectedConstruction] = useState(null);
    const [formState, setFormState] = useState({
        name: "",
    });
    const nameRef = useRef(null);

    useEffect(() => {
        dispatch(fetchConstructions());
    }, [dispatch]);

    useEffect(() => {
        if (showModal) {
            setTimeout(() => nameRef.current?.focus(), 0);
        }
    }, [showModal]);

    const handleFormChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!formState.name.trim())
            return toast.error("Construction Name is required");

        if (selectedConstruction) {
            dispatch(
                updateConstruction({ id: selectedConstruction.id, updatedData: formState })
            ).then((res) => {
                if (!res.error) {
                    toast.success("Construction updated successfully");
                    setShowModal(false);
                    dispatch(fetchConstructions());
                }
            });
        } else {
            dispatch(addConstruction(formState)).then((res) => {

                if (!res.error) {
                    toast.success("Construction added successfully");
                    setShowModal(false);
                    setFormState({ name: "" });
                    dispatch(fetchConstructions());
                }
            });
        }
    };

    const handleDelete = () => {
        dispatch(deleteConstruction(selectedConstruction.id)).then((res) => {
            if (!res.error) {
                toast.success("Construction deleted successfully");
                setShowModal(false);
                dispatch(fetchConstructions());
            }
        });
    };

    const columns = [
        { header: "Construction Name", accessor: "name" },
        {
            header: "Date",
            accessor: "createdAt",
            cell: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A",
        },
    ];

    const renderActions = (construction) => (
        <div className="relative">
            <button
                onClick={() => setOpenMenuId(openMenuId === construction.id ? null : construction.id)}
                className="p-2 rounded hover:bg-gray-100"
            >
                <EllipsisVertical />
            </button>
            {openMenuId === construction.id && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 shadow-md rounded-md w-32 z-50">
                    <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        onClick={() => {
                            setSelectedConstruction(construction);
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
                            setSelectedConstruction(construction);
                            setFormState({ name: construction.name });
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
                            setSelectedConstruction(construction);
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
                    <h1 className="text-2xl font-bold text-gray-900">Construction Types</h1>
                    <p className="text-gray-600">Manage all Construction Types here.</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedConstruction(null);
                        setFormState({ name: "" });
                        setModalType("add");
                        setShowModal(true);
                    }}
                    className="mt-4 sm:mt-0 px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]"
                >
                    + Add Construction
                </button>
            </div>

            <DataTable
                columns={columns}
                data={constructions}
                loading={loading}
                renderActions={renderActions}
                rowKey={(row) => row.id}
                showSearch
            />

            {showModal && (
                <Modal
                    title={
                        modalType === "add"
                            ? "Add Construction"
                            : modalType === "edit"
                                ? "Edit Construction"
                                : modalType === "view"
                                    ? "View Construction"
                                    : "Delete Construction"
                    }
                    onClose={() => setShowModal(false)}
                >
                    {(modalType === "add" || modalType === "edit") && (
                        <form className="space-y-4" onSubmit={handleSave}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Construction Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    ref={nameRef}
                                    value={formState.name}
                                    onChange={handleFormChange}
                                    className="w-full border px-3 py-2 rounded-md"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2 bg-[#B02E0C] text-white rounded-md"
                            >
                                {modalType === "add" ? "Create" : "Update"} Construction
                            </button>
                        </form>
                    )}

                    {modalType === "view" && selectedConstruction && (
                        <div className="space-y-2">
                            <p>
                                <strong>Construction Name:</strong> {selectedConstruction.name}
                            </p>
                            <p>
                                <strong>Date:</strong>{" "}
                                {selectedConstruction.createdAt ? new Date(selectedConstruction.createdAt).toLocaleDateString() : "N/A"}
                            </p>
                        </div>
                    )}

                    {modalType === "delete" && selectedConstruction && (
                        <div>
                            <p>
                                Are you sure you want to delete{" "}
                                <strong>{selectedConstruction.name}</strong>?
                            </p>
                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-300 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md"
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

export default ConstructionType;
