// import { useState } from "react";
// import { EllipsisVertical, Eye, Lock, Ban, X } from "lucide-react";

// const Shift = () => {
//   const [openMenuId, setOpenMenuId] = useState(null);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showOpenModal, setShowOpenModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);

//   const shift = [
//     {
//       id: 1,
//       name: "Aashutosh Sharma",
//       description: "Admin",
//       createdAt: "903-759-6505",
//     },
//     {
//       id: 2,
//       name: "Jatin Shah",
//       description: "Supervisor",
//       createdAt: "903-759-6505",
//     },
//     {
//       id: 3,
//       name: "Ramesh Patel",
//       description: "Builder",
//       createdAt: "903-759-6505",
//     },
//     {
//       id: 4,
//       name: "Satish Patel",
//       description: "Admin",
//       createdAt: "903-759-6505",
//     },
//   ];

//   const Modal = ({ title, children, onClose }) => (
//     <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50">
//       <div className="bg-white rounded-xl w-[400px] p-6 relative">
//         <button
//           onClick={onClose}
//           className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
//         >
//           <X size={20} />
//         </button>
//         <div className="p-6">
//           <h2 className="text-xl font-semibold mb-4">{title}</h2>
//           {children}
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="space-y-6 p-4 bg-gray-100 w-full min-h-screen">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Shift</h1>
//           {/* <p className="text-gray-600">Manage all user feature here.</p> */}
//         </div>
//         <button
//           onClick={() => setShowAddModal(true)}
//           className="mt-4 sm:mt-0 px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]"
//         >
//           + Add Shift Type
//         </button>
//       </div>

//       <div className="bg-white shadow-sm border border-gray-200 mt-4 rounded-lg">
//         <div className="flex justify-between items-center border-b border-gray-200 bg-gray-50 relative">
//           <div className="flex items-center gap-3 p-4 relative">
//             <input
//               type="text"
//               placeholder="Search shift..."
//               className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B02E0C]"
//             />
//           </div>
//         </div>

//         <table className="w-full text-left border-t border-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="py-3 px-4 border border-gray-300 text-sm font-semibold"></th>
//               <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">
//                 Name
//               </th>
//               <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">
//                 Description
//               </th>
//               <th className="py-3 px-4 border border-gray-300 text-sm font-semibold">
//                 Date
//               </th>
//               <th className="py-3 px-4 border border-gray-300 text-sm font-semibold text-center">
//                 Action
//               </th>
//             </tr>
//           </thead>

//           <tbody>
//             {shift.map((user) => (
//               <tr key={user.id}>
//                 <td className="py-3 px-4 border border-gray-300">
//                   <input
//                     type="checkbox"
//                     className="form-checkbox text-[#B02E0C] rounded focus:ring-[#B02E0C]"
//                   />
//                 </td>
//                 <td className="py-2 px-4 border border-gray-300 text-gray-700">
//                   {user.name}
//                 </td>
//                 <td className="py-2 px-4 border border-gray-300 text-gray-700">
//                   {user.description}
//                 </td>
//                 <td className="py-2 px-4 border border-gray-300 text-gray-700">
//                   {user.createdAt}
//                 </td>
//                 <td className="py-2 px-4 border border-gray-300 text-center relative">
//                   <button
//                     onClick={() =>
//                       setOpenMenuId(openMenuId === user.id ? null : user.id)
//                     }
//                     className="p-2 rounded hover:bg-gray-100"
//                   >
//                     <EllipsisVertical className="text-gray-600" />
//                   </button>

