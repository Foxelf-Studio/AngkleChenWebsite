import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const posts = defineCollection({
  loader: glob({ base: "./src/content/posts", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    excerpt: z.string().default(""),
  }),
});

const apps = defineCollection({
  loader: glob({ base: "./src/content/apps", pattern: "**/*.md" }),
  schema: z.object({
    name: z.string(),
    icon: z.string().default("📦"),
    version: z.string().default(""),
    tag: z.string().default(""),
    description: z.string().default(""),
    downloadUrl: z.string().default(""),
  }),
});

const about = defineCollection({
  loader: glob({ base: "./src/content/about", pattern: "**/*.md" }),
  schema: z.object({
    siteTitle: z.string().default("陈叔叔的奇幻空间"),
    siteSubtitle: z.string().default(""),
    heroName: z.string().default("陈叔叔"),
    heroCta: z.string().default("看看我做的软件 →"),
    heroCtaLink: z.string().default("/apps"),
    email: z.string().default(""),
    github: z.string().default(""),
  }),
});

export const collections = { posts, apps, about };
