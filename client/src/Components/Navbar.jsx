import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import ComposeJob from "../Components/ComposeJob";
import api from "../api/client";
import { useTheme } from "../context/ThemeContext";

function Navbar({ searchQuery = "", onSearchChange, startDate = "", onStartDateChange, endDate = "", onEndDateChange, onClearFilters }) {
  const { isDark, toggleTheme } = useTheme();
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const location = useLocation();
  const pathname = location?.pathname || "/";
  const isReviewPage = pathname.startsWith("/review");
  const isDashboardPage = pathname === "/" || pathname.startsWith("/dashboard");

  const logout = async () => {
    try {
      await api.get("/logout");
      window.location.href = "/";
    } catch (err) {
      console.error(err);
    }
  };

  // compose modal state
  const [showCompose, setShowCompose] = useState(false);

  const handleCreate = (newJob) => {
    // dispatch event so pages (Dashboard) can update their state
    try {
      window.dispatchEvent(new CustomEvent("jobCreated", { detail: newJob }));
    } catch {
      // fallback: reload
      window.location.reload();
    }
  };

  return (
    <div className={`border-b transition-colors duration-300 ${
      isDark ? "bg-gray-900 border-gray-700" : "bg-white border-orange-100"
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
        {/* Top row: Logo, Links, Theme, Logout */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <button
  onClick={() => window.location.href = "/dashboard"}
  className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
>
  <img
    src="/vite.png"
    alt="Job Tracker logo"
    className="h-9 w-9 sm:h-8 sm:w-8 object-contain"
  />

  <span
    className={`font-bold text-sm sm:text-base lg:text-lg leading-none ${
      isDark ? "text-cyan-400" : "text-orange-600"
    }`}
  >
    Applyd
  </span>
</button>

            {/* Show only one navigation button: the other page */}
            {isDashboardPage && (
              <Link to="/review" className={`text-xs sm:text-sm transition-colors duration-200 ${
                isDark 
                  ? "text-gray-300 hover:text-cyan-400" 
                  : "text-gray-600 hover:text-orange-600"
              }`}>
                Review
              </Link>
            )}

            {isReviewPage && (
              <Link to="/dashboard" className={`text-xs sm:text-sm transition-colors duration-200 ${
                isDark 
                  ? "text-gray-300 hover:text-cyan-400" 
                  : "text-gray-600 hover:text-orange-600"
              }`}>
                Dashboard
              </Link>
            )}
          </div>

          {/* Search Bar with Expandable Width (hidden on Review page and Dashboard) */}
          {!isReviewPage && !isDashboardPage && (
            <div className="flex items-center gap-2 sm:gap-3 mx-4 flex-1 sm:flex-none">
            <motion.div
              animate={{ width: searchFocused ? "200px" : "120px" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`relative rounded-lg overflow-hidden border transition-all duration-300 ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-orange-50 border-orange-200"
              }`}
            >
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`w-full px-3 py-2 text-xs sm:text-sm bg-transparent outline-none transition-colors duration-200 ${
                  isDark
                    ? "text-white placeholder-gray-500"
                    : "text-gray-800 placeholder-orange-400"
                }`}
              />
            </motion.div>

            {/* Date Filter Dropdown Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDateFilter(!showDateFilter)}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isDark
                  ? "bg-gray-800 text-cyan-400 hover:bg-gray-700"
                  : "bg-orange-50 text-orange-600 hover:bg-orange-100"
              } ${showDateFilter ? (isDark ? "bg-gray-700" : "bg-orange-100") : ""}`}
              title="Date Filter"
            >
              📅
            </motion.button>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setShowCompose(true)} className={`inline-flex mr-1 sm:mr-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 ${isDark ? "bg-cyan-600 text-white hover:bg-cyan-700" : "bg-orange-500 text-white hover:bg-orange-600"}`}>
              + New Job
            </button>
            <button
              onClick={toggleTheme}
              className={`p-1.5 sm:p-2 rounded-lg transition-all duration-300 text-lg sm:text-base ${
                isDark
                  ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
                  : "bg-orange-50 text-orange-600 hover:bg-orange-100"
              }`}
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            <button
              onClick={logout}
              className={`text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded transition-all duration-200 ${
                isDark
                  ? "text-cyan-400 hover:bg-cyan-500 hover:bg-opacity-20"
                  : "text-orange-600 hover:bg-orange-100"
              }`}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Date Filter Dropdown - Expandable */}
        <motion.div
          initial={false}
          animate={{ height: showDateFilter ? "auto" : 0, opacity: showDateFilter ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden mt-2"
        >
          <motion.div
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.2 }}
            className={`border rounded-lg p-3 sm:p-4 ${
              isDark 
                ? "bg-gray-800 border-gray-700" 
                : "bg-orange-50 border-orange-200"
            }`}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {/* Start Date */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
              >
                <label className={`block text-xs font-semibold mb-1 ${
                  isDark ? "text-cyan-400" : "text-orange-600"
                }`}>
                  From
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onStartDateChange?.(e.target.value)}
                  className={`w-full border rounded-lg px-2 py-1.5 text-xs transition-all duration-200 ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white focus:border-cyan-500"
                      : "bg-white border-gray-300 focus:border-orange-500"
                  }`}
                />
              </motion.div>
              
              {/* End Date */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className={`block text-xs font-semibold mb-1 ${
                  isDark ? "text-cyan-400" : "text-orange-600"
                }`}>
                  To
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onEndDateChange?.(e.target.value)}
                  className={`w-full border rounded-lg px-2 py-1.5 text-xs transition-all duration-200 ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white focus:border-cyan-500"
                      : "bg-white border-gray-300 focus:border-orange-500"
                  }`}
                />
              </motion.div>

              {/* Clear Button */}
              {(startDate || endDate) && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  onClick={() => onClearFilters?.()}
                  className={`col-span-1 sm:col-span-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 ${
                    isDark
                      ? "bg-gray-700 text-cyan-300 hover:bg-gray-600"
                      : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                  }`}
                >
                  Clear
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
        {showCompose && (
          <ComposeJob onClose={() => setShowCompose(false)} onCreate={(j) => { handleCreate(j); setShowCompose(false); }} />
        )}
      </div>
    </div>
  );
}

export default Navbar;