"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({ theme: "light", toggle: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // The bootstrap script in layout.tsx has already put the real theme on
  // <html data-tw>. Read it back on mount so the toggle icon agrees with it,
  // and don't write anything until we have, or we'd clobber it with "light".
  const [theme, setTheme] = useState<Theme>("light");
  const [adopted, setAdopted] = useState(false);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-tw");
    if (current === "dark" || current === "light") setTheme(current);
    setAdopted(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "tw-theme" && (e.newValue === "dark" || e.newValue === "light")) {
        setTheme(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!adopted) return;
    document.documentElement.setAttribute("data-tw", theme);
    document.documentElement.style.background =
      theme === "dark" ? "#0B0B0B" : "#FAF7F2";
    document.body.dataset.theme = theme;
  }, [theme, adopted]);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("tw-theme", next);
      } catch {
        /* private mode / blocked storage — theme just won't persist */
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
