"use client";

import { useTheme } from "@/components/ThemeProvider";

export function ReportThemeToggle() {
  const { theme, toggle } = useTheme();
  const label = theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن";
  return (
    <button type="button" className="icon-btn" onClick={toggle} aria-label={label} title={label}>
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}
