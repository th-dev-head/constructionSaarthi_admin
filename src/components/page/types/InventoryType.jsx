// import { useEffect, useState } from "react";
// import { EllipsisVertical, Eye, Lock, Ban, X } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   createInventory,
//   fetchInventory,
// } from "../../../redux/slice/Types/inventorySlice";

// const Inventory = () => {
//   const [openMenuId, setOpenMenuId] = useState(null);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showOpenModal, setShowOpenModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [formState, setFormState] = useState({ name: "" });

//   const dispatch = useDispatch();
//   const { inventoryList, loading, error } = useSelector(
//     (state) => state.inventory
//   );

//   useEffect(() => {
//     dispatch(fetchInventory());
//   }, [dispatch]);

//   const handleCreate = async () => {
//     if (!formState.name.trim()) return alert("Name is required");

//     const result = await dispatch(createInventory(formState));

//     if (createInventory.fulfilled.match(result)) {
//       setShowAddModal(false);
//       setFormState({ name: "" }); // reset form
//       dispatch(fetchInventory()); // refresh data
//       alert("Inventory added successfully!");
//     } else {
//       alert(result.payload || "Failed to create");
//     }
//   };
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
//           <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
//           {/* <p className="text-gray-600">Manage all user feature here.</p> */}
//         </div>
//         <button
//           onClick={() => setShowAddModal(true)}
//           className="mt-4 sm:mt-0 px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]"
//         >
//           + Add Inventory Type
//         </button>
//       </div>

//       <div className="bg-white shadow-sm border border-gray-200 mt-4 rounded-lg">
//         <div className="flex justify-between items-center border-b border-gray-200 bg-gray-50 relative">
//           <div className="flex items-center gap-3 p-4 relative">
//             <input
//               type="text"
//               placeholder="Search Coupon..."
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
//                 Date
//               </th>
//               <th className="py-3 px-4 border border-gray-300 text-sm font-semibold text-center">
//                 Action
//               </th>
//             </tr>
//           </thead>

//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="4" className="py-4 px-4 text-center text-gray-700">
//                   Loading...
//                 </td>
//               </tr>
//             ) : inventoryList && inventoryList.length > 0 ? (
//               inventoryList.map((user) => (
//                 <tr key={user.id}>
//                   <td className="py-3 px-4 border border-gray-300">
//                     <input
//                       type="checkbox"
//                       className="form-checkbox text-[#B02E0C] rounded focus:ring-[#B02E0C]"
//                     />
//                   </td>
//                   <td className="py-2 px-4 border border-gray-300 text-gray-700">
//                     {user.name}
//                   </td>
//                   <td className="py-2 px-4 border border-gray-300 text-gray-700">
//                     {new Date(user.createdAt).toLocaleDateString()}
//                   </td>
//                   <td className="py-2 px-4 border border-gray-300 text-center relative">
//                     <button
//                       onClick={() =>
//                         setOpenMenuId(openMenuId === user.id ? null : user.id)
//                       }
//                       className="p-2 rounded hover:bg-gray-100"
//                     >
//                       <EllipsisVertical className="text-gray-600" />
//                     </button>

//                     {openMenuId === user.id && (
//                       <div className="absolute right-2 top-14 -mt-2 bg-white border-2 border-gray-300 shadow-lg rounded-md w-40 z-50">
//                         <ul className="text-sm">
//                           <li
//                             onClick={() => {
//                               setSelectedUser(user);
//                               setShowOpenModal(true);
//                               setOpenMenuId(null);
//                             }}
//                             className="px-4 py-2 flex items-center gap-2 hover:bg-gray-300 cursor-pointer"
//                           >
//                             <Eye size={16} /> Open
//                           </li>
//                           <li
//                             onClick={() => {
//                               setSelectedUser(user);
//                               setShowEditModal(true);
//                               setOpenMenuId(null);
//                             }}
//                             className="px-4 py-2 flex items-center gap-2 hover:bg-gray-300 cursor-pointer"
//                           >
//                             <Lock size={16} /> Edit
//                           </li>
//                           <li
//                             onClick={() => {
//                               setSelectedUser(user);
//                               setShowDeleteModal(true);
//                               setOpenMenuId(null);
//                             }}
//                             className="px-4 py-2 flex items-center gap-2 text-red-600 hover:bg-gray-300 cursor-pointer"
//                           >
//                             <Ban size={16} /> Delete
//                           </li>
//                         </ul>
//                       </div>
//                     )}
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="4" className="py-4 px-4 text-center text-gray-500">
//                   No inventory available
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Add Feature Modal */}
//       {showAddModal && (
//         <Modal title="Add New Inventory" onClose={() => setShowAddModal(false)}>
//           <form
//             className="space-y-4"
//             onSubmit={(e) => {
//               e.preventDefault();
//               handleCreate();
//             }}
//           >
//             <label className="block text-sm font-medium text-gray-700">
//               Name
//             </label>

