import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",   // ✅ เปิดให้เครื่องอื่นใน LAN หรือมือถือเข้ามาได้
    port: 5173
  }
});
