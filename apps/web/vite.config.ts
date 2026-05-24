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
      const resolved = await this.resolve(source, importer, {
        skipSelf: true,
      });
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
