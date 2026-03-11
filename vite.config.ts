import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": "./src",
    },
  },
  base: "/MDI-Prototyp/",
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  assetsInclude: ["**/*.svg", "**/*.csv"],
  define: {
    STATS_URL: JSON.stringify(mode === "development"
      ? "http://localhost:3000"
      : "https://stats.venastrom.se"
    ),
  },
}));