//                   {openMenuId === user.id && (
//                     <div className="absolute right-1 top-14 -mt-2 bg-white border-2 border-gray-300 shadow-lg rounded-md w-40 z-50">
//                       <ul className="text-sm">
//                         <li
//                           onClick={() => {
//                             setSelectedUser(user);
//                             setShowOpenModal(true);
//                             setOpenMenuId(null);
//                           }}
//                           className="px-4 py-2 flex items-center gap-2 hover:bg-gray-300 cursor-pointer"
//                         >
//                           <Eye size={16} /> Open
//                         </li>
//                         <li
//                           onClick={() => {
//                             setSelectedUser(user);
//                             setShowEditModal(true);
//                             setOpenMenuId(null);
//                           }}
//                           className="px-4 py-2 flex items-center gap-2 hover:bg-gray-300 cursor-pointer"
//                         >
//                           <Lock size={16} /> Edit
//                         </li>
//                         <li
//                           onClick={() => {
//                             setSelectedUser(user);
//                             setShowDeleteModal(true);
//                             setOpenMenuId(null);
//                           }}
//                           className="px-4 py-2 flex items-center gap-2 text-red-600 hover:bg-gray-300 cursor-pointer"
//                         >
//                           <Ban size={16} /> Delete
//                         </li>
//                       </ul>
//                     </div>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Add Feature Modal */}
//       {showAddModal && (
//         <Modal title="Add New Shift" onClose={() => setShowAddModal(false)}>
//           <form className="space-y-4">
//             <label className="block text-sm font-medium text-gray-700">
//               Name
//             </label>
//             <input
//               type="text"
//               placeholder="Name"
//               className="w-full border border-gray-300 px-3 py-2 rounded-md"
//             />
//             <label className="block text-sm font-medium text-gray-700">
//               Description
//             </label>
//             <input
//               type="text"
//               placeholder="description"
//               className="w-full border border-gray-300 px-3 py-2 rounded-md"
//             />
//             <button className="bg-[#B02E0C] text-white px-4 py-2 rounded-md hover:bg-[#8d270b]">
//               Save
//             </button>
//           </form>
//         </Modal>
//       )}

//       {/* Open Modal */}
//       {showOpenModal && selectedUser && (
//         <Modal
//           title="View Shift Details"
//           onClose={() => setShowOpenModal(false)}
//         >
//           <div className="space-y-2">
//             <p>
//               <strong>Shift Name:</strong> {selectedUser.name}
//             </p>
//             <p>
//               <strong>Description:</strong> {selectedUser.description}
//             </p>
//             <p>
//               <strong>Date:</strong> {selectedUser.createdAt}
//             </p>
//           </div>
//         </Modal>
//       )}

//       {/* Edit Modal */}
//       {showEditModal && selectedUser && (
//         <Modal title="Edit Shift" onClose={() => setShowEditModal(false)}>
//           <form className="space-y-4">
//             <label className="block text-sm font-medium text-gray-700">
//               Name
//             </label>
//             <input
//               type="text"
//               defaultValue={selectedUser.name}
//               className="w-full border border-gray-300 px-3 py-2 rounded-md"
//             />
//             <label className="block text-sm font-medium text-gray-700">
//               description
//             </label>
//             <input
//               type="text"
//               defaultValue={selectedUser.description}
//               className="w-full border border-gray-300 px-3 py-2 rounded-md"
//             />
//             <button className="bg-[#B02E0C] text-white px-4 py-2 rounded-md hover:bg-[#8d270b]">
//               Update
//             </button>
//           </form>
//         </Modal>
//       )}

//       {/* Delete Modal */}
//       {showDeleteModal && selectedUser && (
//         <Modal title="Confirm Delete" onClose={() => setShowDeleteModal(false)}>
//           <p>
//             Are you sure you want to delete <strong>{selectedUser.name}</strong>
//             ?
//           </p>
//           <div className="flex justify-end gap-3 mt-6">
//             <button
//               onClick={() => setShowDeleteModal(false)}
//               className="px-4 py-2 bg-gray-200 rounded-md"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={() => {
//                 setShowDeleteModal(false);
//                 alert(`${selectedUser.name} deleted`);
//               }}
//               className="px-4 py-2 bg-red-600 text-white rounded-md"
//             >
//               Delete
//             </button>
//           </div>
//         </Modal>
//       )}
//     </div>
//   );
// };

// export default Shift;

import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { EllipsisVertical, X } from "lucide-react";
import {
  deleteShift,
  fetchShiftTypes,
  updateShift,
} from "../../../redux/slice/Types/shiftTypeSlice";
import DataTable from "../../common/DataTable";

