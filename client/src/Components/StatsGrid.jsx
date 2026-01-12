import React from "react";

import { useTheme } from "../context/ThemeContext";

function StatsGrid({ jobs }) {
  const { isDark } = useTheme();

  const stats = [
    {
      label: "Applications",
      value: jobs.length,
      icon: "📊",
      bg: isDark ? "from-blue-900 to-blue-800" : "from-blue-100 to-blue-50",
      textColor: "text-blue-600"
    },
    {
      label: "Applied",
      value: jobs.filter(j => j.currentStatus === "applied").length,
      icon: "✉️",
      bg: isDark ? "from-green-900 to-green-800" : "from-green-100 to-green-50",
      textColor: "text-green-600"
    },
    {
      label: "Offer",
      value: jobs.filter(j => j.currentStatus === "offer").length,
      icon: "🎁",
      bg: isDark ? "from-purple-900 to-purple-800" : "from-purple-100 to-purple-50",
      textColor: "text-purple-600"
    },
    {
      label: "Rejected",
      value: jobs.filter(j => j.currentStatus === "rejected").length,
      icon: "❌",
      bg: isDark ? "from-red-900 to-red-800" : "from-red-100 to-red-50",
      textColor: "text-red-600"
    }
  ];

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8"
    >
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35 + idx * 0.1 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className={`bg-gradient-to-br ${stat.bg} rounded-lg px-3 sm:px-4 py-4 sm:py-5 border transition-all duration-200 cursor-default ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="text-xl sm:text-2xl mb-2">{stat.icon}</div>
          <div className={`text-xs sm:text-sm font-semibold mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            {stat.label}
          </div>
          <div className={`text-2xl sm:text-3xl font-bold ${stat.textColor}`}>
            {stat.value}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default StatsGrid;
