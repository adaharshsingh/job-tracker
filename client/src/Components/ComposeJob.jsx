import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import api from "../api/client";
import { useTheme } from "../context/ThemeContext";

export default function ComposeJob({ onClose, onCreate }) {
  const { isDark } = useTheme();
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("applied");
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetRef = useRef({ x: 0, y: 0 });

  const startDrag = (e) => {
    if (e.target.closest("input") || e.target.closest("select") || e.target.closest("button")) return;
    dragging.current = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const rect = panelRef.current?.getBoundingClientRect() || {};
    dragStart.current = { 
      x: clientX - rect.left, 
      y: clientY - rect.top 
    };

    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("touchmove", onDrag, { passive: false });
    window.addEventListener("touchend", endDrag);
  };

  const onDrag = (e) => {
    if (!dragging.current) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    offsetRef.current = { 
      x: clientX - dragStart.current.x - window.innerWidth + 416, 
      y: clientY - dragStart.current.y - window.innerHeight + 500
    };
    
    if (panelRef.current) {
      panelRef.current.style.right = `${Math.max(0, -offsetRef.current.x)}px`;
      panelRef.current.style.bottom = `${Math.max(0, -offsetRef.current.y)}px`;
    }
  };

  const endDrag = () => {
    dragging.current = false;
    window.removeEventListener("mousemove", onDrag);
    window.removeEventListener("mouseup", endDrag);
    window.removeEventListener("touchmove", onDrag);
    window.removeEventListener("touchend", endDrag);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!company.trim() && !role.trim()) {
      alert("Please enter at least company or role");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        company: { value: company || "Unknown" },
        role: { value: role || "Unknown" },
        appliedDate: date || new Date().toISOString(),
        currentStatus: status,
        statusSource: "user"
      };

      const res = await api.post("/api/jobs", payload);
      if (res?.data) {
        onCreate?.(res.data);
        onClose?.();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        ref={panelRef}
        className={`fixed bottom-6 right-6 w-96 max-w-xs sm:w-96 sm:max-w-none rounded-xl shadow-2xl border ${isDark ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Draggable */}
        <div
          className={`flex items-center justify-between px-6 py-4 cursor-move select-none border-b ${isDark ? "bg-gray-700 border-gray-600 hover:bg-gray-600" : "bg-gradient-to-r from-orange-50 to-orange-100 border-gray-100 hover:from-orange-100 hover:to-orange-200"} transition-colors duration-200`}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
        >
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isDark ? "bg-emerald-400" : "bg-emerald-500"}`} />
            <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>New Job</h2>
          </div>

          <button 
            onClick={onClose} 
            className={`p-1 rounded-lg transition-all duration-200 ${isDark ? "hover:bg-gray-600 text-gray-400" : "hover:bg-orange-200 text-gray-600"}`}
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className={`p-6 space-y-4 ${isDark ? "bg-gray-800" : "bg-white"}`}>
          {/* Company */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Company
            </label>
            <input 
              value={company} 
              onChange={(e) => setCompany(e.target.value)} 
              className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none ${isDark ? "bg-gray-700 border-gray-600 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-20" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20"}`} 
              placeholder="e.g., Google, Meta, Amazon"
            />
          </div>

          {/* Role */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Job Title
            </label>
            <input 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none ${isDark ? "bg-gray-700 border-gray-600 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-20" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20"}`} 
              placeholder="e.g., Senior Engineer, Product Manager"
            />
          </div>

          {/* Date & Status Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Applied Date
              </label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none ${isDark ? "bg-gray-700 border-gray-600 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-20" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20"}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Status
              </label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)} 
                className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none ${isDark ? "bg-gray-700 border-gray-600 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-20" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20"}`}
              >
                <option value="applied">✉️ Applied</option>
                <option value="interview">👥 Interview</option>
                <option value="offer">🎁 Offer</option>
                <option value="rejected">❌ Rejected</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${isDark ? "bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-cyan-600 disabled:opacity-70" : "bg-orange-500 text-white hover:bg-orange-600 disabled:bg-orange-500 disabled:opacity-70"}`}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving
                </>
              ) : (
                "Create Job"
              )}
            </button>
          </div>

          <p className={`text-xs text-center ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            💡 Drag from header to move this panel
          </p>
        </form>
      </motion.div>
    </div>
  );
}
