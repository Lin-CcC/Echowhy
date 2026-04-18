import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "dark" | "light";
export type Mode = "dynamic" | "focus";

type ThemeModeContextValue = {
  theme: Theme;
  mode: Mode;
  setTheme: (theme: Theme) => void;
  setMode: (mode: Mode) => void;
  toggleTheme: () => void;
  toggleMode: () => void;
};

const THEME_STORAGE_KEY = "echowhy-theme";
const MODE_STORAGE_KEY = "echowhy-mode";

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mode, setMode] = useState<Mode>("dynamic");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const storedMode = window.localStorage.getItem(MODE_STORAGE_KEY);

    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
      applyThemeToDocument(storedTheme);
    } else {
      applyThemeToDocument("dark");
    }

    if (storedMode === "dynamic" || storedMode === "focus") {
      setMode(storedMode);
    }
  }, []);

  useEffect(() => {
    applyThemeToDocument(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(MODE_STORAGE_KEY, mode);
  }, [mode]);

  const value = useMemo(
    () => ({
      theme,
      mode,
      setTheme,
      setMode,
      toggleTheme: () =>
        setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark")),
      toggleMode: () =>
        setMode((prevMode) => (prevMode === "dynamic" ? "focus" : "dynamic")),
    }),
    [theme, mode],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within ThemeProvider");
  }

  return context;
}
