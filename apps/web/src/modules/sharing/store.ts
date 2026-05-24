import { create } from "zustand";

interface SharePopoverStore {
  close: () => void;
  open: (noteId: string) => void;
  openForNoteId: string | null;
}

export const useSharePopoverStore = create<SharePopoverStore>((set) => ({
  openForNoteId: null,
  open: (openForNoteId) => set({ openForNoteId }),
  close: () => set({ openForNoteId: null }),
}));
