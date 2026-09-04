#!/usr/bin/env node

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = join(repoRoot, "skills");
const manifest = JSON.parse(
  readFileSync(join(repoRoot, "upstreams.json"), "utf8"),
);
const errors = [];
const names = new Map();
const discoveredPaths = new Map();

for (const skillPath of findSkillFiles(skillsRoot)) {
  const relativePath = skillPath
    .slice(skillsRoot.length + 1)
    .replaceAll("\\", "/");
  const parts = relativePath.split("/");
  const directoryName = parts.at(-2);
  const mirrorPath = `skills/${parts.slice(0, -1).join("/")}`;
  const source = readFileSync(skillPath, "utf8");
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);

  if (!frontmatter) {
    errors.push(`${relativePath} has no YAML frontmatter`);
    continue;
  }

  const name = frontmatter[1].match(
    /^name:\s*["']?([^\r\n"']+)["']?\s*$/m,
  )?.[1];
  const description = frontmatter[1].match(/^description:\s*(.+)$/m)?.[1];

  if (!name) errors.push(`${relativePath} has no name`);
  if (!description) errors.push(`${relativePath} has no description`);
  if (name && name !== directoryName) {
    errors.push(`${mirrorPath} declares name: ${name}`);
  }
  if (name && names.has(name)) {
    errors.push(
      `Duplicate skill name ${name}: ${names.get(name)} and ${mirrorPath}`,
    );
  }
  if (name) {
    names.set(name, mirrorPath);
    discoveredPaths.set(name, mirrorPath);
  }
}

for (const [name, upstream] of Object.entries(manifest.skills ?? {})) {
  if (!discoveredPaths.has(name)) {
    errors.push(`upstreams.json points to missing skill: ${name}`);
  } else if (upstream.path !== discoveredPaths.get(name)) {
    errors.push(
      `upstreams.json records ${upstream.path} for ${name}, found ${discoveredPaths.get(name)}`,
    );
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Validated ${names.size} skill${names.size === 1 ? "" : "s"}.`);

function findSkillFiles(directory) {
  const results = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) results.push(...findSkillFiles(path));
    if (entry.isFile() && entry.name === "SKILL.md") results.push(path);
  }

  return results;
}
