import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import netlify from "@astrojs/netlify";

import sanity from "@sanity/astro";

export default defineConfig({
  integrations: [
    tailwind(),
    sanity({
      projectId: "z1jw64l3",
      dataset: "production",
      useCdn: false, // for static builds
    }),
  ],
  site: "https://heartbeatimprov.com",

  build: {
    inlineStylesheets: "auto",
  },

  compressHTML: true,
  adapter: netlify(),
});
