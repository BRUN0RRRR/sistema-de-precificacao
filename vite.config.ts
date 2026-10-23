import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import type { IncomingMessage, ServerResponse } from 'http';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

type ApiRequest = IncomingMessage & { body?: unknown };
type ApiResponse = ServerResponse & {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

/**
 * Faz o `npm run dev` servir a rota /api/db (api/db.ts), igual à Vercel em produção.
 * Lê as variáveis de .env.local. Só roda em desenvolvimento.
 */
function localApi(): Plugin {
  return {
    name: 'local-api',
    apply: 'serve',
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.root, '');
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) process.env[key] = value;
      }

      server.middlewares.use('/api/db', async (req, res) => {
        const apiReq = req as ApiRequest;
        const apiRes = res as ApiResponse;
        apiRes.status = (code) => {
          res.statusCode = code;
          return apiRes;
        };
        apiRes.json = (body) => {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(body));
        };

        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const raw = Buffer.concat(chunks).toString('utf8');
          apiReq.body = raw ? JSON.parse(raw) : undefined;

          const mod = await server.ssrLoadModule('/api/db.ts');
          await mod.default(apiReq, apiRes);
        } catch (error) {
          console.error('[api/db]', error);
          apiRes.status(500).json({ error: 'Erro ao executar a API local.' });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    localApi(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'icon.svg'],
      manifest: {
        id: '/',
        name: 'Calculo de produtos',
        short_name: 'Calculo',
        description: 'Cálculo de preço de venda de fardos e caixas, margens e catálogo sincronizado na nuvem.',
        theme_color: '#f97316',
        background_color: '#fff7ed',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // a API nunca pode ser servida pelo service worker
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
