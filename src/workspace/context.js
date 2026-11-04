import fs from "node:fs/promises";
import path from "node:path";

const SKIP_DIRS = new Set([".git", "node_modules", ".next", "dist", "build", "coverage", "vendor", "cache", "logs"]);
const SKIP_FILES = new Set([".env", ".env.local", ".env.production", ".npmrc", ".pypirc", "id_rsa", "id_ed25519"]);
const ALLOWED_EXTENSIONS = new Set([".md", ".mdx", ".js", ".jsx", ".ts", ".tsx", ".json", ".mjs", ".cjs", ".py", ".rs", ".go", ".php", ".css", ".html", ".yml", ".yaml", ".toml", ".txt"]);
const MAX_FILE_BYTES = 24_000;
const MAX_TOTAL_BYTES = 100_000;
const MAX_FILES = 35;

export async function collectWorkspaceContext(rootDir) {
  const root = path.resolve(rootDir);
  const chunks = [];
  let total = 0;
  let count = 0;

  async function walk(dir) {
    if (count >= MAX_FILES || total >= MAX_TOTAL_BYTES) return;
    let entries;
    try { entries = await fs.readdir(dir, { withFileTypes: true }); }
    catch { return; }

    for (const entry of entries) {
      if (count >= MAX_FILES || total >= MAX_TOTAL_BYTES) break;
      if (entry.name.startsWith(".") && entry.name !== ".github") continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) await walk(fullPath);
        continue;
      }
      if (!entry.isFile() || SKIP_FILES.has(entry.name)) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext) && entry.name !== "Dockerfile") continue;
      try {
        const stat = await fs.stat(fullPath);
        if (stat.size > MAX_FILE_BYTES || stat.size === 0) continue;
        const content = await fs.readFile(fullPath, "utf8");
        if (content.includes("\0")) continue;
        const relative = path.relative(root, fullPath).split(path.sep).join("/");
        const block = `\\n--- ${relative} ---\\n${content.slice(0, MAX_FILE_BYTES)}\\n`;
        if (total + Buffer.byteLength(block) > MAX_TOTAL_BYTES) continue;
        chunks.push(block);
        total += Buffer.byteLength(block);
        count++;
      } catch { /* Ignore unreadable files. */ }
    }
  }

  await walk(root);
  return { text: chunks.join(""), files: count, bytes: total };
}
