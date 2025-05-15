import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import Terminal from "vite-plugin-terminal";

export default defineConfig(({ command }) => ({
  plugins: [
    tailwindcss(),
    react(),
    ...(command === "serve"
      ? [
          Terminal({
            console: "terminal",
            output: ["terminal", "console"],
          }),
        ]
      : []),
  ],
  base: "./",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          p5: ["p5"],
        },
      },
    },
  },
}));
