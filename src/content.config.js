import { z } from "zod";
import { defineCollection } from "astro:content";

const commonSchema = {
  title: z.string().optional(),
  description: z.string().optional(),
  draft: z.boolean().optional(),
  date: z.string().optional(),
};

export const collections = {
  articles: defineCollection({
    schema: z.object(commonSchema),
  }),
  events: defineCollection({
    schema: z.object({
      ...commonSchema,
      location: z.string().optional(),
    }),
  }),
};
