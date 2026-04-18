import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "@/app/router";
import { ThemeProvider } from "@/app/theme/theme-provider";
import "@/styles/globals.css";

const queryClient = new QueryClient();

const rootElement = document.getElementById("root");

const storedTheme = window.localStorage.getItem("echowhy-theme");
if (storedTheme === "light" || storedTheme === "dark") {
  document.documentElement.classList.toggle("dark", storedTheme === "dark");
  document.documentElement.style.colorScheme = storedTheme;
} else {
  document.documentElement.classList.add("dark");
  document.documentElement.style.colorScheme = "dark";
}

if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
