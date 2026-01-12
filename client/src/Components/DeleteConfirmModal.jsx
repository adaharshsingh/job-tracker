import React from "react";
import { AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

function DeleteConfirmModal({ deleteDialog, onClose, onConfirm }) {
  const { isDark } = useTheme();

  return (
    <AnimatePresence>
      {deleteDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4 ${
              isDark
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-200"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="text-3xl">⚠️</div>
              <div>
                <h2
                  className={`text-xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {deleteDialog.ids?.length === 1 ? "Delete Job" : "Delete Jobs"}
                </h2>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  } mt-1`}
                >
                  {deleteDialog.ids?.length === 1
                    ? "Are you sure you want to delete this job? This action cannot be undone."
                    : `Are you sure you want to delete ${deleteDialog.ids?.length} jobs? This action cannot be undone.`}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                  isDark
                    ? "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isDark
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default DeleteConfirmModal;
