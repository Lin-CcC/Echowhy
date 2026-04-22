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
      <div className="w-full max-w-md rounded-[28px] border border-slate-200/70 bg-white/84 p-6 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.55)] backdrop-blur-xl dark:border-white/[0.06] dark:bg-slate-950/82 dark:shadow-[0_24px_80px_-52px_rgba(8,47,73,0.55)]">
        <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
          Delete module
        </p>
        <h3 className="mt-3 text-xl font-medium text-slate-900 dark:text-slate-50">
          Remove “{title}”?
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
          This will remove the learning module from your library. The action is
          permanent for the current local data.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onCancel}
            className="rounded-full bg-slate-900/8 px-4 text-slate-700 ring-slate-300/70 hover:bg-slate-900/12 dark:bg-slate-950/26 dark:text-slate-100 dark:ring-white/10 dark:hover:bg-slate-950/40"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="rounded-full bg-rose-500/90 px-4 text-white shadow-none hover:bg-rose-500"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
