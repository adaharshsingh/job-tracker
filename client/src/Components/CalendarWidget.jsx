import React, { useMemo } from "react";

import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import dayjs from "dayjs";
import { useTheme } from "../context/ThemeContext";

function CalendarWidget({ value, onChange }) {
  const { isDark } = useTheme();

  // IMPORTANT: do NOT fake a selected date
  const selectedDate = value ? dayjs(value) : null;

  /* ---------- MEMOIZED MUI THEME ---------- */
  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDark ? "dark" : "light",
          primary: {
            main: isDark ? "#0891B2" : "#EA580C",
          },
          background: {
            paper: isDark ? "#1F2937" : "#FFFFFF",
            default: isDark ? "#111827" : "#FFFFFF",
          },
          text: {
            primary: isDark ? "#E5E7EB" : "#1F2937",
            secondary: isDark ? "#9CA3AF" : "#6B7280",
          },
        },
        components: {
          MuiDateCalendar: {
            styleOverrides: {
              root: {
                height: "100%",
                backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                color: isDark ? "#E5E7EB" : "#1F2937",
              },
            },
          },
          MuiPickersCalendarHeader: {
            styleOverrides: {
              root: {
                padding: "12px 0",
              },
              labelContainer: {
                color: isDark ? "#67E8F9" : "#EA580C",
                fontWeight: 600,
              },
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                color: isDark ? "#67E8F9" : "#EA580C",
                "&:hover": {
                  backgroundColor: isDark
                    ? "rgba(34, 211, 238, 0.1)"
                    : "rgba(249, 115, 22, 0.08)",
                },
              },
            },
          },
          MuiPickersDay: {
            styleOverrides: {
              root: {
                color: isDark ? "#E5E7EB" : "#1F2937",
                "&:hover": {
                  backgroundColor: isDark
                    ? "rgba(34, 211, 238, 0.2)"
                    : "rgba(254, 215, 170, 0.8)",
                },
                "&.Mui-selected": {
                  backgroundColor: isDark ? "#0891B2" : "#EA580C",
                  color: "#FFFFFF",
                  fontWeight: "bold",
                },
                "&.MuiPickersDay-today": {
                  borderColor: isDark ? "#0891B2" : "#EA580C",
                  fontWeight: "bold",
                },
              },
            },
          },
        },
      }),
    [isDark]
  );

  const handleDateChange = (newDate) => {
    if (!newDate) {
      onChange?.(null);
      return;
    }
    onChange?.(newDate.toDate());
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`h-full rounded-lg border shadow-lg overflow-hidden ${
            isDark
              ? "bg-gray-800 border-cyan-700"
              : "bg-white border-gray-200"
          }`}
        >
          {/* CALENDAR MUST FILL HEIGHT */}
          <div className="h-full p-3">
            <DateCalendar
              value={selectedDate}
              onChange={handleDateChange}
              disableFuture={false}
            />
          </div>
        </motion.div>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default CalendarWidget;