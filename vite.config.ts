import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 3006,
    strictPort: true,
    allowedHosts: [
      "falah.live",
      "www.falah.live",
      "localhost",
      "127.0.0.1",
      "0.0.0.0",
    ],
    // COMPLETELY DISABLE HMR - NO WEBSOCKET CONNECTIONS
    hmr: false,
    ws: false, // Disable WebSocket server completely
    cors: mode === "development",
    https: false,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Plugin to completely disable Vite client injection and WebSocket
    {
      name: 'disable-vite-client',
      enforce: 'post', // Run after other plugins to catch injected scripts
      transformIndexHtml: {
        enforce: 'post',
        transform(html) {
          // Remove ALL Vite client script injections (multiple patterns)
          return html
            .replace(/<script type="module" src="\/@vite\/client"><\/script>/gi, '')
            .replace(/<script type="module">[\s\S]*?\/@vite\/client[\s\S]*?<\/script>/gi, '')
            .replace(/import\s+.*?from\s+['"]\/@vite\/client['"];?/gi, '');
        },
      },
      transform(code, id) {
        // Remove HMR code that causes "Invalid left-hand side in assignment" error
        if (code && typeof code === 'string') {
          let cleaned = code;
          
          // Remove all HMR-related imports from /@vite/client
          cleaned = cleaned.replace(/import\s+.*?from\s+['"]\/@vite\/client['"];?\s*/g, '');
          
          // Remove import.meta.hot assignments (read-only, causes error)
          cleaned = cleaned.replace(/import\.meta\.hot\s*=\s*[^;]+;?\s*/g, '');
          
          // Remove import.meta.hot method calls (accept, prune, etc.)
          cleaned = cleaned.replace(/import\.meta\.hot\.[a-zA-Z]+\([^)]*\);?\s*/g, '');
          
          // Remove __vite__ function calls that are part of HMR
          cleaned = cleaned.replace(/__vite__(updateStyle|removeStyle|createHotContext)\([^)]*\);?\s*/g, '');
          
          // Remove arrow functions that are part of HMR prune callbacks
          cleaned = cleaned.replace(/\(\)\s*=>\s*__vite__removeStyle\([^)]*\)\)?\s*/g, '');
          cleaned = cleaned.replace(/=>\s*__vite__removeStyle\([^)]*\)\)?\s*/g, '');
          
          // Clean up any remaining orphaned syntax
          cleaned = cleaned.replace(/^\s*=>\s*[^;]+;?\s*$/gm, '');
          
          if (cleaned !== code) {
            return { code: cleaned, map: null };
          }
        }
        return null;
      },
      configureServer(server) {
        // Return dummy Vite client module to prevent import errors
        server.middlewares.use('/@vite/client', (req, res) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/javascript');
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          // Return ES module with all Vite client exports as no-ops
          res.end(`
// Vite client disabled - dummy exports to prevent errors
export function createHotContext() {
  return {
    accept: () => {},
    acceptDeps: () => {},
    acceptExports: () => {},
    decline: () => {},
    invalidate: () => {},
    dispose: () => {},
    on: () => {},
    off: () => {},
    send: () => {},
  };
}
export const hot = undefined;
export const updateStyle = () => {};
export const removeStyle = () => {};
export const injectQuery = (id, query) => id;
export const isCSSRequest = () => false;
export const isExplicitImportRequired = () => false;
export const isModernBrowser = false;
export const viteClientId = '';
`);
        });
        // Block WebSocket upgrade requests
        server.middlewares.use((req, res, next) => {
          if (req.headers.upgrade === 'websocket' || req.url?.includes('?token=')) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('WebSocket disabled');
            return;
          }
          next();
        });
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize build for production
    minify: "esbuild",
    sourcemap: false, // Disable sourcemaps in production for security
    rollupOptions: {
      output: {
        // Code splitting for better performance
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          'utils-vendor': ['date-fns', '@tanstack/react-query'],
        },
        // Optimize chunk names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
    // Optimize assets
    assetsInlineLimit: 4096, // Inline small assets
  },
  // Remove console.logs in production
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
  // Completely disable HMR client injection
  define: {
    'import.meta.hot': 'undefined',
  },
}));
