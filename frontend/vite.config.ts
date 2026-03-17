import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";
import react from '@vitejs/plugin-react';
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    port: 5173, 
    open: true,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
});
