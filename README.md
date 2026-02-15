# SolidStart + Park UI (Panda CSS) Starter

Starter repository for SolidStart with Park UI wrappers, Panda theming, and a curated set of developer-focused assets reconciled from `visual-notes`.

## Layout

- `/app` - SolidStart application
- `/AGENTS.md` - repo-level contributor + agent guidance
- `/.agents/skills` - local reusable skills/playbooks
- `/.mcp.json` - Ark UI MCP server wiring
- `/docs` - migration/reconciliation documentation

## Quick Start

```bash
pnpm -C app install
pnpm -C app dev
```

## Useful Commands

```bash
pnpm -C app prepare
pnpm -C app type-check
pnpm -C app test
pnpm -C app build
pnpm -C app start
```

## UI Surface

Base Park-style wrappers are in `app/src/components/ui/*`, including reconciled utility wrappers:

- `SimpleDialog`
- `SimplePopover`
- `SimpleSelect`
- `PanelPopover`
- `ConfirmDialog`
- `ClearButton`
- `WrapWhen`

## Reconciliation Notes

See `/docs/visual-notes-reconciliation-2026-02-15.md` for the full import list and rationale.

