import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EllipsisVertical, Eye, Lock, Ban, X } from "lucide-react";
import {
  addFeature,
  deleteFeature,
  fetchAllFeature,
  updateFeature,
} from "../../../redux/slice/RolesPermission/FeatureSlice";
import DataTable from "../../common/DataTable";

const Feature = () => {
  const dispatch = useDispatch();
  const { Features, loading, error, pagination } = useSelector((state) => state.feature);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  const [page, setPage] = useState(pagination?.page || 1);
  const [limit, setLimit] = useState(pagination?.limit || 10);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchAllFeature({ page, limit, search }));
  }, [dispatch, page, limit, search]);

  const openAddModal = () => {
    setSelectedFeature(null);
    setFormState({
      name: "",
      description: "",
      is_active: true,
    });
    setShowFeatureModal(true);
  };

  const openEditModal = (feature) => {
    setSelectedFeature(feature);
    setFormState({
      name: feature.name,
      description: feature.description || "",
    });
    setShowFeatureModal(true);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();

    const payload = {
      name: formState.name,
      description: formState.description,
      is_active: formState.is_active,
    };

    if (selectedFeature) {
      dispatch(updateFeature({ id: selectedFeature.id, updatedData: payload }))
        .unwrap()
        .then(() => {
          setShowFeatureModal(false);
             dispatch(fetchAllFeature({ page, limit, search }));
        });
    } else {
      dispatch(addFeature(payload))
        .unwrap()
        .then(() => {
          setShowFeatureModal(false);
             dispatch(fetchAllFeature({ page, limit, search }));
        });
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

  return (
    <div className="space-y-6 p-4 bg-gray-100 w-full min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Feature Management
          </h1>
          <p className="text-gray-600">Manage all user features here.</p>
        </div>

        <button
          onClick={openAddModal}
          className="mt-4 sm:mt-0 px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]"
        >
          + Add Feature
        </button>
      </div>

      <DataTable
        showSearch={true}
        onSearch={(q) => { setSearch(q); setPage(1); }}
        columns={[
          { header: "", accessor: "checkbox", key: "checkbox", cell: () => <input type="checkbox" className="form-checkbox text-[#B02E0C] rounded focus:ring-[#B02E0C]" /> },
          { header: "Name", accessor: "name" },
          { header: "Description", accessor: "description" },
          { header: "Date", accessor: "createdAt", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
        ]}
        data={Features}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
        renderActions={(feature) => (
          <div>
            <button
              onClick={() => setOpenMenuId(openMenuId === feature.id ? null : feature.id)}
              className="p-2 rounded hover:bg-gray-100"
            >
              <EllipsisVertical />
            </button>
            {openMenuId === feature.id && (
              <div className="absolute right-2 top-14 bg-white border-2 border-gray-300 shadow-lg rounded-md w-40 z-50">
                <ul className="text-sm">
                  <li
                    onClick={() => { setSelectedFeature(feature); setShowOpenModal(true); setOpenMenuId(null); }}
                    className="px-4 py-2 hover:bg-gray-300 cursor-pointer flex gap-2"
                  >
                    <Eye size={16} /> Open
                  </li>
                  <li
                    onClick={() => { openEditModal(feature); setOpenMenuId(null); }}
                    className="px-4 py-2 hover:bg-gray-300 cursor-pointer flex gap-2"
                  >
                    <Lock size={16} /> Edit
                  </li>
                  <li
                    onClick={() => { setSelectedFeature(feature); setShowDeleteModal(true); setOpenMenuId(null); }}
                    className="px-4 py-2 hover:bg-gray-300 cursor-pointer flex gap-2 text-red-600"
                  >
                    <Ban size={16} /> Delete
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      />

      {showFeatureModal && (
        <Modal
          title={selectedFeature ? "Edit Feature" : "Add New Feature"}
          onClose={() => setShowFeatureModal(false)}
        >
          <form onSubmit={handleSubmitForm} className="space-y-4">
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              value={formState.name}
              onChange={(e) =>
                setFormState({ ...formState, name: e.target.value })
              }
              className="w-full border px-3 py-2 rounded-md"
              autoFocus
            />

            <label className="block text-sm font-medium">Description</label>
            <input
              type="text"
              value={formState.description}
              onChange={(e) =>
                setFormState({ ...formState, description: e.target.value })
              }
              className="w-full border px-3 py-2 rounded-md"
            />

            <button
              type="submit"
              className="bg-[#B02E0C] text-white px-4 py-2 rounded-md w-full"
            >
              {selectedFeature ? "Update Feature" : "Create Feature"}
            </button>
          </form>
        </Modal>
      )}

      {showOpenModal && selectedFeature && (
        <Modal
          title="View Feature Details"
          onClose={() => setShowOpenModal(false)}
        >
          <p>
            <strong>Name:</strong> {selectedFeature.name}
          </p>
          <p>
            <strong>Description:</strong> {selectedFeature.description}
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {new Date(selectedFeature.createdAt).toLocaleString()}
          </p>
        </Modal>
      )}

      {showDeleteModal && selectedFeature && (
        <Modal title="Confirm Delete" onClose={() => setShowDeleteModal(false)}>
          <p>
            Are you sure you want to delete{" "}
            <strong>{selectedFeature.name}</strong>?
          </p>

          <div className="flex justify-end mt-6 gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 bg-gray-200 rounded-md"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                   dispatch(deleteFeature(selectedFeature.id)).then(() => {
                     setShowDeleteModal(false);
                     dispatch(fetchAllFeature({ page, limit, search }));
                   });
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Feature;
