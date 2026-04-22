import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { QuestionEntry } from "@/features/start-entry/components/question-entry";
import { guidedQuestions } from "@/mock/data/guided-questions";
import { constellationTopic } from "@/mock/data/constellation-topic";
import { cn } from "@/lib/utils";
import { useThemeMode } from "@/app/theme/theme-provider";
import { ThemedAmbientBackground } from "@/components/ui/themed-ambient-background";
import {
  appendLearningModuleChild,
  loadLearningModules,
  upsertLearningModule,
  type LearningModuleChildRecord,
  type LearningModuleRecord,
} from "@/features/topic-session/module-storage";

const wakeLine = "Echowhy, emm?";
const importedSourcesStorageKey = "echowhy:start-imported-sources";
const pendingStartSourceStorageKey = "echowhy:start-pending-source";
const startWakeSessionKey = "echowhy:start-wake-played";
const bubblePlacements = [
  "left-1/2 top-[12%] -translate-x-1/2",
  "right-[8%] top-[42%]",
  "left-[8%] top-[46%]",
] as const;

type StartMode = "ask" | "recent";

type StartSourceChild = {
  id: string;
  label: string;
  topicId: string;
  angleId?: string;
  customQuestion?: string;
  kind?: "angle" | "my-own-why";
};

type StartSource = {
  id: string;
  label: string;
  caption: string;
  kind: "project" | "folder" | "file" | "conceptual";
  children: StartSourceChild[];
  moduleTopicId?: string;
  sourceId?: string;
  sourceLabel?: string;
  sourceFiles?: string[];
};

const seedRecentSources: StartSource[] = [
  {
    id: constellationTopic.sourceImport.id,
    label: constellationTopic.sourceImport.projectName,
    caption: "RBAC source",
    kind: "project",
    children: constellationTopic.sourceImport.guidedQuestions.map((question) => ({
      id: question.id,
      label: question.label,
      topicId: question.topicId,
      angleId: question.angleId,
    })),
  },
];

function createDefaultModuleChildren(
  moduleId: string,
  seedQuestion?: string,
): LearningModuleChildRecord[] {
  const now = new Date().toISOString();
  const angleChildren = constellationTopic.learningAngles
    .filter((angle) => !angle.isCustom)
    .map((angle) => ({
      id: `${moduleId}-${angle.id}`,
      label: angle.title,
      topicId: moduleId,
      angleId: angle.id,
      kind: "angle" as const,
      createdAt: now,
    }));

  if (!seedQuestion?.trim()) {
    return angleChildren;
  }

  return [
    ...angleChildren,
    {
      id: `${moduleId}-my-own-why-root`,
      label: seedQuestion.trim(),
      topicId: moduleId,
      angleId: "angle-custom-followup",
      customQuestion: seedQuestion.trim(),
      kind: "my-own-why",
      createdAt: now,
    },
  ];
}

function createRecentSourceFromModule(module: LearningModuleRecord): StartSource {
  const children = module.children.length
    ? module.children
    : createDefaultModuleChildren(module.id, module.seedQuestion);

  return {
    id: `module-${module.id}`,
    label: module.title,
    caption: module.sourceLabel
      ? `Learning module - ${module.sourceLabel}`
      : "Learning module",
    kind: module.kind === "conceptual" ? "conceptual" : "project",
    moduleTopicId: module.id,
    sourceId: module.sourceId,
    sourceLabel: module.sourceLabel,
    sourceFiles: module.sourceFiles,
    children,
  };
}

function createGeneratedWhyId(sourceId?: string) {
  const suffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  return sourceId ? `why-${sourceId}-${suffix}` : `why-conceptual-${suffix}`;
}

function readImportedSources() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(importedSourcesStorageKey);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue) as StartSource[];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

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

function markStartWakePlayed() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(startWakeSessionKey, "true");
  } catch {
    // The animation is decorative; storage failure should not block the page.
  }
}

