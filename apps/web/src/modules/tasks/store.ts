import { create } from "zustand";

interface TaskDialogStore {
  /** Null while in create mode; a task id while editing. */
  close: () => void;
  open: boolean;
  openCreate: (prefillTitle?: string) => void;
  openEdit: (taskId: string) => void;
  prefillTitle: string;
  taskId: string | null;
}

export const useTaskDialogStore = create<TaskDialogStore>((set) => ({
  open: false,
  taskId: null,
  prefillTitle: "",
  openCreate: (prefillTitle = "") =>
    set({ open: true, taskId: null, prefillTitle }),
  openEdit: (taskId) => set({ open: true, taskId, prefillTitle: "" }),
  close: () => set({ open: false, taskId: null, prefillTitle: "" }),
}));
