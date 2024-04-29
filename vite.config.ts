import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
// import { nodePolyfills as pp } from "vite-plugin-node-polyfills";
// import nodePolyfills from "rollup-plugin-polyfill-node";

installGlobals();

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
  ssr: {
    noExternal: ["remix-utils"],
    // external: ["remix-utils", "child_process"],
  },
  build: {
    rollupOptions: {
      external: ["fs/promises", "child_process"],
    },
  },
});
