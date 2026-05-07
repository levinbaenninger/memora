import { ORPCError } from "@orpc/server";
import { generateText, type JSONContent } from "@tiptap/core";
import Link from "@tiptap/extension-link";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import StarterKit from "@tiptap/starter-kit";
import { z } from "zod";

import type { NoteContent } from "@memora/db/schema";

export const INTERNAL_NOTE_HREF_RE = /^memora:\/\/note\/([A-Za-z0-9_-]{21})$/;

const jsonPrimitiveSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

type JsonValue =
  | z.infer<typeof jsonPrimitiveSchema>
  | { [key: string]: JsonValue }
  | JsonValue[];

const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    jsonPrimitiveSchema,
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ])
);

export const noteContentSchema = z
  .object({
    type: z.literal("doc"),
    content: z.array(jsonValueSchema).optional(),
  })
  .passthrough();

export const tiptapExtensions = [
  StarterKit.configure({
    link: false,
  }),
  Link.configure({
    openOnClick: false,
    autolink: false,
    protocols: ["memora"],
    isAllowedUri: (url, ctx) => {
      if (INTERNAL_NOTE_HREF_RE.test(url)) {
        return true;
      }

      return ctx.defaultValidate(url);
    },
  }),
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
] as const;

const MAX_CONTENT_BYTES = 1_000_000;
const ALLOWED_EXTERNAL_PROTOCOLS = new Set([
  "http:",
  "https:",
  "mailto:",
  "tel:",
]);

export function parseNoteContent(content: unknown) {
  const parsed = noteContentSchema.parse(content) as JSONContent;
  validateLinkMarks(parsed);

  return parsed;
}

export function getNoteContentText(content: JSONContent) {
  return generateText(content, [...tiptapExtensions]).trim();
}

export function normalizeNoteContent(content: unknown) {
  try {
    const contentBytes = new TextEncoder().encode(
      JSON.stringify(content)
    ).byteLength;

    if (contentBytes > MAX_CONTENT_BYTES) {
      throw new Error("Content too large.");
    }

    const parsed = parseNoteContent(content);
    const contentText = getNoteContentText(parsed);

    return {
      content: parsed as NoteContent,
      contentText,
      linkedNoteIds: extractInternalNoteLinkIds(parsed),
    };
  } catch (error) {
    throw new ORPCError("BAD_REQUEST", {
      cause: error,
      message: "Invalid TipTap note content.",
    });
  }
}

export function extractInternalNoteLinkIds(content: JSONContent) {
  const ids = new Set<string>();

  walkContent(content, (node) => {
    for (const mark of getMarks(node)) {
      const match = INTERNAL_NOTE_HREF_RE.exec(getHref(mark) ?? "");
      if (match?.[1]) {
        ids.add(match[1]);
      }
    }
  });

  return [...ids];
}

function isAllowedHref(href: string) {
  if (INTERNAL_NOTE_HREF_RE.test(href)) {
    return true;
  }

  try {
    const url = new URL(href);

    return ALLOWED_EXTERNAL_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
}

function validateLinkMarks(content: JSONContent) {
  walkContent(content, (node) => {
    for (const mark of getMarks(node)) {
      if (mark.type === "link" && !isAllowedHref(getHref(mark) ?? "")) {
        throw new Error("Unsafe link href.");
      }
    }
  });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getMarks(node: Record<string, unknown>) {
  return Array.isArray(node.marks) ? node.marks.filter(isPlainObject) : [];
}

function getHref(mark: Record<string, unknown>) {
  const attrs = mark.attrs;
  if (!isPlainObject(attrs) || typeof attrs.href !== "string") {
    return;
  }

  return attrs.href;
}

function walkContent(
  value: unknown,
  onNode: (node: Record<string, unknown>) => void
) {
  if (Array.isArray(value)) {
    for (const item of value) {
      walkContent(item, onNode);
    }
    return;
  }

  if (!isPlainObject(value)) {
    return;
  }

  onNode(value);

  for (const child of Object.values(value)) {
    walkContent(child, onNode);
  }
}
