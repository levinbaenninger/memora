import { create } from "zustand";

export type SaveStatus = "idle" | "saving" | "saved" | "error";
export type MobilePanel = "nav" | "list" | "editor";

interface NotesStore {
  activeMobilePanel: MobilePanel;
  expandedFolderIds: Set<string>;
  saveStatus: SaveStatus;
  setActiveMobilePanel: (p: MobilePanel) => void;
  setSaveStatus: (s: SaveStatus) => void;
  toggleFolder: (id: string) => void;
}

export const useNotesStore = create<NotesStore>((set) => ({
  saveStatus: "idle",
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  expandedFolderIds: new Set<string>(),
  toggleFolder: (id) =>
    set((s) => {
      const next = new Set(s.expandedFolderIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { expandedFolderIds: next };
    }),
  activeMobilePanel: "list",
  setActiveMobilePanel: (activeMobilePanel) => set({ activeMobilePanel }),
}));
