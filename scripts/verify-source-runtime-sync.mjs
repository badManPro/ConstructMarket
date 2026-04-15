import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const sourceDir = path.join(rootDir, "miniprogram");
const distDir = path.join(rootDir, "dist");

function walkTsFiles(dirPath, files = []) {
  for (const entry of readdirSync(dirPath)) {
    const absolutePath = path.join(dirPath, entry);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      walkTsFiles(absolutePath, files);
      continue;
    }

    if (!absolutePath.endsWith(".ts") || absolutePath.endsWith(".d.ts")) {
      continue;
    }

    files.push(absolutePath);
  }

  return files;
}

if (!existsSync(distDir)) {
  console.error("Missing dist/ build output. Run `npm run build:miniapp` first.");
  process.exit(1);
}

const issues = [];
const tsFiles = walkTsFiles(sourceDir);

for (const tsFile of tsFiles) {
  const relativePath = path.relative(sourceDir, tsFile);
  const runtimeRelativePath = relativePath.replace(/\.ts$/, ".js");
  const sourceJsPath = path.join(sourceDir, runtimeRelativePath);
  const distJsPath = path.join(distDir, runtimeRelativePath);

  if (!existsSync(distJsPath)) {
    issues.push(`dist missing compiled output for ${runtimeRelativePath}`);
    continue;
  }

  if (!existsSync(sourceJsPath)) {
    issues.push(`source missing runtime JS for ${runtimeRelativePath}`);
    continue;
  }

  const sourceContents = readFileSync(sourceJsPath, "utf8");
  const distContents = readFileSync(distJsPath, "utf8");

  if (sourceContents !== distContents) {
    issues.push(`source JS out of sync for ${runtimeRelativePath}`);
  }
}

if (issues.length) {
  console.error("Miniapp source runtime sync check failed:");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log(`Miniapp source runtime sync verified for ${tsFiles.length} TypeScript files.`);
