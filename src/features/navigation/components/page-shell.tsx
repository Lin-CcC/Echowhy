import { useEffect, useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useThemeMode } from "@/app/theme/theme-provider";
import { Moon, Sparkles, Sun, Target } from "lucide-react";

const navItems = [
  { to: "/", label: "Start" },
  { to: "/library", label: "Library" },
  { to: "/review", label: "Review" },
] as const;

export function PageShell() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isStartPage = pathname === "/";
  const [headerVisible, setHeaderVisible] = useState(pathname !== "/");
  const { theme, mode, toggleTheme, toggleMode } = useThemeMode();

  useEffect(() => {
    if (pathname !== "/") {
      setHeaderVisible(true);
      return;
    }

    setHeaderVisible(false);

    const timeoutId = window.setTimeout(() => {
      setHeaderVisible(true);
    }, 3500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pathname]);

  return (
    <div
      className={cn(
        "min-h-screen",
        isStartPage ? "px-0 py-0" : "px-4 py-4 sm:px-6",
      )}
    >
      <div
        className={cn(
          "mx-auto flex flex-col",
          isStartPage
            ? "min-h-screen max-w-none"
            : "min-h-[calc(100vh-2rem)] max-w-7xl",
        )}
      >
        <header
          className={cn(
            "z-20 flex items-center justify-between px-1 py-3 transition-all duration-700 sm:px-2",
            isStartPage
              ? "absolute inset-x-0 top-0 px-6 py-6 sm:px-8"
              : "sticky top-4",
            headerVisible
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-6 opacity-0",
          )}
        >
          <div>
            <span className="text-[10px] uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">
              Echowhy
            </span>
            <h1 className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-50 sm:text-base">
              Question-driven learning
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center gap-1 p-1 rounded-full border transition-colors duration-300 backdrop-blur-md",
                theme === "dark"
                  ? "border-white/10 bg-white/5"
                  : "border-slate-200 bg-slate-900/5",
              )}
            >
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle light and dark theme"
                className={cn(
                  "p-2 rounded-full text-slate-400 hover:text-cyan-600 hover:bg-cyan-500/10 transition-colors duration-300",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40",
                  "dark:text-slate-400",
                  theme === "light" ? "text-cyan-600" : "",
                )}
              >
                {theme === "dark" ? (
                  <Moon size={16} aria-hidden="true" />
                ) : (
                  <Sun size={16} aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                onClick={toggleMode}
                aria-label="Toggle dynamic and focus mode"
                className={cn(
                  "p-2 rounded-full text-slate-400 hover:text-cyan-600 hover:bg-cyan-500/10 transition-colors duration-300",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40",
                  "dark:text-slate-400",
                  mode === "focus" ? "text-cyan-600" : "",
                )}
              >
                {mode === "focus" ? (
                  <Target size={16} aria-hidden="true" />
                ) : (
                  <Sparkles size={16} aria-hidden="true" />
                )}
              </button>
            </div>

            <nav className="flex items-center gap-2 bg-transparent p-1">
              {navItems.map((item) => {
                const active =
                  item.to === "/"
                    ? pathname === item.to
                    : pathname.startsWith(item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "rounded-full px-3 py-2 text-sm text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100",
                      active && "text-slate-800 dark:text-slate-50",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        <main
          className={cn(
            "flex-1",
            isStartPage ? "px-0 py-0" : "px-1 py-6 sm:px-2 sm:py-8",
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
