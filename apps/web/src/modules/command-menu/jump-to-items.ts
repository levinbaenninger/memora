import {
  ArchiveIcon,
  DashboardSquare01Icon,
  FavouriteIcon,
  NoteIcon,
  PinIcon,
  Settings01Icon,
  Task01Icon,
} from "@hugeicons/core-free-icons";
import type { LinkProps } from "@tanstack/react-router";

type RouteTo = NonNullable<LinkProps["to"]>;
type RouteParams = LinkProps["params"];

export interface JumpToItem {
  icon: Parameters<typeof import("@hugeicons/react").HugeiconsIcon>[0]["icon"];
  id: string;
  keywords: string[];
  params?: RouteParams;
  shortcut?: string;
  title: string;
  to: RouteTo;
}

export const jumpToItems: JumpToItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    to: "/dashboard",
    icon: DashboardSquare01Icon,
    keywords: ["home", "overview"],
    shortcut: "g d",
  },
  {
    id: "notes-all",
    title: "All Notes",
    to: "/notes",
    icon: NoteIcon,
    keywords: ["notes"],
    shortcut: "g n",
  },
  {
    id: "notes-pinned",
    title: "Pinned",
    to: "/notes/pinned",
    icon: PinIcon,
    keywords: ["pinned", "notes"],
    shortcut: "g p",
  },
  {
    id: "notes-favorites",
    title: "Favorites",
    to: "/notes/favorites",
    icon: FavouriteIcon,
    keywords: ["favorites", "favourites", "starred", "notes"],
    shortcut: "g f",
  },
  {
    id: "notes-archived",
    title: "Archive",
    to: "/notes/archived",
    icon: ArchiveIcon,
    keywords: ["archive", "archived", "trash", "bin", "notes"],
    shortcut: "g a",
  },
  {
    id: "tasks",
    title: "Tasks",
    to: "/tasks",
    icon: Task01Icon,
    keywords: ["todo", "tasks"],
    shortcut: "g t",
  },
  {
    id: "settings",
    title: "Settings",
    to: "/settings/$path",
    params: { path: "account" },
    icon: Settings01Icon,
    keywords: ["preferences", "config", "account"],
  },
];
