"use client";

import { useEffect, useState } from "react";

/**
 * Returns true if dark mode is active.
 * Source of truth: localStorage.theme === "dark"; falls back to `<html>.classList`.
 * Reacts to runtime changes by observing the html class attribute.
 */
export function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(false);

  const readIsDark = () => {
    try {
      const theme = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
      if (theme === "dark") return true;
      if (typeof document !== "undefined") {
        return document.documentElement.classList.contains("dark");
      }
    } catch {}
    return false;
  };

  useEffect(() => {
    setIsDark(readIsDark());
    if (typeof document === "undefined") return;
    const observer = new MutationObserver(() => setIsDark(readIsDark()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}