function readPendingStartSource(): StartSource | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(pendingStartSourceStorageKey);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as Partial<StartSource>;
    window.localStorage.removeItem(pendingStartSourceStorageKey);

    if (
      typeof parsedValue.id !== "string" ||
      typeof parsedValue.label !== "string" ||
      typeof parsedValue.caption !== "string"
    ) {
      return null;
    }

    return {
      id: parsedValue.id,
      label: parsedValue.label,
      caption: parsedValue.caption,
      kind:
        parsedValue.kind === "folder" ||
        parsedValue.kind === "file" ||
        parsedValue.kind === "conceptual"
          ? parsedValue.kind
          : "project",
      children: Array.isArray(parsedValue.children)
        ? parsedValue.children.filter(
            (child): child is StartSourceChild =>
              Boolean(child) &&
              typeof child.id === "string" &&
              typeof child.label === "string" &&
              typeof child.topicId === "string",
          )
        : [],
      moduleTopicId:
        typeof parsedValue.moduleTopicId === "string"
          ? parsedValue.moduleTopicId
          : undefined,
      sourceId:
        typeof parsedValue.sourceId === "string" ? parsedValue.sourceId : undefined,
      sourceLabel:
        typeof parsedValue.sourceLabel === "string"
          ? parsedValue.sourceLabel
          : undefined,
      sourceFiles: Array.isArray(parsedValue.sourceFiles)
        ? parsedValue.sourceFiles.filter(
            (sourceFile): sourceFile is string =>
              typeof sourceFile === "string" && Boolean(sourceFile.trim()),
          )
        : undefined,
    };
  } catch {
    return null;
  }
}

function saveImportedSources(sources: StartSource[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(importedSourcesStorageKey, JSON.stringify(sources));
  } catch {
    // Keep the visual flow usable even if the browser refuses persistence.
  }
}

function createImportedSource(files: FileList | File[], existingId?: string) {
  const fileArray = Array.from(files);
  const firstFile = fileArray[0];
  const folderName = firstFile?.webkitRelativePath?.split("/")?.[0]?.trim();
  const fileName = firstFile?.name?.replace(/\.[^/.]+$/, "").trim();
  const baseLabel = folderName || fileName || "Imported source";
  const label = fileArray.length > 1 ? `${baseLabel} + ${fileArray.length - 1}` : baseLabel;

  return {
    id: existingId ?? `source-local-${Date.now().toString(36)}`,
    label,
    caption: `${fileArray.length || 1} local file${fileArray.length === 1 ? "" : "s"}`,
    kind: fileArray.length > 1 ? "folder" : "file",
    sourceFiles: fileArray.map((file) => file.name),
    children: [] as StartSourceChild[],
  } satisfies StartSource;
}

function getRecentSourcePoint(index: number, total: number) {
  if (total <= 1) {
    return { x: 82, y: 39 };
  }

  const yOffsets = [38, 56, 34, 53, 40];

  return {
    x: 30 + (index * 56) / Math.max(total - 1, 1),
    y: yOffsets[index % yOffsets.length],
  };
}

const recentTrackStartPoint = { x: 9, y: 54 };

function TypewriterHeading({
  text,
  theme,
}: {
  text: string;
  theme: "light" | "dark";
}) {
  return (
    <motion.h2
      key={text}
      className={cn(
        "min-h-9 text-2xl font-extralight tracking-[0.06em] sm:text-3xl",
        theme === "dark"
          ? "text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          : "text-slate-800",
      )}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.018,
          },
        },
      }}
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={`${text}-${char}-${index}`}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          }}
          transition={{ duration: 0.03 }}
        >
          {char}
        </motion.span>
      ))}
    </motion.h2>
  );
}

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

