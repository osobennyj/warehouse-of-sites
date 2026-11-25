// Husky expects to run from the git root; this app may live in a subfolder of a larger repo.
import { execSync } from "node:child_process";
import path from "node:path";

if (process.env.CI || process.env.HUSKY === "0") process.exit(0);

try {
  const appDir = process.cwd();
  const gitRoot = execSync("git rev-parse --show-toplevel", { encoding: "utf8" }).trim();
  const hooksDir = path.relative(gitRoot, path.join(appDir, ".husky")) || ".husky";
  const { default: husky } = await import("husky");
  process.chdir(gitRoot);
  const result = husky(hooksDir);
  if (result) console.warn(`git hooks: ${result}`);
} catch {
  console.warn("git hooks: skipped (not a git checkout)");
}
