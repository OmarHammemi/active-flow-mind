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
    allowedHosts: "all", // This allows all hosts - use only in development!
    hmr: {
      host: "falah.live",
      port: 3006,
      protocol: "ws",
      overlay: false,
    },
    cors: true,
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
}));
