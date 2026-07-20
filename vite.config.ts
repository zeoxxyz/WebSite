import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Was: @lovable.dev/vite-tanstack-config (defaults to a cloudflare nitro target,
// only relevant inside Lovable's own preview/hosting). Replaced with the plugins
// it wrapped, but pointed at Vercel via nitro's "vercel" preset so the build
// output is Vercel Functions instead of a Cloudflare Worker.
export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({
      // Keep pointing TanStack Start's server entry at src/server.ts (SSR error wrapper)
      server: { entry: "server" },
    }),
    nitro({ preset: "vercel" }),
    viteReact(),
  ],
});
