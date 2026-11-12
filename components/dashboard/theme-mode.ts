"use client";
import { useTheme } from "@/lib/theme";

// Thin adapter over the app's ThemeProvider (@/lib/theme, storage key "easybills-theme"),
// so the dashboard toggle and Preferences page share one source of truth with the landing site.
export function useThemeMode() {
  const { theme, setTheme } = useTheme();
  return { mode: theme, setMode: setTheme };
}
