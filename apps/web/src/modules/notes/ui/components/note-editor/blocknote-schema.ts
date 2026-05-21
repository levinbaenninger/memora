import { codeBlockOptions } from "@blocknote/code-block";
import {
  BlockNoteSchema,
  createCodeBlockSpec,
  createHeadingBlockSpec,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
} from "@blocknote/core";

import { noteMentionSpec } from "./note-mention-spec";

const {
  audio: _audio,
  file: _file,
  image: _image,
  table: _table,
  video: _video,
  ...allowedBlockSpecs
} = defaultBlockSpecs;

const {
  backgroundColor: _backgroundColor,
  textColor: _textColor,
  ...allowedStyleSpecs
} = defaultStyleSpecs;

export const noteSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...allowedBlockSpecs,
    codeBlock: createCodeBlockSpec(codeBlockOptions),
    heading: createHeadingBlockSpec({
      levels: [1, 2, 3],
      allowToggleHeadings: false,
      defaultLevel: 1,
    }),
  },
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    noteMention: noteMentionSpec,
  },
  styleSpecs: allowedStyleSpecs,
});

export type NoteEditor = typeof noteSchema.BlockNoteEditor;
export type NoteBlock = typeof noteSchema.Block;
