import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { QuestionEntry } from "@/features/start-entry/components/question-entry";
import { guidedQuestions } from "@/mock/data/guided-questions";
import { cn } from "@/lib/utils";
import { useThemeMode } from "@/app/theme/theme-provider";

const wakeLine = "Echowhy, emm?";
const bubblePlacements = [
  "left-1/2 top-[12%] -translate-x-1/2",
  "right-[8%] top-[42%]",
  "left-[8%] top-[46%]",
] as const;

export function StartPage() {
  const { theme, mode } = useThemeMode();
  const navigate = useNavigate();
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [isAwake, setIsAwake] = useState(false);
  const [textVisible, setTextVisible] = useState(true);
  const constellationCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const constellationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const textTimer = window.setTimeout(() => {
      setTextVisible(false);
    }, 2800);

    const awakeTimer = window.setTimeout(() => {
      setIsAwake(true);
    }, 2850);

    return () => {
      window.clearTimeout(textTimer);
      window.clearTimeout(awakeTimer);
    };
  }, []);

  const goToTopic = (topicId: string) => {
    void navigate({ to: "/topic/$id", params: { id: topicId } });
  };

  const showGuidedPaths = isAwake && Boolean(sourceId) && mode === "dynamic";

  const questionBubbleVariants = useMemo(
    () => ({
      hidden: { opacity: 0, scale: 0.94, y: 14 },
      visible: (index: number) => ({
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          delay: 0.18 * index,
          duration: 0.78,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      }),
    }),
    [],
  );

  const isDarkDynamic = theme === "dark" && mode === "dynamic";
  const isLightDynamic = theme === "light" && mode === "dynamic";

  useEffect(() => {
    if (!isLightDynamic) {
      if (constellationFrameRef.current != null) {
        window.cancelAnimationFrame(constellationFrameRef.current);
        constellationFrameRef.current = null;
      }
      return;
    }

    const canvas = constellationCanvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const nodeCount = Math.floor(Math.random() * 7) + 18; // 18-24
    const maxDistance = 300;

    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
    }> = [];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const width = () => canvas.clientWidth;
    const height = () => canvas.clientHeight;

    for (let i = 0; i < nodeCount; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.15 + Math.random() * 0.3; // px/s, < 0.5
      nodes.push({
        x: Math.random() * width(),
        y: Math.random() * height(),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 1.6 + Math.random() * 1.2,
      });
    }

    let lastTs = performance.now();

    const render = (ts: number) => {
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;

      const w = width();
      const h = height();

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < nodes.length; i += 1) {
        const n = nodes[i];

        n.x += n.vx * dt;
        n.y += n.vy * dt;

        if (n.x <= 0 || n.x >= w) {
          n.vx *= -1;
          n.x = Math.min(w, Math.max(0, n.x));
        }
        if (n.y <= 0 || n.y >= h) {
          n.vy *= -1;
          n.y = Math.min(h, Math.max(0, n.y));
        }
      }

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDistance) {
            const t = 1 - dist / maxDistance;
            const alpha = Math.pow(t, 1.05) * 0.42;
            ctx.strokeStyle = `rgba(100,116,139,${alpha.toFixed(4)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < nodes.length; i += 1) {
        const n = nodes[i];
        ctx.fillStyle = "rgba(100,116,139,0.95)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      constellationFrameRef.current = window.requestAnimationFrame(render);
    };

    constellationFrameRef.current = window.requestAnimationFrame(render);
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      if (constellationFrameRef.current != null) {
        window.cancelAnimationFrame(constellationFrameRef.current);
        constellationFrameRef.current = null;
      }
    };
  }, [isLightDynamic]);

  return (
    <section className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 dark:bg-transparent">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          theme === "dark" ? "bg-[#020308]" : "bg-slate-50",
        )}
      />

      {isDarkDynamic ? (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <motion.div
            className="absolute -left-[10%] -top-[30%] h-[80vw] w-[80vw] rounded-full bg-indigo-900/10 blur-[160px] mix-blend-screen"
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-[30%] -right-[10%] h-[70vw] w-[70vw] rounded-full bg-cyan-900/10 blur-[160px] mix-blend-screen"
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
          <motion.div
            className="absolute -inset-full opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(1px 1px at 10% 10%, #fff, transparent), radial-gradient(1px 1px at 40% 60%, #fff, transparent), radial-gradient(1px 1px at 80% 30%, #fff, transparent)",
              backgroundSize: "150px 150px",
            }}
            animate={{ y: ["0%", "-30%"], opacity: [0.2, 0.5, 0.2] }}
            transition={{
              y: { duration: 150, repeat: Infinity, ease: "linear" },
              opacity: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            }}
          />
          <motion.div
            className="absolute -inset-full opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(1.5px 1.5px at 20% 80%, #cbd5e1, transparent), radial-gradient(1.5px 1.5px at 70% 20%, #fff, transparent)",
              backgroundSize: "250px 250px",
            }}
            animate={{ y: ["0%", "-40%"], opacity: [0.1, 0.8, 0.1] }}
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
            className="absolute -inset-full opacity-45"
            style={{
              backgroundImage:
                "radial-gradient(2px 2px at 15% 35%, #ffffff, transparent), radial-gradient(2px 2px at 55% 75%, #dbeafe, transparent)",
              backgroundSize: "360px 360px",
            }}
            animate={{ y: ["0%", "-52%"], opacity: [0.12, 0.7, 0.12] }}
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
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <canvas
            ref={constellationCanvasRef}
            className="absolute inset-0 h-full w-full"
          />

          <div
            className="absolute inset-0 z-[-1]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(148,163,184,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.02) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>
      ) : null}

      {mode === "dynamic" ? (
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 rounded-full"
          style={{
            background:
              theme === "dark"
                ? "radial-gradient(circle, rgba(200,240,255,0.08) 0%, rgba(6,182,212,0) 70%)"
                : "radial-gradient(circle, rgba(14,165,233,0) 0%, rgba(14,165,233,0) 70%)",
            transform: "translate(-50%, -50%)",
          }}
          initial={{ width: 0, height: 0, opacity: 0 }}
          animate={
            isAwake ? { width: "200vw", height: "200vw", opacity: 1 } : {}
          }
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      ) : null}

      <AnimatePresence>
        {textVisible && mode === "dynamic" ? (
          <motion.div
            key="wake-text"
            className={cn(
              "pointer-events-none absolute left-1/2 top-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 text-2xl font-light tracking-[0.08em] sm:text-4xl",
              theme === "dark" ? "text-slate-100" : "text-slate-700",
            )}
            initial={{ opacity: 1, filter: "blur(0px)", scale: 1, y: 0 }}
            exit={{ opacity: 0, filter: "blur(20px)", scale: 2.8, y: -40 }}
            transition={{ duration: 0.35, ease: [0.7, 0, 1, 1] }}
          >
            {wakeLine.split("").map((char, index) => (
              <motion.span
                key={`${char}-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.05, delay: 0.5 + index * 0.1 }}
              >
                {char}
              </motion.span>
            ))}

            {!isAwake ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0, 1, 0] }}
                transition={{
                  duration: 0.8,
                  delay: 0.5 + wakeLine.length * 0.1,
                }}
                className={cn(
                  "ml-1 h-7 w-0.5 self-center",
                  theme === "dark" ? "bg-white/70" : "bg-slate-500",
                )}
              />
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        className="relative z-20 flex w-full max-w-6xl flex-col items-center justify-center px-4 py-10 sm:px-6"
        initial={{ opacity: 0, scale: 0.85, filter: "blur(15px)" }}
        animate={isAwake ? { opacity: 1, scale: 1, filter: "blur(0px)" } : {}}
        transition={{
          duration: 1.2,
          ease: [0.19, 1, 0.22, 1],
          delay: 0.05,
        }}
      >
        <div className="relative flex min-h-136 w-full items-center justify-center">
          {mode === "dynamic"
            ? guidedQuestions.map((question, index) => (
                <motion.button
                  key={question.id}
                  type="button"
                  custom={index}
                  variants={questionBubbleVariants}
                  initial="hidden"
                  animate={showGuidedPaths ? "visible" : "hidden"}
                  onClick={() => goToTopic(question.topicId)}
                  className={cn(
                    "absolute max-w-68 rounded-full px-5 py-3 text-left text-sm leading-6 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1",
                    theme === "dark"
                      ? "bg-white/5 text-slate-100 shadow-[0_14px_50px_rgba(2,6,23,0.16)] hover:bg-white/8"
                      : "bg-white/70 text-slate-700 shadow-[0_14px_50px_rgba(15,23,42,0.08)] hover:bg-white/85",
                    "animate-float-drift",
                    bubblePlacements[index],
                  )}
                  style={{ animationDelay: `${index * 0.9}s` }}
                >
                  <span className="block text-[10px] uppercase tracking-[0.24em] text-slate-400">
                    guided path
                  </span>
                  <span className="mt-2 block">{question.label}</span>
                </motion.button>
              ))
            : null}

          <div className="relative flex w-full flex-col items-center justify-center gap-12 text-center">
            <h2
              className={cn(
                "text-2xl font-extralight tracking-[0.08em] sm:text-3xl",
                theme === "dark"
                  ? "text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  : "text-slate-800",
              )}
            >
              What are you trying to understand?
            </h2>

            <div className="relative flex flex-col items-center">
              {isDarkDynamic ? (
                <div className="pointer-events-none absolute left-1/2 top-[58%] z-0 h-52 w-[95vw] -translate-x-1/2 -translate-y-1/2 sm:h-60 sm:w-200">
                  <div className="absolute left-1/2 top-1/2 h-14 w-68 -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-cyan-300/14 blur-[34px] sm:h-16 sm:w-100 sm:blur-2xl" />

                  <motion.div
                    className="absolute left-[36%] top-[40%] h-[6.8rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-[100%] bg-indigo-600/23 blur-[52px] sm:h-32 sm:w-md sm:blur-[60px]"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.28, 0.58, 0.28],
                    }}
                    transition={{
                      duration: 7,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  <motion.div
                    className="absolute left-[65%] top-[60%] h-32 w-80 -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-[100%] bg-cyan-700/20 blur-[60px] sm:h-40 sm:w-120 sm:blur-[70px]"
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.35, 0.68, 0.35],
                    }}
                    transition={{
                      duration: 5.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.4,
                    }}
                  />

                  <div className="absolute left-1/2 top-[76%] h-24 w-92 -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-blue-900/28 blur-[62px] sm:h-32 sm:w-180 sm:blur-[80px]" />
                </div>
              ) : null}

              <div className="relative z-10">
                <QuestionEntry
                  theme={theme}
                  onSubmit={() => goToTopic("topic-login-jwt")}
                  onAttachSource={
                    !sourceId ? () => setSourceId("source-rbac") : undefined
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