function SourcePreviewLens({
  files,
  activeIndex,
  onActiveIndexChange,
  onClose,
  theme,
}: {
  files: File[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onClose: () => void;
  theme: "light" | "dark";
}) {
  const activeFile = files[activeIndex] ?? files[0];
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [textPreview, setTextPreview] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [panelOffset, setPanelOffset] = useState({ x: 0, y: 0 });
  const dragCleanupRef = useRef<(() => void) | null>(null);
  const isImage = activeFile?.type.startsWith("image/");
  const isText = activeFile ? canPreviewAsText(activeFile) : false;

  const handleDragStart = (event: PointerEvent<HTMLDivElement>) => {
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

    const handlePointerMove = (pointerEvent: globalThis.PointerEvent) => {
      setPanelOffset({
        x: startPanelX + pointerEvent.clientX - startPointerX,
        y: startPanelY + pointerEvent.clientY - startPointerY,
      });
    };

    const cleanupDrag = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", cleanupDrag);
      window.removeEventListener("pointercancel", cleanupDrag);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      dragCleanupRef.current = null;
    };

    dragCleanupRef.current = cleanupDrag;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", cleanupDrag);
    window.addEventListener("pointercancel", cleanupDrag);
  };

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
          <p className="mt-1 text-[9px] uppercase tracking-[0.24em] text-slate-500/80">
            {formatFileSize(activeFile.size)}
            {activeFile.type ? ` - ${activeFile.type}` : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className={cn(
            "shrink-0 text-[11px] tracking-widest transition-colors",
            theme === "dark"
              ? "text-slate-500 hover:text-slate-200"
              : "text-slate-400 hover:text-slate-700",
          )}
        >
          [ x ]
        </button>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-none">
        {isImage && imageUrl ? (
          <div
            className={cn(
              "flex h-full min-h-0 items-center justify-center rounded-none",
              theme === "dark" ? "bg-white/[0.025]" : "bg-white/24",
            )}
          >
            <img
              src={imageUrl}
              alt={activeFile.name}
              className="h-full w-full rounded-none object-contain"
            />
          </div>
        ) : null}

        {isText ? (
          <div className="relative h-full min-h-0">
            <pre
              className={cn(
                "h-full min-h-0 overflow-auto whitespace-pre-wrap px-0.5 py-1 text-[12px] font-medium leading-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                theme === "dark" ? "text-slate-200/88" : "text-slate-800/86",
              )}
            >
              {textPreview ?? previewError ?? "Reading preview..."}
            </pre>
          </div>
        ) : null}

        {!isImage && !isText ? (
          <div
            className={cn(
              "px-4 py-8 text-center text-sm",
              theme === "dark" ? "text-slate-400" : "text-slate-500",
            )}
          >
            Preview is not available for this file type.
          </div>
        ) : null}
      </div>

      {files.length > 1 ? (
        <div className="mt-2 flex items-center justify-center gap-3 text-[11px]">
          <button
            type="button"
            disabled={!canGoPrevious}
            onClick={() => onActiveIndexChange(activeIndex - 1)}
            className={cn(
              "transition-colors disabled:opacity-30",
              theme === "dark"
                ? "text-slate-500 hover:text-slate-200"
                : "text-slate-400 hover:text-slate-700",
            )}
          >
            prev
          </button>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[9px] tracking-[0.18em]",
              theme === "dark"
                ? "bg-white/[0.025] text-slate-600"
                : "bg-slate-200/26 text-slate-500/80",
            )}
          >
            {activeIndex + 1}/{files.length}
          </span>
          <button
            type="button"
            disabled={!canGoNext}
            onClick={() => onActiveIndexChange(activeIndex + 1)}
            className={cn(
              "transition-colors disabled:opacity-30",
              theme === "dark"
                ? "text-slate-500 hover:text-slate-200"
                : "text-slate-400 hover:text-slate-700",
            )}
          >
            next
          </button>
        </div>
      ) : null}
      </div>
    </motion.div>
  );
}

