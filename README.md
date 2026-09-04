# Personal skills mirror

This repository holds editable copies of skills found through the [Skills CLI](https://github.com/vercel-labs/skills). Skills live under `skills/<author>/<skill-name>/`, so related work stays grouped while each skill remains directly installable. You can change its instructions, references, scripts, assets, or Codex invocation policy and commit the result.

`upstreams.json` keeps public GitHub provenance for third-party skills. Personal skills in the `kopenkinda` group contain only the source type, content hash, author group, and repository-relative path. Local paths, timestamps, and machine-specific details are omitted.

## Import a skill

Node.js 20 or newer is recommended.

```sh
npm install
npm run import -- vercel-labs/agent-skills frontend-design
```

Sources accepted by the Skills CLI also work here, including registry/GitHub shorthand, Git URLs, direct skill URLs, and local paths.

If you know the skill name but not its source, search the registry first:

```sh
npm run find -- frontend-design
```

The importer derives `vercel-labs` as the group in that example. Override the grouping when a source has no useful author name:

```sh
npm run import -- ./downloaded-skills skill-name --group alice
```

For a locally installed copy with an existing Skills CLI lock entry:

```sh
npm run import -- ~/.agents/skills skill-name --group alice \
  --origin-lock ~/.agents/.skill-lock.json
```

This preserves public registry and GitHub provenance without recording either local path. Imports into the `kopenkinda` group keep only the four minimal fields.

To keep a skill available as `$skill-name` while preventing automatic invocation:

```sh
npm run import -- owner/repo skill-name --explicit-only
```

This sets `user-invocable: true` and `disable-model-invocation: true` in the
skill frontmatter for agents that follow those fields. It also sets Codex's
`policy.allow_implicit_invocation` to `false` in `agents/openai.yaml`.

The importer copies the complete skill, including supporting references and assets. It will not overwrite an existing fork.

After making changes, validate the mirror:

```sh
npm run check
```

## Install your edition

Install from this checkout while developing:

```sh
npx skills add . --skill skill-name -g -a codex -y
```

After pushing this repository, install the same edition from GitHub:

```sh
npx skills add your-github-user/your-repo --skill skill-name -g -a codex -y
```

Remove `-g` for a project-local install. The Skills CLI discovers nested `SKILL.md` files in this repository, so no generated registry index is needed. Names remain global at install and invocation time. Two authors cannot both contribute a skill called `review` without renaming one fork.

## Refresh from upstream

There is intentionally no overwrite flag. Import a fresh upstream copy into a temporary checkout or directory, compare it with the existing fork, then merge the changes you want. This keeps an upstream update from silently erasing your edits.

Original skills do not need an `upstreams.json` entry. Put them under `skills/local/<skill-name>` or replace `local` with your own author handle.
