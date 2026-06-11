# Subagent 调度协议

规范路径：`comet/reference/subagent-dispatch.md`

本协议仅适用于 `build_mode: subagent-driven-development`。主会话只负责协调，禁止直接编写实现代码。

## 角色隔离

- 每个 task 派发一个全新的 implementer agent，不得把多个 task 打包给同一个 agent。
- 每次 spec compliance review、code quality review、反馈修复和最终 review 都使用新的独立后台 agent，不得复用 implementer 或之前的 reviewer。
- 每个 agent 必须具有隔离上下文，在后台运行，并由主会话获取结果。Claude Code 使用 `Agent` 工具并设置 `run_in_background: true`；其他平台使用等效机制。
- 主会话和后台 agent 都不加载 `subagent-driven-development` 技能。主会话可参考其 `implementer-prompt.md`、`spec-reviewer-prompt.md` 和 `code-quality-reviewer-prompt.md`，但必须把完整指令直接写入派发 prompt。

## 开始前

1. 读取计划一次，按顺序提取所有未勾选 task 的完整文本。
2. 为每个 task 保存唯一标识：plan 中 checkbox 后的完整任务文本，以及它映射的 OpenSpec task 完整文本（若存在）。若文本不唯一，停止并先修正计划，禁止依赖“第一个匹配项”。
3. 尊重依赖关系；依赖尚未完成的 task 不得提前派发。

## 每个 Task 的执行循环

1. 派发全新的 implementer agent。prompt 必须包含完整 task 文本、架构和依赖上下文、`Language: 使用触发本次工作流的用户请求语言输出`、允许修改的范围、测试命令和提交要求。
2. implementer 只负责实现、测试和提交代码。**implementer 不得勾选 plan 或 OpenSpec task**，也不得只更新内置 Todo 或对话 checklist。
3. 若 `tdd_mode: tdd`，必须在 implementer prompt 中注入 TDD 硬约束：`You MUST follow TDD: write a failing test first, watch it fail, then write minimal code to pass. No production code without a failing test first.`。回报必须提供 **RED 失败命令与失败摘要**、**GREEN 通过命令与通过摘要**；缺少任一证据不得进入审查。
4. implementer 回报状态必须为 `DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT`，并包含实现内容、测试、提交哈希、更改文件和顾虑。主会话确认提交和文件在当前工作树可见；隔离副本平台先拉取或合并更改。
5. 派发全新的 spec compliance reviewer，提供完整 task、实现提交/差异和 TDD 证据。通过后再派发全新的 code quality reviewer。若 `tdd_mode: tdd`，两个 reviewer 都必须核验 RED/GREEN 证据与测试覆盖。
6. 任一 reviewer 发现问题时，派发新的 implementer agent 修复，再从对应审查开始。每个 task 最多 3 轮审查-修复；仍未通过则暂停并把累计反馈交给用户。
7. **两个审查都通过后**，由主会话将 plan 中保存的唯一 task 文本从 `- [ ]` 改为 `- [x]`；若存在映射，再同步勾选 OpenSpec task，并提交这次进度更新。
8. **定向完成检查点**：按保存的任务唯一文本调用状态脚本验证，不得在 Skill 中内联实现检查逻辑，也不得用“列出所有未完成项”代替当前任务验证：

```bash
"$COMET_BASH" "$COMET_STATE" task-checkoff "$PLAN_FILE" "$PLAN_TASK_TEXT"
"$COMET_BASH" "$COMET_STATE" task-checkoff "openspec/changes/<name>/tasks.md" "$OPENSPEC_TASK_TEXT"
```

仅在对应映射存在时运行第二条。脚本会要求任务文本恰好出现一次且该项已勾选；验证失败时不得进入下一个 task。

## 收尾

- review 通过后立即继续下一个 task，不在 task 之间询问是否继续。
- 所有 task 完成后，派发全新的 final code quality reviewer 审查整体实现。CRITICAL 问题必须派发新的 implementer 修复并重新审查；接受非 CRITICAL 发现时，在 tasks.md 中记录理由。

## 上下文恢复

从第一个未勾选 task 恢复，并重新执行本协议。已提交但未通过双审查的 task 保持未勾选，重新进入审查或修复循环。
