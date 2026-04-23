import { useRef } from "react";
import { motion } from "framer-motion";
import { QuestionEntry } from "@/features/start-entry/components/question-entry";
import type { StartSource } from "./start-page-utils";

type StartAskPanelProps = {
  theme: "light" | "dark";
  selectedSource: StartSource | null;
  attachedFiles: File[];
  isSourceLensOpen: boolean;
  onSubmit: (question: string) => void;
  onFilesSelected: (files: FileList | File[]) => void;
  onShowRecentSources: () => void;
  onPreviewSource: () => void;
  onClearSelectedSource: () => void;
};

export function StartAskPanel({
  theme,
  selectedSource,
  attachedFiles,
  isSourceLensOpen,
  onSubmit,
  onFilesSelected,
  onShowRecentSources,
  onPreviewSource,
  onClearSelectedSource,
}: StartAskPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files) {
            onFilesSelected(event.target.files);
            event.target.value = "";
          }
        }}
      />

      <QuestionEntry
        theme={theme}
        onSubmit={onSubmit}
        onAttachSource={() => fileInputRef.current?.click()}
        onFilesSelected={onFilesSelected}
        onShowRecentSources={onShowRecentSources}
        selectedSourceLabel={selectedSource?.label}
        selectedSourceCaption={selectedSource?.caption}
        sourcePreviewAvailable={attachedFiles.length > 0}
        isSourcePreviewOpen={isSourceLensOpen}
        onPreviewSource={onPreviewSource}
        onClearSelectedSource={onClearSelectedSource}
        allowEmptyQuestion={Boolean(selectedSource)}
      />
    </motion.div>
  );
}
