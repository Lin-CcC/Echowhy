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
  { to: "/analyze", label: "Analyze" },
] as const;

const startWakeSessionKey = "echowhy:start-wake-played";

function hasPlayedStartWake() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.sessionStorage.getItem(startWakeSessionKey) === "true";
  } catch {
    return false;
  }
}

export function PageShell() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isStartPage = pathname === "/";
  const isStartFlowPage =
    pathname === "/" || pathname.startsWith("/topic/") || pathname.startsWith("/ladder/");
  const [headerVisible, setHeaderVisible] = useState(
    () => pathname !== "/" || hasPlayedStartWake(),
  );
  const { theme, mode, toggleTheme, toggleMode } = useThemeMode();

  useEffect(() => {
    if (pathname !== "/") {
      setHeaderVisible(true);
      return;
    }

    if (hasPlayedStartWake()) {
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
              : "fixed inset-x-0 top-0 h-14 px-5 py-2.5 sm:px-6",
            headerVisible
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-6 opacity-0",
          )}
        >
          <div>
            <span className="text-[9px] uppercase tracking-[0.34em] text-slate-500 dark:text-slate-400">
              Echowhy
            </span>
            <h1 className="mt-0.5 text-[12px] font-medium text-slate-800 dark:text-slate-200 sm:text-[13px]">
              Question-driven learning
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center gap-0.5 rounded-[1rem] border p-0.5 transition-colors duration-300 backdrop-blur-xl",
                theme === "dark"
                  ? "border-white/10 bg-white/5"
                  : "border-slate-200/65 bg-white/24 shadow-[0_8px_24px_-18px_rgba(148,163,184,0.32)]",
              )}
            >
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle light and dark theme"
                className={cn(
                  "rounded-[0.8rem] p-1.5 text-slate-400 transition-colors duration-300 hover:bg-cyan-500/8 hover:text-cyan-600",
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
                  "rounded-[0.8rem] p-1.5 text-slate-400 transition-colors duration-300 hover:bg-cyan-500/8 hover:text-cyan-600",
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

            <nav className="flex items-center gap-4 bg-transparent">
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
                      "border-b border-transparent px-1 py-1 text-[13px] text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 sm:text-sm",
                      active &&
                        "border-slate-300/85 text-slate-800 dark:border-white/18 dark:text-slate-100",
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
            isStartPage ? "px-0 py-0" : "px-0 py-0 pt-14",
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
