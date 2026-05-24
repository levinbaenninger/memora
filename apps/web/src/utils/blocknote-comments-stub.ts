// Safe stub for @blocknote/react's comments controller chunks. Returned in
// place of the FloatingThreadController / FloatingComposerController chunks so
// the broken upstream bundle never loads. Callers must not destructure, call
// methods on, or read properties from `noop`'s return value — it is only safe
// as a React component / hook reference whose result is discarded.
const noop = () => null;

// The single-letter named exports below mirror the exports emitted by the
// FloatingThreadController and FloatingComposerController chunks in
// @blocknote/react@0.50.0. They are referenced by static and dynamic imports
// in the compiled `blocknote-react.js`, so all of them must exist as live
// bindings even though we never render comments.
//
// When upgrading @blocknote/react, verify these letters still match the
// chunk's `export { ... }` statement:
//   node_modules/@blocknote/react/dist/FloatingThreadController-*.js
//   node_modules/@blocknote/react/dist/FloatingComposerController-*.js
// If they differ, update this file and the matching resolver in
// apps/web/vite.config.ts (`stubBlocknoteComments`).
export default noop;
export const a = noop;
export const c = noop;
export const i = noop;
export const n = noop;
export const o = noop;
export const r = noop;
export const s = noop;
export const t = noop;
