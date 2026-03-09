import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
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
});
