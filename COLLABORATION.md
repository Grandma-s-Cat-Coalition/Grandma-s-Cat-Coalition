# Claude + Codex collaboration

This repository is the shared source of truth for Grandma's Cat Coalition.

## Roles (standard table)

Seats are roles, not products. The tool in a chair can change; the chair doesn't.

- **Athena (Claude):** strategy, specs, copy, architecture, routing the work.
- **Forge (Claude Code):** implementation, tests, deployment work, technical fixes.
- **Sherlock (Codex):** skeptic and reviewer. Different vendor from the builder, by structure — nobody grades their own homework.
- **Cortney:** product approval and Kim coordination.

> Note: prior to 2026-08-27 the chairs were reversed (Codex built, Claude reviewed).
> Spec 01's initial implementation was built by Codex; everything from the Spec 01
> rework onward follows the table above.

## Working agreement

1. Claude writes or updates a numbered file in `specs/` before implementation.
2. The active owner updates the spec's `Status` line whenever work moves between `Not started`, `In progress`, `Needs review`, `Changes requested`, `Blocked`, and `Implemented`.
3. The builder (Forge) records implementation details and verification in `specs/HANDOFF.md` and links the relevant spec.
4. The reviewer (Sherlock/Codex) reviews the actual changed files and verification results, then records approval or requested changes in the handoff log.
5. Product decisions that need Cortney or Kim stay listed under the spec's open items. Agents do not guess those answers.
6. GitHub issues are used for work that spans more than one session. Pull requests reference the spec and issue when one exists.

## Safe handoffs

- Never place credentials, donor information, adopter information, or private animal records in specs, issues, commits, or the handoff log.
- Preserve unrelated local changes. In particular, `.claude/settings.local.json` is machine-local and must not be committed.
- Every implementation handoff includes the files changed, tests/builds run, results, known limitations, and the next owner.
- A passing build does not mean product approval. Use `Needs review` until the reviewer and Cortney have completed the required review.

## GitHub labels

When the repository labels are configured, use:

- `agent:claude`
- `agent:codex`
- `needs-review`
- `blocked`
- `decision-needed`
- `content`
- `development`
