import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
const env = loadEnv(process.env.NODE_ENV, process.cwd());
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [{ find: '@', replacement: '/src' }],
  },
  server: {
    host: true,
    port: 3000,
    open: true,
    proxy: {
      "/ais/proxy": {
        target: env.VITE_API_URL,
        changeOrigin: true,
      },
    },
  },
});
