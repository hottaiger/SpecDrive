# OpenSpec Artifact Rules Compliance Design

## Goal

Fix Issue #66 so the Chinese `comet-open` workflow applies OpenSpec project
context and artifact-specific rules when generating the standard OpenSpec
artifacts.

## Scope

This change is intentionally limited to the standard Comet open workflow:

- `proposal`
- `design`
- `tasks`

It does not add general Custom Schema support or change Comet's assumptions
about `proposal.md`, `design.md`, and `tasks.md`.

Following the repository's bilingual Skill policy, this change updates the
Chinese Skill first. The English Skill will be updated only after the user
confirms the Chinese behavior.

## Root Cause

OpenSpec injects project configuration through:

```bash
openspec instructions <artifact-id> --change "<name>" --json
```

The returned JSON contains:

- `context`: project-wide constraints and background
- `rules`: rules for the requested artifact ID
- `template`: the artifact structure
- `instruction`: schema guidance
- `resolvedOutputPath`: the output location
- `dependencies`: completed artifacts to read first

The current `comet-open` Skill mentions `openspec instructions` only as part of
change creation, then tells the agent to fill `design.md` and `tasks.md`
directly. Their artifact-specific instructions are therefore not reliably
loaded, so rules such as `rules.tasks` can be ignored.

## Design

After `openspec new change` and the initial status lookup, `comet-open` will
create each standard artifact separately.

Before creating each artifact, it must run:

```bash
openspec instructions <artifact-id> --change "<name>" --json
```

For each returned instruction payload, the workflow must:

1. Read every completed dependency listed in `dependencies`.
2. Use `template` as the artifact structure.
3. Follow `instruction`.
4. Apply `context` and `rules` as constraints without copying them into the
   artifact.
5. Write to `resolvedOutputPath`.
6. Verify the output exists and is non-empty.
7. Re-run `openspec status --change "<name>" --json` before selecting the next
   artifact.

The already-confirmed Comet clarification summary remains the source material
for artifact content. OpenSpec instructions constrain and structure that
content rather than replacing Comet's clarification and confirmation gates.

## Failure Handling

If `openspec instructions` fails, returns invalid JSON, reports unmet
dependencies, or does not provide a usable output path, the workflow must stop
artifact generation and report the OpenSpec error. It must not fall back to
hard-coded artifact prose because that would silently bypass project rules.

## Testing

Add Chinese Skill contract assertions that verify:

- each of `proposal`, `design`, and `tasks` has an explicit JSON instructions
  command;
- the Skill requires applying `context`, `rules`, `template`, `instruction`,
  `resolvedOutputPath`, and `dependencies`;
- context and rules are constraints and must not be copied into artifacts;
- status is refreshed between artifacts;
- the Skill does not silently fall back when instructions fail.

Run the focused Skill tests, then the full Vitest suite.

## Release Notes

Append the fix and regression coverage to the existing `0.3.8` Changelog
entry. The current package version is already one patch above `master`
(`0.3.8` versus `0.3.7`), so this change does not bump the version.
