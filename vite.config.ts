import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 3006,
    open: true,
    proxy: {
      '/api/eternal-return': {
        target: 'https://open-api.bser.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/eternal-return/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // API キーをヘッダーに追加
            const apiKey = env.VITE_ETERNAL_RETURN_API_KEY;
            if (apiKey) {
              proxyReq.setHeader('x-api-key', apiKey);
            }
            proxyReq.setHeader('accept', 'application/json');
          });
        },
      },
      '/api/l10n': {
        target: 'https://d1wkxvul68bth9.cloudfront.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  };
});