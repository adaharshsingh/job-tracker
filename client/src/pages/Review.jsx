import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import api from "../api/client";
import { extractCompany } from "../utils/extractCompany";
import Navbar from "../Components/Navbar";
import { useTheme } from "../context/ThemeContext";

function Review() {
  const { isDark } = useTheme();
  const [emails, setEmails] = useState([]);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncCount, setSyncCount] = useState(30);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    api.get("/me")
      .then(meRes => {
        if (!mounted) return;

        if (!meRes.data) {
          window.location.href = "/";
          return;
        }

        return api.get("/review/unknown");
      })
      .then(res => {
        if (!mounted || !res) return;
        setEmails(res.data || []);
      })
      .catch(err => {
        console.error(err);
        window.location.href = "/";
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      setSyncMessage("");
      
      const res = await api.post(`/sync/gmail-unknown/fetch?maxResults=${syncCount}`);
      
      if (res?.data?.summary) {
        setSyncMessage(
          Object.entries(res.data.summary)
            .filter(([, v]) => v)
            .map(([k, v]) => `${v} ${k}`)
            .join(" · ")
        );
      }
      
      // Reload emails
      const emailsRes = await api.get("/review/unknown");
      setEmails(emailsRes.data || []);
      setShowSyncModal(false);
    } catch (err) {
      console.error(err);
      setSyncMessage("Sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const confirm = async (id, intent) => {
    try {
      const email = emails.find(e => e._id === id);
      const company = extractCompany(email);

      await api.post("/review/confirm", {
        snapshotId: id,
        finalIntent: intent,
        company,
        role: "Unknown"
      });

      setEmails(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
    }`}>
      <Navbar />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-6 py-10"
      >
        {/* HEADER */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className={`text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-2`}>
            📧 Review Emails
          </h1>
          <p className={`text-sm transition-colors duration-300 ${
            isDark ? "text-gray-400" : "text-gray-500"
          } mb-6`}>
            Review and confirm job-related emails
          </p>
        </motion.div>

        {/* SYNC BUTTON */}
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => setShowSyncModal(true)}
          disabled={isSyncing}
          className={`mb-6 inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 border ${
            isDark
              ? "border-cyan-700 bg-cyan-900 bg-opacity-30 text-cyan-400 hover:bg-cyan-800 hover:bg-opacity-50 disabled:opacity-50"
              : "border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100 disabled:opacity-50"
          }`}
        >
          {isSyncing ? "⏳" : "🔄"} {isSyncing ? "Syncing..." : "Sync Emails"}
        </motion.button>

        {/* SYNC MESSAGE */}
        {syncMessage && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`mb-6 px-5 py-4 rounded-lg border-l-4 font-medium shadow-lg ${
              isDark
                ? "bg-slate-800 border-emerald-500 text-emerald-100"
                : "bg-emerald-50 border-emerald-500 text-emerald-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">✓</span>
              <span>{syncMessage}</span>
            </div>
          </motion.div>
        )}

        {/* SYNC MODAL */}
        <AnimatePresence>
          {showSyncModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => !isSyncing && setShowSyncModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4 ${
                  isDark ? "bg-gray-800" : "bg-white"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                  🔄 Sync Emails
                </h2>
                
                <p className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  How many emails would you like to fetch from your inbox?
                </p>

                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Number of emails (max 100)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={syncCount}
                    onChange={(e) => setSyncCount(Math.min(Math.max(1, parseInt(e.target.value) || 1), 100))}
                    disabled={isSyncing}
                    className={`w-full px-4 py-2 rounded-lg border transition-all duration-200 ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } disabled:opacity-50`}
                  />
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowSyncModal(false)}
                    disabled={isSyncing}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                      isDark
                        ? "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50"
                        : "border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                    }`}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSync}
                    disabled={isSyncing}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isDark
                        ? "bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-50"
                        : "bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                    }`}
                  >
                    {isSyncing ? "⏳ Syncing..." : "✓ Sync"}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* NO EMAILS MESSAGE */}
        {emails.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`text-center py-12 text-sm rounded-lg border-2 border-dashed ${
              isDark
                ? "border-gray-700 text-gray-400"
                : "border-gray-300 text-gray-500"
            }`}
          >
            🎉 No emails to review
          </motion.div>
        )}

        {/* EMAIL LIST */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4"
        >
          {emails.map((e, idx) => {
            const company = extractCompany(e);

            return (
              <motion.div
                key={e._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + idx * 0.08 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`rounded-lg border transition-all duration-200 p-5 shadow-md ${
                  isDark
                    ? "border-gray-700 bg-gray-800 hover:border-cyan-600"
                    : "border-orange-200 bg-white hover:border-orange-400"
                }`}
              >
                <h3 className={`text-sm font-semibold mb-2 ${
                  isDark ? "text-cyan-400" : "text-orange-600"
                }`}>
                  {e.subject}
                </h3>

                <p className={`text-xs font-medium mb-1 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}>
                  🏢 Company: <span className={isDark ? "text-cyan-300" : "text-orange-600"}>{company}</span>
                </p>

                <p className={`text-xs mb-3 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}>
                  {e.from}
                </p>

                <p className={`text-sm mb-4 line-clamp-3 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}>
                  {e.snippet}
                </p>

                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.1 }}
                    onClick={() => confirm(e._id, "APPLIED")}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${
                      isDark
                        ? "bg-blue-900 bg-opacity-40 text-blue-300 hover:bg-blue-800 hover:bg-opacity-60"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    ✉️ Applied
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.1 }}
                    onClick={() => confirm(e._id, "INTERVIEW")}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${
                      isDark
                        ? "bg-purple-900 bg-opacity-40 text-purple-300 hover:bg-purple-800 hover:bg-opacity-60"
                        : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                    }`}
                  >
                    👥 Interview
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.1 }}
                    onClick={() => confirm(e._id, "OFFER")}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${
                      isDark
                        ? "bg-green-900 bg-opacity-40 text-green-300 hover:bg-green-800 hover:bg-opacity-60"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    🎁 Offer
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.1 }}
                    onClick={() => confirm(e._id, "REJECTED")}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${
                      isDark
                        ? "bg-red-900 bg-opacity-40 text-red-300 hover:bg-red-800 hover:bg-opacity-60"
                        : "bg-red-50 text-red-700 hover:bg-red-100"
                    }`}
                  >
                    ❌ Rejected
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.1 }}
                    onClick={() => confirm(e._id, "IGNORE")}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ml-auto ${
                      isDark
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    ⊘ Ignore
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Review;