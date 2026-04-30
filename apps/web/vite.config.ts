import { fileURLToPath } from "node:url";
import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";

const webRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, webRoot, "");
  return {
    define: {
      "import.meta.env.VITE_SENTRY_DSN": JSON.stringify(
        env.VITE_SENTRY_DSN ?? env.SENTRY_DSN ?? ""
      ),
    },
    plugins: [
      tailwindcss(),
      tanstackStart(),
      sentryTanstackStart({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: "levexis",
        project: "memora",
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