//             <input
//               type="text"
//               placeholder="Enter Inventory Name"
//               value={formState.name}
//               onChange={(e) =>
//                 setFormState({ ...formState, name: e.target.value })
//               }
//               className="w-full border border-gray-300 px-3 py-2 rounded-md"
//               required
//               autoFocus
//             />
//             <button
//               type="submit"
//               className="bg-[#B02E0C] text-white px-4 py-2 rounded-md hover:bg-[#8d270b]"
//             >
//               Save
//             </button>
//           </form>
//         </Modal>
//       )}

//       {/* Open Modal */}
//       {showOpenModal && selectedUser && (
//         <Modal
//           title="View Inventory Details"
//           onClose={() => setShowOpenModal(false)}
//         >
//           <div className="space-y-2">
//             <p>
//               <strong>Inventory Name:</strong> {selectedUser.name}
//             </p>
//             <p>
//               <strong>Date:</strong> {selectedUser.createdAt}
//             </p>
//           </div>
//         </Modal>
//       )}

//       {/* Edit Modal */}
//       {showEditModal && selectedUser && (
//         <Modal title="Edit Inventory" onClose={() => setShowEditModal(false)}>
//           <form className="space-y-4">
//             <label className="block text-sm font-medium text-gray-700">
//               Name
//             </label>
//             <input
//               type="text"
//               defaultValue={selectedUser.name}
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

// export default Inventory;

// import React, { useEffect, useState, useRef } from "react";
// import { toast } from "react-toastify";
// import { useDispatch, useSelector } from "react-redux";
// import { EllipsisVertical, X } from "lucide-react";
// import {
//   createInventory,
//   fetchInventory,
// } from "../../../redux/slice/Types/inventorySlice";
// import DataTable from "../../common/DataTable";

// const Inventory = () => {
//   const dispatch = useDispatch();
//   const { inventoryList, loading, pagination } = useSelector(
//     (state) => state.inventory
//   );

//   const [openMenuId, setOpenMenuId] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [modalType, setModalType] = useState("add"); // "add" | "edit" | "view" | "delete"
//   const [selectedInventory, setSelectedInventory] = useState(null);
//   const [formState, setFormState] = useState({ name: "" });
//   const [page, setPage] = useState(pagination?.page || 1);
//   const [limit, setLimit] = useState(pagination?.limit || 10);
//   const [search, setSearch] = useState("");
//   const nameRef = useRef(null);

//   useEffect(() => {
//     dispatch(fetchInventory({ page, limit, search }));
//   }, [dispatch, page, limit, search]);

//   useEffect(() => {
//     if (showModal) setTimeout(() => nameRef.current?.focus(), 0);
//   }, [showModal]);

//   const handleFormChange = (e) => {
//     setFormState({ ...formState, [e.target.name]: e.target.value });
//   };

//   const handleSave = () => {
//     if (!formState.name.trim()) return toast.error("Name is required");
//     dispatch(createInventory(formState)).then((res) => {
//       if (!res.error) {
//         toast.success("Inventory added successfully!");
//         setShowModal(false);
//         setFormState({ name: "" });
//         dispatch(fetchInventory({ page, limit, search }));
//       } else toast.error(res.payload || "Failed to create inventory");
//     });
//   };

//   const Modal = ({ title, children, onClose }) => (
//     <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50">
//       {" "}
//       <div className="bg-white rounded-xl w-[400px] p-6 relative">
//         {" "}
//         <button
//           onClick={onClose}
//           className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
//         >
//           {" "}
//           <X size={20} />{" "}
//         </button>{" "}
//         <h2 className="text-xl font-semibold mb-4">{title}</h2>
//         {children}{" "}
//       </div>{" "}
//     </div>
//   );

//   const columns = [
//     { header: "Name", accessor: "name" },
//     {
//       header: "Date",
//       accessor: "createdAt",
//       cell: (r) => new Date(r.createdAt).toLocaleDateString(),
//     },
//   ];

