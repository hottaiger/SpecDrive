# 上下文压缩（Context Compression）

> 版本状态：Beta（在 change 的 `.specdrive.yaml` 或项目级 `.specdrive/config.yaml` 中设置 `context_compression: beta` 启用）

## 概述

上下文压缩是 SpecDrive 在 Design → Build 阶段交接时的 token 优化机制。核心思路是：Build 阶段的 Agent 不必重复携带全部 OpenSpec 制品全文，而是读取 `specdrive-handoff.sh` 生成的、带来源追踪的 handoff 上下文包。

在标准流程中，Design 阶段处理 OpenSpec 制品并产出 Superpowers Design Doc；Build 阶段若读取完整 proposal / design / tasks / delta spec 摘录，输入 token 会随 Spec 规模显著膨胀。上下文压缩在离开 design 阶段前生成精简上下文包，Benchmark 显示 Build 阶段输入 token 约降低 **25–30%**（详见下文报告）。

## 压缩原理

### 两种模式

| 模式 | handoff 产物 | 行为 | 适用场景 |
|------|-------------|------|----------|
| `off` | `design-context.json` / `.md` | 嵌入 OpenSpec 源文件摘录（proposal、design、tasks、spec.md；单文件默认最多 80 行，可用 `--full` 输出全文） | Spec 较小、需要较完整上下文的场景 |
| `beta` | `spec-context.json` / `.md` | **verbatim 投影** delta `spec.md` 全文；proposal / design / tasks 等支持文件仅以 SHA256 引用 | Spec 较大、关注 token 效率的场景 |

> **与旧文档的区别**：beta 模式并非「只保留 Design Doc + hash」。handoff 的源文件是 **OpenSpec change 目录**下的制品；Superpowers Design Doc（`docs/superpowers/specs/`）由 design 阶段单独维护，不写入 handoff JSON。

### 压缩流程

```text
Design 阶段                                      Build 阶段
┌─────────────────────┐                           ┌─────────────────────┐
│ 处理 OpenSpec 制品   │                           │ 读取 handoff 上下文  │
│ 产出 Design Doc      │    specdrive-handoff.sh   │ 实现代码             │
│ （Superpowers 侧）   │ ────────────────────────► │ 运行测试             │
└─────────────────────┘    生成 handoff context    └─────────────────────┘
```

`specdrive-handoff.sh` 读取 change 的 `.specdrive.yaml` 中 `context_compression` 字段决定模式：

```bash
specdrive-handoff.sh <change-name> design --write        # compact（off 模式）
specdrive-handoff.sh <change-name> design --write --full # off 模式全文摘录
```

- **off 模式**：生成 `openspec/changes/<name>/.specdrive/handoff/design-context.json`（及同名 `.md`）。
- **beta 模式**：生成 `openspec/changes/<name>/.specdrive/handoff/spec-context.json`（及同名 `.md`）；`--full` 在 beta 下会被忽略。

### 压缩产物与状态字段

handoff 产物路径和 SHA256 会写入 change 的 `.specdrive.yaml`：

| 字段 | 含义 |
|------|------|
| `handoff_context` | handoff JSON 文件路径 |
| `handoff_hash` | 对 OpenSpec 源文件集合计算的 context hash |

`specdrive-guard.sh` 在 design → build 推进时会校验 `handoff_context` / `handoff_hash`（beta 模式额外校验 `spec-context.json` 结构）。

## 配置方式

### 优先级

| 优先级 | 位置 | 说明 |
|--------|------|------|
| 运行时 | `openspec/changes/<name>/.specdrive.yaml` 的 `context_compression` | handoff / guard 直接读取 |
| 初始化默认 | `SPECDRIVE_CONTEXT_COMPRESSION` 环境变量 | `specdrive-state init` 写入 change 时使用 |
| 初始化默认 | `.specdrive/config.yaml` | 项目级默认（环境变量未设置时） |
| 内置默认 | — | `off` |

