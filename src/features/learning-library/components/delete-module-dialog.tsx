import { Button } from "@/components/ui/button";

type DeleteModuleDialogProps = {
  open: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteModuleDialog({
  open,
  title,
  onCancel,
  onConfirm,
}: DeleteModuleDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-6 backdrop-blur-sm">
      <div className="w-full max-w-md border border-slate-200/70 bg-white/94 p-6 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.4)] backdrop-blur-md dark:border-white/[0.08] dark:bg-slate-950/94 dark:shadow-[0_24px_80px_-52px_rgba(8,47,73,0.46)]">
        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
          Delete module
        </p>
        <h3 className="mt-4 text-[26px] font-light tracking-tight text-slate-900 dark:text-slate-50">
          Remove “{title}”?
        </h3>
        <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
          This will remove the learning module from your library. The action is
          permanent for the current local data.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onCancel}
            className="rounded-none bg-transparent px-0 text-slate-600 ring-0 hover:bg-transparent hover:text-slate-900 dark:text-slate-300 dark:hover:bg-transparent dark:hover:text-slate-50"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="rounded-none bg-transparent px-0 text-rose-600 shadow-none hover:bg-transparent hover:text-rose-700 dark:text-rose-300 dark:hover:bg-transparent dark:hover:text-rose-200"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
