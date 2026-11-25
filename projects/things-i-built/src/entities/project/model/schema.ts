import { z } from "zod";

export const PROJECT_TAGS = ["Research", "Trading", "Bots", "AI", "DeFi"] as const;
export const PROJECT_STATUSES = ["live", "beta", "in-progress"] as const;
export const PROJECT_ACCENTS = ["teal", "violet", "amber", "sky", "rose", "lime"] as const;

const publicAssetPath = z
  .string()
  .regex(/^\/[\w\-./]+\.(png|jpe?g|webp|gif|avif|svg)$/, "must be an image path inside /public, e.g. /projects/x/cover.png");

export const projectFrontmatterSchema = z
  .object({
    title: z.string().min(2).max(60),
    tagline: z.string().min(10).max(140),
    description: z.string().min(30).max(220),
    status: z.enum(PROJECT_STATUSES),
    tags: z.array(z.enum(PROJECT_TAGS)).min(1).max(3),
    stack: z.array(z.string().min(1)).min(2).max(6),
    metric: z.object({ value: z.string().min(1).max(24), label: z.string().min(1).max(60) }).strict(),
    role: z.string().min(3).default("Product, architecture, AI-assisted implementation"),
    links: z.object({ live: z.url().optional(), github: z.url().optional() }).strict().default({}),
    cover: z.object({ src: publicAssetPath, alt: z.string().min(5) }).strict().optional(),
    accent: z.enum(PROJECT_ACCENTS).default("teal"),
    featured: z.boolean().default(true),
    order: z.number().int().default(100),
    date: z.coerce.date(),
  })
  .strict();
