```
███████╗██████╗ ███████╗ ██████╗    ██████╗ ██████╗ ██╗██╗   ██╗███████╗
██╔════╝██╔══██╗██╔════╝██╔════╝    ██╔══██╗██╔══██╗██║██║   ██║██╔════╝
███████╗██████╔╝█████╗  ██║         ██║  ██║██████╔╝██║██║   ██║█████╗
╚════██║██╔═══╝ ██╔══╝  ██║         ██║  ██║██╔══██╗██║╚██╗ ██╔╝██╔══╝
███████║██║     ███████╗╚██████╗    ██████╔╝██║  ██║██║ ╚████╔╝ ███████╗
╚══════╝╚═╝     ╚══════╝ ╚═════╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚══════╝
```

> 中文版：[README-zh.md](README-zh.md)

**OpenSpec + Superpowers dual-star development workflow** — one command from idea to archive.

OpenSpec handles **WHAT** (outlines, proposals, spec lifecycle, archiving).

Superpowers handles **HOW** (technical design, planning, execution, wrap-up).

SpecDrive chains both into a five-phase automated pipeline.

> [!NOTE]
> This project is a fork of [Comet](https://github.com/rpamis/comet) by [rpamis](https://github.com/rpamis). SpecDrive continues development on that foundation; the CLI and skill names now use SpecDrive branding, with backward compatibility for some legacy Comet config paths and skill directories.

> [!IMPORTANT]
> **0.3.7 Highlights** — One-step [CodeGraph](https://github.com/colbymchenry/codegraph) semantic code indexing (official: cost **↓16%**, tool calls **↓58%**);
>
> New **Beta context compression** cutting Build-phase input tokens by **25–30%**;
> New active context compression mechanism to release context consumed by reading specs and brainstorming, preserving window space for the subsequent Build phase.
> 6 default-on workflow token optimizations; New `auto_transition` config for automatic or manual phase handoff;
> Hook+Rule anti-drift phase guard; Optional TDD mode and subagent dispatch confirmation;
> Large PRD split into multiple changes; Pre-archive confirmation with reopen, verify retry limit, systematic debugging interception, and verification completion check.
>
> See [NEWS.md](NEWS.md) for details.

## Why Comet

OpenSpec excels at managing requirements, creating proposals, managing Spec lifecycles, and archiving, but its proposals
and tasks lack the detail of Superpowers brainstorming.

Superpowers generates Spec documents after brainstorming, but these documents typically lack stateful design — after
completing requirements, Specs only have tasks checked off in the document, and Agents even forget to check them off.
This causes the Agent to re-examine documents and project code to verify on resumption, wasting many tokens.

**SpecDrive combines the strengths of both**, integrating the core workflow into 5 phases

The main entry `/comet` supports current Spec state detection, suitable for long tasks — after closing your AI coding
session midway, just `/comet` and SpecDrive will automatically read the active Spec (lists multiple for selection),
dynamically identify which phase is currently executing, and continue.

At the same time, SpecDrive provides full Spec lifecycle management. During execution, it links OpenSpec change/spec
artifacts with Superpowers design and planning documents, then automates handoff, state updates, validation, and archive
sync so users do not have to repeatedly remind the Agent to keep documents synchronized and connected.

## What You'll Learn

Many excellent Skill projects exist in the current Skill market, but they generally have preference issues — users may
only like some features. For example, when using both OpenSpec and Superpowers, one might only use OpenSpec's Spec
management capabilities, but prefer Superpowers' TDD-driven approach for coding.

Long-term Skill users know these capabilities can be freely combined, but exactly how to do so still requires real
practice. The SpecDrive project can serve as a reference:

- **How to reliably trigger nested Skills** — Not letting the Agent rely on document descriptions to perform "look-alike
  Skill trigger" operations (like writing files based on Skill descriptions), but truly triggering Skills (key feature:
  Skill trigger prints on CC). SpecDrive triggers many capabilities from OpenSpec and Superpowers. How is this Prompt
  written?

- **How to make combined Skills flow automatically across phases** — Not relying on manual intervention. Comet's 5-phase
  flow can automatically trigger Skills for the core process except for necessary user choices, while the state machine
  also protects state transition reliability.

- **How to turn the Spec lifecycle into a resumable workflow** — SpecDrive links OpenSpec change/spec artifacts with
  Superpowers design and planning documents, then records phase, execution mode, verification results, and archive
  status in `.specdrive.yaml`, so the Agent can resume after interruption instead of rereading documents and guessing
  progress.

- **How to turn document synchronization from "user reminders" into automation** — SpecDrive puts handoff, state updates,
  validation, and archive sync into scripted flows, reducing repeated prompts like "remember to update the design
  doc", "remember to sync the spec", and "remember to archive the change".

- **How to design guard conditions that Agents can execute** — SpecDrive does not simply trust the Agent saying "done" at
  phase exits. Scripts such as `specdrive-guard.sh`, `specdrive-yaml-validate.sh`, and `specdrive-state.sh` check tasks, state
  fields, verification evidence, and archive conditions before allowing the workflow to advance.

- **How to distribute and install Skills across platforms** — SpecDrive supports multiple AI coding platforms,
  project/global installation, Chinese/English Skill choices, and platform-specific directory differences such as
  Antigravity using different project-level and global paths. It can be a reference for CLI installers and Skill package
  structure.

- **How to turn shell scripts into Agent workflow infrastructure** — Comet's scripts need to work across macOS, Linux,
  and Windows Git Bash while handling hashes, YAML fields, state machines, and archive flows. It shows how to move
  fragile workflow control out of scattered Prompt text and into testable, reusable tools.

## Install

Requirements:

- Node.js 20+
- npm/npx
- Git
- Bash-compatible shell for workflow scripts (Windows users should use Git Bash or an equivalent bash environment)

```bash
npm install -g @lion_zs/specdrive
```

## Quick Start

```bash
cd your-project
specdrive init
```

`specdrive init` will:

1. Prompt you to select AI platforms (auto-detects existing configs)
2. Choose install scope: project-level (current directory) or global (home directory)
3. Select language for SpecDrive skills: English or 中文
4. Install [OpenSpec](https://github.com/Fission-AI/OpenSpec) skills
5. Install [Superpowers](https://github.com/obra/superpowers) skills
6. Deploy SpecDrive skills (in your chosen language) to selected platforms
7. Create `docs/superpowers/specs/` and `docs/superpowers/plans/` working directories for project-scope installs

> [!TIP]
> update version
>
> `specdrive update` or `npm install -g @hottaiger/SpecDrive@latest` to get the latest features and fixes.

## Support for OpenClaw and Hermes, and other AI platforms

For platforms that use the generic `skills` CLI directly, you can install the SpecDrive skill package with:

```bash
npx skills add hottaiger/SpecDrive
```

## Screenshots

<p align="center">
  <img src="https://github.com/hottaiger/SpecDrive/blob/master/img/runner.png" alt="runner">
</p>

<p align="center">Auto-install OpenSpec & Superpowers, one-click dev environment setup</p>
<p align="center">Multi-phase Skill entry, auto-detects current Spec stage, auto-triggers core flow, manual review at key nodes</p>

## Commands

<details>
<summary><code>specdrive init [path]</code> — Initialize SpecDrive workflow</summary>

Initializes OpenSpec, Superpowers, and SpecDrive skills for selected AI coding platforms.

| Option            | Description                                                                    |
| ----------------- | ------------------------------------------------------------------------------ |
| `--yes`           | Non-interactive mode, auto-select detected platforms (or all if none detected) |
| `--scope <scope>` | Install scope: `project` or `global`                                           |
| `--skip-existing` | Skip already installed components                                              |
| `--overwrite`     | Overwrite already installed components                                         |
| `--json`          | Output structured JSON                                                         |

When multiple existing components are found on the same platform, interactive init offers one bulk choice: overwrite
all, skip all, or choose per component.

</details>

<details>
<summary><code>specdrive status [path]</code> — Show active changes and next workflow command</summary>

Displays active changes, task progress, and the recommended next SpecDrive workflow command.

| Option   | Description                              |
| -------- | ---------------------------------------- |
| `--json` | Output active changes with `nextCommand` |

</details>

<details>
<summary><code>specdrive doctor [path]</code> — Diagnose SpecDrive installation health</summary>

Checks project/global installation health, working directories, installed skills, scripts, and SpecDrive state files.

| Option            | Description                                                     |
| ----------------- | --------------------------------------------------------------- |
| `--json`          | Output structured diagnostic results                            |
| `--scope <scope>` | Diagnose `auto`, `project`, or `global` scope (default: `auto`) |

</details>

<details>
<summary><code>specdrive update [path]</code> — Update SpecDrive package and skills</summary>

Updates the npm package and refreshes installed SpecDrive skills in detected project/global targets.

| Option              | Description                                   |
| ------------------- | --------------------------------------------- |
| `--json`            | Output npm and skill update results as JSON   |
| `--language <lang>` | Override detected skill language (`en`, `zh`) |
| `--scope <scope>`   | Update only `global` or `project` scope       |

</details>

| Command               | Description  |
| --------------------- | ------------ |
| `specdrive --help`    | Show help    |
| `specdrive --version` | Show version |

## Supported Platforms

`specdrive init` supports 28 AI coding platforms:

<details>
<summary>View full platform list</summary>

| Platform           | Skills Dir   | Platform   | Skills Dir    |
| ------------------ | ------------ | ---------- | ------------- |
| Claude Code        | `.claude/`   | Cursor     | `.cursor/`    |
| Codex              | `.codex/`    | OpenCode   | `.opencode/`  |
| Windsurf           | `.windsurf/` | Cline      | `.cline/`     |
| RooCode            | `.roo/`      | Continue   | `.continue/`  |
| GitHub Copilot     | `.github/`   | Gemini CLI | `.gemini/`    |
| Amazon Q Developer | `.amazonq/`  | Qwen Code  | `.qwen/`      |
| Kilo Code          | `.kilocode/` | Auggie     | `.augment/`   |
| Kiro               | `.kiro/`     | Lingma     | `.lingma/`    |
| Junie              | `.junie/`    | CodeBuddy  | `.codebuddy/` |
| CoStrict           | `.cospec/`   | Crush      | `.crush/`     |
| Factory Droid      | `.factory/`  | iFlow      | `.iflow/`     |
| Pi                 | `.pi/`       | Qoder      | `.qoder/`     |
| Antigravity        | `.agents/`   | Bob Shell  | `.bob/`       |
| ForgeCode          | `.forge/`    | Trae       | `.trae/`      |

</details>

Some platforms use different project and global directories. For example, OpenCode global installs use
`.config/opencode`, Lingma global installs use `.lingma`, and Antigravity global installs use `.gemini/antigravity`.

## Skills

After `specdrive init`, three groups of skills are installed to the selected platform's `skills/` directory:

### SpecDrive Skills

<details>
<summary>View SpecDrive skills</summary>

| Skill            | Description                                                    |
| ---------------- | -------------------------------------------------------------- |
| `/comet`         | Main entry — auto-detects phase and dispatches to sub-commands |
| `/comet-open`    | Phase 1: Open a change (proposal, design, task breakdown)      |
| `/comet-design`  | Phase 2: Deep design (brainstorming, Design Doc)               |
| `/comet-build`   | Phase 3: Plan and build (implementation plan, code commits)    |
| `/comet-verify`  | Phase 4: Verify and finish (testing, verification report)      |
| `/comet-archive` | Phase 5: Archive (delta spec sync, status annotation)          |
| `/comet-hotfix`  | Preset: Quick bug fix (skips brainstorming)                    |
| `/comet-tweak`   | Preset: Small change (skips brainstorming and full plan)       |

</details>

### Guard & Automation Scripts

<details>
<summary>View script list</summary>

| Script                       | Purpose                                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `specdrive-env.sh`           | Script discovery helper — exports bundled script paths such as `SPECDRIVE_GUARD`, `SPECDRIVE_STATE`, `SPECDRIVE_HANDOFF`, and `SPECDRIVE_ARCHIVE` |
| `specdrive-guard.sh`         | Phase transition guard — validates exit conditions, `--apply` auto-updates `.specdrive.yaml`                                                      |
| `specdrive-handoff.sh`       | Design handoff — generates deterministic context packages from OpenSpec artifacts with SHA256 tracing                                             |
| `specdrive-archive.sh`       | One-command archive — validates state, syncs specs, moves to archive, updates status                                                              |
| `specdrive-yaml-validate.sh` | Schema validator — validates `.specdrive.yaml` structure and field values                                                                         |
| `specdrive-hook-guard.sh`    | Phase write guard — PreToolUse hook, blocks file writes during open/design/archive phases                                                         |
| `specdrive-state.sh`         | Unified state management — init/set/get/check/scale, agents' exclusive YAML interface                                                             |

</details>

### OpenSpec Skills

Spec lifecycle management: propose, explore, sync, verify, archive, and more.

### Superpowers Skills

Development methodology: brainstorming, TDD, subagent-driven development, code review, plan writing, and more.

## Workflow

```
/comet
  ↓ auto-detect
/specdrive-open  -->  /specdrive-design  -->  /specdrive-build  -->  /specdrive-verify  -->  /comet-archive
(OpenSpec)         (Superpowers)       (Superpowers)       (Both)           (OpenSpec)

/specdrive-hotfix (preset path, skips brainstorming)
  open  -->  build  -->  verify  -->  archive

/specdrive-tweak (preset path, skips brainstorming and full plan)
  open  -->  lightweight build  -->  light verify  -->  archive
```

### Five Phases

| Phase              | Command          | Owner       | Artifacts                            |
| ------------------ | ---------------- | ----------- | ------------------------------------ |
| 1. Open            | `/comet-open`    | OpenSpec    | proposal.md, design.md, tasks.md     |
| 2. Deep Design     | `/comet-design`  | Superpowers | Design Doc, delta spec               |
| 3. Plan & Build    | `/comet-build`   | Superpowers | Implementation plan, code commits    |
| 4. Verify & Finish | `/comet-verify`  | Both        | Verification report, branch handling |
| 5. Archive         | `/comet-archive` | OpenSpec    | delta→main spec sync, archive        |

### Core Principles

- **Brainstorming is non-skippable** — every change must go through deep design (except hotfix/tweak)
- **Delta specs are living documents** — freely editable during Phase 3, synced at archive
- **Keep tasks.md in sync** — check off each task as completed
- **Commit frequently** — one commit per task, message reflects design intent
- **Verify before archive** — `/comet-verify` must pass before `/comet-archive`

### State Management

SpecDrive uses a decoupled state architecture with separate YAML files:

| File              | Owner     | Purpose                                             |
| ----------------- | --------- | --------------------------------------------------- |
| `.openspec.yaml`  | OpenSpec  | Spec lifecycle, change metadata                     |
| `.specdrive.yaml` | SpecDrive | Workflow phase, execution mode, verification status |

All states and execution phases are updated via scripts, and each phase verifies that tasks are truly complete before
advancing. Compared to storing complex state rules only in Skill text, this script-backed state machine gives SpecDrive more
reliable phase transitions, correct YAML, and easier breakpoint recovery; agents can read the current Spec situation
through Comet's built-in commands.

<details>
<summary>View key .specdrive.yaml fields</summary>

**Key Fields in `.specdrive.yaml`:**

```yaml
workflow: full
auto_transition: true
phase: build
build_mode: subagent-driven-development
build_pause: null
isolation: branch
verify_mode: null
tdd_mode: null
subagent_dispatch: null
design_doc: docs/superpowers/specs/YYYY-MM-DD-topic-design.md
plan: docs/superpowers/plans/YYYY-MM-DD-feature.md
verify_result: pending
verification_report: null
branch_status: pending
verified_at: null
archived: false
direct_override: false
build_command: null
verify_command: null
handoff_context: openspec/changes/<name>/.specdrive/handoff/design-context.json
handoff_hash: <sha256>
```

In full workflow, `build_mode`, `build_pause`, `isolation`, `verify_mode`, `tdd_mode`, and `subagent_dispatch` may
temporarily be `null`; `build_mode` and `isolation` must be resolved before `build → verify`. `auto_transition` controls automatic vs manual skill invocation after phase completion — see [AUTO-TRANSITION.md](docs/AUTO-TRANSITION.md). `build_pause` records an internal build-phase pause point:
`null` means no pause, while `plan-ready` means the plan has been generated and the user paused before choosing
isolation and execution mode. It is not an execution mode and must not be written into `build_mode`.
`verification_report` stays `null` until verification writes a report, and `verify-pass` requires that report to exist
plus `branch_status: handled`. Fields after `archived` in the example are optional or script-derived: `direct_override`
is only needed for full-workflow direct builds, project commands may be absent unless configured, and
`handoff_context` / `handoff_hash` are recorded by `specdrive-handoff.sh` before leaving design. Projects can configure
`build_command` / `verify_command` in the change or repo root, and guard will run those commands first and print failure
output.

</details>

### Reliability Features

SpecDrive ensures agent execution reliability through automated state transitions:

<details>
<summary>View reliability features</summary>

1. **Entry Verification** — Each phase validates preconditions before execution
   - Checks file existence, state consistency, and phase transitions
   - Outputs `[HARD STOP]` with actionable suggestions if validation fails

2. **Automated State Transitions** — `specdrive-guard.sh --apply` updates `.specdrive.yaml` automatically
   - All phase transitions (open → design/build → verify → archive) use `guard --apply`
   - No manual state editing required — eliminates write-verification errors
   - `specdrive-state.sh` is the agents' exclusive interface for state operations
   - Guard and archive scripts use `specdrive-state.sh` internally for state management

3. **Schema Validation** — `specdrive-yaml-validate.sh` ensures data integrity
   - Validates required and optional fields
   - Validates enum values, including `direct_override`
   - Validates `design_doc`, `plan`, and `handoff_context` paths exist, plus `handoff_hash` format
   - Detects unknown/typos fields

4. **Build Decision Enforcement** — Guard and state transitions both block skipped build choices
   - `isolation` must be `branch` or `worktree`
   - `build_mode` must be selected before leaving build
   - `build_pause: plan-ready` is a recoverable pause after plan generation, not a `build_mode`
   - Full workflow `build_mode: direct` requires `direct_override: true`

5. **Verification Evidence** — Guard enforces proof before phase advance
   - `verify-pass` transition requires `verification_report` pointing to an existing report file
   - `branch_status` must be `handled` before verify can pass
   - Guard checks `verification_report exists` and `branch_status=handled` as hard prerequisites
   - Prevents false phase advances when verification or branch handling was skipped

6. **Archive Automation** — `specdrive-archive.sh` handles the full archive flow in one command
   - Validates entry state, merges delta specs into main specs through OpenSpec
   - Annotates design doc and plan frontmatter
   - Moves change to archive directory and updates `archived: true`
   - Supports `--dry-run` for preview

</details>

## Project Structure

```
your-project/
├── .specdrive/
│   └── config.yaml              # Project-level global config (context_compression, auto_transition, etc.)
├── .claude/skills/              # Platform skills dir (SpecDrive + OpenSpec + Superpowers)
│   ├── comet/SKILL.md
│   │   └── scripts/
│   │       ├── specdrive-guard.sh       # Phase transition guard (--apply auto-updates state)
│   │       ├── specdrive-env.sh         # Script discovery helper
│   │       ├── specdrive-handoff.sh     # Design handoff (OpenSpec → Superpowers context tracing)
│   │       ├── specdrive-archive.sh     # One-command archive automation
│   │       ├── specdrive-yaml-validate.sh # Schema validator
│   │       ├── specdrive-hook-guard.sh   # Phase write guard (PreToolUse hook)
│   │       └── specdrive-state.sh       # Unified state management (init/set/get/check/scale)
│   ├── comet-*/SKILL.md
│   ├── openspec-*/SKILL.md
│   └── brainstorming/SKILL.md
├── openspec/                    # OpenSpec — WHAT
│   ├── config.yaml
│   └── changes/
│       └── <name>/
│           ├── .openspec.yaml       # OpenSpec state
│           ├── .specdrive.yaml          # SpecDrive workflow state (decoupled)
│           ├── proposal.md
│           ├── design.md
│           ├── specs/<capability>/spec.md
│           └── tasks.md
└── docs/superpowers/            # Superpowers — HOW
    ├── specs/                   # Design documents
    └── plans/                   # Implementation plans
```

<details>
<summary>Context Compression (Beta)</summary>

SpecDrive supports context compression at the Design → Build handoff. When enabled, `specdrive-handoff.sh` generates a compact
context package that reduces Build-phase input tokens by **25–30%** without affecting implementation correctness.

| Mode   | Behavior                                 | Token Savings |
| ------ | ---------------------------------------- | ------------- |
| `off`  | Full Spec excerpts in handoff context    | Baseline      |
| `beta` | Design Doc + SHA256 hash references only | ~25–30%       |

Key findings from benchmark testing:

- **Test pass rate**: 100% across all tiers (compression does not affect correctness)
- **Spec coverage**: 100% (off) vs 95% (beta) — minor edge-case detail loss
- **Scaling**: Larger tasks yield higher absolute savings (up to 15,000 tokens for large-tier tasks)

Enable in `.specdrive/config.yaml`: `context_compression: beta`

See [CONTEXT-COMPRESSION.md](docs/CONTEXT-COMPRESSION.md) for the full benchmark report, compression principles, and
reproduction steps.

</details>

<details>
<summary>Auto Transition</summary>

`auto_transition` controls whether SpecDrive automatically invokes the next skill after a phase completes, or pauses for
manual handoff. Phase advancement itself always happens — this setting only affects skill invocation.

| Value   | Behavior                                                      |
| ------- | ------------------------------------------------------------- |
| `true`  | Auto-invoke the next skill after each phase (default)         |
| `false` | Pause after each phase; user manually triggers the next skill |

Three-layer configuration with precedence: `SPECDRIVE_AUTO_TRANSITION` env var > `.specdrive/config.yaml` (project) > `.specdrive.yaml` (change).

See [AUTO-TRANSITION.md](docs/AUTO-TRANSITION.md) for configuration details, workflow mapping, and FAQ.

</details>

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) | [中文版](CONTRIBUTING-zh.md) for development setup, commit
conventions, PR process, branch workflow, and guidance for adding platforms,
skills, scripts, or changelog entries.

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

## Roadmap

Track our development progress and upcoming features on the [SpecDrive Roadmap](https://github.com/orgs/hottaiger/projects/1).

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=hottaiger/SpecDrive&type=Date)](https://star-history.com/#hottaiger/SpecDrive&Date)

## Contributors

<a href="https://github.com/hottaiger/SpecDrive/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=hottaiger/SpecDrive&columns=12&anon=1" />
</a>

## License

[MIT](LICENSE)

## Community

<table align="center">
  <tr>
    <td align="center" width="180">
      <img src="https://github.com/hottaiger/SpecDrive/blob/master/img/douyin.png" width="120" height="120"><br>
      <b>DouYin (Recommended)</b>
    </td>
    <td align="center" width="180">
      <img src="https://github.com/hottaiger/SpecDrive/blob/master/img/wechat.jpg" width="120" height="120"><br>
      <b>WeChat</b>
    </td>
    <td align="center" width="180">
      <img src="https://github.com/hottaiger/SpecDrive/blob/master/img/qq.jpg" width="120" height="120"><br>
      <b>QQ</b>
    </td>
  </tr>
</table>

## Reference

[LINUX DO - 新的理想型社区](https://linux.do/)
