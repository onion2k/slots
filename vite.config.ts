import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@app": "/src/app",
      "@game": "/src/game",
      "@ui": "/src/ui",
      "@styles": "/src/styles",
      "@lib": "/src/lib"
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setupTests.ts"
  }
});