const Shift = () => {
  const dispatch = useDispatch();
  const {
    list: shiftTypes,
    loading,
    pagination,
  } = useSelector((state) => state.shiftTypes);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedShift, setSelectedShift] = useState(null);
  const [formState, setFormState] = useState({ name: "", description: "" });
  const [page, setPage] = useState(pagination?.page || 1);
  const [limit, setLimit] = useState(pagination?.limit || 10);
  const [search, setSearch] = useState("");
  const nameRef = useRef(null);

  useEffect(() => {
    dispatch(fetchShiftTypes({ page, limit, search }));
  }, [dispatch, page, limit, search]);

  useEffect(() => {
    if (showModal) setTimeout(() => nameRef.current?.focus(), 0);
  }, [showModal]);

  const handleFormChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (modalType === "add") {
      dispatch(createShift(formState))
        .unwrap()
        .then(() => {
          toast.success("Shift created successfully!");
          setShowModal(false);
          setFormState({ name: "", description: "" });
        })
        .catch((err) => {
          toast.error("Failed to create shift");
          console.error(err);
        });
    } else if (modalType === "edit" && selectedShift) {
      dispatch(updateShift({ id: selectedShift.id, data: formState }))
        .unwrap()
        .then(() => {
          toast.success("Shift updated successfully!");
          setShowModal(false);
        })
        .catch((err) => {
          toast.error("Failed to update shift");
          console.error(err);
        });
    }
  };

  const handleDelete = () => {
    if (!selectedShift) return;

    dispatch(deleteShift(selectedShift.id))
      .unwrap()
      .then(() => {
        toast.success("Shift deleted successfully!");
        setShowModal(false);
      })
      .catch((err) => {
        toast.error("Failed to delete shift");
        console.error(err);
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
    { header: "Shift Name", accessor: "name" },
    // { header: "Description", accessor: "description" },
    {
      header: "Date",
      accessor: "createdAt",
      cell: (r) => new Date(r.createdAt).toLocaleDateString("en-IN"),
    },
  ];

  const renderActions = (shift) => (
    <div className="relative">
      <button
        onClick={() => setOpenMenuId(openMenuId === shift.id ? null : shift.id)}
        className="p-2 rounded hover:bg-gray-100"
      >
        <EllipsisVertical />
      </button>
      {openMenuId === shift.id && (
        <div className="absolute right-0 top-8 bg-white border border-gray-200 shadow-md rounded-md w-32 z-50">
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={() => {
              setSelectedShift(shift);
              setModalType("view");
              setShowModal(true);
            }}
          >
            View
          </button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={() => {
              setSelectedShift(shift);
              setFormState({ ...shift });
              setModalType("edit");
              setShowModal(true);
            }}
          >
            Edit
          </button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
            onClick={() => {
              setSelectedShift(shift);
              setModalType("delete");
              setShowModal(true);
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
      {" "}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        {" "}
        <div>
          {" "}
          <h1 className="text-2xl font-bold text-gray-900">Shift Types</h1>{" "}
          <p className="text-gray-600">Manage all Shift Types here.</p>{" "}
        </div>
        <button
          onClick={() => {
            setSelectedShift(null);
            setFormState({ name: "" });
            setModalType("add");
            setShowModal(true);
          }}
          className="mt-4 sm:mt-0 px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]"
        >
          + Add Shift Type{" "}
        </button>{" "}
      </div>
      <DataTable
        columns={columns}
        data={shiftTypes}
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
              ? "Add Shift"
              : modalType === "edit"
              ? "Edit Shift"
              : modalType === "view"
              ? "View Shift"
              : "Delete Shift"
          }
          onClose={() => setShowModal(false)}
        >
          {(modalType === "add" || modalType === "edit") && (
            <form className="space-y-4" onSubmit={handleSave}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
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
                {modalType === "add" ? "Create" : "Update"} Shift
              </button>
            </form>
          )}

          {modalType === "view" && selectedShift && (
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {selectedShift.name}
              </p>
              <p>
                <strong>Description:</strong> {selectedShift.description}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(selectedShift.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
          )}

          {modalType === "delete" && selectedShift && (
            <div>
              <p>
                Are you sure you want to delete{" "}
                <strong>{selectedShift.name}</strong>?
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

export default Shift;
