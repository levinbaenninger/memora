import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  plugins: [tailwindcss(), tanstackStart(), viteReact(), nitro()],
  ssr:
    command === "build"
      ? {
          noExternal: ["react", "react-dom", "use-sync-external-store"],
        }
      : undefined,
  resolve: {
    tsconfigPaths: true,
  },
}));
