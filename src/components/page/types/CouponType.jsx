// import { useState } from "react";
// import { EllipsisVertical, Eye, Lock, Ban, X } from "lucide-react";
// import { createCoupon } from "../../../redux/slice/Types/couponSlice";
// import { useDispatch, useSelector } from "react-redux";

// const Coupon = () => {
//   const [openMenuId, setOpenMenuId] = useState(null);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showOpenModal, setShowOpenModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [couponName, setCouponName] = useState("");
//   const [formState, setFormState] = useState({ name: "" });

//   const dispatch = useDispatch();
//   const { couponList, loading } = useSelector((state) => state.coupon);

//   // Handle Save Coupon
//   const handleSaveCoupon = (e) => {
//     e.preventDefault();
//     if (!formState.name) return alert("Please enter coupon name");

//     dispatch(createCoupon({ name: formState.name }));
//     setShowAddModal(false);
//     setFormState({ name: "" });
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
//           <h1 className="text-2xl font-bold text-gray-900">Coupon</h1>
//           {/* <p className="text-gray-600">Manage all user feature here.</p> */}
//         </div>
//         <button
//           onClick={() => setShowAddModal(true)}
//           className="mt-4 sm:mt-0 px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]"
//         >
//           + Add Coupon Type
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
//             ) : couponList && couponList.length > 0 ? (
//               couponList.map((user) => (
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
//                     {user.createdAt}
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
//                       <div className="absolute right-2 top-14 bg-white border-2 border-gray-300 shadow-lg rounded-md w-40 z-50">
//                         <ul className="text-gray-700 text-sm">
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
//                   No coupon available
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Add Feature Modal */}
//       {showAddModal && (
//         <Modal title="Add New Coupon" onClose={() => setShowAddModal(false)}>
//           <form className="space-y-4">
//             <label className="block text-sm font-medium text-gray-700">
//               Name
//             </label>
//             <input
//               type="text"
//               placeholder="Name"
//               value={formState.name}
//               onChange={(e) =>
//                 setFormState((prev) => ({ ...prev, name: e.target.value }))
//               }
//               className="w-full border border-gray-300 px-3 py-2 rounded-md"
//               autoFocus
//             />
//             <button
//               onClick={handleSaveCoupon}
//               disabled={loading}
//               className="bg-[#B02E0C] text-white px-4 py-2 rounded-md hover:bg-[#8d270b]"
//             >
//               {loading ? "Saving..." : "Save"}
//             </button>
//           </form>
//         </Modal>
//       )}

//       {/* Open Modal */}
//       {showOpenModal && selectedUser && (
//         <Modal
//           title="View Coupon Details"
//           onClose={() => setShowOpenModal(false)}
//         >
//           <div className="space-y-2">
//             <p>
//               <strong>Coupon Name:</strong> {selectedUser.name}
//             </p>
//             <p>
//               <strong>Date:</strong> {selectedUser.createdAt}
//             </p>
//           </div>
//         </Modal>
//       )}

//       {/* Edit Modal */}
//       {showEditModal && selectedUser && (
//         <Modal title="Edit Coupon" onClose={() => setShowEditModal(false)}>
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

// export default Coupon;

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { EllipsisVertical, X } from "lucide-react";
import { 
  createCoupon, 
  fetchCoupons, 
  updateCouponType, 
  deleteCouponType 
} from "../../../redux/slice/Types/couponSlice";
import DataTable from "../../common/DataTable";

