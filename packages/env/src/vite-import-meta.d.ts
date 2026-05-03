/** Local shim so `import.meta.env` types work without pulling `vite/client` into tsc. */
interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
