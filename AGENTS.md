# AGENTS.md

`@hottaiger/specdrive` — SpecDrive CLI. OpenSpec + Superpowers dual-star workflow
installed into 28 AI platform skill directories.

## Commands

```bash
pnpm build              # tsc via build.js (cleans dist/)
pnpm test               # vitest run (all suites)
pnpm test:watch         # vitest watch mode
pnpm lint               # eslint src/ (ignores dist/bin/scripts/assets)
pnpm format             # prettier --write src/
pnpm format:check       # prettier --check src/
pnpm test:shell         # node scripts/run-bats.js test/shell/*.bats
pnpm test:coverage      # vitest run --coverage
```

Single focused test: `npx vitest run test/ts/specdrive-scripts.test.ts` (most
common — covers the shell scripts; ~16s, 238 tests).

Pre-commit / pre-PR gate (matches CI):
`pnpm build && pnpm lint && pnpm format:check && pnpm test`.

## Layout

- `bin/specdrive.js` — CLI shim, loads `dist/cli/index.js`.
- `src/cli/` — entrypoint (`index.ts`).
- `src/commands/` — `init`, `update`, `doctor`, etc.
- `src/core/` — platform detection, skills, state.
- `assets/skills/specdrive*/` — 9 English skills (root + 8 phase skills).
- `assets/skills-zh/specdrive*/` — Chinese versions, **edit zh first, then en**.
- `assets/skills/specdrive/scripts/` — bash scripts shipped to user projects.
- `assets/manifest.json` — skill inventory; add new skills here.
- `test/ts/` — Vitest suites. `test/shell/*.bats` — bats tests run via
  `scripts/run-bats.js` (no system bats required; finds bash via
  `SPECDRIVE_TEST_BASH` / `SPECDRIVE_BASH` envs).

`build.js` calls `tsc` directly with `typescript` resolved from `node_modules`;
no separate build config file. ESLint config is flat (`eslint.config.js`,
ignores `dist/`, `node_modules/`, `bin/`, `scripts/`, `assets/`).

## Brand strings (don't rename casually)

These must stay in sync — they appear in `bin/`, package paths, and skill
filenames in user projects after install:

- npm package: `@hottaiger/specdrive`
- CLI command: `specdrive` (mapped in `package.json` `bin` to `./bin/specdrive.js`)
- Skill dir: `specdrive/` (under `.claude/skills/`, `.codex/skills/`, etc.)
- State file: `.specdrive.yaml`
- Config dir: `.specdrive/`
- Shell scripts: `specdrive-*.sh`

## Shell scripts (in `assets/skills/specdrive/scripts/`)

Cross-platform required (macOS / Linux / Windows Git Bash):

- **Never use `sed -i`** (GNU/BSD incompatible) — use `awk` for field replacement.
- **Hashes**: support both `sha256sum` (GNU) and `shasum -a 256` (BSD/macOS).
- **Grep**: any optional `grep` result must end with `|| true` to survive
  `set -o pipefail`.
- **New script** → add to the `beforeEach` copy list in
  `test/ts/specdrive-scripts.test.ts` and to `assets/manifest.json`.
- Bash entrypoint for shell tests on Windows: set `SPECDRIVE_TEST_BASH` (or
  `SPECDRIVE_BASH`) to a working bash (Git Bash). WSL's `bash.exe` is
  explicitly unsupported.

## Script dependency graph

```
specdrive-state.sh       ← specdrive-guard.sh, specdrive-handoff.sh, specdrive-archive.sh
specdrive-yaml-validate.sh ← specdrive-guard.sh (preflight phase)
specdrive-handoff.sh     ← specdrive-state.sh (writes handoff_context/handoff_hash)
specdrive-hook-guard.sh  ← independent, called by .claude/settings.local.json PreToolUse hook
```

Shared helpers (hash, yaml parsing): if needed in multiple scripts, duplicate
inline is allowed — do not introduce a shared include file.

## `.specdrive.yaml` state machine

Field changes must be synchronized in three places:

1. `specdrive-state.sh` — `cmd_set` whitelist + enum validation.
2. `specdrive-yaml-validate.sh` — schema validation + `KNOWN_KEYS`.
3. `test/ts/specdrive-scripts.test.ts` — yaml strings in tests.

## Skill authoring

Edit `assets/skills-zh/specdrive*/` first, get user confirmation, then mirror
changes into `assets/skills/specdrive*/` (English).

Skill trigger wording (use exactly, both languages):
- ZH: `**立即执行：** 使用 Skill 工具加载 <skill-name> 技能。禁止跳过此步骤。`
- EN: `**Immediately execute:** Use the Skill tool to load the <skill-name> skill. Skipping this step is prohibited.`

Subsequent instructions go in a "技能加载后 / After the skill loads" section.
Do **not** mix `ARGUMENTS` or `fast-forward` into the trigger sentence — those
belong elsewhere.

## Changelog

File: `CHANGELOG.md`. New version entry at the top.

```
## What's Changed [x.y.z] - YYYY-MM-DD

### Added / Changed / Fixed / Tests / Removed / Security

- **功能名**: 描述做了什么以及为什么
```

- Version number matches `package.json` `version`.
- Each bullet: `- **Bold keyword**: ...` describing the **behavior change** (what + why), not the implementation.
- Group by type: Added → Changed → Fixed → Tests → Removed → Security.
- `### Tests` section summarizes coverage by scenario, not by individual test case.

## CI matrix (`.github/workflows/ci.yml`)

- `build-and-test`: Node 20 + 22 on ubuntu-latest.
- `shellcheck`: scans `assets/skills/specdrive/scripts`.
- `bats-tests`: system bats on ubuntu.
- `script-smoke`: Node 20 across ubuntu + macos + windows (portable shell
  tests).
- `init-e2e`: `specdrive init` end-to-end against 28 platforms, Node 20 + 22
  × ubuntu + macos + windows. Requires global `@fission-ai/openspec@latest`.

## Notes

- Package manager pinned: `pnpm@10.18.3` (`packageManager` field).
- Node engine: `>=20`.
- `prepare` runs `pnpm build` on `pnpm install`.
- `prepublishOnly` runs `scripts/prepublish-check.js` then `pnpm build`.
- `CLAUDE.md` exists with overlapping content; treat `AGENTS.md` as the
  canonical repo-wide file. `CLAUDE.md` may add Claude-Code-specific extras.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **SpecDrive** (1605 symbols, 2305 relationships, 79 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/SpecDrive/context` | Codebase overview, check index freshness |
| `gitnexus://repo/SpecDrive/clusters` | All functional areas |
| `gitnexus://repo/SpecDrive/processes` | All execution flows |
| `gitnexus://repo/SpecDrive/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
