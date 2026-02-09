import React, { useState, useMemo } from "react";

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  pagination = { page: 1, limit: 10, totalPages: 1, totalRecords: 0 },
  onPageChange = () => {},
  onLimitChange = () => {},
  renderActions = null,
  pageSizes = [5, 10, 20, 50],
  showSearch = false,
  onSearch = null,
  rowKey = (r) => r.id,
}) => {
  const { page, limit, totalPages, totalRecords } = pagination;
  const [search, setSearch] = useState("");

  const handlePrev = () => onPageChange(Math.max(1, page - 1));
  const handleNext = () => onPageChange(Math.min(totalPages || 1, page + 1));
  const handleFirst = () => onPageChange(1);
  const handleLast = () => onPageChange(totalPages || 1);

  const computedColumns = useMemo(() => columns, [columns]);

  const handleSearchChange = (value) => {
    setSearch(value);
    if (onSearch) onSearch(value);
  };

  return (
    <div className="bg-white shadow-sm border border-gray-200 mt-4 rounded-lg">
      <div className="flex items-center justify-between p-3 border-b gap-3">
        {showSearch ? (
          <div className="flex items-center gap-2">
            <input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search..."
              className="px-3 py-2 border rounded w-64"
            />
            <button onClick={() => handleSearchChange("")} className="text-sm text-gray-600">Clear</button>
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-700">
            Showing page <strong>{page}</strong> of <strong>{totalPages || 1}</strong>
          </div>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="border px-2 py-1 rounded"
          >
            {pageSizes.map((l) => (
              <option key={l} value={l}>{l} / page</option>
            ))}
          </select>
        </div>
      </div>

      <table className="w-full text-left border-t border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {computedColumns.map((col) => (
              <th key={col.key || col.accessor} className={`py-3 px-4 border border-gray-300 ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
            {renderActions && (
              <th className="py-3 px-4 border border-gray-300 text-center">Action</th>
            )}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={computedColumns.length + (renderActions ? 1 : 0)} className="py-4 px-4 text-center text-gray-700">
                Loading...
              </td>
            </tr>
          ) : data && data.length > 0 ? (
            data.map((row) => (
              <tr key={typeof rowKey === "function" ? rowKey(row) : row[rowKey]}>
                {computedColumns.map((col) => (
                  <td key={col.key || col.accessor} className={`py-3 px-4 border border-gray-300 ${col.cellClass || ""}`}>
                    {col.cell ? col.cell(row) : (row[col.accessor] ?? "")}
                  </td>
                ))}
                {renderActions && (
                  <td className="py-3 px-4 border border-gray-300 text-center relative">
                    {renderActions(row)}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={computedColumns.length + (renderActions ? 1 : 0)} className="py-4 px-4 text-center text-gray-500">
                No records available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-between p-4 border-t">
        <div className="text-sm text-gray-700">
          <strong>{totalRecords}</strong> records total
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleFirst} disabled={page <= 1} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50">First</button>
          <button onClick={handlePrev} disabled={page <= 1} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50">Prev</button>
          <div className="px-3 py-1">Page <strong>{page}</strong></div>
          <button onClick={handleNext} disabled={page >= (totalPages || 1)} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50">Next</button>
          <button onClick={handleLast} disabled={page >= (totalPages || 1)} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50">Last</button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
