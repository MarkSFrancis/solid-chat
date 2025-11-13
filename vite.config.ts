import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import tsConfigPathsPlugin from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [solidPlugin(), tsConfigPathsPlugin()],
  server: {
    proxy: {
      "/api": {
        ws: true,
        target: "ws://localhost:8080",
        rewriteWsOrigin: true,
      },
    },
  },
});
