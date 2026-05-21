import { ORPCError } from "@orpc/server";
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

export const noteContentSchema = z.array(jsonValueSchema);

const MAX_CONTENT_BYTES = 1_000_000;
const ALLOWED_EXTERNAL_PROTOCOLS = new Set([
  "http:",
  "https:",
  "mailto:",
  "tel:",
]);

const NOTE_ID_RE = /^[A-Za-z0-9_-]{21}$/;

interface Block {
  children?: unknown;
  content?: unknown;
  props?: Record<string, unknown>;
  type?: string;
}

export function parseNoteContent(content: unknown) {
  const parsed = noteContentSchema.parse(content) as Block[];
  validateLinks(parsed);

  return parsed;
}

export function getNoteContentText(blocks: Block[]) {
  const parts: string[] = [];
  walkBlocks(blocks, (block) => {
    const blockText = extractBlockText(block);
    if (blockText) {
      parts.push(blockText);
    }
  });

  return parts.join("\n").trim();
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
      content: parsed as unknown as NoteContent,
      contentText,
      linkedNoteIds: extractInternalNoteLinkIds(parsed),
    };
  } catch (error) {
    throw new ORPCError("BAD_REQUEST", {
      cause: error,
      message: "Invalid BlockNote note content.",
    });
  }
}

export function extractInternalNoteLinkIds(blocks: Block[]) {
  const ids = new Set<string>();

  walkBlocks(blocks, (block) => {
    walkInlineContent(block.content, (inline) => {
      if (inline.type === "noteMention") {
        const noteId = readString(inline.props, "noteId");
        if (noteId && NOTE_ID_RE.test(noteId)) {
          ids.add(noteId);
        }
        return;
      }
      if (inline.type === "link") {
        const href = readString(inline, "href");
        const match = href ? INTERNAL_NOTE_HREF_RE.exec(href) : null;
        if (match?.[1]) {
          ids.add(match[1]);
        }
      }
    });
  });

  return [...ids];
}

function validateLinks(blocks: Block[]) {
  walkBlocks(blocks, (block) => {
    walkInlineContent(block.content, (inline) => {
      if (inline.type !== "link") {
        return;
      }
      const href = readString(inline, "href") ?? "";
      if (!isAllowedHref(href)) {
        throw new Error("Unsafe link href.");
      }
    });
  });
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

function walkBlocks(blocks: unknown, onBlock: (block: Block) => void) {
  if (!Array.isArray(blocks)) {
    return;
  }

  for (const raw of blocks) {
    if (!isPlainObject(raw)) {
      continue;
    }

    const block = raw as Block;
    onBlock(block);

    if (Array.isArray(block.children)) {
      walkBlocks(block.children, onBlock);
    }
  }
}

interface InlineNode {
  content?: unknown;
  href?: unknown;
  props?: Record<string, unknown>;
  text?: unknown;
  type?: string;
}

type InlineVisitor = (inline: InlineNode) => void;

function walkTableContent(content: unknown, onInline: InlineVisitor) {
  if (!isPlainObject(content)) {
    return;
  }
  const rows = (content as { rows?: unknown }).rows;
  if (!Array.isArray(rows)) {
    return;
  }
  for (const row of rows) {
    if (!isPlainObject(row)) {
      continue;
    }
    const cells = (row as { cells?: unknown }).cells;
    if (!Array.isArray(cells)) {
      continue;
    }
    for (const cell of cells) {
      walkInlineContent(cell, onInline);
    }
  }
}

function walkInlineArray(items: unknown[], onInline: InlineVisitor) {
  for (const raw of items) {
    if (!isPlainObject(raw)) {
      continue;
    }
    const inline = raw as InlineNode;
    onInline(inline);

    if (inline.type === "link" && Array.isArray(inline.content)) {
      for (const child of inline.content) {
        if (isPlainObject(child)) {
          onInline(child as InlineNode);
        }
      }
    }
  }
}

function walkInlineContent(content: unknown, onInline: InlineVisitor) {
  if (typeof content === "string") {
    onInline({ type: "text", text: content });
    return;
  }

  if (Array.isArray(content)) {
    walkInlineArray(content, onInline);
    return;
  }

  walkTableContent(content, onInline);
}

function extractBlockText(block: Block) {
  const parts: string[] = [];
  walkInlineContent(block.content, (inline) => {
    if (inline.type === "text" && typeof inline.text === "string") {
      parts.push(inline.text);
      return;
    }
    if (inline.type === "noteMention") {
      const label = readString(inline.props, "label");
      if (label) {
        parts.push(label);
      }
    }
  });
  return parts.join("");
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(
  source: Record<string, unknown> | InlineNode | undefined,
  key: string
): string | undefined {
  if (!source) {
    return;
  }
  const value = (source as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}
