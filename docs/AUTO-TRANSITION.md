# 自动流转（Auto Transition）

> 版本状态：Stable（`.specdrive/config.yaml` 中 `auto_transition: true` 为默认值）

## 概述

`auto_transition` 控制 SpecDrive 工作流在阶段完成后是否自动调用下一个 Skill，还是暂停等待用户手动触发。

**关键区分**：`auto_transition` 不控制阶段推进本身。阶段推进（更新 change 的 `.specdrive.yaml` 中的 `phase` 字段）由 `specdrive-guard.sh --apply` 执行，无论 `auto_transition` 如何设置都会发生。该配置仅控制阶段推进后是否自动调用下一个 Skill。

## 工作原理

### 执行流程

```text
specdrive-guard.sh --apply              specdrive-state next <change>
┌──────────────────────┐              ┌──────────────────────┐
│ 校验阶段前置条件       │              │ 读取 phase、workflow  │
│ 更新 phase 字段       │ ──────────► │ 读取 auto_transition  │
│ （始终执行）           │              │ 输出下一步指令         │
└──────────────────────┘              └──────────────────────┘
```

`specdrive-state next` 的输出协议：

```text
NEXT: auto|manual|done
SKILL: <skill-name>       # done 时省略
HINT: <message>           # 仅 manual 时输出
```

手动模式下，`HINT` 会提示运行 `/<skill-name>`（例如 `/specdrive-build`）。

### 两种模式

| 值 | 行为 | 适用场景 |
|------|------|----------|
| `true` | 阶段推进后自动调用下一个 Skill，无需用户干预 | 连续执行、熟悉流程的用户 |
| `false` | 阶段推进后暂停，输出提示让用户手动运行下一个 Skill | 需要在阶段间审查、调试或介入的场景 |

### 模式对比

```text
auto_transition: true（默认）

  open ──► design ──► build ──► verify ──► archive
   自动      自动       自动       自动       完成


auto_transition: false

  open ──► 暂停 ► design ──► 暂停 ► build ──► 暂停 ► verify ──► 暂停 ► archive
           用户手动            用户手动           用户手动           用户手动           完成
           触发 design         触发 build         触发 verify        触发 archive
```

## 配置方式

### 三层配置与优先级

`auto_transition` 支持三层配置。`specdrive-state next` 解析时的优先级（从高到低）：

| 优先级 | 位置 | 说明 |
|--------|------|------|
| 1 | `openspec/changes/<name>/.specdrive.yaml` | Change 级显式值（`true` / `false`） |
| 2 | 环境变量 `SPECDRIVE_AUTO_TRANSITION` | 适合 CI/CD 或临时覆盖（仅当 change 级为 `null` 时生效） |
| 3 | 项目级 `.specdrive/config.yaml` | 项目默认值 |
| 4 | 内置默认 | `true` |

解析逻辑：

1. 读取 change 的 `.specdrive.yaml` 中的 `auto_transition`
2. 若为 `null` 或空，调用 `project_auto_transition_default`：先读 `SPECDRIVE_AUTO_TRANSITION`，再读 `.specdrive/config.yaml`，最后回退到 `true`

> **迁移说明**：旧 Comet 项目若仍使用 `.comet/config.yaml` 或 change 级 `.comet.yaml`，需迁移到 `.specdrive/config.yaml` / `.specdrive.yaml` 后 SpecDrive 脚本才会识别。

### 配置示例

#### 项目级配置（`.specdrive/config.yaml`）

```yaml
auto_transition: false        # 本项目所有 change 默认手动转场
context_compression: off
```

#### Change 级配置（`openspec/changes/<name>/.specdrive.yaml`）

```yaml
workflow: full
phase: design
auto_transition: true         # 覆盖项目级与环境变量，此 change 使用自动转场
```

#### 环境变量覆盖

```bash
# 临时启用自动转场（change 级未显式设置时生效）
export SPECDRIVE_AUTO_TRANSITION=true
```

### 初始化时的行为

运行 `specdrive-state init` 创建新 change 时，`auto_transition` 会从项目级默认值（含环境变量）解析并写入 change 的 `.specdrive.yaml`。之后可以单独修改该 change 的值而不影响其他 change。

## 工作流映射

`specdrive-state next` 根据当前 phase 和 workflow 类型决定下一个 Skill（调用时使用 `/<skill-name>`）：

| Phase | Full 工作流 | Hotfix 工作流 | Tweak 工作流 |
|-------|------------|--------------|-------------|
| `open` | specdrive-open | specdrive-open | specdrive-open |
| `design` | specdrive-design | — | — |
| `build` | specdrive-build | specdrive-hotfix | specdrive-tweak |
| `verify` | specdrive-verify | specdrive-verify | specdrive-verify |
| `archive` | specdrive-archive | specdrive-archive | specdrive-archive |

## 与上下文压缩的关系

`auto_transition` 和 `context_compression` 是独立的配置项，存储在同一配置文件中但互不影响：

| 配置项 | 控制内容 | 有效值 |
|--------|----------|--------|
| `auto_transition` | 阶段间是否自动调用下一个 Skill | `true` / `false` |
| `context_compression` | Design → Build 交接时的 token 压缩策略 | `off` / `beta` |

两者可以自由组合：

| 组合 | 效果 |
|------|------|
| `auto_transition: true` + `context_compression: off` | 全自动 + 完整上下文 |
| `auto_transition: true` + `context_compression: beta` | 全自动 + 压缩上下文（token 节省 25–30%） |
| `auto_transition: false` + `context_compression: off` | 手动控制 + 完整上下文 |
| `auto_transition: false` + `context_compression: beta` | 手动控制 + 压缩上下文 |

## 常见问题

### Q: 设为 `false` 后阶段还会推进吗？

会。`auto_transition: false` 仅暂停 Skill 调用，`specdrive-guard.sh --apply` 仍然会更新 `phase` 字段。暂停后用户需要手动运行下一个 Skill（如 `/specdrive-build`）继续流程。

### Q: 可以中途切换吗？

可以。在任意时刻修改 change 的 `.specdrive.yaml` 中的 `auto_transition` 字段即可。下一次 `specdrive-state next` 调用会使用新值。

### Q: 环境变量和配置文件冲突时以谁为准？

Change 级 `.specdrive.yaml` 中显式设置的 `true` / `false` 优先级最高。仅当 change 级为 `null` 时，`SPECDRIVE_AUTO_TRANSITION` 才会覆盖项目级 `.specdrive/config.yaml`。

### Q: Hotfix / Tweak 工作流也支持吗？

支持。`auto_transition` 对所有工作流类型（full / hotfix / tweak）生效，只是映射到的下一个 Skill 不同（见工作流映射表）。
