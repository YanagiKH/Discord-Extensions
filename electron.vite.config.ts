import { resolve } from 'node:path';
import { defineConfig } from 'electron-vite';

export default defineConfig({
  main: {
    build: {
      outDir: 'dist/main'
    }
  },
  preload: {
    build: {
      outDir: 'dist/preload'
    }
  },
  renderer: {
    build: {
      outDir: 'dist/renderer',
      rollupOptions: {
        input: {
          index: resolve('src/renderer/index.html'),
          workbench: resolve('src/renderer/workbench.html')
        }
      }
    }
  }
});
