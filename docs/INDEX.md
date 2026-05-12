# StreetNotes Docs Index

This is the repo-local map for durable project documentation. Strategic and session context lives in the Obsidian brain at `../_brain/`.

## Current Field Glow UI/UX Notes

- `docs/plans/2026-05-07-field-glow-ui-ux-pro-audit.md` - consolidated `mobile-ux` and `ui-ux-pro-max` recommendations for the mobile app.
- `../_brain/sessions/2026-05-08-fieldglow-landing-content-reposition.md` - landing copy reposition around brain-dump input, Salesforce focus, live intel, Story Vault, and self-learning field memory.
- `../_brain/sessions/2026-05-07-fieldglow-logo-production-deploy.md` - logo integration and production deployment note for the Field Glow app shell.
- `../_brain/sessions/2026-05-07-fieldglow-mobile-polish-pass.md` - implementation note for the P0/P1 mobile-polish pass.
- `docs/plans/2026-05-05-voice-engine-unification-plan.md` - shared voice-engine plan.

## Session Trail

- `docs/SESSION_LOG.md` - append-only project session outcomes.
- `../_brain/CONTEXT.md` - current Obsidian briefing.
- `../_brain/MOC.md` - Obsidian map of content.
- `../_brain/sessions/` - session notes linked from the MOC.

## Generated Codebase Wiki

- `docs/codebase/overview.md` - generated GitNexus overview.
- `docs/codebase/` - generated module wiki, synced from `.gitnexus/wiki/`.

Manual cached sync:

```bash
./scripts/sync-wiki.sh
```

Live GitNexus regeneration is intentionally opt-in because it can invoke external LLM work:

```bash
GITNEXUS_REFRESH_WIKI=1 ./scripts/sync-wiki.sh
```

## Maintenance Rule

When adding a durable plan, strategy note, or meaningful project doc, add it here and update `docs/SESSION_LOG.md` if it changes direction, scope, or future work.
