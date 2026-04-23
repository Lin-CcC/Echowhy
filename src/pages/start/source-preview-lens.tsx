import { useEffect, useRef, useState, type PointerEvent } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function canPreviewAsText(file: File) {
  const textExtensions = [
    ".css",
    ".csv",
    ".html",
    ".java",
    ".js",
    ".json",
    ".jsx",
    ".md",
    ".py",
    ".sql",
    ".svg",
    ".ts",
    ".tsx",
    ".txt",
    ".xml",
    ".yaml",
    ".yml",
  ];
  const lowerName = file.name.toLowerCase();

  return (
    file.type.startsWith("text/") ||
    file.type.includes("json") ||
    file.type.includes("xml") ||
    textExtensions.some((extension) => lowerName.endsWith(extension))
  );
}

type SourcePreviewLensProps = {
  files: File[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onClose: () => void;
  theme: "light" | "dark";
};

export function SourcePreviewLens({
  files,
  activeIndex,
  onActiveIndexChange,
  onClose,
  theme,
}: SourcePreviewLensProps) {
  const activeFile = files[activeIndex] ?? files[0];
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [textPreview, setTextPreview] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [panelOffset, setPanelOffset] = useState({ x: 0, y: 0 });
  const dragCleanupRef = useRef<(() => void) | null>(null);
  const isImage = activeFile?.type.startsWith("image/");
  const isText = activeFile ? canPreviewAsText(activeFile) : false;

  function handleDragStart(event: PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button")) {
      return;
    }

    event.preventDefault();
    dragCleanupRef.current?.();

    const startPointerX = event.clientX;
    const startPointerY = event.clientY;
    const startPanelX = panelOffset.x;
    const startPanelY = panelOffset.y;

    document.body.style.cursor = "move";
    document.body.style.userSelect = "none";

    function handlePointerMove(pointerEvent: globalThis.PointerEvent) {
      setPanelOffset({
        x: startPanelX + pointerEvent.clientX - startPointerX,
        y: startPanelY + pointerEvent.clientY - startPointerY,
      });
    }

    function cleanupDrag() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", cleanupDrag);
      window.removeEventListener("pointercancel", cleanupDrag);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      dragCleanupRef.current = null;
    }

    dragCleanupRef.current = cleanupDrag;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", cleanupDrag);
    window.addEventListener("pointercancel", cleanupDrag);
  }

  useEffect(() => {
    if (!activeFile) {
      return;
    }

    let isDisposed = false;
    let objectUrl: string | null = null;
    setImageUrl(null);
    setTextPreview(null);
    setPreviewError(null);

    if (activeFile.type.startsWith("image/")) {
      objectUrl = URL.createObjectURL(activeFile);
      setImageUrl(objectUrl);
    } else if (canPreviewAsText(activeFile)) {
      void activeFile
        .text()
        .then((content) => {
          if (!isDisposed) {
            setTextPreview(content);
          }
        })
        .catch(() => {
          if (!isDisposed) {
            setPreviewError("This file cannot be previewed as text.");
          }
        });
    }

    return () => {
      isDisposed = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [activeFile]);

  useEffect(() => () => dragCleanupRef.current?.(), []);

  if (!activeFile) {
    return null;
  }

  const canGoPrevious = activeIndex > 0;
  const canGoNext = activeIndex < files.length - 1;

  return (
    <motion.div
      key="source-preview-lens"
      initial={{ opacity: 0, scale: 0.985, filter: "blur(10px)" }}
      animate={{
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
      }}
      exit={{ opacity: 0, scale: 0.985, filter: "blur(10px)" }}
      transition={{
        opacity: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
        scale: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
        filter: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
      }}
      className={cn(
        "fixed right-[5.8vw] top-[18vh] z-50 flex h-[min(30rem,58vh)] min-h-[18rem] w-[min(27rem,28vw)] min-w-[21rem] resize overflow-hidden rounded-none border px-4 py-3 text-left backdrop-blur-xl max-lg:left-1/2 max-lg:right-auto max-lg:top-[62%] max-lg:h-[min(28rem,48vh)] max-lg:w-[min(34rem,86vw)] max-lg:-translate-x-1/2",
        theme === "dark"
          ? "border-white/[0.025] bg-slate-950/12 text-slate-300 shadow-[0_18px_64px_-62px_rgba(0,0,0,0.74)]"
          : "border-white/20 bg-white/[0.18] text-slate-600 shadow-[0_18px_68px_-66px_rgba(15,23,42,0.22)]",
      )}
      style={{
        maxHeight: "76vh",
        maxWidth: "90vw",
        x: panelOffset.x,
        y: panelOffset.y,
      }}
    >
      <motion.div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0",
          theme === "dark" ? "bg-slate-800/10" : "bg-white/12",
        )}
        animate={{ opacity: [0.24, 0.42, 0.24] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          className="mb-2 flex cursor-move touch-none select-none items-start justify-between gap-4"
          onPointerDown={handleDragStart}
        >
          <div className="min-w-0">
            <p
              className={cn(
                "truncate text-[12px] font-semibold tracking-wide",
                theme === "dark" ? "text-slate-100/95" : "text-slate-800/95",
              )}
            >
              {activeFile.name}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-slate-400">
              {formatFileSize(activeFile.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "text-[10px] uppercase tracking-[0.28em] transition-colors",
              theme === "dark"
                ? "text-slate-400 hover:text-slate-100"
                : "text-slate-500 hover:text-slate-800",
            )}
          >
            Close
          </button>
        </div>

        <div
          className={cn(
            "mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-slate-400",
            files.length === 1 && "justify-end",
          )}
        >
          {files.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => onActiveIndexChange(Math.max(activeIndex - 1, 0))}
                disabled={!canGoPrevious}
                className={cn(
                  "transition-colors disabled:cursor-not-allowed disabled:opacity-35",
                  theme === "dark"
                    ? "hover:text-slate-100"
                    : "hover:text-slate-700",
                )}
              >
                Prev
              </button>
              <span>{`${activeIndex + 1}/${files.length}`}</span>
              <button
                type="button"
                onClick={() =>
                  onActiveIndexChange(
                    Math.min(activeIndex + 1, files.length - 1),
                  )
                }
                disabled={!canGoNext}
                className={cn(
                  "transition-colors disabled:cursor-not-allowed disabled:opacity-35",
                  theme === "dark"
                    ? "hover:text-slate-100"
                    : "hover:text-slate-700",
                )}
              >
                Next
              </button>
            </>
          ) : null}
        </div>

        <div
          className={cn(
            "min-h-0 flex-1 overflow-hidden border",
            theme === "dark"
              ? "border-white/[0.05] bg-slate-950/20"
              : "border-white/25 bg-white/14",
          )}
        >
          {isImage && imageUrl ? (
            <img
              src={imageUrl}
              alt={activeFile.name}
              className="h-full w-full object-contain"
            />
          ) : isText ? (
            <pre className="source-workbench-scrollbar h-full overflow-auto px-4 py-3 font-mono text-[12px] leading-6">
              {textPreview ?? "Loading preview..."}
            </pre>
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-400">
              {previewError ?? "Preview is not available for this file type yet."}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
