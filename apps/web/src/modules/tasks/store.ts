import { create } from "zustand";

interface TasksStore {
  createDialogOpen: boolean;
  openTaskId: string | null;
  setCreateDialogOpen: (open: boolean) => void;
  setOpenTaskId: (id: string | null) => void;
}

export const useTasksStore = create<TasksStore>((set) => ({
  openTaskId: null,
  setOpenTaskId: (openTaskId) => set({ openTaskId }),
  createDialogOpen: false,
  setCreateDialogOpen: (createDialogOpen) => set({ createDialogOpen }),
}));
