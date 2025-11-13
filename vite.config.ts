import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';
import solidPlugin from 'vite-plugin-solid';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tanstackRouter({
      target: 'solid',
      autoCodeSplitting: true,
    }),
    solidPlugin(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        ws: true,
        target: 'ws://localhost:8080',
        rewriteWsOrigin: true,
      },
    },
  },
  build: {
    target: 'esnext',
  },
});
