import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import glsl from 'vite-plugin-glsl';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  base: './',
  plugins: [react(), glsl(), visualizer({ open: true })],

  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },

  define: {
    'process.env.NODE_ENV': '"production"',
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Safe, non-breaking chunk splitting
            if (id.includes('three')) return 'vendor_three';
            if (id.includes('@react-three/fiber')) return 'vendor_fiber';
            if (id.includes('framer-motion')) return 'vendor_motion';
            if (id.includes('hls.js')) return 'vendor_hls';
            return 'vendor'; // all other node_modules
          }
        },
      },
    },
  },
});
