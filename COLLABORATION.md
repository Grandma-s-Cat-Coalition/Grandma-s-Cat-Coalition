# Claude + Codex collaboration

This repository is the shared source of truth for Grandma's Cat Coalition.

## Roles

- **Claude:** strategy, copy, architecture, specifications, and review.
- **Codex:** implementation, tests, deployment work, and technical fixes.
- **Cortney:** product approval and Kim coordination.

## Working agreement

1. Claude writes or updates a numbered file in `specs/` before implementation.
2. The active owner updates the spec's `Status` line whenever work moves between `Not started`, `In progress`, `Needs review`, `Changes requested`, `Blocked`, and `Implemented`.
3. Codex records implementation details and verification in `specs/HANDOFF.md` and links the relevant spec.
4. Claude reviews the actual changed files and verification results, then records approval or requested changes in the handoff log.
5. Product decisions that need Cortney or Kim stay listed under the spec's open items. Agents do not guess those answers.
6. GitHub issues are used for work that spans more than one session. Pull requests reference the spec and issue when one exists.

## Safe handoffs

- Never place credentials, donor information, adopter information, or private animal records in specs, issues, commits, or the handoff log.
- Preserve unrelated local changes. In particular, `.claude/settings.local.json` is machine-local and must not be committed.
- Every implementation handoff includes the files changed, tests/builds run, results, known limitations, and the next owner.
- A passing build does not mean product approval. Use `Needs review` until Claude and Cortney have completed the required review.

## GitHub labels

When the repository labels are configured, use:

- `agent:claude`
- `agent:codex`
- `needs-review`
- `blocked`
- `decision-needed`
- `content`
- `development`

