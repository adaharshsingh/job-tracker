import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import CalendarWidget from "./CalendarWidget";
import { useTheme } from "../context/ThemeContext";

function CalendarSearchPanel({
  selectedDate,
  setSelectedDate,
  searchQuery,
  setSearchQuery,
  searchFocused,
  setSearchFocused,
}) {
  const { isDark } = useTheme();
  const isDateSelected = Boolean(selectedDate);

  const handleClearDate = () => setSelectedDate(null);
  const handleClearSearch = () => setSearchQuery("");

  return (
    /* 
      IMPORTANT:
      - Width is controlled by parent (60/40 grid)
      - Height is controlled by parent (fixed dashboard height)
    */
    <div className="flex flex-col h-full w-full gap-3 sm:gap-4">
      {/* FIXED GRID: 70% calendar / 30% search */}
      <div className="grid grid-rows-[85fr_15fr] h-full gap-3">
        {/* ================= CALENDAR (70%) ================= */}
        <div className="overflow-hidden">
          <CalendarWidget
            value={selectedDate}
            onChange={setSelectedDate}
          />
        </div>

        {/* ================= SEARCH (30%) ================= */}
        <AnimatePresence>
          {!(searchQuery.trim() || searchFocused) && (
            <div
              className={`rounded-lg border overflow-hidden ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-orange-200"
              }`}
            >
              <AnimatePresence mode="wait">
                {/* -------- DEFAULT SEARCH STATE -------- */}
                {!isDateSelected ? (
              <motion.div
                key="search-default"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className={`h-full px-3 sm:px-4 py-2 sm:py-3 flex flex-col items-center justify-center gap-2 ${
                  isDark ? "bg-gray-700" : "bg-orange-50"
                }`}
              >

                {/* When search is active (top bar visible), hide the calendar input to avoid duplicate controls */}
                {!(searchQuery.trim() || searchFocused) && (
                  <>
                    <div className="w-full relative">
                      <input
                        type="text"
                        placeholder="Company or job title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => {
                          setSearchFocused?.(true);
                        }}
                        onBlur={() => setSearchFocused?.(false)}
                        className={`w-full pr-8 px-2 py-1 text-xs rounded border text-center transition-all duration-200 focus:outline-none ${
                          isDark
                            ? "bg-gray-600 border-gray-500 text-white focus:border-cyan-500"
                            : "bg-white border-orange-200 text-gray-900 focus:border-orange-500"
                        }`}
                      />
                      {searchQuery.trim() && (
                        <button
                          onClick={handleClearSearch}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm px-1 py-0.5 rounded ${isDark ? "text-cyan-300" : "text-orange-700"}`}
                          aria-label="Clear search"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {searchQuery.trim() && (
                      <motion.button
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        onClick={handleClearSearch}
                        className={`w-full px-2 py-1 border-t text-xs font-medium transition-colors ${
                          isDark
                            ? "border-gray-700 bg-gray-700 text-cyan-300 hover:bg-gray-600"
                            : "border-orange-100 bg-orange-50 text-orange-700 hover:bg-orange-100"
                        }`}
                      >
                        Clear Search
                      </motion.button>
                    )}
                  </>
                )}
              </motion.div>
            ) : (
              /* -------- DATE SELECTED STATE -------- */
              <motion.div
                key="search-filtered"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="h-full p-2 flex flex-col gap-2"
              >
                {/* Clear Filter Button */}
                <button
                  onClick={handleClearDate}
                  className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isDark
                      ? "bg-blue-900 text-blue-300 hover:bg-blue-800"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  ✕ Clear Filter
                </button>

                {/* Full-width Search */}
                <div
                  className={`flex items-center gap-2 w-full rounded-md border p-2 transition-all ${
                    searchFocused
                      ? isDark
                        ? "bg-gray-700 border-cyan-500"
                        : "bg-white border-orange-500"
                      : isDark
                      ? "bg-gray-700 border-gray-600"
                      : "bg-orange-50 border-orange-200"
                  }`}
                >
                  <span className="text-lg flex-shrink-0">🔍</span>

                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused?.(true)}
                    onBlur={() => setSearchFocused?.(false)}
                    className={`flex-1 min-w-0 bg-transparent outline-none text-sm ${
                      isDark
                        ? "text-white placeholder-gray-400"
                        : "text-gray-700 placeholder-orange-400"
                    }`}
                  />

                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className={`text-lg flex-shrink-0 transition-transform hover:scale-110 ${
                        isDark ? "text-cyan-300" : "text-orange-700"
                      }`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default CalendarSearchPanel;