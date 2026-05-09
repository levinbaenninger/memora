import { Outlet } from "@tanstack/react-router";

import { ScrollArea } from "@memora/ui/components/scroll-area";

import { NoteListPanel } from "../components/note-list-panel";

export function NotesView() {
  return (
    <div className="grid h-full w-full grid-cols-[280px_1fr]">
      <NoteListPanel className="flex flex-col overflow-hidden border-r" />
      <div className="flex h-full flex-col overflow-hidden">
        <ScrollArea className="h-full">
          <Outlet />
        </ScrollArea>
      </div>
    </div>
  );
}
