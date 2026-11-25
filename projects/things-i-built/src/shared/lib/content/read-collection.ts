import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { z } from "zod";

export interface ContentEntry<T> {
  slug: string;
  data: T;
  body: string;
}

const CONTENT_ROOT = path.join(process.cwd(), "content");
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Reads every `*.md` file of `content/<collection>` and validates its frontmatter.
 * Invalid content fails the build with a precise message instead of rendering a broken page.
 */
export function readCollection<S extends z.ZodType>(
  collection: string,
  schema: S,
  root: string = CONTENT_ROOT,
): ContentEntry<z.output<S>>[] {
  const dir = path.join(root, collection);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md") && !file.startsWith("_"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      if (!SLUG_PATTERN.test(slug)) {
        throw new Error(`content/${collection}/${file}: file name must be kebab-case`);
      }
      const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        const issues = parsed.error.issues
          .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
          .join("\n");
        throw new Error(`content/${collection}/${file} has invalid frontmatter:\n${issues}`);
      }
      return { slug, data: parsed.data, body: content.trim() };
    });
}
