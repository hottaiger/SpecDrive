# Context Compression Recovery Protocol

Canonical path: `comet/reference/context-recovery.md`

This protocol is shared by all comet sub-skills that may trigger context compression. When the agent suspects context compression has occurred (previous conversation summarized, cannot find previously discussed content), follow this protocol to recover.

## Recovery Steps

```bash
"$COMET_BASH" "$COMET_STATE" check <change-name> <phase> --recover
```

The script outputs structured recovery context (phase, completed fields, pending fields, recovery action). Follow the **Recovery action** output for next steps.

## Build Phase Special Recovery

If the recovery script outputs `build_mode: subagent-driven-development`:

1. Re-read `comet/reference/subagent-dispatch.md` for the dispatch workflow
2. Do not load the `subagent-driven-development` skill
3. Do not execute tasks directly in the main session
4. Resume from the first unchecked task, dispatching fresh background agents per the protocol

## Design Phase Special Recovery

- If the user has not yet confirmed the design approach, return to brainstorming
- If the user has confirmed, continue creating the Design Doc
- On recovery, reload `brainstorm-summary.md` + handoff context files

## Verify/Archive Phase Recovery

- Verify: script outputs verification status, branch status, and recovery action
- Archive: if `archived: true` and archive directory exists, archival is complete — do not re-execute