const Coupon = () => {
  const dispatch = useDispatch();
  const { couponList, loading, pagination } = useSelector(
    (state) => state.coupon
  );

  const [openMenuId, setOpenMenuId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [formState, setFormState] = useState({ name: "" });
  
  // Initialize pagination state from Redux or defaults
  const [page, setPage] = useState(pagination?.currentPage || 1);
  const [limit, setLimit] = useState(pagination?.limit || 10);
  const [search, setSearch] = useState("");

  // Fetch coupons when page, limit, or search changes
  useEffect(() => {
    console.log("Fetching coupons with:", { page, limit, search });
    dispatch(fetchCoupons({ page, limit, search }));
  }, [dispatch, page, limit, search]);

  // Update local state when Redux pagination changes
  useEffect(() => {
    if (pagination?.currentPage) {
      setPage(pagination.currentPage);
    }
    if (pagination?.limit) {
      setLimit(pagination.limit);
    }
  }, [pagination]);

  const handleFormChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formState.name.trim()) {
      return toast.error("Coupon name is required");
    }

    try {
      const resultAction = await dispatch(createCoupon({ name: formState.name }));

      if (createCoupon.fulfilled.match(resultAction)) {
        toast.success("Coupon added successfully!");
        setShowModal(false);
        setFormState({ name: "" });
        // Refresh the list with current pagination
        dispatch(fetchCoupons({ page, limit, search }));
      } else if (createCoupon.rejected.match(resultAction)) {
        const errorMessage = resultAction.payload || "Failed to add coupon";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error in handleSave:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formState.name.trim()) {
      return toast.error("Coupon name is required");
    }

    if (!selectedCoupon) return;

    try {
      const resultAction = await dispatch(
        updateCouponType({
          id: selectedCoupon.id,
          name: formState.name,
        })
      );

      if (updateCouponType.fulfilled.match(resultAction)) {
        toast.success("Coupon updated successfully!");
        setShowModal(false);
        setFormState({ name: "" });
        // Refresh the list with current pagination
        dispatch(fetchCoupons({ page, limit, search }));
      } else if (updateCouponType.rejected.match(resultAction)) {
        const errorMessage = resultAction.payload || "Failed to update coupon";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error in handleUpdate:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleDelete = async () => {
    if (!selectedCoupon) return;

    try {
      const resultAction = await dispatch(deleteCouponType(selectedCoupon.id));

      if (deleteCouponType.fulfilled.match(resultAction)) {
        toast.success("Coupon deleted successfully!");
        setShowModal(false);
        // Refresh the list with current pagination
        dispatch(fetchCoupons({ page, limit, search }));
      } else if (deleteCouponType.rejected.match(resultAction)) {
        const errorMessage = resultAction.payload || "Failed to delete coupon";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handlePageChange = (newPage) => {
    console.log("Page changing to:", newPage);
    setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    console.log("Limit changing to:", newLimit);
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  };

  const handleSearch = (searchTerm) => {
    console.log("Search term:", searchTerm);
    setSearch(searchTerm);
    setPage(1); // Reset to first page when searching
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
    {
      header: "Name",
      accessor: "name",
      cell: (row) => row.name || 'N/A'
    },
    {
      header: "Date",
      accessor: "createdAt",
      cell: (row) => {
        try {
          return row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A';
        } catch (e) {
          console.error("Error formatting date:", e, "Row data:", row);
          return 'Invalid Date';
        }
      }
    }
  ];

  const renderActions = (coupon) => (
    <div className="relative">
      <button
        onClick={() =>
          setOpenMenuId(openMenuId === coupon.id ? null : coupon.id)
        }
        className="p-2 rounded hover:bg-gray-100"
      >
        <EllipsisVertical />
      </button>
      {openMenuId === coupon.id && (
        <div className="absolute right-0 top-8 bg-white border border-gray-200 shadow-md rounded-md w-32 z-50">
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={() => {
              setSelectedCoupon(coupon);
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
              setSelectedCoupon(coupon);
              setFormState({ name: coupon.name });
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
              setSelectedCoupon(coupon);
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

  // Ensure couponList is always an array
  const tableData = Array.isArray(couponList) ? couponList : [];

  return (
    <div className="space-y-6 p-4 bg-gray-100 w-full min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          {pagination && (
            <p className="text-sm text-gray-600 mt-1">
              Showing {tableData.length} of {pagination.totalRecords || 0} coupons
              {pagination.totalPages > 1 && ` (Page ${page} of ${pagination.totalPages})`}
            </p>
          )}
        </div>
        <button
          onClick={() => {
            setModalType("add");
            setFormState({ name: "" });
            setShowModal(true);
          }}
          className="mt-4 sm:mt-0 px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]"
        >
          + Add Coupon
        </button>
      </div>

      <DataTable
        columns={columns}
        data={tableData}
        loading={loading}
        renderActions={renderActions}
        rowKey={(row) => row.id || row._id || Math.random().toString()}
        showSearch
        onSearch={handleSearch}
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

      {showModal && (
        <Modal
          title={
            modalType === "add"
              ? "Add Coupon"
              : modalType === "edit"
              ? "Edit Coupon"
              : modalType === "view"
              ? "View Coupon"
              : "Delete Coupon"
          }
          onClose={() => setShowModal(false)}
        >
          {(modalType === "add" || modalType === "edit") && (
            <form
              className="space-y-4"
              onSubmit={modalType === "add" ? handleSave : handleUpdate}
            >
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={formState.name}
                onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded-md"
                autoFocus
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-[#B02E0C] text-white rounded-md hover:bg-[#8d270b]"
              >
                {modalType === "add" ? "Save" : "Update"}
              </button>
            </form>
          )}

          {modalType === "view" && selectedCoupon && (
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {selectedCoupon.name}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {selectedCoupon.createdAt ? new Date(selectedCoupon.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          )}

          {modalType === "delete" && selectedCoupon && (
            <div>
              <p>
                Are you sure you want to delete{" "}
                <strong>{selectedCoupon.name}</strong>?
              </p>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
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

export default Coupon;