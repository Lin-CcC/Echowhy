import { motion, useReducedMotion } from "framer-motion";
import { useThemeMode } from "@/app/theme/theme-provider";
import { cn } from "@/lib/utils";

const lightLabelItems = [
  {
    label: "phi = 1.618",
    lineClass:
      "absolute left-[5rem] top-[7.15rem] h-px w-[6.5rem] bg-gradient-to-r from-slate-500/72 to-transparent",
    textClass:
      "absolute left-[4.8rem] top-[6.3rem] px-1 text-[10px] font-mono tracking-[0.12em] text-slate-500/80 [text-shadow:0_1px_8px_rgba(248,250,252,0.9)]",
  },
  {
    label: "theta = pi/2",
    lineClass:
      "absolute right-[6rem] top-[7.9rem] h-px w-[5.3rem] bg-gradient-to-l from-slate-500/68 to-transparent",
    textClass:
      "absolute right-[5.8rem] top-[6.95rem] px-1 text-[10px] font-mono tracking-[0.12em] text-slate-500/80 [text-shadow:0_1px_8px_rgba(248,250,252,0.9)]",
  },
  {
    label: "r = 4.0u",
    lineClass:
      "absolute left-[4rem] bottom-[6.95rem] h-px w-[5rem] bg-gradient-to-r from-slate-500/68 to-transparent",
    textClass:
      "absolute left-[3.85rem] bottom-[7.85rem] px-1 text-[10px] font-mono tracking-[0.12em] text-slate-500/78 [text-shadow:0_1px_8px_rgba(248,250,252,0.88)]",
  },
  {
    label: "lim x->inf",
    lineClass:
      "absolute right-[7rem] bottom-[9.95rem] h-px w-[5.4rem] bg-gradient-to-l from-slate-500/68 to-transparent",
    textClass:
      "absolute right-[6.85rem] bottom-[10.95rem] px-1 text-[10px] font-mono tracking-[0.12em] text-slate-500/78 [text-shadow:0_1px_8px_rgba(248,250,252,0.88)]",
  },
] as const;

type ThemedAmbientBackgroundProps = {
  className?: string;
  showLightDynamicAnnotations?: boolean;
  showLightDynamicCenterMask?: boolean;
  quiet?: boolean;
};