//   const renderActions = (item) => (
//     <div className="relative">
//       <button
//         onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
//         className="p-2 rounded hover:bg-gray-100"
//       >
//         {" "}
//         <EllipsisVertical />{" "}
//       </button>
//       {openMenuId === item.id && (
//         <div className="absolute right-0 top-8 bg-white border border-gray-200 shadow-md rounded-md w-32 z-50">
//           <button
//             className="block w-full text-left px-4 py-2 hover:bg-gray-100"
//             onClick={() => {
//               setSelectedInventory(item);
//               setModalType("view");
//               setShowModal(true);
//               setOpenMenuId(null);
//             }}
//           >
//             View{" "}
//           </button>
//           <button
//             className="block w-full text-left px-4 py-2 hover:bg-gray-100"
//             onClick={() => {
//               setSelectedInventory(item);
//               setFormState({ ...item });
//               setModalType("edit");
//               setShowModal(true);
//               setOpenMenuId(null);
//             }}
//           >
//             Edit{" "}
//           </button>
//           <button
//             className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
//             onClick={() => {
//               setSelectedInventory(item);
//               setModalType("delete");
//               setShowModal(true);
//               setOpenMenuId(null);
//             }}
//           >
//             Delete{" "}
//           </button>{" "}
//         </div>
//       )}{" "}
//     </div>
//   );

//   return (
//     <div className="space-y-6 p-4 bg-gray-100 w-full min-h-screen">
//       {" "}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//         {" "}
//         <div>
//           {" "}
//           <h1 className="text-2xl font-bold text-gray-900">
//             Inventory Types
//           </h1>{" "}
//           <p className="text-gray-600">Manage all Inventory types here.</p>{" "}
//         </div>
//         <button
//           onClick={() => {
//             setModalType("add");
//             setShowModal(true);
//           }}
//           className="mt-4 sm:mt-0 px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]"
//         >
//           + Add Inventory{" "}
//         </button>{" "}
//       </div>
//       <DataTable
//         columns={columns}
//         data={inventoryList}
//         loading={loading}
//         renderActions={renderActions}
//         rowKey={(row) => row.id}
//         showSearch={true}
//         onSearch={(q) => {
//           setSearch(q);
//           setPage(1);
//         }}
//         pagination={pagination}
//         onPageChange={setPage}
//         onLimitChange={(l) => {
//           setLimit(l);
//           setPage(1);
//         }}
//       />
//       {showModal && (
//         <Modal
//           title={
//             modalType === "add"
//               ? "Add Inventory"
//               : modalType === "edit"
//               ? "Edit Inventory"
//               : modalType === "view"
//               ? "View Inventory"
//               : "Delete Inventory"
//           }
//           onClose={() => setShowModal(false)}
//         >
//           {(modalType === "add" || modalType === "edit") && (
//             <form
//               className="space-y-4"
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 modalType === "add" ? handleSave() : handleUpdate();
//               }}
//             >
//               <label>Name</label>
//                 <input
//                   type="text"
//                   name="name"
//                   ref={nameRef}
//                   value={formState.name}
//                   onChange={handleFormChange}
//                   className="w-full border px-3 py-2 rounded-md"
//                 />
//               <button
//                 type="submit"
//                 className="w-full px-4 py-2 bg-[#B02E0C] text-white rounded-md"
//               >
//                 {modalType === "add" ? "Save" : "Update"}
//               </button>
//             </form>
//           )}

//           {modalType === "view" && selectedInventory && (
//             <div className="space-y-2">
//               <p>
//                 <strong>Name:</strong> {selectedInventory.name}
//               </p>
//               <p>
//                 <strong>Date:</strong>{" "}
//                 {new Date(selectedInventory.createdAt).toLocaleDateString()}
//               </p>
//             </div>
//           )}

//           {modalType === "delete" && selectedInventory && (
//             <div>
//               <p>
//                 Are you sure you want to delete{" "}
//                 <strong>{selectedInventory.name}</strong>?
//               </p>
//               <div className="flex justify-end gap-3 mt-4">
//                 <button
//                   onClick={() => setShowModal(false)}
//                   className="px-4 py-2 bg-gray-200 rounded-md"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleDelete}
//                   className="px-4 py-2 bg-red-600 text-white rounded-md"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           )}
//         </Modal>
//       )}
//     </div>
//   );
// };

// export default Inventory;


import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { EllipsisVertical, X } from "lucide-react";
import {
  createInventory,
  fetchInventory,
  updateInventory,
  deleteInventory,
} from "../../../redux/slice/Types/inventorySlice";
import DataTable from "../../common/DataTable";

