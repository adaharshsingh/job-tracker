import React from "react";

import { useTheme } from "../context/ThemeContext";
import api from "../api/client";

function JobsTable({
  tableRef,
  sortedJobs,
  editing,
  setEditing,
  expandedJob,
  setExpandedJob,
  emailPreview,
  setEmailPreview,
  selectMode,
  selectedIds,
  setSelectedIds,
  setSelectMode,
  onDelete,
  onUpdateStatus,
  onSaveField,
  selectedDate
}) {
  const { isDark } = useTheme();

  const handleCompanyClick = async (jobId) => {
    if (expandedJob === jobId) {
      setExpandedJob(null);
      setEmailPreview(null);
      return;
    }
    setExpandedJob(jobId);
    const job = sortedJobs.find(j => j._id === jobId);
    if (job?.emailThreadId) {
      const res = await api.get(`/email/by-thread/${job.emailThreadId}`);
      setEmailPreview(res.data);
    }
  };

  return (
    <motion.div
      ref={tableRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className={`rounded-lg overflow-x-auto border ${
        isDark ? "border-gray-700 bg-gray-800" : "border-orange-200 bg-white"
      } shadow-lg`}
    >
      {sortedJobs.length === 0 && selectedDate ? (
        <div
          className={`flex items-center justify-center py-12 sm:py-16 px-3 sm:px-6 text-center ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div>
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">📭</div>
            <h3
              className={`text-base sm:text-lg font-semibold mb-1 sm:mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              No Jobs Found
            </h3>
            <p
              className={`text-xs sm:text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              No job applications were submitted on{" "}
              {new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </p>
          </div>
        </div>
      ) : (
        <table className="w-full min-w-max text-sm sm:text-base">
          <thead className={isDark ? "bg-gray-700" : "bg-gradient-to-r from-gray-50 to-gray-100"}>
            <tr>
              <th
                className={`px-2 sm:px-4 py-2 sm:py-3 cursor-pointer select-none font-semibold text-left text-xs sm:text-sm ${
                  isDark ? "text-cyan-400" : "text-cyan-700"
                }`}
                onClick={() => {
                  setSelectMode(v => !v);
                  setSelectedIds(new Set());
                }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  setSelectMode(true);
                  if (selectedIds.size === sortedJobs.length) {
                    setSelectedIds(new Set());
                  } else {
                    setSelectedIds(new Set(sortedJobs.map(j => j._id)));
                  }
                }}
              >
                #
              </th>
              <th
                className={`px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-xs sm:text-sm ${
                  isDark ? "text-cyan-400" : "text-cyan-700"
                }`}
              >
                Company
              </th>
              <th
                className={`px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-xs sm:text-sm ${
                  isDark ? "text-cyan-400" : "text-cyan-700"
                }`}
              >
                Role
              </th>
              <th
                className={`hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-xs sm:text-sm ${
                  isDark ? "text-cyan-400" : "text-cyan-700"
                }`}
              >
                Date
              </th>
              <th
                className={`px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-xs sm:text-sm ${
                  isDark ? "text-cyan-400" : "text-cyan-700"
                }`}
              >
                Status
              </th>
              <th
                className={`px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-xs sm:text-sm cursor-pointer select-none transition-transform duration-200 ${
                  isDark ? "text-cyan-400 hover:text-red-400" : "text-cyan-700 hover:text-red-600"
                }`}
                onClick={() => {
                  if (selectMode) {
                    onDelete([...selectedIds]);
                  } else {
                    setSelectMode(true);
                    setSelectedIds(new Set(sortedJobs.map(j => j._id)));
                  }
                }}
                title={selectMode ? "Delete selected jobs" : "Select all jobs"}
              >
                🗑
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedJobs.map((job, i) => (
              <React.Fragment key={job._id}>
                <motion.tr
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className={`border-t transition-colors duration-200 ${
                    isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"
                  }`}
                >
                  <td
                    className={`px-2 sm:px-4 py-2 sm:py-3 cursor-pointer select-none font-medium text-xs sm:text-sm ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                    onDoubleClick={() => {
                      setSelectMode(true);
                      setSelectedIds(new Set([job._id]));
                    }}
                  >
                    {selectMode ? (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(job._id)}
                        onChange={(e) => {
                          const s = new Set(selectedIds);
                          e.target.checked ? s.add(job._id) : s.delete(job._id);
                          setSelectedIds(s);
                        }}
                        className="w-4 h-4"
                      />
                    ) : (
                      i + 1
                    )}
                  </td>

                  <td
                    className={`px-2 sm:px-4 py-2 sm:py-3 font-medium cursor-pointer text-xs sm:text-sm ${
                      isDark ? "text-cyan-400 hover:text-cyan-300" : "text-cyan-600 hover:text-cyan-700"
                    } transition-colors duration-200`}
                    onClick={() => handleCompanyClick(job._id)}
                    onDoubleClick={() =>
                      setEditing({ id: job._id, field: "company" })
                    }
                  >
                    {editing?.id === job._id && editing.field === "company" ? (
                      <input
                        autoFocus
                        defaultValue={getValue(job.company)}
                        onBlur={(e) =>
                          onSaveField(job._id, "company", e.target.value)
                        }
                        className={`border rounded px-2 py-1 w-full text-xs sm:text-sm ${
                          isDark
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white border-cyan-300"
                        }`}
                      />
                    ) : (
                      getValue(job.company)
                    )}
                  </td>

                  <td
                    className={`px-2 sm:px-4 py-2 sm:py-3 cursor-text text-xs sm:text-sm ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                    onDoubleClick={() =>
                      setEditing({ id: job._id, field: "role" })
                    }
                  >
                    {editing?.id === job._id && editing.field === "role" ? (
                      <input
                        autoFocus
                        defaultValue={getValue(job.role)}
                        onBlur={(e) => onSaveField(job._id, "role", e.target.value)}
                        className={`border rounded px-2 py-1 w-full ${
                          isDark
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white border-cyan-300"
                        }`}
                      />
                    ) : (
                      getValue(job.role)
                    )}
                  </td>

                  <td
                    className={`px-4 py-3 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {new Date(job.appliedDate).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    <motion.select
                      value={job.currentStatus}
                      onChange={(e) => onUpdateStatus(job._id, e.target.value)}
                      className={`border rounded px-2 py-1 font-medium cursor-pointer transition-all duration-200 ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white hover:border-cyan-500"
                          : "bg-white border-gray-300 hover:border-cyan-500"
                      }`}
                    >
                      <option value="applied">✉️ Applied</option>
                      <option value="interview">👥 Interview</option>
                      <option value="offer">🎁 Offer</option>
                      <option value="rejected">❌ Rejected</option>
                    </motion.select>
                  </td>

                  <td
                    className={`px-4 py-3 text-lg cursor-pointer transition-transform duration-200 hover:scale-125 ${
                      isDark ? "hover:text-red-400" : "hover:text-red-600"
                    }`}
                    onClick={() => onDelete([job._id])}
                  >
                    🗑
                  </td>
                </motion.tr>

                {expandedJob === job._id && emailPreview && (
                  <motion.tr
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className={`${isDark ? "bg-gray-700" : "bg-gray-50"}`}
                  >
                    <td
                      colSpan="6"
                      className={`px-4 py-4 text-sm ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <div
                        className={`font-semibold text-lg mb-2 ${
                          isDark ? "text-cyan-400" : "text-cyan-600"
                        }`}
                      >
                        📧 {emailPreview.subject}
                      </div>
                      <div
                        className={isDark ? "text-gray-400" : "text-gray-600"}
                      >
                        {emailPreview.snippet}
                      </div>
                    </td>
                  </motion.tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </motion.div>
  );
}

const getValue = (v) => {
  if (!v) return "Unknown";
  if (typeof v === "string") return v;
  if (typeof v === "object") return v.value || "Unknown";
  return "Unknown";
};

export default JobsTable;
