import React, { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import CategoryDragDrop from "./CategoryDragDrop";
import CategoryInlineEdit from "./CategoryInlineEdit";
import Image from "next/image";
import CategoryCSVExport from "./CategoryCSVExport";

// Enhanced useTable hook
function useTable(data, initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((row) =>
      Object.values(row).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDir]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paged = sortedData.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handlePage = (newPage) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelected(
      selected.length === paged.length ? [] : paged.map((row) => row.id)
    );
  };

  return {
    paged,
    page,
    pageSize,
    totalPages,
    sortKey,
    sortDir,
    selected,
    searchTerm,
    setPage,
    setPageSize,
    handleSort,
    handlePage,
    toggleSelect,
    selectAll,
    setSearchTerm,
    totalItems: sortedData.length,
  };
}

export function GenericTable({
  data = [],
  columns = [],
  onEdit,
  onDelete,
  onReorder,
  onAddNew,
  addNewLabel = "Add New",
  title,
  emptyMessage = "No data available",
  selectable = true,
  searchable = true,
  enableDragDrop = false,
  actions = [],
}) {
  const table = useTable(data);
  const TableBody = enableDragDrop ? CategoryDragDrop : "tbody";

  const handleBulkDelete = () => {
    if (table.selected.length > 0 && onDelete) {
      table.selected.forEach((id) => {
        const row = data.find((item) => item.id === id);
        if (row) onDelete(row);
      });
    }
  };

  // Helper to render a table row's cells
  const renderRowCells = (row, index) => (
    <>
      {selectable && (
        <td className="px-4 py-4">
          <input
            type="checkbox"
            checked={table.selected.includes(row.id)}
            onChange={() => table.toggleSelect(row.id)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </td>
      )}
      {columns.map((col) => {
        let value = row[col.accessor];

        // Use custom render function if provided
        if (typeof col.render === "function") {
          return (
            <td
              key={col.accessor}
              className="px-4 py-4 text-sm text-gray-900 dark:text-white"
            >
              {col.render(row, value, index)}
            </td>
          );
        }

        if (col.type === "image") {
          return (
            <td key={col.accessor} className="px-4 py-4">
              <Image
                src={value}
                alt={row.name || "Image"}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                width={40}
                height={40}
              />
            </td>
          );
        }

        return (
          <td
            key={col.accessor}
            className="px-4 py-4 text-sm text-gray-900 dark:text-white"
          >
            {value}
          </td>
        );
      })}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          {/* Custom actions */}
          {actions.map((action, i) => (
            <button
              key={action.label || i}
              onClick={() => action.onClick(row)}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
              title={action.label}
            >
              <Icon icon={action.icon} className="w-4 h-4" />
            </button>
          ))}
          {/* Edit/Delete */}
          {onEdit && (
            <button
              onClick={() => onEdit(row)}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors"
              title="Edit"
            >
              <Icon icon="cuida:edit-outline" className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(row)}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors"
              title="Delete"
            >
              <Icon icon="mynaui:trash" className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </>
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      {(title || searchable || onAddNew) && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {title && (
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
            )}
            <div className="flex flex-1 items-center justify-between w-full gap-3">
              {/* Search on the left */}
              {searchable && (
                <div className="relative">
                  <Icon
                    icon="mdi:magnify"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={table.searchTerm}
                    onChange={(e) => table.setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              )}
              {/* Export and Add New on the right */}
              <div className="flex items-center gap-3 ml-auto">
                <CategoryCSVExport data={data} filename={`${title?.replace(/\s+/g, "_") || "data"}.csv`} />
                {onAddNew && (
                  <button
                    onClick={onAddNew}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <Icon icon="mdi:plus" className="w-4 h-4" />
                    {addNewLabel}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectable && table.selected.length > 0 && (
        <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {table.selected.length} item
              {table.selected.length !== 1 ? "s" : ""} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              <Icon icon="mdi:delete" className="w-3 h-3" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {enableDragDrop && <th className="w-8 px-3 py-4"></th>}
              {selectable && (
                <th className="w-12 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={
                      table.paged.length > 0 &&
                      table.paged.every((row) =>
                        table.selected.includes(row.id)
                      )
                    }
                    onChange={table.selectAll}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.accessor}
                  className={`px-4 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 ${
                    col.sortable
                      ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                      : ""
                  }`}
                  onClick={
                    col.sortable
                      ? () => table.handleSort(col.accessor)
                      : undefined
                  }
                >
                  <div className="flex items-center gap-2">
                    {col.header
                      .split(" ")
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                      .join(" ")}
                    {col.sortable && (
                      <div className="flex flex-col">
                        <Icon
                          icon="mdi:chevron-up"
                          className={`w-3 h-3 ${
                            table.sortKey === col.accessor &&
                            table.sortDir === "asc"
                              ? "text-blue-600"
                              : "text-gray-300"
                          }`}
                        />
                        <Icon
                          icon="mdi:chevron-down"
                          className={`w-3 h-3 -mt-1 ${
                            table.sortKey === col.accessor &&
                            table.sortDir === "desc"
                              ? "text-blue-600"
                              : "text-gray-300"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <TableBody
            items={enableDragDrop ? table.paged : undefined}
            onReorder={
              enableDragDrop
                ? (paged, fromIdx, toIdx) =>
                    onReorder(paged, fromIdx, toIdx, table.page, table.pageSize)
                : undefined
            }
            className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700"
          >
            {enableDragDrop
              ? (item, idx) => renderRowCells(item, idx)
              : table.paged.length === 0
                ? (
                  <tr>
                    <td
                      colSpan={
                        columns.length +
                        (selectable ? 1 : 0) +
                        (enableDragDrop ? 1 : 0) +
                        1
                      }
                      className="px-4 py-12 text-center"
                    >
                      <div className="text-gray-500 dark:text-gray-400">
                        <div className="flex justify-center text-4xl mb-3 ">
                          <Icon icon="mdi:table-search" className="w-10 h-10" />
                        </div>
                        <div className="text-sm font-medium">{emptyMessage}</div>
                      </div>
                    </td>
                  </tr>
                )
                : table.paged.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      {enableDragDrop && <td className="px-3 py-4"></td>}
                      {renderRowCells(row, index)}
                    </tr>
                  ))
            }
          </TableBody>
        </table>
      </div>

      {/* Footer with pagination */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              Showing{" "}
              <span className="font-medium">
                {(table.page - 1) * table.pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(table.page * table.pageSize, table.totalItems)}
              </span>{" "}
              of <span className="font-medium">{table.totalItems}</span> results
            </div>
            <div className="flex items-center gap-2">
              <span>Show:</span>
              <select
                value={table.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {[5, 10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => table.handlePage(table.page - 1)}
              disabled={table.page === 1}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Icon icon="mdi:chevron-left" className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, table.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => table.handlePage(pageNum)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      table.page === pageNum
                        ? "bg-blue-900 text-white shadow-sm"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => table.handlePage(table.page + 1)}
              disabled={table.page === table.totalPages}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <Icon icon="mdi:chevron-right" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
