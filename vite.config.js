import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import react from '@vitejs/plugin-react';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  base: './',
  plugins: [
    visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
    react(),
    glsl(),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
    exclude: ["three-stdlib"]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three')) return 'three';
            if (id.includes('@react-three')) return 'r3f';
            if (id.includes('framer-motion')) return 'motion';
            if (id.includes('troika-three-text')) return 'troika'; // optional
            return 'vendor';
          }
        },
      },
    },
  },
});
