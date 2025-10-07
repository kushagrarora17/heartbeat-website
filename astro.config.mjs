import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  integrations: [tailwind()],
  site: "https://heartbeatimprov.com",
  build: {
    inlineStylesheets: "auto",
  },
  compressHTML: true,
});