`specdrive-state init` 会把解析后的 `context_compression` 写入新 change 的 `.specdrive.yaml`。之后可用 `specdrive-state set <name> context_compression <off|beta>` 单独修改。

#### 项目级示例（`.specdrive/config.yaml`）

```yaml
context_compression: beta
auto_transition: true
```

#### 环境变量

```bash
export SPECDRIVE_CONTEXT_COMPRESSION=beta
```

> **迁移说明**：旧 Comet 的 `.comet/config.yaml` / `.comet.yaml` 不会被 SpecDrive 脚本读取；需迁移到 `.specdrive/config.yaml` / `.specdrive.yaml`。

## Benchmark 报告

以下为基于 dry-run 模型的执行基准测试结果，对比 `off` 和 `beta` 两种模式在不同阶段和规模下的表现。

### 测试配置

- **测试日期**：2026-06-07
- **测试类型**：Dry-run（基于预设模型的模拟执行）
- **每组重复次数**：1
- **测试档位**：small / medium / large
- **测试阶段**：L1（设计）、L2（构建）、L3（全流程）

### 档位规模定义

| 档位 | Spec 需求数 | 测试用例数 | 乘数 |
|------|------------|-----------|------|
| small | 8 | 10 | 1× |
| medium | 20 | 25 | 5× |
| large | 40 | 50 | 15× |

### L1：设计阶段

Agent 读取 Spec → 产出 Design Doc → 记录需求覆盖率。

- **Token 节省**：925 tokens（30.87%）
- **输入 token 节省**：825 tokens

| 模式 | 平均总 tokens | 需求覆盖率 | 平均决策数 | 平均风险数 | 平均耗时(s) | 平均成本($) |
|------|-------------|-----------|-----------|-----------|------------|------------|
| off | 2,998 | 100% | 4 | 3 | 14 | 0.06 |
| beta | 2,072 | 100% | 3 | 2 | 9.33 | 0.04 |

**结论**：Design 阶段 beta 模式在保持 100% 需求覆盖率的同时，节省约 31% token。

### L2：构建阶段

Agent 读取 handoff context → 实现代码 → 运行测试 → 失败则重试。

- **Token 节省**：1,042 tokens（29.93%）
- **输入 token 节省**：942 tokens

| 模式 | 平均总 tokens | 测试通过率 | 完成率 | 平均重试 | 平均耗时(s) | 平均成本($) |
|------|-------------|-----------|-------|---------|------------|------------|
| off | 3,481 | 100% | 100% | 2 | 18.67 | 0.08 |
| beta | 2,439 | 100% | 100% | 1 | 11.67 | 0.05 |

**分档明细**：

| 档位 | off tokens | beta tokens | Token 节省 | 测试通过率 |
|------|-----------|------------|-----------|-----------|
| small | 1,468 | 1,144 | 324 (22.07%) | 100% |
| medium | 2,900 | 2,090 | 810 (27.93%) | 100% |
| large | 6,075 | 4,083 | 1,992 (32.79%) | 100% |

**结论**：构建阶段 beta 模式保持 100% 测试通过率，token 节省随规模增大而提升（22% → 33%）。

### L3：全流程（spec → design doc → handoff 压缩 → 实现 → 测试）

完整的双阶段流程：Design 阶段产出 Design Doc → `specdrive-handoff.sh` 生成压缩上下文 → Build 阶段读取压缩上下文实现并测试。

- **Token 节省**：7,000 tokens（24.53%）
- **输入 token 节省**：5,600 tokens

| 模式 | 平均总 tokens | Spec 覆盖率 | 测试通过率 | 平均重试 | 平均耗时(s) | 平均成本($) |
|------|-------------|-----------|-----------|---------|------------|------------|
| off | 28,536 | 100% | 100% | 2 | 98 | 0.98 |
| beta | 21,536 | 95% | 100% | 1 | 56 | 0.56 |

**分档明细**：

