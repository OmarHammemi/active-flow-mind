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
      "20.107.168.51",
      "localhost",
    ],
    hmr: {
      host: "falah.live",
      port: 3006,
      protocol: "ws",
      overlay: false,
    },
    cors: true,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
