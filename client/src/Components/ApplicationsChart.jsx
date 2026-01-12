import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useTheme } from "../context/ThemeContext";

function ApplicationsChart({ jobs }) {
  const { isDark } = useTheme();
  const [timeRange, setTimeRange] = useState("week"); // "week" or "month"

  const chartData = useMemo(() => {
    const now = new Date();
    let data = [];

    if (timeRange === "week") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

        const count = jobs.filter(job => {
          const jobDate = new Date(job.appliedDate);
          return jobDate.toDateString() === date.toDateString();
        }).length;

        data.push({ date: dateStr, applications: count });
      }
    } else {
      // Last 30 days (grouped by week)
      for (let week = 4; week >= 0; week--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - week * 7 - 6);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const weekLabel = `Week ${5 - week}`;

        const count = jobs.filter(job => {
          const jobDate = new Date(job.appliedDate);
          return jobDate >= weekStart && jobDate <= weekEnd;
        }).length;

        data.push({ date: weekLabel, applications: count });
      }
    }

    return data;
  }, [jobs, timeRange]);

  const totalApplications = chartData.reduce((sum, d) => sum + d.applications, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className={`rounded-lg border p-3 sm:p-4 md:p-6 ${
        isDark
          ? "border-cyan-700 bg-gray-900"
          : "border-orange-200 bg-white"
      } shadow-lg`}
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h3 className={`text-lg sm:text-xl font-bold mb-1 ${
            isDark ? "text-cyan-400" : "text-orange-600"
          }`}>
            📊 Applications Applied
          </h3>
          <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Total: <span className="font-semibold">{totalApplications}</span> {totalApplications === 1 ? "application" : "applications"}
          </p>
        </div>

        {/* TIME RANGE TOGGLE */}
        <div className="flex gap-1 sm:gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTimeRange("week")}
            className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${
              timeRange === "week"
                ? isDark
                  ? "bg-cyan-600 text-white"
                  : "bg-orange-500 text-white"
                : isDark
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            📅 Week
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTimeRange("month")}
            className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${
              timeRange === "month"
                ? isDark
                  ? "bg-cyan-600 text-white"
                  : "bg-orange-500 text-white"
                : isDark
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            📆 Month
          </motion.button>
        </div>
      </div>

      {/* CHART */}
      <motion.div
        key={timeRange}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#4B5563" : "#E5E7EB"}
            />
            <XAxis
              dataKey="date"
              stroke={isDark ? "#9CA3AF" : "#6B7280"}
              style={{ fontSize: "11px" }}
            />
            <YAxis
              stroke={isDark ? "#9CA3AF" : "#6B7280"}
              style={{ fontSize: "11px" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                border: `1px solid ${isDark ? "#4B5563" : "#E5E7EB"}`,
                borderRadius: "8px",
                color: isDark ? "#F3F4F6" : "#111827",
                fontSize: "12px"
              }}
              labelStyle={{ color: isDark ? "#F3F4F6" : "#111827", fontSize: "12px" }}
              formatter={(value) => [`${value} application${value !== 1 ? "s" : ""}`, "Applications"]}
              cursor={{ fill: isDark ? "rgba(34, 211, 238, 0.1)" : "rgba(249, 115, 22, 0.05)" }}
            />
            <Bar
              dataKey="applications"
              fill={isDark ? "#22D3EE" : "#EA580C"}
              radius={[8, 8, 0, 0]}
              animationDuration={500}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
}

export default ApplicationsChart;