export function ThemedAmbientBackground({
  className,
  showLightDynamicAnnotations = false,
  showLightDynamicCenterMask = false,
  quiet = false,
}: ThemedAmbientBackgroundProps) {
  const { theme, mode } = useThemeMode();
  const prefersReducedMotion = useReducedMotion();

  const isDarkDynamic = theme === "dark" && mode === "dynamic";
  const isLightDynamic = theme === "light" && mode === "dynamic";

  return (
    <div className={cn("pointer-events-none fixed inset-0 z-0 overflow-hidden bg-fixed", className)}>
      <div
        className={cn(
          "absolute inset-0",
          theme === "dark" ? "bg-[#020308]" : "bg-slate-50",
        )}
      />

      {isDarkDynamic ? (
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className={cn("absolute -inset-full", quiet ? "opacity-18" : "opacity-30")}
            style={{
              backgroundImage:
                "radial-gradient(1px 1px at 10% 10%, #fff, transparent), radial-gradient(1px 1px at 40% 60%, #fff, transparent), radial-gradient(1px 1px at 80% 30%, #fff, transparent)",
              backgroundSize: "150px 150px",
            }}
            animate={{ y: ["0%", "-30%"], opacity: quiet ? [0.12, 0.28, 0.12] : [0.2, 0.5, 0.2] }}
            transition={{
              y: { duration: 150, repeat: Infinity, ease: "linear" },
              opacity: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            }}
          />
          <motion.div
            className={cn("absolute -inset-full", quiet ? "opacity-24" : "opacity-40")}
            style={{
              backgroundImage:
                "radial-gradient(1.5px 1.5px at 20% 80%, #cbd5e1, transparent), radial-gradient(1.5px 1.5px at 70% 20%, #fff, transparent)",
              backgroundSize: "250px 250px",
            }}
            animate={{ y: ["0%", "-40%"], opacity: quiet ? [0.08, 0.32, 0.08] : [0.1, 0.8, 0.1] }}
            transition={{
              y: { duration: 100, repeat: Infinity, ease: "linear" },
              opacity: {
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              },
            }}
          />
          <motion.div
            className={cn("absolute -inset-full", quiet ? "opacity-22" : "opacity-45")}
            style={{
              backgroundImage:
                "radial-gradient(2px 2px at 15% 35%, #ffffff, transparent), radial-gradient(2px 2px at 55% 75%, #dbeafe, transparent)",
              backgroundSize: "360px 360px",
            }}
            animate={{ y: ["0%", "-52%"], opacity: quiet ? [0.08, 0.28, 0.08] : [0.12, 0.7, 0.12] }}
            transition={{
              y: { duration: 72, repeat: Infinity, ease: "linear" },
              opacity: {
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
              },
            }}
          />
        </div>
      ) : null}

      {isLightDynamic ? (
        <div className="absolute inset-0 overflow-hidden opacity-100">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(71,85,105,0.02) 1px, transparent 0)",
              backgroundSize: "92px 92px",
            }}
          />

          <div
            className="absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2"
            style={{
              background:
                quiet
                  ? "radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)"
                  : "radial-gradient(ellipse at center, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 70%)",
            }}
          />

          <div
            className={cn(
              "absolute right-[12rem] top-[3rem] h-64 w-64 rounded-full blur-[110px]",
              quiet ? "bg-cyan-400/4" : "bg-cyan-400/6",
            )}
          />

          <motion.svg
            viewBox="0 0 1440 900"
            className="absolute left-0 top-0 h-full w-full overflow-visible"
            fill="none"
            animate={
              prefersReducedMotion
                ? {}
                : { opacity: quiet ? [0.1, 0.16, 0.1] : [0.22, 0.34, 0.22] }
            }
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          >
            <defs>
              <linearGradient
                id="main-axis-gradient"
                x1="120"
                y1="760"
                x2="1320"
                y2="150"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="rgba(100,116,139,0)" />
                <stop offset="18%" stopColor="rgba(100,116,139,0.12)" />
                <stop offset="50%" stopColor="rgba(100,116,139,0.22)" />
                <stop offset="82%" stopColor="rgba(100,116,139,0.12)" />
                <stop offset="100%" stopColor="rgba(100,116,139,0)" />
              </linearGradient>
            </defs>
            <motion.path
              d="M 60 760 C 360 640, 640 470, 900 330 S 1230 180, 1380 120"
              stroke="url(#main-axis-gradient)"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeDasharray="1 5"
              animate={prefersReducedMotion ? {} : { strokeDashoffset: [0, -180] }}
              transition={{ duration: 112, repeat: Infinity, ease: "linear" }}
            />
          </motion.svg>

          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(78% 74% at 16% 22%, rgba(191,219,254,0.22) 0%, rgba(191,219,254,0.06) 26%, rgba(248,250,252,0) 58%), radial-gradient(84% 76% at 84% 18%, rgba(125,211,252,0.18) 0%, rgba(125,211,252,0.05) 24%, rgba(248,250,252,0) 56%), radial-gradient(70% 66% at 76% 74%, rgba(199,210,254,0.12) 0%, rgba(199,210,254,0.04) 24%, rgba(248,250,252,0) 54%)",
            }}
            animate={{ opacity: quiet ? [0.66, 0.74, 0.68] : [0.92, 1, 0.94] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          />

          <div
            className={cn(
              "absolute inset-0",
              showLightDynamicCenterMask
                ? "mask-[radial-gradient(circle_at_50%_53%,transparent_0_150px,black_230px_100%)] [mask-image:radial-gradient(circle_at_50%_53%,transparent_0_150px,black_230px_100%)] [-webkit-mask-image:radial-gradient(circle_at_50%_53%,transparent_0_150px,black_230px_100%)]"
                : "",
            )}
          >
            <motion.div
              className="absolute inset-0"
              style={{ transformOrigin: "18% 22%" }}
              animate={prefersReducedMotion ? {} : { rotate: [0, 360] }}
              transition={{ duration: 260, repeat: Infinity, ease: "linear" }}
            >
              <motion.div
                className="absolute -left-[14rem] -top-[10rem] h-[38rem] w-[38rem] rounded-full border border-slate-500/40 shadow-[0_0_0_1px_rgba(148,163,184,0.08)]"
                animate={
                  prefersReducedMotion
                    ? {}
                    : { scale: [1, 1.016, 1], opacity: [0.34, 0.56, 0.34] }
                }
                transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute -left-[8rem] top-[5rem] h-[26rem] w-[26rem] rounded-full border border-slate-500/30"
                animate={
                  prefersReducedMotion
                    ? {}
                    : { scale: [1, 1.012, 1], opacity: [0.24, 0.42, 0.24] }
                }
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.6,
                }}
              />
              <motion.div
                className={cn(
                  "absolute left-[4rem] top-[6rem] h-px w-[22rem] origin-left bg-gradient-to-r from-slate-500/70 via-slate-500/26 to-transparent",
                  quiet && "hidden",
                )}
                animate={
                  prefersReducedMotion
                    ? {}
                    : { opacity: [0.42, 0.62, 0.42], scaleX: [0.98, 1.02, 0.98] }
                }
                transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>

            <motion.div
              className="absolute inset-0"
              style={{ transformOrigin: "84% 18%" }}
              animate={prefersReducedMotion ? {} : { rotate: [0, -360] }}
              transition={{ duration: 300, repeat: Infinity, ease: "linear" }}
            >
              <motion.div
                className="absolute -right-[12rem] top-[8rem] h-[34rem] w-[34rem] rounded-full border border-slate-500/38 shadow-[0_0_0_1px_rgba(148,163,184,0.06)]"
                animate={
                  prefersReducedMotion
                    ? {}
                    : { scale: [1, 1.016, 1], opacity: [0.32, 0.52, 0.32] }
                }
                transition={{
                  duration: 24,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8,
                }}
              />
              <motion.div
                className="absolute right-[4rem] top-[2rem] h-[24rem] w-[24rem] rounded-full border border-slate-500/28"
                animate={
                  prefersReducedMotion
                    ? {}
                    : { scale: [1, 1.014, 1], opacity: [0.22, 0.38, 0.22] }
                }
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2.8,
                }}
              />
              <motion.div
                className={cn(
                  "absolute right-[6rem] bottom-[8rem] h-px w-[18rem] origin-right bg-gradient-to-l from-slate-500/66 via-slate-500/24 to-transparent",
                  quiet && "hidden",
                )}
                animate={
                  prefersReducedMotion
                    ? {}
                    : { opacity: [0.4, 0.58, 0.4], scaleX: [0.98, 1.03, 0.98] }
                }
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5,
                }}
              />
            </motion.div>

            {!quiet ? (
              <svg
                viewBox="0 0 560 360"
                className="absolute left-0 top-0 h-full w-full overflow-visible"
                fill="none"
              >
                <motion.path
                  d="M 52 146 C 136 108, 212 88, 308 84"
                  stroke="rgba(100,116,139,0.36)"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  strokeDasharray="4 20 12 20"
                  animate={prefersReducedMotion ? {} : { strokeDashoffset: [0, -180] }}
                  transition={{ duration: 72, repeat: Infinity, ease: "linear" }}
                />
                <motion.path
                  d="M 510 118 C 470 126, 432 144, 384 178"
                  stroke="rgba(100,116,139,0.32)"
                  strokeWidth="0.75"
                  strokeLinecap="round"
                  strokeDasharray="4 20 12 20"
                  animate={prefersReducedMotion ? {} : { strokeDashoffset: [0, 150] }}
                  transition={{ duration: 64, repeat: Infinity, ease: "linear" }}
                />
              </svg>
            ) : null}

            {showLightDynamicAnnotations
              ? lightLabelItems.map((item) => (
                  <div key={item.label}>
                    <div className={item.lineClass} />
                    <div className={item.textClass}>{item.label}</div>
                  </div>
                ))
              : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
