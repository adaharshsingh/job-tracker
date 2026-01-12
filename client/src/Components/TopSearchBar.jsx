import React from "react";
import { motion } from "framer-motion";

function TopSearchBar({ value, onChange, onClear, isDark, compact = false, setSearchFocused, inputRef }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className={compact ? "" : "mb-3"}
    >
      <div className={`${compact ? "w-full sm:w-72 md:w-96" : "w-full"} rounded-lg border px-3 py-2 flex items-center gap-3 transition-all ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <span className="text-lg">🔍</span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setSearchFocused?.(true)}
          onBlur={() => setSearchFocused?.(false)}
          placeholder="Search jobs by company or title..."
          className={`flex-1 bg-transparent outline-none text-sm ${isDark ? "text-white placeholder-gray-400" : "text-gray-700 placeholder-gray-500"}`}
        />
        {(value || compact) && (
          <button onClick={onClear} className={`text-lg transition-transform hover:scale-110 ${isDark ? "text-cyan-300" : "text-gray-600"}`} aria-label="Close search">✕</button>
        )}
      </div>
    </motion.div>
  );
}

export default TopSearchBar;

