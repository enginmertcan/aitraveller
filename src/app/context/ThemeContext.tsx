"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createTheme, ThemeProvider as MUIThemeProvider } from "@mui/material";

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
      primary: {
        main: "#2563eb",
      },
      secondary: {
        main: "#7c3aed",
      },
      background: {
        default: isDarkMode ? "#121212" : "#f3f4f6",
        paper: isDarkMode ? "#1e1e1e" : "#ffffff",
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? "rgba(30, 30, 30, 0.8)" : "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? "rgba(30, 30, 30, 0.8)" : "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
          },
        },
      },
    },
  });

  const toggleTheme = () => {
    setIsDarkMode((prev: boolean) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <MUIThemeProvider theme={theme}>{children}</MUIThemeProvider>
    </ThemeContext.Provider>
  );
}
