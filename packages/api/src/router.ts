import type { RouterClient } from "@orpc/server";

import { foldersRouter } from "./modules/folders/router";
import { linksRouter } from "./modules/links/router";
import { tagsRouter } from "./modules/note-tags/router";
import { notesRouter } from "./modules/notes/router";
import { recentVisitsRouter } from "./modules/recent-visits/router";
import { sharesRouter } from "./modules/shares/router";
import { tagsRouter as taskTagsRouter } from "./modules/task-tags/router";

export const appRouter = {
  notes: {
    ...notesRouter,
    folders: foldersRouter,
    links: linksRouter,
    shares: sharesRouter,
    tags: tagsRouter,
  },
  recentVisits: recentVisitsRouter,
  tasks: {
    tags: taskTagsRouter,
  },
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<AppRouter>;
