import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// Configuration Vite : React + Tailwind CSS v4 + PWA (installable & hors-ligne).
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["apple-touch-icon.png"],
      manifest: {
        name: "Diagnostic Olfactif Parfumarium",
        short_name: "Parfumarium",
        description:
          "Trouvez le parfum idéal en quelques questions — borne de diagnostic olfactif Parfumarium.",
        lang: "fr",
        start_url: ".",
        display: "standalone",
        orientation: "portrait",
        background_color: "#f7f4ed",
        theme_color: "#1c1913",
        icons: [
          { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
});
