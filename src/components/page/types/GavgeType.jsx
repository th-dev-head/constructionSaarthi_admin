
import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { EllipsisVertical, X } from "lucide-react";
import {
  addGavgeType,
  fetchAllGavge,
  updateGavge,
  deleteGavge,
} from "../../../redux/slice/Types/GavgeTypeSlice";
import DataTable from "../../common/DataTable";

const Gavge = () => {
  const dispatch = useDispatch();
  const { Gavges, loading, pagination } = useSelector((state) => state.gavge);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" | "edit" | "view" | "delete"
  const [selectedGavge, setSelectedGavge] = useState(null);
  const [formState, setFormState] = useState({
    gavgeName: "",
    gavgeFormat: "",
  });
  const nameRef = useRef(null);
  const [page, setPage] = useState(pagination?.page || 1);
  const [limit, setLimit] = useState(pagination?.limit || 10);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchAllGavge({ page, limit, search }));
  }, [dispatch, page, limit, search]);

  useEffect(() => {
    if (showModal) {
      // focus the name input when modal opens
      setTimeout(() => nameRef.current?.focus(), 0);
    }
  }, [showModal]);

  const handleFormChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formState.gavgeName.trim())
      return toast.error("Gavge Name is required");

    const payload = { ...formState };

    if (selectedGavge) {
      dispatch(
        updateGavge({ id: selectedGavge.id, updatedData: payload })
      ).then((res) => {
        if (!res.error) {
          toast.success("Gavge updated successfully");
          setShowModal(false);
          dispatch(fetchAllGavge({ page, limit, search }));
        }
      });
    } else {
      dispatch(addGavgeType(payload)).then((res) => {
        if (!res.error) {
          toast.success("Gavge added successfully");
          setShowModal(false);
          setFormState({ gavgeName: "", gavgeFormat: "" });
          dispatch(fetchAllGavge({ page, limit, search }));
        }
      });
    }
  };

  const handleDelete = () => {
    dispatch(deleteGavge(selectedGavge.id)).then((res) => {
      if (!res.error) {
        toast.success("Gavge deleted successfully");
        setShowModal(false);
        dispatch(fetchAllGavge({ page, limit, search }));
      }
    });
  };

  const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50">
      {" "}
      <div className="bg-white rounded-xl w-[400px] p-6 relative">
        {" "}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          {" "}
          <X size={20} />{" "}
        </button>{" "}
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        {children}{" "}
      </div>{" "}
    </div>
  );

  const columns = [
    { header: "Gavge Name", accessor: "gavgeName" },
    { header: "Gavge Format", accessor: "gavgeFormat" },
    {
      header: "Date",
      accessor: "createdAt",
      cell: (r) => new Date(r.createdAt).toLocaleDateString(),
    },
  ];

  const renderActions = (gavge) => (
    <div className="relative">
      <button
        onClick={() => setOpenMenuId(openMenuId === gavge.id ? null : gavge.id)}
        className="p-2 rounded hover:bg-gray-100"
      >
        {" "}
        <EllipsisVertical />{" "}
      </button>
      {openMenuId === gavge.id && (
        <div className="absolute right-0 top-8 bg-white border border-gray-200 shadow-md rounded-md w-32 z-50">
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={() => {
              setSelectedGavge(gavge);
              setModalType("view");
              setShowModal(true);
              setOpenMenuId(null);
            }}
          >
            View{" "}
          </button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={() => {
              setSelectedGavge(gavge);
              setFormState({ ...gavge });
              setModalType("edit");
              setShowModal(true);
              setOpenMenuId(null);
            }}
          >
            Edit{" "}
          </button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
            onClick={() => {
              setSelectedGavge(gavge);
              setModalType("delete");
              setShowModal(true);
              setOpenMenuId(null);
            }}
          >
            Delete{" "}
          </button>{" "}
        </div>
      )}{" "}
    </div>
  );

  return (
    <div className="space-y-6 p-4 bg-gray-100 w-full min-h-screen">
      {" "}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        {" "}
        <div>
          {" "}
          <h1 className="text-2xl font-bold text-gray-900">Gavge Types</h1>{" "}
          <p className="text-gray-600">Manage all Gavge Types here.</p>{" "}
        </div>
        <button
          onClick={() => {
            setSelectedGavge(null);
            setFormState({ gavgeName: "", gavgeFormat: "" });
            setModalType("add");
            setShowModal(true);
          }}
          className="mt-4 sm:mt-0 px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]"
        >
          + Add Gavge Type{" "}
        </button>{" "}
      </div>
      <DataTable
        columns={columns}
        data={Gavges}
        loading={loading}
        renderActions={renderActions}
        rowKey={(row) => row.id}
        showSearch
        onSearch={(q) => {
          setSearch(q);
          setPage(1);
        }}
        pagination={pagination}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
      />
      {showModal && (
        <Modal
          title={
            modalType === "add"
              ? "Add Gavge"
              : modalType === "edit"
              ? "Edit Gavge"
              : modalType === "view"
              ? "View Gavge"
              : "Delete Gavge"
          }
          onClose={() => setShowModal(false)}
        >
          {(modalType === "add" || modalType === "edit") && (
            <form className="space-y-4" onSubmit={handleSave}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gavge Name
                </label>
                <input
                  type="text"
                  name="gavgeName"
                  ref={nameRef}
                  value={formState.gavgeName}
                  onChange={handleFormChange}
                  className="w-full border px-3 py-2 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gavge Format
                </label>
                <input
                  type="text"
                  name="gavgeFormat"
                  value={formState.gavgeFormat}
                  onChange={handleFormChange}
                  className="w-full border px-3 py-2 rounded-md"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-[#B02E0C] text-white rounded-md"
              >
                {modalType === "add" ? "Create" : "Update"} Gavge
              </button>
            </form>
          )}

          {modalType === "view" && selectedGavge && (
            <div className="space-y-2">
              <p>
                <strong>Gavge Name:</strong> {selectedGavge.gavgeName}
              </p>
              <p>
                <strong>Gavge Format:</strong> {selectedGavge.gavgeFormat}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(selectedGavge.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}

          {modalType === "delete" && selectedGavge && (
            <div>
              <p>
                Are you sure you want to delete{" "}
                <strong>{selectedGavge.gavgeName}</strong>?
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

export default Gavge;
