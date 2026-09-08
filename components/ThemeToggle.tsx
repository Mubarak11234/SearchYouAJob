"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = stored === "dark";
    setIsDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-8 w-14 items-center rounded-full border border-zinc-200 px-1 transition-colors"
      style={{ backgroundColor: isDark ? "#1F2937" : "#F1F1EF" }}
    >
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition-transform"
        style={{ transform: isDark ? "translateX(24px)" : "translateX(0px)" }}
      >
        {isDark ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#69ABF7">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#69ABF7">
            <circle cx="12" cy="12" r="5" />
            <path
              stroke="#69ABF7"
              strokeWidth="2"
              strokeLinecap="round"
              d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            />
          </svg>
        )}
      </span>
    </button>
  );
}