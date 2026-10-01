// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  // --------------------------------------------------------------------------
  // PACKAGED ELECTRON RENDERER
  // --------------------------------------------------------------------------
  //
  // Electron loads the production renderer using:
  //
  //     file:///.../dist/index.html
  //
  // Relative asset paths are therefore required.
  //
  // This makes Vite generate:
  //
  //     ./assets/index-xxxx.js
  //
  // instead of:
  //
  //     /assets/index-xxxx.js
  //
  // which would fail under Electron's file:// protocol.
  // --------------------------------------------------------------------------

  base: './',

  // --------------------------------------------------------------------------
  // PLUGINS
  // --------------------------------------------------------------------------

  plugins: [
    react(),
  ],

  // --------------------------------------------------------------------------
  // PATH ALIASES
  // --------------------------------------------------------------------------

  resolve: {
    alias: {
      '@': path.resolve(
        __dirname,
        'src/renderer',
      ),
    },
  },

  // --------------------------------------------------------------------------
  // BUILD
  // --------------------------------------------------------------------------

  build: {
    outDir: 'dist',

    emptyOutDir: true,
  },
});