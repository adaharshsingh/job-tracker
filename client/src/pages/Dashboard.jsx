import React, { useEffect, useState, useMemo, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import api from "../api/client";
import Navbar from "../Components/Navbar";
import ApplicationsChart from "../Components/ApplicationsChart";
import CalendarWidget from "../Components/CalendarWidget";
import StatsGrid from "../Components/StatsGrid";
import JobsTable from "../Components/JobsTable";
import DeleteConfirmModal from "../Components/DeleteConfirmModal";
import CalendarSearchPanel from "../Components/CalendarSearchPanel";
import TopSearchBar from "../Components/TopSearchBar";
import { useTheme } from "../context/ThemeContext";

/* ---------- SAFE VALUE ---------- */
const getValue = (v) => {
  if (!v) return "Unknown";
  if (typeof v === "string") return v;
  if (typeof v === "object") return v.value || "Unknown";
  return "Unknown";
};

/* ---------- STATUS PRIORITY ---------- */
const STATUS_ORDER = {
  offer: 1,
  interview: 2,
  applied: 3,
  rejected: 4
};

function Dashboard() {
  const tableRef = useRef(null);
  const navbarRef = useRef(null);
  const topSearchRef = useRef(null);
  const hideNavbarTimeoutRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const { isDark } = useTheme();
  const [jobs, setJobs] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [editing, setEditing] = useState(null);
  const [expandedJob, setExpandedJob] = useState(null);
  const [emailPreview, setEmailPreview] = useState(null);
  const [showNavbar, setShowNavbar] = useState(true);

  /* ---------- BULK MODE ---------- */
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  /* ---------- DELETE CONFIRMATION DIALOG ---------- */
  const [deleteDialog, setDeleteDialog] = useState(null); // null or { ids: [...] }

  /* ---------- SEARCH & FILTER ---------- */
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  /* ---------- AUTO-FOCUS TOP SEARCH WHEN CALENDAR INPUT CLICKED ---------- */
  useEffect(() => {
    if (searchFocused && topSearchRef.current) {
      setTimeout(() => topSearchRef.current?.focus(), 100);
    }
  }, [searchFocused]);
  
  useEffect(() => {
    if (searchQuery.trim() && tableRef.current) {
      setTimeout(() => tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
  }, [searchQuery]);

  /* ---------- FETCH JOBS ---------- */
  useEffect(() => {
    api.get("/me")
      .then(res => {
        if (!res.data) {
          window.location.href = "/";
          return;
        }
        return api.get("/api/jobs");
      })
      .then(res => setJobs(res?.data || []))
      .catch(() => window.location.href = "/");
  }, []);

  /* ---------- LISTEN FOR EXTERNAL JOB CREATIONS ---------- */
  useEffect(() => {
    const handler = (e) => {
      const newJob = e.detail;
      if (newJob && newJob._id) {
        setJobs(j => [newJob, ...j]);
      }
    };
    window.addEventListener("jobCreated", handler);
    return () => window.removeEventListener("jobCreated", handler);
  }, []);

  /* ---------- KEYBOARD SHORTCUTS ---------- */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input or select
      const isTyping =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement ||
        e.target instanceof HTMLTextAreaElement;

      if (isTyping) return;

      const key = e.key.toLowerCase();

      // A: Select ALL jobs
      if (key === "a") {
        e.preventDefault();
        setSelectMode(true);
        setSelectedIds(new Set(jobs.map(j => j._id)));
      }

      // Esc: Exit selection mode + clear selection
      if (key === "escape") {
        e.preventDefault();
        setSelectMode(false);
        setSelectedIds(new Set());
        setExpandedJob(null);
        setEmailPreview(null);
      }

      // D: Bulk delete (only if something is selected)
      if (key === "d" && selectedIds.size > 0) {
        e.preventDefault();
        requestDelete([...selectedIds]);
      }

      // S: Sync Gmail
      if (key === "s" && !syncing) {
        e.preventDefault();
        syncGmail();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jobs, selectedIds, syncing]);

  /* ---------- SCROLL TO TABLE ON DATE SELECT ---------- */
  useEffect(() => {
    if (selectedDate && tableRef.current) {
      setTimeout(() => {
        tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [selectedDate]);

  /* ---------- STICKY NAVBAR WITH AUTO-HIDE ---------- */
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when scrolling
      setShowNavbar(true);
      
      // Clear previous timeout
      if (hideNavbarTimeoutRef.current) {
        clearTimeout(hideNavbarTimeoutRef.current);
      }
      
      // Hide navbar after 3 seconds of inactivity
      hideNavbarTimeoutRef.current = setTimeout(() => {
        if (currentScrollY > 100) {
          setShowNavbar(false);
        }
      }, 3000);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (hideNavbarTimeoutRef.current) {
        clearTimeout(hideNavbarTimeoutRef.current);
      }
    };
  }, []);

  /* ---------- SORT ---------- */
  const sortedJobs = useMemo(() => {
    let filtered = [...jobs];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        getValue(job.company).toLowerCase().includes(query) ||
        getValue(job.role).toLowerCase().includes(query)
      );
    }

    // Apply date range filter
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(job => new Date(job.appliedDate) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(job => new Date(job.appliedDate) <= end);
    }

    // Apply single-day filter from calendar
    if (selectedDate) {
      const dayStart = new Date(selectedDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(selectedDate);
      dayEnd.setHours(23, 59, 59, 999);
      filtered = filtered.filter(job => {
        const applied = new Date(job.appliedDate);
        return applied >= dayStart && applied <= dayEnd;
      });
    }

    // Sort
    return filtered.sort((a, b) => {
      const s =
        STATUS_ORDER[a.currentStatus] -
        STATUS_ORDER[b.currentStatus];
      if (s !== 0) return s;
      return new Date(b.appliedDate) - new Date(a.appliedDate);
    });
  }, [jobs, searchQuery, startDate, endDate, selectedDate]);

  /* ---------- SYNC ---------- */
  const syncGmail = async () => {
    try {
      setSyncing(true);
      setSyncMsg("");

      const res = await api.post("/sync/gmail-unknown");
      const jobsRes = await api.get("/api/jobs");
      setJobs(jobsRes.data || []);

      if (res?.data?.summary) {
        setSyncMsg(
          Object.entries(res.data.summary)
            .filter(([, v]) => v)
            .map(([k, v]) => `${v} ${k}`)
            .join(" · ")
        );
      }
    } catch (err) {
      console.error("Sync error:", err.response?.data || err.message);
      setSyncMsg(err.response?.data?.error || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  /* ---------- EDIT ---------- */
  const saveField = async (id, field, value) => {
    const res = await api.patch(`/api/jobs/${id}`, {
      [field]: value,
      statusSource: "user"
    });
    setJobs(j => j.map(x => (x._id === id ? res.data : x)));
    setEditing(null);
  };

  const updateStatus = async (id, status) => {
    const res = await api.patch(`/api/jobs/${id}`, {
      currentStatus: status,
      statusSource: "user"
    });
    setJobs(j => j.map(x => (x._id === id ? res.data : x)));
  };

  /* ---------- DELETE UNIFIED PIPELINE ---------- */
  const requestDelete = (ids) => {
    setDeleteDialog({ ids });
  };

  const confirmDelete = async () => {
    if (!deleteDialog?.ids) return;
    try {
      await Promise.all(
        deleteDialog.ids.map(id => api.delete(`/api/jobs/${id}`))
      );
      setJobs(j => j.filter(x => !deleteDialog.ids.includes(x._id)));
      setSelectedIds(new Set());
      setSelectMode(false);
      setDeleteDialog(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
    }`}>
      {/* Sticky Navbar with Animation */}
      <motion.div
        ref={navbarRef}
        initial={{ y: 0 }}
        animate={{ y: showNavbar ? 0 : -100 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          onClearFilters={() => {
            setSearchQuery("");
            setStartDate("");
            setEndDate("");
          }}
        />
      </motion.div>
      {/* Compose is available in the navbar */}
      {/* Floating Sync Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={syncGmail}
        disabled={syncing}
        className={`fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-lg font-medium transition-all duration-200 ${
          syncing
            ? "bg-cyan-400 text-white opacity-70 cursor-not-allowed"
            : isDark
            ? "bg-cyan-600 text-white hover:bg-cyan-700"
            : "bg-cyan-500 text-white hover:bg-cyan-600"
        }`}
        title="Sync Gmail"
      >
        {syncing ? "⏳" : "🔄"}
      </motion.button>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-24 max-w-6xl mx-auto px-6 py-10"
      >
        {/* HEADER */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row justify-between mb-6 sm:mb-8 items-start sm:items-center gap-3 sm:gap-4"
        >
          <h1 className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent`}>📊 My Jobs</h1>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {(searchQuery.trim() || searchFocused) && (
              <TopSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => {
                  setSearchQuery("");
                  setSearchFocused(false);
                }}
                isDark={isDark}
                compact
                setSearchFocused={setSearchFocused}
                inputRef={topSearchRef}
              />
            )}

            <div className="flex flex-wrap gap-2 sm:gap-3">
              {selectMode && selectedIds.size > 0 && (
                <motion.button
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={() => requestDelete([...selectedIds])}
                  className="bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-red-600 transition-colors duration-200 shadow-lg"
                >
                  Delete ({selectedIds.size})
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* SYNC MESSAGE - Professional Alert */}
        {syncMsg && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`mb-4 sm:mb-6 px-3 sm:px-5 py-3 sm:py-4 rounded-lg border-l-4 font-medium shadow-lg text-sm sm:text-base ${
              isDark
                ? "bg-slate-800 border-emerald-500 text-emerald-100"
                : "bg-emerald-50 border-emerald-500 text-emerald-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">✓</span>
              <span>{syncMsg}</span>
            </div>
          </motion.div>
        )}

        {/* STATS CARDS & CHART & CALENDAR - Hide when searching */}
        <AnimatePresence>
          {!searchQuery.trim() && !searchFocused && (
            <>
              <StatsGrid jobs={jobs} />

              {/* BENTO GRID: Flex Row - Chart 60%, Calendar+Search 40% */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col lg:flex-row gap-0 lg:gap-6 mb-6 sm:mb-8 w-full"
              >
                {/* Chart: 60% width on large screens, full width on mobile */}
<div className="w-full lg:w-3/5 flex-shrink-0 
                h-auto 
                lg:h-[377px]">                  <ApplicationsChart jobs={jobs} />
                </div>

                {/* Right Side: 40% width - Calendar+Search Container */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
className="w-full lg:w-2/5 flex-shrink-0 
                h-auto 
                lg:h-[377px]"                >
                  <CalendarSearchPanel
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    searchFocused={searchFocused}
                    setSearchFocused={setSearchFocused}
                  />
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* TABLE - searches originate from calendar-side search; top search is in header */}

        {/* TABLE */}
        {/* BULK DELETE BUTTON - Shows when selectMode is active */}
        {selectMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mb-3 sm:mb-4 flex gap-2 flex-wrap items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => requestDelete([...selectedIds])}
              className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                isDark
                  ? "bg-red-900 bg-opacity-50 border border-red-700 text-red-400 hover:bg-red-900 hover:bg-opacity-70"
                  : "bg-red-100 border border-red-300 text-red-700 hover:bg-red-200"
              }`}
            >
              🗑 Delete {selectedIds.size} {selectedIds.size === 1 ? "job" : "jobs"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectMode(false);
                setSelectedIds(new Set());
              }}
              className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                isDark
                  ? "bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 border border-gray-300 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Cancel
            </motion.button>
          </motion.div>
        )}

        <JobsTable
          tableRef={tableRef}
          sortedJobs={sortedJobs}
          editing={editing}
          setEditing={setEditing}
          expandedJob={expandedJob}
          setExpandedJob={setExpandedJob}
          emailPreview={emailPreview}
          setEmailPreview={setEmailPreview}
          selectMode={selectMode}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          setSelectMode={setSelectMode}
          onDelete={requestDelete}
          onUpdateStatus={updateStatus}
          onSaveField={saveField}
          selectedDate={selectedDate}
        />

        {/* DELETE CONFIRMATION DIALOG */}
        <DeleteConfirmModal
          deleteDialog={deleteDialog}
          onClose={() => setDeleteDialog(null)}
          onConfirm={confirmDelete}
        />
      </motion.div>
    </div>
  );
}

export default Dashboard;