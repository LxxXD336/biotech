// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            input: {
                main: "index.html",
            },
        },
    },
    server: {
        proxy: {
            "/api": { target: "http://localhost:5174", changeOrigin: true },
            "/static": { target: "http://localhost:5174", changeOrigin: true }
        }
    }
});
