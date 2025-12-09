import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081,
    strictPort: true,
    // Force clear cache and reload
    force: true,
    https: mode === "production",
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: "buffer",
      events: "events",
    },
  },
  preview: {
    port: 8080,
    strictPort: true,
    https: true,
  },
  // Clear cache on build
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    // Ensure proper handling of dynamic imports and CommonJS modules
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    // Optimize dependencies
    optimizeDeps: {
      include: ['xlsx', 'tesseract.js', 'pdfjs-dist'],
    },
  },
  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
}));
