import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      include: "**/*.tsx",
    }),
    nodePolyfills(),
  ],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
    },
  }
});
