## 测试

```bash
npx vitest run test/ts/specdrive-scripts.test.ts   # shell 脚本测试
npx vitest run                                   # 全量测试
```

## Shell 脚本规范

脚本位于 `assets/skills/comet/scripts/`，必须跨平台兼容（macOS / Linux / Windows Git Bash）：

- **禁止** `sed -i`（GNU/BSD 不兼容），用 `awk` 做字段替换
- 必须兼容 `sha256sum`（GNU）和 `shasum -a 256`（BSD/macOS）
- 所有可选 grep 结果加 `|| true` 防止 `pipefail` 误杀
- 新增脚本必须加入 `beforeEach` 的拷贝列表和 manifest.json

## 脚本依赖关系

```
specdrive-state.sh ← specdrive-guard.sh, specdrive-handoff.sh, specdrive-archive.sh
specdrive-yaml-validate.sh ← specdrive-guard.sh (preflight 阶段)
specdrive-handoff.sh ← specdrive-state.sh (写入 handoff_context/handoff_hash)
specdrive-hook-guard.sh ← (独立脚本，由 .claude/settings.local.json 的 PreToolUse hook 调用)
```

新增共享工具函数时（如 hash、yaml 解析），如果两个脚本都需要，允许在各自脚本中独立实现，不强制抽共享文件。

## .specdrive.yaml 状态机

每个 change 的状态文件，字段变更需要同步三处：
1. `specdrive-state.sh` — `cmd_set` 白名单 + enum 验证
2. `specdrive-yaml-validate.sh` — schema 校验 + KNOWN_KEYS
3. `test/ts/specdrive-scripts.test.ts` — 测试中的 yaml 字符串

## 双语言 Skill

skill 优化时先写中文版本（`assets/skills-zh/`），用户确认后再修改英文版本（`assets/skills/`）。

## Skill 触发表述规范

修改 skill 时，新增或调整依赖 skill 的触发方式必须和既有写法保持一致：

- 中文统一使用：`**立即执行：** 使用 Skill 工具加载 <skill-name> 技能。禁止跳过此步骤。`
- 英文统一使用：`**Immediately execute:** Use the Skill tool to load the <skill-name> skill. Skipping this step is prohibited.`
- 后续输入、上下文或执行要求写在“技能加载后 / After the skill loads”段落，不要把 `ARGUMENTS`、`fast-forward` 等另一套调用术语混入触发句。

## Changelog 规范

文件：`CHANGELOG.md`，新版本条目置顶。

```
## What's Changed [x.y.z] - YYYY-MM-DD

### Added / Changed / Fixed / Tests / Removed / Security

- **功能名**: 描述做了什么以及为什么
```

要点：
- 版本号与 `package.json` 的 `version` 字段一致
- 每条以 `- **粗体关键词**: ` 开头，后接具体变更内容
- 按类型分组：Added → Changed → Fixed → Tests → Removed → Security
- 描述侧重 **行为变更**（what + why），不是实现细节
- `### Tests` 条目汇总新增测试覆盖的场景，不逐条列出测试用例

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
