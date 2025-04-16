import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [react(), glsl()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000', // if running your own local server, not needed for Vercel
    },
  },
});
