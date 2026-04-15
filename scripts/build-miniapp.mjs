import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const sourceDir = path.join(rootDir, "miniprogram");
const outputDir = path.join(rootDir, "dist");

function ensureDir(dirPath) {
  mkdirSync(dirPath, { recursive: true });
}

function copyStaticAssets(fromDir, toDir) {
  ensureDir(toDir);

  for (const entry of readdirSync(fromDir)) {
    const sourcePath = path.join(fromDir, entry);
    const targetPath = path.join(toDir, entry);
    const stats = statSync(sourcePath);

    if (stats.isDirectory()) {
      copyStaticAssets(sourcePath, targetPath);
      continue;
    }

    if (sourcePath.endsWith(".ts") || sourcePath.endsWith(".d.ts")) {
      continue;
    }

    cpSync(sourcePath, targetPath);
  }
}

function walkTypeScriptRuntimeFiles(dirPath, files = []) {
  for (const entry of readdirSync(dirPath)) {
    const absolutePath = path.join(dirPath, entry);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      walkTypeScriptRuntimeFiles(absolutePath, files);
      continue;
    }

    if (!absolutePath.endsWith(".ts") || absolutePath.endsWith(".d.ts")) {
      continue;
    }

    files.push(absolutePath);
  }

  return files;
}

function syncCompiledRuntimeJs(fromDir, toDir) {
  const runtimeEntries = walkTypeScriptRuntimeFiles(toDir);

  for (const tsPath of runtimeEntries) {
    const relativePath = path.relative(toDir, tsPath).replace(/\.ts$/, ".js");
    const compiledJsPath = path.join(fromDir, relativePath);
    const sourceJsPath = path.join(toDir, relativePath);

    if (!existsSync(compiledJsPath)) {
      throw new Error(`Missing compiled runtime output: ${compiledJsPath}`);
    }

    ensureDir(path.dirname(sourceJsPath));
    cpSync(compiledJsPath, sourceJsPath);
  }
}

if (!existsSync(sourceDir)) {
  throw new Error(`Missing source miniprogram directory: ${sourceDir}`);
}

rmSync(outputDir, { recursive: true, force: true });
copyStaticAssets(sourceDir, outputDir);

execFileSync(
  process.execPath,
  [path.join(rootDir, "node_modules", "typescript", "bin", "tsc"), "-p", path.join(rootDir, "tsconfig.build.json")],
  {
    cwd: rootDir,
    stdio: "inherit",
  },
);

syncCompiledRuntimeJs(outputDir, sourceDir);

console.log(`Built miniapp output -> ${outputDir}`);
