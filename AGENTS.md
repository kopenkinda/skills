# Skills mirror

This repository vendors editable forks of agent skills. A request to install or import a skill into this repository means to add its complete source under `skills/<author>/<skill-name>/`, not to install it into this repository's `.agents/` or `.codex/` directory. Skill names remain globally unique even though their files are grouped by author.

## Importing a skill

Run:

```sh
npm run import -- <source> <skill-name> [--group <author>] [--explicit-only]
```

The source may be a Skills CLI registry result, an `owner/repo` GitHub shorthand, a Git URL, a direct skill URL, or a local path. The import script uses the Skills CLI in a temporary directory, copies the whole selected skill into `skills/<author>/<skill-name>`, and records its upstream entry in `upstreams.json`. It derives the author from common Git sources. Pass `--group` when that result is ambiguous or when a different grouping is wanted.

When the user supplies only a skill name or search terms, run `npm run find -- <query>` to search the registry. Resolve the exact source and skill name from the result before running the importer. If several results are plausible and the choice would change which skill is copied, ask the user which one they mean.

Keep every imported file, including `references/`, `scripts/`, `assets/`, and `agents/`. Make requested customizations only after the import completes. Treat `upstreams.json` as provenance for the untouched upstream snapshot, so local edits do not change its recorded upstream hash.

The importer refuses to replace an existing skill. Preserve local changes. For an upstream refresh, fetch a fresh copy outside its current directory, compare it with the fork, and merge the wanted changes deliberately.

## Invocation policy

All mirrored skills remain explicitly invocable by name. When a skill should run only after a user invokes it, set this in the skill's `agents/openai.yaml`:

```yaml
policy:
  allow_implicit_invocation: false
```

Preserve existing `interface`, `dependencies`, and other policy fields. Use the importer's `--explicit-only` option when this is known at import time. Omit that policy when Codex should also select the skill automatically.

## Validation

Run `npm run check` after importing or changing a skill. A finished change has valid `SKILL.md` frontmatter, one unique skill name, intact referenced files, and a matching provenance entry for every imported skill. Original skills may omit provenance and should live under `skills/local/` or the author's own handle.
