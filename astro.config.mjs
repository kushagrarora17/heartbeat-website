import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import netlify from "@astrojs/netlify";

export default defineConfig({
  integrations: [tailwind()],
  site: "https://heartbeatimprov.com",

  build: {
    inlineStylesheets: "auto",
  },

  compressHTML: true,
  adapter: netlify(),
});