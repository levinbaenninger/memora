import { fileURLToPath } from "node:url";
import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv, type Plugin } from "vite";

const webRoot = fileURLToPath(new URL(".", import.meta.url));

const blocknoteCommentsStub = fileURLToPath(
  new URL("./src/utils/blocknote-comments-stub.ts", import.meta.url)
);

// Matches @blocknote/react comment-chunk filenames such as
// `FloatingThreadController.js`, `FloatingThreadController-DXD0P6RJ.js`, or
// the same names without the `.js` extension. Pattern parts:
//   (?:^|[\\/])                  — start of string or a (posix/windows) path
//                                  separator, so we match the basename only
//   Floating(?:Thread|Composer)Controller
//                                — the two controller chunks we want to stub
//   (?:-[A-Za-z0-9_]+)?          — Rolldown's optional content-hash suffix
//   (?:\.js)?$                   — optional `.js` extension at end of string
const BLOCKNOTE_COMMENTS_CHUNK =
  /(?:^|[\\/])Floating(?:Thread|Composer)Controller(?:-[A-Za-z0-9_]+)?(?:\.js)?$/;
const BLOCKNOTE_REACT_PATH = /@blocknote[\\/]react[\\/]/;

function stubBlocknoteComments(): Plugin {
  return {
    name: "stub-blocknote-comments",
    enforce: "pre",
    async resolveId(source, importer) {
      if (!BLOCKNOTE_COMMENTS_CHUNK.test(source)) {
        return null;
      }
      let resolved: Awaited<ReturnType<typeof this.resolve>> | null = null;
      try {
        resolved = await this.resolve(source, importer, {
          skipSelf: true,
        });
      } catch (error) {
        this.warn(
          `stub-blocknote-comments: failed to resolve ${source}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        return null;
      }
      if (!resolved) {
        return null;
      }
      if (
        BLOCKNOTE_REACT_PATH.test(resolved.id) &&
        BLOCKNOTE_COMMENTS_CHUNK.test(resolved.id)
      ) {
        return blocknoteCommentsStub;
      }
      return null;
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, webRoot, "");

  return {
    plugins: [
      stubBlocknoteComments(),
      tailwindcss(),
      tanstackStart({ spa: { enabled: true } }),
      sentryTanstackStart({
        authToken: env.SENTRY_AUTH_TOKEN,
        org: env.VITE_SENTRY_ORG,
        project: env.VITE_SENTRY_PROJECT,
        tunnelRoute: "/tunnel",
      }),
      viteReact(),
      nitro({
        traceDeps: ["react"],
      }),
    ],
    resolve: {
      tsconfigPaths: true,
    },
  };
});
