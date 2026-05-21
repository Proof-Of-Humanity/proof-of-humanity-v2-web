"use client";

/**
 * The application is dark-mode only, so this is always true.
 * Kept as a hook so existing consumers don't need to change.
 */
export function useIsDarkMode(): boolean {
  return true;
}
