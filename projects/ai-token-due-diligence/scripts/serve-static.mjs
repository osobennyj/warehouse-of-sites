import { cpSync, mkdirSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptsDir, "..");
const outDir = path.join(projectRoot, "out");
const basePath = (
  process.env.NEXT_PUBLIC_BASE_PATH ?? "/warehouse-of-sites/projects/ai-token-due-diligence"
).replace(/^\//, "");
const serveRoot = path.join(projectRoot, ".static-serve");

rmSync(serveRoot, { recursive: true, force: true });
const targetDir = path.join(serveRoot, ...basePath.split("/"));
mkdirSync(targetDir, { recursive: true });
cpSync(outDir, targetDir, { recursive: true });

const port = process.env.PORT ?? "3000";
const child = spawn("npx", ["--yes", "serve@14", serveRoot, "-l", port], {
  stdio: "inherit",
  cwd: projectRoot,
});
child.on("exit", (code) => process.exit(code ?? 0));