const Inventory = () => {
  const dispatch = useDispatch();
  const { inventoryList, loading, pagination } = useSelector(
    (state) => state.inventory
  );

  const [openMenuId, setOpenMenuId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" | "edit" | "view" | "delete"
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [formState, setFormState] = useState({ name: "" });
  const [page, setPage] = useState(pagination?.page || 1);
  const [limit, setLimit] = useState(pagination?.limit || 10);
  const [search, setSearch] = useState("");
  const nameRef = useRef(null);

  useEffect(() => {
    dispatch(fetchInventory({ page, limit, search }));
  }, [dispatch, page, limit, search]);

  useEffect(() => {
    if (showModal) setTimeout(() => nameRef.current?.focus(), 0);
  }, [showModal]);

  const handleFormChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!formState.name.trim()) return toast.error("Name is required");
    dispatch(createInventory(formState)).then((res) => {
      if (!res.error) {
        toast.success("Inventory added successfully!");
        setShowModal(false);
        setFormState({ name: "" });
        dispatch(fetchInventory({ page, limit, search }));
      } else toast.error(res.payload || "Failed to create inventory");
    });
  };

  const handleUpdate = () => {
    if (!formState.name.trim()) return toast.error("Name is required");
    dispatch(updateInventory({ id: selectedInventory.id, ...formState })).then((res) => {
      if (!res.error) {
        toast.success("Inventory updated successfully!");
        setShowModal(false);
        setSelectedInventory(null);
        setFormState({ name: "" });
        dispatch(fetchInventory({ page, limit, search }));
      } else toast.error(res.payload || "Failed to update inventory");
    });
  };

  const handleDelete = () => {
    dispatch(deleteInventory(selectedInventory.id)).then((res) => {
      if (!res.error) {
        toast.success("Inventory deleted successfully!");
        setShowModal(false);
        setSelectedInventory(null);
        dispatch(fetchInventory({ page, limit, search }));
      } else toast.error(res.payload || "Failed to delete inventory");
    });
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
    // { header: "ID", accessor: "id" },
    { header: "Name", accessor: "name" },
    { header: "Active", accessor: "is_active", cell: (r) => (r.is_active ? "Yes" : "No") },
    {
      header: "Created At",
      accessor: "createdAt",
      cell: (r) => new Date(r.createdAt).toLocaleDateString(),
    },
  ];

  const renderActions = (item) => (
    <div className="relative">
      <button
        onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
        className="p-2 rounded hover:bg-gray-100"
      >
        <EllipsisVertical />
      </button>
      {openMenuId === item.id && (
        <div className="absolute right-0 top-8 bg-white border border-gray-200 shadow-md rounded-md w-32 z-50">
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={() => {
              setSelectedInventory(item);
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
              setSelectedInventory(item);
              setFormState({ ...item });
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
              setSelectedInventory(item);
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
          <h1 className="text-2xl font-bold text-gray-900">Inventory Types</h1>
          <p className="text-gray-600">Manage all Inventory types here.</p>
        </div>
        <button
          onClick={() => {
            setModalType("add");
            setShowModal(true);
          }}
          className="mt-4 sm:mt-0 px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]"
        >
          + Add Inventory
        </button>
      </div>

      <DataTable
        columns={columns}
        data={inventoryList}
        loading={loading}
        renderActions={renderActions}
        rowKey={(row) => row.id}
        showSearch={true}
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
              ? "Add Inventory"
              : modalType === "edit"
              ? "Edit Inventory"
              : modalType === "view"
              ? "View Inventory"
              : "Delete Inventory"
          }
          onClose={() => setShowModal(false)}
        >
          {(modalType === "add" || modalType === "edit") && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                modalType === "add" ? handleSave() : handleUpdate();
              }}
            >
              <label>Name</label>
              <input
                type="text"
                name="name"
                ref={nameRef}
                value={formState.name}
                onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded-md"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-[#B02E0C] text-white rounded-md"
              >
                {modalType === "add" ? "Save" : "Update"}
              </button>
            </form>
          )}

          {modalType === "view" && selectedInventory && (
            <div className="space-y-2">
              <p>
                <strong>ID:</strong> {selectedInventory.id}
              </p>
              <p>
                <strong>Name:</strong> {selectedInventory.name}
              </p>
              <p>
                <strong>Active:</strong> {selectedInventory.is_active ? "Yes" : "No"}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(selectedInventory.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}

          {modalType === "delete" && selectedInventory && (
            <div>
              <p>
                Are you sure you want to delete <strong>{selectedInventory.name}</strong>?
              </p>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-md"
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

export default Inventory;
