# Vault Index

Curated map of non-code context in this repo (which is also an Obsidian vault). Loaded automatically into every Claude Code session via `@docs/INDEX.md` in the project `CLAUDE.md`.

**Keep this file short.** It is a map, not a dump. One line per document. If you find yourself reaching for a file repeatedly and it's not listed, add it. If a listed file is stale or deleted, remove it.

---

## Codebase wiki (auto-generated from GitNexus graph)

- `docs/codebase/overview.md` — Entry point. Linked module map of the whole repo.
- `docs/codebase/` — 65 module pages (auth, API routes, libraries, components, dashboards). Read the overview first; jump to the specific module page for detail.
- Regenerate with `./scripts/sync-wiki.sh` after meaningful code changes. Costs ~$0.50–2 in OpenAI calls. Wiki is gitignored — it's a regenerated artifact, not a source of truth.

## Second Brain (knowledge layer)

- `_brain/CONTEXT.md` — Lean briefing doc. Read this at session start for "where are we."
- `_brain/MOC.md` — Map of Content linking all decisions, patterns, sessions, evolution notes.
- `_brain/decisions/` — Why we chose X over Y. Wikilinked.
- `_brain/patterns/` — Reusable technical patterns. Wikilinked.
- `_brain/sessions/` — Auto-generated session knowledge. Wikilinked.
- `_brain/evolution/` — GTM/strategy shifts over time. Wikilinked.

## Current state

- `StreetNotes_Project_Status_March_2026.md` — Scorecard, what's done, what's next, roadmap.
- `.planning/STATE.md` — Current session position and continuity notes (auto-managed by GSD).
- `.planning/PROJECT.md` — Core requirements and decisions.
- `.planning/ROADMAP.md` — 6-phase build plan and success criteria.
- `.planning/REQUIREMENTS.md` — v1 requirements with traceability.
- `docs/SESSION_LOG.md` — Dated log of notable session outcomes. Append-only.

## Strategy & GTM

- `SN ACP/acp-strategy-full-framework-v2.md` — Agentic Commerce Protocol strategy.
- `SN ACP/StreetNotes_Blitzkrieg_GTM_Strategy.md` — GTM playbook.
- `SN ACP/ACP STRATEGY_Streetnotes.docx` — ACP strategy (docx; convert if deep read needed).
- `Pricing Strategy for StreetNotes.ai.docx` — Pricing tiers and rationale.
- `StreetNotes_Idea_Validation_Pre_Analysis.docx` — Pre-build validation.
- `spectacular_feature_research (1).md` — Feature research brief.

## Product & specs

- `Story Vault — Feature Specification.md` — Story Vault + Challenges spec.
- `Streetnotes_Build_Plan.pdf` — Original build plan (PDF).
- `streetnotesbuild.docx` — Build plan working doc.
- `.planning/research/ARCHITECTURE.md` — Architecture research.
- `.planning/research/FEATURES.md` — Feature research.
- `.planning/research/STACK.md` — Stack research.
- `.planning/research/PITFALLS.md` — Known pitfalls.
- `.planning/research/SUMMARY.md` — Research synthesis.
- `.planning/research/aesthetics-vertical-analysis.md` — Aesthetics/plastic surgery sales vertical beachhead analysis (TAM, competitive gap, GTM playbook).

## Design docs (dated, most recent first)

- `docs/plans/2026-04-19-aesthetics-investor-brief-v3.md` — Investor brief v3 (FINAL): excitement-first, compounding math, "move faster" frame. Send this one.
- `docs/plans/2026-04-19-aesthetics-investor-brief-v2.md` — Investor brief v2: partnership model, exit thesis, brand deals, doubled budget ask ($30K).
- `docs/plans/2026-04-18-aesthetics-investor-brief.md` — Investor brief v1: aesthetics niche pivot, GTM on $10–15K.
- `docs/plans/2026-04-18-second-brain-design.md`
- `docs/plans/2026-03-23-vbrick-dashboard-impl.md`
- `docs/plans/2026-03-23-vbrick-dashboard-design.md`
- `docs/plans/2026-03-20-vbrick-command-center-design.md`
- `docs/plans/2026-03-15-brain-dump-intelligence-implementation.md`
- `docs/plans/2026-03-15-brain-dump-intelligence-layer-design.md`
- `docs/plans/2026-03-12-brain-dump-prd.md`
- `docs/superpowers/specs/2026-04-10-swipe-to-delete-stories-design.md`

## Phase plans

- `.planning/phases/` — One directory per phase, contains research and execution plans. List subdirs when you need current phase detail.

## Working style & ops

- `cursor-working-style.md` — Jeff's preferred working style when it differs from defaults.
- `AGENTS.md` — GitNexus code-intelligence usage (also in CLAUDE.md).
- `security_best_practices_report.md` — Security audit findings.

## Ideabrowser (external)

Strategy, offer definition, brand voice, and ICP live in Ideabrowser (MCP), not here.
- Project ID: `f75b829b-c0c0-451b-97f1-12bb813ce610`
- Idea ID: `6297`
- Load via `get_project_context` when needed.

---

## Update rules (for Claude)

When working in this repo, keep this index honest:

1. **New vault doc created** → add a one-line entry under the right section. Delete the entry if the file is deleted.
2. **Significant shift in project status, strategy, or direction** → append a dated bullet to `docs/SESSION_LOG.md` with the outcome and links to any new or updated docs. Keep each entry under three lines.
3. **Stale pointers** → if a listed file no longer matches its description, fix the description or remove the line. Do not leave lies in the index.
4. **Do not bloat.** If this file grows past ~120 lines, collapse sections or move detail into sub-indexes (e.g., `docs/plans/INDEX.md`) and reference those here.
