// @ts-check
import { defineConfig, envField } from "astro/config";
import { loadEnv } from "vite";
import netlify from "@astrojs/netlify";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

const env = loadEnv(process.env.NODE_ENV ?? "", process.cwd(), "");
// Preview-Deploy (Visual Editor): Seiten werden on demand gerendert und zeigen Entwürfe.
const isPreview = env.STORYBLOK_PREVIEW === "true";
const useHttps = env.DEV_HTTPS === "true";

export default defineConfig({
  site: env.SITE_URL || "https://nz-wasenmoosgeister-hoell.de",
  output: isPreview ? "server" : "static",
  // Adapter nur für den Preview-Deploy nötig; Production ist rein statisch.
  adapter: isPreview ? netlify() : undefined,
  trailingSlash: "ignore",
  integrations: isPreview ? [] : [sitemap()],
  env: {
    schema: {
      STORYBLOK_DELIVERY_TOKEN: envField.string({ context: "server", access: "secret", optional: true }),
      STORYBLOK_PREVIEW_TOKEN: envField.string({ context: "server", access: "secret", optional: true }),
      STORYBLOK_PREVIEW: envField.boolean({ context: "server", access: "public", default: false }),
      STORYBLOK_OFFLINE: envField.boolean({ context: "server", access: "public", default: false }),
    },
  },
  vite: {
    plugins: [tailwindcss(), ...(useHttps ? [basicSsl()] : [])],
  },
});
