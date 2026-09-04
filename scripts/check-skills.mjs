#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "node:fs";
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
const personalGroup = "kopenkinda";
const requiredManifestFields = new Set([
  "sourceType",
  "computedHash",
  "group",
  "path",
]);
const publicSourceFields = new Set([
  "source",
  "sourceUrl",
  "skillPath",
  "ref",
  "recordedUpstreamHash",
]);

for (const path of findFiles(skillsRoot)) {
  const buffer = readFileSync(path);
  const text = buffer.toString("utf8");
  if (Buffer.from(text).equals(buffer) && text.includes("\u2014")) {
    errors.push(
      `${path.slice(repoRoot.length + 1)} contains an em dash; use the ASCII hyphen-minus`,
    );
  }
}

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
  const allowedFields = new Set(requiredManifestFields);
  if (upstream.group !== personalGroup) {
    for (const field of publicSourceFields) allowedFields.add(field);
  }
  const unsupportedFields = Object.keys(upstream).filter(
    (field) => !allowedFields.has(field),
  );
  if (unsupportedFields.length > 0) {
    errors.push(
      `upstreams.json exposes unsupported fields for ${name}: ${unsupportedFields.join(", ")}`,
    );
  }
  for (const field of requiredManifestFields) {
    if (typeof upstream[field] !== "string" || upstream[field].length === 0) {
      errors.push(`upstreams.json is missing ${field} for ${name}`);
    }
  }
  if (
    typeof upstream.computedHash === "string" &&
    !/^[a-f0-9]{64}$/.test(upstream.computedHash)
  ) {
    errors.push(`upstreams.json has an invalid computedHash for ${name}`);
  }
  for (const field of publicSourceFields) {
    const value = upstream[field];
    if (
      typeof value === "string" &&
      (/^\/(?:Users|home)\//.test(value) || /^[A-Za-z]:\\Users\\/.test(value))
    ) {
      errors.push(`upstreams.json contains a local path in ${field} for ${name}`);
    }
  }
  if (
    upstream.group !== personalGroup &&
    upstream.sourceType !== "local" &&
    typeof upstream.source !== "string"
  ) {
    errors.push(`upstreams.json is missing the public source for ${name}`);
  }
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
  const rootSkill = join(directory, "SKILL.md");
  if (existsSync(rootSkill)) return [rootSkill];

  const results = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) results.push(...findSkillFiles(path));
    if (entry.isFile() && entry.name === "SKILL.md") results.push(path);
  }

  return results;
}

function findFiles(directory) {
  const results = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) results.push(...findFiles(path));
    if (entry.isFile()) results.push(path);
  }

  return results;
}
