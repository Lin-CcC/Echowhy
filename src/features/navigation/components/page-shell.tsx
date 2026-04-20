import { useEffect, useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useThemeMode } from "@/app/theme/theme-provider";
import { Moon, Sparkles, Sun, Target } from "lucide-react";
import { ThemedAmbientBackground } from "@/components/ui/themed-ambient-background";

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
  const isStartFlowPage =
    pathname === "/" || pathname.startsWith("/topic/") || pathname.startsWith("/ladder/");
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
    <div className="relative min-h-screen w-full">
      {!isStartPage ? <ThemedAmbientBackground quiet /> : null}

      <div className="relative z-10 flex min-h-screen w-full flex-col">
        <header
          className={cn(
            "z-30 flex items-center justify-between transition-all duration-700",
            isStartPage
              ? "absolute inset-x-0 top-0 px-6 py-6 sm:px-8"
              : "fixed inset-x-0 top-0 h-20 px-6 py-4 sm:px-8",
            headerVisible
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-6 opacity-0",
          )}
        >
          <div>
            <span className="text-[10px] uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">
              Echowhy
            </span>
            <h1 className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200 sm:text-base">
              Question-driven learning
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center gap-1 rounded-full border p-1 transition-colors duration-300 backdrop-blur-xl",
                theme === "dark"
                  ? "border-white/10 bg-white/5"
                  : "border-slate-200/60 bg-white/28 shadow-[0_8px_24px_-18px_rgba(148,163,184,0.4)]",
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
                    ? isStartFlowPage
                    : pathname.startsWith(item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "rounded-full border border-transparent px-3 py-2 text-sm text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100",
                      active &&
                        "border-white/70 text-slate-800 dark:border-white/22 dark:text-slate-100",
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
            "relative z-10 flex-1 w-full",
            isStartPage ? "px-0 py-0" : "px-0 py-0 pt-20",
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
