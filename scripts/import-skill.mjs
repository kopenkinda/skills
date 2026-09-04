#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rawArgs = process.argv.slice(2);
const positional = [];
let explicitOnly = false;
let requestedGroup;

for (let index = 0; index < rawArgs.length; index += 1) {
  const arg = rawArgs[index];
  if (arg === "--explicit-only") {
    explicitOnly = true;
  } else if (arg === "--group") {
    requestedGroup = rawArgs[index + 1];
    index += 1;
    if (!requestedGroup) {
      console.error("--group requires an author name");
      process.exit(1);
    }
  } else {
    positional.push(arg);
  }
}

if (
  positional.length !== 2 ||
  positional.includes("--help") ||
  positional.includes("-h")
) {
  console.error(
    "Usage: npm run import -- <source> <skill-name> [--group <author>] [--explicit-only]",
  );
  process.exit(
    positional.includes("--help") || positional.includes("-h") ? 0 : 1,
  );
}

const [source, skillName] = positional;

if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(skillName)) {
  console.error(
    "Skill names must contain lowercase letters, digits, or hyphens and be at most 64 characters.",
  );
  process.exit(1);
}

const group = normalizeGroup(requestedGroup ?? deriveGroup(source));
const destination = join(repoRoot, "skills", group, skillName);

if (existsSync(destination)) {
  console.error(`Refusing to overwrite existing fork: ${destination}`);
  process.exit(1);
}

const workDir = mkdtempSync(join(tmpdir(), "skills-mirror-import-"));

try {
  const cliPath = join(repoRoot, "node_modules", ".bin", "skills");
  const command = existsSync(cliPath) ? cliPath : "npx";
  const commandArgs = existsSync(cliPath)
    ? ["add", source, "--skill", skillName, "--agent", "codex", "--copy", "-y"]
    : [
        "--yes",
        "skills@1.5.23",
        "add",
        source,
        "--skill",
        skillName,
        "--agent",
        "codex",
        "--copy",
        "-y",
      ];

  const result = spawnSync(command, commandArgs, {
    cwd: workDir,
    encoding: "utf8",
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);

  const importedPath = join(workDir, ".agents", "skills", skillName);
  const skillFile = join(importedPath, "SKILL.md");

  if (!existsSync(skillFile)) {
    throw new Error(
      `Skills CLI completed, but ${skillName} was not found in its canonical install directory.`,
    );
  }

  mkdirSync(dirname(destination), { recursive: true });
  cpSync(importedPath, destination, { recursive: true, errorOnExist: true });

  if (explicitOnly) setExplicitOnly(destination);

  const cliLockPath = join(workDir, "skills-lock.json");
  const cliLock = JSON.parse(readFileSync(cliLockPath, "utf8"));
  const upstreamEntry = cliLock.skills?.[skillName];

  if (!upstreamEntry) {
    throw new Error("Skills CLI did not record upstream provenance.");
  }

  const manifestPath = join(repoRoot, "upstreams.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  manifest.skills[skillName] = {
    requestedSource: source,
    group,
    path: `skills/${group}/${skillName}`,
    importedAt: new Date().toISOString(),
    explicitOnly,
    ...upstreamEntry,
  };
  manifest.skills = Object.fromEntries(
    Object.entries(manifest.skills).sort(([left], [right]) =>
      left.localeCompare(right),
    ),
  );
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`Imported ${skillName} into ${destination}`);
} catch (error) {
  rmSync(destination, { recursive: true, force: true });
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  rmSync(workDir, { recursive: true, force: true });
}

function setExplicitOnly(skillDirectory) {
  const agentsDirectory = join(skillDirectory, "agents");
  const yamlPath = join(agentsDirectory, "openai.yaml");

  if (!existsSync(agentsDirectory)) {
    mkdirSync(agentsDirectory, { recursive: true });
  }

  if (!existsSync(yamlPath)) {
    writeFileSync(
      yamlPath,
      "policy:\n  allow_implicit_invocation: false\n",
    );
    return;
  }

  let yaml = readFileSync(yamlPath, "utf8");

  if (/^\s{2}allow_implicit_invocation:\s*.*$/m.test(yaml)) {
    yaml = yaml.replace(
      /^\s{2}allow_implicit_invocation:\s*.*$/m,
      "  allow_implicit_invocation: false",
    );
  } else if (/^policy:\s*$/m.test(yaml)) {
    yaml = yaml.replace(
      /^policy:\s*$/m,
      "policy:\n  allow_implicit_invocation: false",
    );
  } else if (/^policy:\s*\S+/m.test(yaml)) {
    throw new Error(
      "Cannot safely edit an inline policy in agents/openai.yaml. Expand it to block YAML and retry.",
    );
  } else {
    yaml = `${yaml.trimEnd()}\n\npolicy:\n  allow_implicit_invocation: false\n`;
  }

  writeFileSync(yamlPath, yaml.endsWith("\n") ? yaml : `${yaml}\n`);
}

function deriveGroup(value) {
  const scpMatch = value.match(/^[^@]+@[^:]+:([^/]+)\//);
  if (scpMatch) return scpMatch[1];

  try {
    const url = new URL(value);
    const firstPathPart = url.pathname.split("/").filter(Boolean)[0];
    return firstPathPart ?? url.hostname.split(".")[0];
  } catch {
    const normalized = value.replaceAll("\\", "/").replace(/^\.\//, "");
    if (/^[^/]+\/[^/]+/.test(normalized) && !normalized.startsWith("../")) {
      return normalized.split("/")[0];
    }
  }

  return "local";
}

function normalizeGroup(value) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!normalized) {
    console.error("Could not derive a valid author group. Pass --group <author>.");
    process.exit(1);
  }

  return normalized;
}
