import { readdir } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";

const ignoredDirectories = new Set([".git", ".hg", ".svn", "node_modules", "vendor", "dist", "build", "coverage", ".next", ".cache"]);
const manifestNames = new Set(["package.json", "pyproject.toml", "requirements.txt", "Cargo.toml", "go.mod", "pom.xml", "build.gradle", "build.gradle.kts", "*.sln", "*.csproj"]);
const documentNames = new Set(["README.md", "AGENTS.md", "CONTRIBUTING.md", "ARCHITECTURE.md"]);

export interface RepositoryEvidence {
  readonly filesScanned: number;
  readonly truncated: boolean;
  readonly manifests: readonly string[];
  readonly documents: readonly string[];
}

export async function inspectRepository(repositoryRoot: string, maxFiles = 2_000, maxDepth = 8): Promise<RepositoryEvidence> {
  const root = resolve(repositoryRoot);
  const manifests: string[] = [];
  const documents: string[] = [];
  let filesScanned = 0;
  let truncated = false;

  async function visit(directory: string, depth: number): Promise<void> {
    if (truncated || depth > maxDepth) return;
    const entries = (await readdir(directory, { withFileTypes: true })).sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      if (truncated) return;
      if (entry.isSymbolicLink()) continue;
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!ignoredDirectories.has(entry.name)) await visit(path, depth + 1);
        continue;
      }
      if (!entry.isFile()) continue;
      filesScanned += 1;
      if (filesScanned > maxFiles) {
        filesScanned = maxFiles;
        truncated = true;
        return;
      }
      const name = entry.name;
      const rel = relative(root, path).split(sep).join("/");
      if (manifestNames.has(name) || name.endsWith(".sln") || name.endsWith(".csproj")) manifests.push(rel);
      if (documentNames.has(name) || rel.startsWith("docs/") && name.endsWith(".md")) documents.push(rel);
    }
  }

  await visit(root, 0);
  return { filesScanned, truncated, manifests, documents };
}