| 档位 | off tokens | beta tokens | Token 节省 | 测试通过率 | Spec 覆盖率 |
|------|-----------|------------|-----------|-----------|------------|
| small | 4,896 | 3,896 | 1,000 (20.42%) | 100% | off 100% / beta 95% |
| medium | 20,982 | 15,982 | 5,000 (23.83%) | 100% | off 100% / beta 95% |
| large | 59,729 | 44,729 | 15,000 (25.11%) | 100% | off 100% / beta 95% |

**结论**：

- beta 模式在全流程中节省约 25% token，大型任务的绝对节省量最大（15,000 tokens）。
- 测试通过率保持 100%——压缩不影响实现正确性。
- Spec 覆盖率从 100% 降至 95%——压缩可能丢失少量非关键需求细节，需在 Design 阶段确保核心需求被充分记录。
- 平均重试次数从 2 降至 1——压缩后的上下文更聚焦，减少了首次实现的偏差。

### 指标说明

| 指标 | 含义 | 度量阶段 |
|------|------|----------|
| **Spec 覆盖率** | Design Doc 对原始 Spec 需求的覆盖比例 | Design（L1/L3） |
| **测试通过率** | 实现代码通过测试用例的比例 | Build（L2/L3） |
| **Token 节省** | beta 模式相比 off 模式减少的总 token 数 | 全阶段 |
| **平均重试** | 达到全测试通过所需的 Claude 调用次数 | Build（L2/L3） |

### 核心发现

1. **压缩不影响正确性**：所有测试通过率均为 100%，beta 模式不会导致实现错误。
2. **规模越大节省越明显**：small 档位节省约 20%，large 档位节省约 25–33%，呈现正相关趋势。
3. **Spec 覆盖率存在微小损失**：beta 模式下 Spec 覆盖率约 95%，压缩过程可能丢失边缘需求。建议在 Design 阶段确保核心需求被 Design Doc 充分捕获。
4. **重试次数减少**：beta 模式的平均重试次数更低，说明精简上下文有助于 Agent 更准确地理解任务。

## 复现步骤

### 环境要求

- Node.js 20+
- Bash 兼容 shell（Windows 用户使用 Git Bash）
- Claude Code CLI（`claude` 命令可用，仅实际执行 benchmark 时需要）

### Dry-run 模式（无需 Claude API）

```bash
# 运行全流程 dry-run（L1 + L2 + L3）
node scripts/context-execution-benchmark.mjs --phase all --dry-run

# 单独运行 L3 全流程测试
node scripts/context-execution-benchmark.mjs --phase l3 --dry-run

# 上下文压缩专项 benchmark
node scripts/context-compression-benchmark.mjs --dry-run

# 指定档位
node scripts/context-execution-benchmark.mjs --phase l3 --tiers small --dry-run
```

### 实际执行（消耗 Claude API token）

```bash
# 运行 L3 全流程 benchmark
node scripts/context-execution-benchmark.mjs --phase l3

# 指定模型和重复次数
node scripts/context-execution-benchmark.mjs --phase l3 --model claude-sonnet-4-20250514 --repeat 3

# 指定单档位
node scripts/context-execution-benchmark.mjs --phase l3 --tiers large
```

### 输出文件

- **终端输出**：实时显示进度和汇总表
- **Markdown 报告**：`report.md`（中文格式，包含完整数据表）
- **JSON 原始数据**：`report.json`（每次运行的完整 token usage、verdict、测试结果和耗时）

输出目录（benchmark 脚本默认工作区）：

| 脚本 | 默认输出目录 |
|------|-------------|
| `context-execution-benchmark.mjs` | `.specdrive/benchmark-runs/.specdrive/benchmark/execution/` |
| `context-compression-benchmark.mjs` | `.specdrive/benchmark-runs/.specdrive/benchmark/context-compression/` |

可通过 `--workspace <dir>` 自定义工作区根目录。

### 测试验证

```bash
# 运行 benchmark 测试套件
npx vitest run test/ts/context-execution-benchmark.test.ts
npx vitest run test/ts/context-compression-benchmark.test.ts

# 运行全量测试
npx vitest run
```