export function StartPage() {
  const { theme, mode } = useThemeMode();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sourceSelectionTimerRef = useRef<number | null>(null);
  const trackPulseTimerRef = useRef<number | null>(null);
  const [isAwake, setIsAwake] = useState(() => hasPlayedStartWake());
  const [textVisible, setTextVisible] = useState(() => !hasPlayedStartWake());
  const [startMode, setStartMode] = useState<StartMode>("ask");
  const [selectedSource, setSelectedSource] = useState<StartSource | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isSourceLensOpen, setIsSourceLensOpen] = useState(false);
  const [sourceLensIndex, setSourceLensIndex] = useState(0);
  const [importedSources, setImportedSources] = useState<StartSource[]>([]);
  const [learningModules, setLearningModules] = useState<LearningModuleRecord[]>([]);
  const [hoveredSourceId, setHoveredSourceId] = useState<string | null>(null);
  const [selectingSourceId, setSelectingSourceId] = useState<string | null>(null);
  const [trackPulseKey, setTrackPulseKey] = useState(0);
  const [isTrackPulseActive, setIsTrackPulseActive] = useState(false);

  const isDarkDynamic = theme === "dark" && mode === "dynamic";
  const recentModuleSources = useMemo(
    () =>
      learningModules
        .filter((module) => !module.parentModuleId)
        .slice(0, 5)
        .map(createRecentSourceFromModule),
    [learningModules],
  );
  const recentSources = useMemo(
    () => [
      ...recentModuleSources,
      ...importedSources,
      ...seedRecentSources.filter(
        (source) =>
          !importedSources.some((importedSource) => importedSource.id === source.id) &&
          !recentModuleSources.some((moduleSource) => moduleSource.sourceId === source.id),
      ),
    ]
      .slice(0, 5),
    [importedSources, recentModuleSources],
  );
  const activeHeading =
    startMode === "recent"
      ? "Which source are you looking for?"
      : "What are you trying to understand?";
  const recentSourcePoints = useMemo(
    () => recentSources.map((_, index) => getRecentSourcePoint(index, recentSources.length)),
    [recentSources],
  );
  const recentTrackPoints = useMemo(
    () => [recentTrackStartPoint, ...recentSourcePoints],
    [recentSourcePoints],
  );
  const recentSourcePath = recentTrackPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const selectingSourceIndex = selectingSourceId
    ? recentSources.findIndex((source) => source.id === selectingSourceId)
    : -1;
  const selectingSourcePath =
    selectingSourceIndex >= 0
      ? recentTrackPoints
          .slice(0, selectingSourceIndex + 2)
          .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
          .join(" ")
      : "";

  useEffect(() => {
    if (hasPlayedStartWake()) {
      setTextVisible(false);
      setIsAwake(true);
      return;
    }

    const textTimer = window.setTimeout(() => {
      setTextVisible(false);
    }, 2800);

    const awakeTimer = window.setTimeout(() => {
      setIsAwake(true);
      markStartWakePlayed();
    }, 2850);

    return () => {
      window.clearTimeout(textTimer);
      window.clearTimeout(awakeTimer);
    };
  }, []);

  useEffect(() => {
    setImportedSources(readImportedSources());
    setLearningModules(loadLearningModules());

    const pendingSource = readPendingStartSource();

    if (pendingSource) {
      setSelectedSource(pendingSource);
      setStartMode("ask");
    }
  }, []);

  useEffect(
    () => () => {
      if (sourceSelectionTimerRef.current) {
        window.clearTimeout(sourceSelectionTimerRef.current);
      }

      if (trackPulseTimerRef.current) {
        window.clearTimeout(trackPulseTimerRef.current);
      }
    },
    [],
  );

  const persistImportedSources = (sources: StartSource[]) => {
    setImportedSources(sources);
    saveImportedSources(sources);
  };

  const goToTopic = (
    topicId: string,
    angleId?: string,
    customQuestion?: string,
    sourceId?: string,
    sourceLabel?: string,
  ) => {
    const search: {
      angle?: string;
      customQuestion?: string;
      sourceId?: string;
      sourceLabel?: string;
    } = {};

    if (angleId) {
      search.angle = angleId;
    }

    if (customQuestion?.trim()) {
      search.customQuestion = customQuestion.trim();
    }

    if (sourceId) {
      search.sourceId = sourceId;
    }

    if (sourceLabel?.trim()) {
      search.sourceLabel = sourceLabel.trim();
    }

    void navigate({
      to: "/topic/$id",
      params: { id: topicId },
      search,
    });
  };

  const createWhyFromQuestion = (question: string) => {
    const trimmedQuestion = question.trim();
    const parentModuleId = selectedSource?.moduleTopicId;
    const topicId = createGeneratedWhyId(parentModuleId ?? selectedSource?.id);
    const sourceId = selectedSource?.sourceId ?? selectedSource?.id;
    const sourceLabel = parentModuleId
      ? selectedSource?.label
      : selectedSource?.sourceLabel ?? selectedSource?.label;
    const sourceFiles = selectedSource?.sourceFiles;
    const moduleTitle = trimmedQuestion || sourceLabel || "New learning module";

    if (parentModuleId && trimmedQuestion) {
      const existingParentModule =
        learningModules.find((module) => module.id === parentModuleId) ??
        loadLearningModules().find((module) => module.id === parentModuleId);

      if (existingParentModule && !existingParentModule.children.length) {
        upsertLearningModule({
          ...existingParentModule,
          children: createDefaultModuleChildren(
            existingParentModule.id,
            existingParentModule.seedQuestion,
          ),
        });
      }

      const savedChildModule = upsertLearningModule({
        id: topicId,
        title: trimmedQuestion,
        seedQuestion: trimmedQuestion,
        sourceId,
        sourceLabel,
        sourceFiles,
        parentModuleId,
        kind: "source-backed",
        children: createDefaultModuleChildren(topicId, trimmedQuestion),
      });

      appendLearningModuleChild(parentModuleId, {
        id: `${parentModuleId}-my-own-why-${topicId}`,
        label: trimmedQuestion,
        topicId,
        customQuestion: trimmedQuestion,
        kind: "my-own-why",
      });

      if (savedChildModule) {
        setLearningModules(loadLearningModules());
      }

      goToTopic(topicId, undefined, trimmedQuestion, sourceId, sourceLabel);
      return;
    }

    const savedModule = upsertLearningModule({
      id: topicId,
      title: moduleTitle,
      seedQuestion: trimmedQuestion || undefined,
      sourceId,
      sourceLabel,
      sourceFiles,
      kind: selectedSource ? "source-backed" : "conceptual",
      children: createDefaultModuleChildren(topicId, trimmedQuestion),
    });

    if (savedModule) {
      setLearningModules(loadLearningModules());
    }

    goToTopic(
      topicId,
      undefined,
      trimmedQuestion || undefined,
      sourceId,
      sourceLabel,
    );
  };

  const clearSelectedSource = () => {
    setSelectedSource(null);
    setAttachedFiles([]);
    setSourceLensIndex(0);
    setIsSourceLensOpen(false);
  };

  const handleFilesSelected = (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    if (!fileArray.length) {
      return;
    }

    const isExtendingLocalSource = selectedSource?.id.startsWith("source-local-");
    const mergedFiles = [
      ...(isExtendingLocalSource ? attachedFiles : []),
      ...fileArray,
    ].filter(
      (file, index, allFiles) =>
        allFiles.findIndex(
          (candidate) =>
            candidate.name === file.name &&
            candidate.size === file.size &&
            candidate.lastModified === file.lastModified,
        ) === index,
    );
    const nextSource = createImportedSource(
      mergedFiles,
      isExtendingLocalSource ? selectedSource?.id : undefined,
    );
    const nextImportedSources = [
      nextSource,
      ...importedSources.filter(
        (source) => source.id !== nextSource.id && source.label !== nextSource.label,
      ),
    ].slice(0, 8);

    persistImportedSources(nextImportedSources);
    setSelectedSource(nextSource);
    setAttachedFiles(mergedFiles);
    setSourceLensIndex(Math.max(0, mergedFiles.length - fileArray.length));
    setStartMode("ask");
  };

  const handleSelectRecentSource = (source: StartSource) => {
    setHoveredSourceId(null);
    setIsTrackPulseActive(false);
    setSelectingSourceId(source.id);

    if (sourceSelectionTimerRef.current) {
      window.clearTimeout(sourceSelectionTimerRef.current);
    }

    sourceSelectionTimerRef.current = window.setTimeout(() => {
      setSelectedSource(source);
      setAttachedFiles([]);
      setSourceLensIndex(0);
      setIsSourceLensOpen(false);
      setSelectingSourceId(null);
      setStartMode("ask");
    }, 780);
  };

  const handlePulseRecentTrack = () => {
    setHoveredSourceId(null);
    setSelectingSourceId(null);
    setTrackPulseKey((currentKey) => currentKey + 1);
    setIsTrackPulseActive(true);

    if (sourceSelectionTimerRef.current) {
      window.clearTimeout(sourceSelectionTimerRef.current);
    }

    if (trackPulseTimerRef.current) {
      window.clearTimeout(trackPulseTimerRef.current);
    }

    trackPulseTimerRef.current = window.setTimeout(() => {
      setIsTrackPulseActive(false);
    }, 2400);
  };

  const showGuidedPaths = false;

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

  return (
    <section className="relative isolate flex h-screen w-full items-center justify-center overflow-hidden bg-slate-50 dark:bg-transparent">
      <ThemedAmbientBackground
        showLightDynamicAnnotations
        showLightDynamicCenterMask
      />

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
          animate={isAwake ? { width: "200vw", height: "200vw", opacity: 1 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      ) : null}

      <AnimatePresence>
        {textVisible && mode === "dynamic" ? (
          <motion.div
            key="wake-text"
            className={cn(
              "pointer-events-none absolute left-1/2 top-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 text-2xl font-light tracking-[0.04em] sm:text-4xl",
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
        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1], delay: 0.05 }}
      >
        <div className="relative flex h-screen w-full items-center justify-center overflow-hidden">
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
            <TypewriterHeading text={activeHeading} theme={theme} />

            <div className="relative flex flex-col items-center">
              {isDarkDynamic ? (
                <div className="pointer-events-none absolute left-1/2 top-[58%] z-0 h-52 w-[95vw] -translate-x-1/2 -translate-y-1/2 sm:h-60 sm:w-200">
                  <div className="absolute left-1/2 top-1/2 h-14 w-68 -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-cyan-300/14 blur-[34px] sm:h-16 sm:w-100 sm:blur-2xl" />

                  <div className="absolute left-1/2 top-[76%] h-24 w-92 -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-blue-900/28 blur-[62px] sm:h-32 sm:w-180 sm:blur-[80px]" />
                </div>
              ) : null}

              <div className="relative z-10">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    if (event.target.files) {
                      handleFilesSelected(event.target.files);
                      event.target.value = "";
                    }
                  }}
                />

                <AnimatePresence mode="wait">
                  {startMode === "ask" ? (
                    <motion.div
                      key="ask"
                      initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <QuestionEntry
                        theme={theme}
                        onSubmit={createWhyFromQuestion}
                        onAttachSource={() => fileInputRef.current?.click()}
                        onFilesSelected={handleFilesSelected}
                        onShowRecentSources={() => {
                          setIsSourceLensOpen(false);
                          setStartMode("recent");
                        }}
                        selectedSourceLabel={selectedSource?.label}
                        selectedSourceCaption={selectedSource?.caption}
                        sourcePreviewAvailable={attachedFiles.length > 0}
                        isSourcePreviewOpen={isSourceLensOpen}
                        onPreviewSource={() => setIsSourceLensOpen((isOpen) => !isOpen)}
                        onClearSelectedSource={clearSelectedSource}
                        allowEmptyQuestion={Boolean(selectedSource)}
                      />

                    </motion.div>
                  ) : null}

                  {startMode === "recent" ? (
                    <motion.div
                      key="recent"
                      initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="relative flex min-h-48 w-[min(46rem,90vw)] flex-col items-center"
                    >
                      <div className="relative h-40 w-full">
                        <svg
                          className="pointer-events-none absolute inset-0 h-full w-full"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          aria-hidden="true"
                        >
                          <path
                            d={recentSourcePath}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="0.35"
                            strokeDasharray={theme === "dark" ? "1.2 3.4" : "1.4 3.2"}
                            className={cn(
                              theme === "dark"
                                ? "stroke-cyan-300/24"
                                : "stroke-slate-500/52",
                            )}
                          />

                          {selectingSourcePath || isTrackPulseActive ? (
                            <motion.path
                              key={isTrackPulseActive ? `recent-track-pulse-${trackPulseKey}` : selectingSourcePath}
                              d={isTrackPulseActive ? recentSourcePath : selectingSourcePath}
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="0.7"
                              className={cn(
                                theme === "dark"
                                  ? "stroke-cyan-200"
                                  : "stroke-cyan-500",
                              )}
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={
                                isTrackPulseActive
                                  ? { pathLength: 1, opacity: [0, 1, 0.82, 0] }
                                  : { pathLength: 1, opacity: [0, 1, 0.86] }
                              }
                              transition={{
                                pathLength: {
                                  duration: isTrackPulseActive ? 1.25 : 0.62,
                                  ease: [0.22, 1, 0.36, 1],
                                },
                                opacity: {
                                  duration: isTrackPulseActive ? 2.3 : 0.62,
                                  times: isTrackPulseActive ? [0, 0.36, 0.72, 1] : undefined,
                                  ease: "easeOut",
                                },
                              }}
                            />
                          ) : null}
                        </svg>

                        <div
                          className="absolute -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: `${recentTrackStartPoint.x}%`,
                            top: `${recentTrackStartPoint.y}%`,
                          }}
                        >
                          <button
                            type="button"
                            onClick={handlePulseRecentTrack}
                            disabled={Boolean(selectingSourceId || isTrackPulseActive)}
                            aria-label="Preview recent source track"
                            className="group relative flex h-8 w-8 items-center justify-center"
                          >
                            <motion.span
                              className={cn(
                                "absolute h-7 w-7 rounded-full transition-opacity",
                                theme === "dark"
                                  ? "bg-cyan-300/8 group-hover:bg-cyan-300/12"
                                  : "bg-slate-400/10 group-hover:bg-cyan-400/14",
                              )}
                              animate={
                                isTrackPulseActive
                                  ? { opacity: [0.25, 0.72, 0.48, 0.16], scale: [0.82, 1.45, 1.1, 0.92] }
                                  : { opacity: 0.3, scale: 1 }
                              }
                              transition={{
                                duration: isTrackPulseActive ? 2.2 : 0.2,
                                times: isTrackPulseActive ? [0, 0.32, 0.68, 1] : undefined,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                            />
                            <motion.span
                              className={cn(
                                "relative h-3 w-3 rounded-full transition-colors",
                                theme === "dark"
                                  ? "bg-cyan-300/78 shadow-[0_0_18px_rgba(103,232,249,0.32)] group-hover:bg-cyan-200"
                                  : "border border-cyan-600/75 bg-cyan-400 shadow-[0_0_0_4px_rgba(255,255,255,0.86),0_0_0_7px_rgba(6,182,212,0.1)] group-hover:bg-cyan-500",
                              )}
                              animate={
                                isTrackPulseActive
                                  ? { scale: [1, 1.48, 1.18, 1], opacity: [0.88, 1, 0.9, 0.82] }
                                  : { scale: 1 }
                              }
                              transition={{
                                duration: isTrackPulseActive ? 2.05 : 0.2,
                                times: isTrackPulseActive ? [0, 0.28, 0.68, 1] : undefined,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                            />
                          </button>
                        </div>

                        {recentSources.map((source, index) => {
                          const point = recentSourcePoints[index] ?? { x: 50, y: 48 };
                          const hovered = hoveredSourceId === source.id;
                          const hasChildren = source.children.length > 0;
                          const isInSelectingPath =
                            selectingSourceIndex >= 0 && index <= selectingSourceIndex;
                          const isLitByTrackPulse = isTrackPulseActive;
                          const isSelectingTarget = selectingSourceId === source.id;

                          return (
                            <div
                              key={source.id}
                              className="absolute -translate-x-1/2 -translate-y-1/2"
                              style={{ left: `${point.x}%`, top: `${point.y}%` }}
                              onMouseEnter={() => {
                                if (hasChildren) {
                                  setHoveredSourceId(source.id);
                                }
                              }}
                              onMouseLeave={() => setHoveredSourceId(null)}
                            >
                              <button
                                type="button"
                                onClick={() => handleSelectRecentSource(source)}
                                disabled={Boolean(selectingSourceId || isTrackPulseActive)}
                                className="group relative flex h-8 w-8 items-center justify-center"
                              >
                                <motion.span
                                  className={cn(
                                    "relative h-3 w-3 rounded-full transition-colors",
                                    theme === "dark"
                                      ? "bg-cyan-300/80 shadow-[0_0_18px_rgba(103,232,249,0.38)] group-hover:bg-cyan-200"
                                      : "border border-slate-500/80 bg-slate-500 shadow-[0_0_0_4px_rgba(255,255,255,0.84),0_0_0_7px_rgba(100,116,139,0.1)] group-hover:border-cyan-600 group-hover:bg-cyan-400",
                                    (isInSelectingPath || isLitByTrackPulse) &&
                                      (theme === "dark"
                                        ? "bg-cyan-100 shadow-[0_0_26px_rgba(165,243,252,0.58)]"
                                        : "border-cyan-600 bg-cyan-400 shadow-[0_0_0_4px_rgba(255,255,255,0.88),0_0_0_8px_rgba(6,182,212,0.14)]"),
                                  )}
                                  animate={
                                    isSelectingTarget
                                      ? { scale: [1, 1.55, 1.16], opacity: [0.92, 1, 1] }
                                      : isLitByTrackPulse
                                        ? { scale: [1, 1.28, 1.14, 1], opacity: [0.88, 1, 0.9, 0.82] }
                                        : { scale: hovered || isInSelectingPath ? 1.2 : 1 }
                                  }
                                  transition={{
                                    duration: isSelectingTarget ? 0.58 : isLitByTrackPulse ? 2.05 : 0.2,
                                    times: isLitByTrackPulse ? [0, 0.32, 0.72, 1] : undefined,
                                    ease: [0.22, 1, 0.36, 1],
                                  }}
                                />
                                <span
                                  className={cn(
                                    "absolute left-1/2 top-7 max-w-36 -translate-x-1/2 truncate whitespace-nowrap text-xs tracking-wide transition-colors",
                                    theme === "dark"
                                      ? "text-slate-300 drop-shadow-[0_0_10px_rgba(2,6,23,0.9)] group-hover:text-slate-100"
                                      : "text-slate-600 [text-shadow:0_0_10px_#f8fafc,_0_0_20px_#f8fafc] group-hover:text-slate-900",
                                  )}
                                >
                                  {source.label}
                                </span>
                              </button>

                              <AnimatePresence>
                                {hovered && hasChildren ? (
                                  <motion.div
                                    initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
                                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, y: 8, filter: "blur(8px)" }}
                                    transition={{ duration: 0.2 }}
                                    className={cn(
                                      "absolute z-30 w-72 overflow-hidden rounded-none border p-3 text-left backdrop-blur-xl",
                                      "left-1/2 top-12 -translate-x-1/2",
                                      theme === "dark"
                                        ? "border-white/[0.025] bg-slate-950/12 text-slate-300 shadow-[0_18px_64px_-62px_rgba(0,0,0,0.74)]"
                                        : "border-white/20 bg-white/[0.18] text-slate-600 shadow-[0_18px_68px_-66px_rgba(15,23,42,0.22)]",
                                    )}
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

                                    <div className="relative">
                                      <p
                                        className={cn(
                                          "mb-2 text-[10px] uppercase tracking-[0.22em]",
                                          theme === "dark" ? "text-slate-400" : "text-slate-500",
                                        )}
                                      >
                                        {source.caption}
                                      </p>

                                      <div className="space-y-1">
                                        {source.children.slice(0, 4).map((child) => (
                                          <button
                                            key={child.id}
                                            type="button"
                                            onClick={() =>
                                              goToTopic(
                                                child.topicId,
                                                child.angleId,
                                                child.customQuestion,
                                                source.sourceId ?? source.id,
                                                source.sourceLabel ?? source.label,
                                              )
                                            }
                                            className={cn(
                                              "block w-full truncate border-l px-2 py-1 text-left text-xs transition-colors",
                                              theme === "dark"
                                                ? "border-cyan-400/16 text-slate-300/82 hover:border-cyan-400/70 hover:text-slate-100"
                                                : "border-slate-300/70 text-slate-600 hover:border-cyan-500/70 hover:text-slate-900",
                                            )}
                                          >
                                            {child.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </motion.div>
                                ) : null}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>

                      <div
                        className={cn(
                          "mt-2 flex justify-center gap-8 transition-all duration-300 ease-out",
                          hoveredSourceId
                            ? "pointer-events-none translate-y-2 opacity-0 blur-[3px]"
                            : "translate-y-0 opacity-100 blur-0",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => setStartMode("ask")}
                          className={cn(
                            "text-sm tracking-wide transition-colors",
                            theme === "dark"
                              ? "text-slate-500 hover:text-slate-300"
                              : "text-slate-400 hover:text-slate-700",
                          )}
                        >
                          Back to asking
                        </button>
                        <button
                          type="button"
                          onClick={() => void navigate({ to: "/library" })}
                          className={cn(
                            "text-sm tracking-wide transition-colors",
                            theme === "dark"
                              ? "text-slate-400 hover:text-slate-300"
                              : "text-slate-500 hover:text-slate-700",
                          )}
                        >
                          Open Library
                        </button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isSourceLensOpen && attachedFiles.length > 0 ? (
          <SourcePreviewLens
            files={attachedFiles}
            activeIndex={sourceLensIndex}
            onActiveIndexChange={setSourceLensIndex}
            onClose={() => setIsSourceLensOpen(false)}
            theme={theme}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
