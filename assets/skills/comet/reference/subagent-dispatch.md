# Subagent Dispatch Protocol

Canonical path: `comet/reference/subagent-dispatch.md`

This protocol applies only when `build_mode: subagent-driven-development`. The main session only coordinates; it must not write implementation code directly.

## Role Isolation

- Dispatch a fresh implementer agent for each task; never bundle multiple tasks into one agent.
- Each spec compliance review, code quality review, feedback fix, and final review uses a new independent background agent; never reuse the implementer or a previous reviewer.
- Each agent must have isolated context, run in the background, and have its results retrieved by the main session. Claude Code uses the `Agent` tool with `run_in_background: true`; other platforms use equivalent mechanisms.
- Neither the main session nor background agents load the `subagent-driven-development` skill. The main session may reference its `implementer-prompt.md`, `spec-reviewer-prompt.md`, and `code-quality-reviewer-prompt.md`, but must write complete instructions directly into the dispatch prompt.

## Before Starting

1. Read the plan once, extracting the full text of all unchecked tasks in order.
2. Save a unique identifier for each task: the full task text after the checkbox in the plan, and the full OpenSpec task text it maps to (if any). If the text is not unique, stop and fix the plan first; never rely on "first match."
3. Respect dependencies; do not dispatch a task whose dependencies are not yet complete.

## Per-Task Execution Cycle

1. Dispatch a fresh implementer agent. The prompt must include the full task text, architecture and dependency context, `Language: Use the language of the user request that triggered this workflow`, allowed scope, test commands, and commit requirements.
2. The implementer is only responsible for implementation, testing, and committing code. **The implementer must not check off plan or OpenSpec tasks**, nor update only the built-in Todo or in-chat checklists.
3. If `tdd_mode: tdd`, inject the TDD hard constraint into the implementer prompt: `You MUST follow TDD: write a failing test first, watch it fail, then write minimal code to pass. No production code without a failing test first.`. The return must provide **RED failure command and failure summary**, **GREEN pass command and pass summary**; missing either piece of evidence blocks entry into review.
4. The implementer return status must be `DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT`, and include implementation content, tests, commit hash, changed files, and concerns. The main session verifies the commit and files are visible in the current worktree; for isolated-copy platforms, pull or merge changes first.
5. Dispatch a fresh spec compliance reviewer, providing the full task, implementation commit/diff, and TDD evidence. After it passes, dispatch a fresh code quality reviewer. If `tdd_mode: tdd`, both reviewers must verify RED/GREEN evidence and test coverage.
6. When either reviewer finds issues, dispatch a new implementer agent to fix them, then resume from the corresponding review. Each task allows at most 3 review-fix rounds; if still not passing, pause and hand accumulated feedback to the user.
7. **After both reviews pass**, the main session changes the saved unique task text from `- [ ]` to `- [x]` in the plan; if a mapping exists, also check off the OpenSpec task, and commit this progress update.
8. **Targeted completion checkpoint**: verify using the saved unique task text via the state script; never inline check logic in the Skill, and never substitute "list all incomplete items" for current task verification:

```bash
"$COMET_BASH" "$COMET_STATE" task-checkoff "$PLAN_FILE" "$PLAN_TASK_TEXT"
"$COMET_BASH" "$COMET_STATE" task-checkoff "openspec/changes/<name>/tasks.md" "$OPENSPEC_TASK_TEXT"
```

Run the second command only when the corresponding mapping exists. The script requires the task text to appear exactly once and be checked; verification failure blocks moving to the next task.

## Wrap-up

- After review passes, immediately continue to the next task; do not ask whether to continue between tasks.
- After all tasks complete, dispatch a fresh final code quality reviewer to review the overall implementation. CRITICAL issues must be fixed by dispatching a new implementer and re-reviewed; non-CRITICAL findings may be accepted with rationale recorded in tasks.md.

## Context Recovery

Resume from the first unchecked task and re-execute this protocol. Tasks that were committed but did not pass dual review remain unchecked and re-enter the review or fix cycle.
