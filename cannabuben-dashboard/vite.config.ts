import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
  },
  // ✅ Correct way for SPA routing fallback on Vite 5+ (Render / Vercel safe)
  server: {
    port: 5173,
    fs: { strict: false },
  },
  // ✅ Enable history fallback through Rollup HTML entry
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});
