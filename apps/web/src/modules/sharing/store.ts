import { create } from "zustand";

interface SharePopoverStore {
  openForNoteId: string | null;
  open: (noteId: string) => void;
  close: () => void;
}

export const useSharePopoverStore = create<SharePopoverStore>((set) => ({
  openForNoteId: null,
  open: (openForNoteId) => set({ openForNoteId }),
  close: () => set({ openForNoteId: null }),
}));
