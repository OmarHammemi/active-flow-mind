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
    // Use 'all' to allow all hosts, or specify the exact hosts
    allowedHosts: mode === "development" ? "all" : [], // Only allow all hosts in development
    hmr: mode === "development" ? {
      host: "falah.live",
      port: 3006,
      protocol: "ws",
      overlay: false,
    } : false,
    cors: mode === "development", // Only enable CORS in development
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
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
}));
