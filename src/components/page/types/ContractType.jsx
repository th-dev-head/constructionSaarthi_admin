import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { EllipsisVertical, X } from "lucide-react";
import {
    fetchContractTypes,
    addContractType,
    updateContractType,
    deleteContractType,
} from "../../../redux/slice/Types/ContractTypeSlice";
import DataTable from "../../common/DataTable";
import Modal from "../../common/Modal";

const ContractType = () => {
    const dispatch = useDispatch();
    const { contractTypes, loading } = useSelector((state) => state.contractType);

    const [openMenuId, setOpenMenuId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("add"); // "add" | "edit" | "view" | "delete"
    const [selectedContractType, setSelectedContractType] = useState(null);
    const [formState, setFormState] = useState({
        name: "",
    });
    const nameRef = useRef(null);

    useEffect(() => {
        dispatch(fetchContractTypes());
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
            return toast.error("Contract Type Name is required");

        if (selectedContractType) {
            dispatch(
                updateContractType({ id: selectedContractType.id, updatedData: formState })
            ).then((res) => {
                if (!res.error) {
                    toast.success("Contract Type updated successfully");
                    setShowModal(false);
                    dispatch(fetchContractTypes());
                }
            });
        } else {
            dispatch(addContractType(formState)).then((res) => {
                if (!res.error) {
                    toast.success("Contract Type added successfully");
                    setShowModal(false);
                    setFormState({ name: "" });
                    dispatch(fetchContractTypes());
                }
            });
        }
    };

    const handleDelete = () => {
        dispatch(deleteContractType(selectedContractType.id)).then((res) => {
            if (!res.error) {
                toast.success("Contract Type deleted successfully");
                setShowModal(false);
                dispatch(fetchContractTypes());
            }
        });
    };

    const columns = [
        { header: "Contract Type Name", accessor: "name" },
        {
            header: "Date",
            accessor: "createdAt",
            cell: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A",
        },
    ];

    const renderActions = (type) => (
        <div className="relative">
            <button
                onClick={() => setOpenMenuId(openMenuId === type.id ? null : type.id)}
                className="p-2 rounded hover:bg-gray-100"
            >
                <EllipsisVertical />
            </button>
            {openMenuId === type.id && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 shadow-md rounded-md w-32 z-50">
                    <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        onClick={() => {
                            setSelectedContractType(type);
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
                            setSelectedContractType(type);
                            setFormState({ name: type.name });
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
                            setSelectedContractType(type);
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
                    <h1 className="text-2xl font-bold text-gray-900">Contract Types</h1>
                    <p className="text-gray-600">Manage all Contract Types here.</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedContractType(null);
                        setFormState({ name: "" });
                        setModalType("add");
                        setShowModal(true);
                    }}
                    className="mt-4 sm:mt-0 px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]"
                >
                    + Add Contract Type
                </button>
            </div>

            <DataTable
                columns={columns}
                data={contractTypes}
                loading={loading}
                renderActions={renderActions}
                rowKey={(row) => row.id}
                showSearch
            />

            {showModal && (
                <Modal
                    title={
                        modalType === "add"
                            ? "Add Contract Type"
                            : modalType === "edit"
                                ? "Edit Contract Type"
                                : modalType === "view"
                                    ? "View Contract Type"
                                    : "Delete Contract Type"
                    }
                    onClose={() => setShowModal(false)}
                >
                    {(modalType === "add" || modalType === "edit") && (
                        <form className="space-y-4" onSubmit={handleSave}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Contract Type Name
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
                                {modalType === "add" ? "Create" : "Update"} Contract Type
                            </button>
                        </form>
                    )}

                    {modalType === "view" && selectedContractType && (
                        <div className="space-y-2">
                            <p>
                                <strong>Contract Type Name:</strong> {selectedContractType.name}
                            </p>
                            <p>
                                <strong>Date:</strong>{" "}
                                {selectedContractType.createdAt ? new Date(selectedContractType.createdAt).toLocaleDateString() : "N/A"}
                            </p>
                        </div>
                    )}

                    {modalType === "delete" && selectedContractType && (
                        <div>
                            <p>
                                Are you sure you want to delete{" "}
                                <strong>{selectedContractType.name}</strong>?
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

export default ContractType;
