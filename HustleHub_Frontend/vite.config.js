import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Content Security Policy for React frontend
const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "connect-src 'self' https://localhost:3000 ws://localhost:5173",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'"
].join("; ");

export default defineConfig({
    plugins: [react()],

    // Apply security headers to the Vite development server
    server: {
        headers: {
            "Content-Security-Policy": csp
        }
    },

    test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js"
}
});