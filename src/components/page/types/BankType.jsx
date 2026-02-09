import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { EllipsisVertical, X, Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { apiInstance } from "../../../config/axiosInstance";

const BankType = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" | "edit" | "delete"
  const [selectedBank, setSelectedBank] = useState(null);
  const [formState, setFormState] = useState({ name: "" });
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all banks
  const fetchBanks = async () => {
    setLoading(true);
    try {
      const response = await apiInstance.get(`/api/bank`);
      if (response.data) {
        // Handle different response structures
        if (response.data.banks && Array.isArray(response.data.banks)) {
          setBanks(response.data.banks);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          setBanks(response.data.data);
        } else if (Array.isArray(response.data)) {
          setBanks(response.data);
        } else {
          setBanks([]);
        }
      }
    } catch (err) {
      console.error("Error fetching banks:", err);
      toast.error(err.response?.data?.message || "Failed to fetch banks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleFormChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formState.name.trim()) {
      return toast.error("Bank name is required");
    }

    setSubmitting(true);
    try {
      if (selectedBank) {
        // Update bank
        const response = await apiInstance.put(
          `/api/bank/update/${selectedBank.id}`,
          { name: formState.name }
        );

        if (response.status === 200 || response.status === 201 || response.data?.success) {
          toast.success("Bank updated successfully");
          setShowModal(false);
          setSelectedBank(null);
          setFormState({ name: "" });
          fetchBanks();
        } else {
          toast.error(response.data?.message || "Failed to update bank");
        }
      } else {
        // Create bank
        const response = await apiInstance.post(`/api/bank`, { name: formState.name });

        if (response.status === 200 || response.status === 201 || response.data?.success) {
          toast.success("Bank added successfully");
          setShowModal(false);
          setFormState({ name: "" });
          fetchBanks();
        } else {
          toast.error(response.data?.message || "Failed to add bank");
        }
      }
    } catch (err) {
      console.error("Error saving bank:", err);
      toast.error(err.response?.data?.message || "Failed to save bank");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBank) return;

    setDeletingId(selectedBank.id);
    try {
      const response = await apiInstance.delete(`/api/bank/delete/${selectedBank.id}`);

      if (response.status === 200 || response.status === 204 || response.data?.success) {
        toast.success("Bank deleted successfully");
        setShowModal(false);
        setSelectedBank(null);
        fetchBanks();
      } else {
        toast.error(response.data?.message || "Failed to delete bank");
      }
    } catch (err) {
      console.error("Error deleting bank:", err);
      toast.error(err.response?.data?.message || "Failed to delete bank");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditClick = (bank) => {
    setSelectedBank(bank);
    setFormState({ name: bank.name });
    setModalType("edit");
    setShowModal(true);
    setOpenMenuId(null);
  };

  const handleDeleteClick = (bank) => {
    setSelectedBank(bank);
    setModalType("delete");
    setShowModal(true);
    setOpenMenuId(null);
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "--";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 p-4 bg-gray-100 w-full min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bank Management</h1>
          <p className="text-gray-600">Manage all bank types here.</p>
        </div>
        <button
          onClick={() => {
            setModalType("add");
            setSelectedBank(null);
            setFormState({ name: "" });
            setShowModal(true);
          }}
          className="mt-4 sm:mt-0 px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b] flex items-center gap-2"
        >
          <Plus size={18} />
          Add Bank
        </button>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 mt-4 rounded-lg">
        <div className="flex justify-between items-center border-b border-gray-200 bg-gray-50 relative">
          <div className="flex items-center gap-3 p-4 relative">
            <input
              type="text"
              placeholder="Search Bank..."
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B02E0C]"
            />
          </div>
        </div>

        <table className="w-full text-left border-t border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 border border-gray-300 text-sm font-semibold"></th>
              <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">
                Name
              </th>
              <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">
                Date
              </th>
              <th className="py-3 px-4 border border-gray-300 text-sm font-semibold text-center">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="py-8 text-center">
                  <Loader2 className="animate-spin text-[#B02E0C] mx-auto" size={32} />
                </td>
              </tr>
            ) : banks.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-gray-500">
                  No banks found. Click "Add Bank" to add one.
                </td>
              </tr>
            ) : (
              banks.map((bank) => (
                <tr key={bank.id}>
                  <td className="py-3 px-4 border border-gray-300">
                    <input
                      type="checkbox"
                      className="form-checkbox text-[#B02E0C] rounded focus:ring-[#B02E0C]"
                    />
                  </td>
                  <td className="py-2 px-4 border border-gray-300 text-gray-700 font-medium">
                    {bank.name}
                  </td>
                  <td className="py-2 px-4 border border-gray-300 text-gray-700">
                    {formatDate(bank.createdAt || bank.created_at)}
                  </td>
                  <td className="py-2 px-4 border border-gray-300 text-center relative">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEditClick(bank)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(bank)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        {deletingId === bank.id ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && modalType !== "delete" && (
        <Modal
          title={modalType === "edit" ? "Edit Bank" : "Add Bank"}
          onClose={() => {
            setShowModal(false);
            setSelectedBank(null);
            setFormState({ name: "" });
          }}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Bank Name *
              </label>
              <input
                type="text"
                name="name"
                value={formState.name}
                onChange={handleFormChange}
                placeholder="Enter bank name"
                required
                className="w-full border rounded-md px-3 py-2 focus:ring-1 focus:ring-[#B02E0C] outline-none"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setSelectedBank(null);
                  setFormState({ name: "" });
                }}
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-md bg-[#B02E0C] text-white hover:bg-[#8d270b] cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    {modalType === "edit" ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  modalType === "edit" ? "Update Bank" : "Add Bank"
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showModal && modalType === "delete" && (
        <Modal
          title="Delete Bank"
          onClose={() => {
            setShowModal(false);
            setSelectedBank(null);
          }}
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete <strong>{selectedBank?.name}</strong>? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setSelectedBank(null);
                }}
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deletingId !== null}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {deletingId === selectedBank?.id ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BankType;
