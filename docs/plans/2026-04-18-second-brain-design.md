# Second Brain — Obsidian Knowledge Capture Design

Date: 2026-04-18
Status: Active

## Purpose

Build a persistent knowledge layer in the Obsidian vault that captures decisions, patterns, strategy evolution, and session knowledge across all projects — with wikilinks that power the graph view and a lean context-loading system that reduces Claude Code token usage per session.

## Vault Structure

```
Obsidian_ClaudeCode/               <- vault root
+-- _brain/                        <- the Second Brain
|   +-- CONTEXT.md                 <- lean briefing doc (~50 lines, updated each session)
|   +-- MOC.md                     <- Map of Content (linked index of all brain notes)
|   +-- decisions/                 <- why we chose X over Y
|   +-- patterns/                  <- reusable technical patterns
|   +-- sessions/                  <- auto-generated session knowledge
|   +-- evolution/                 <- GTM/strategy shifts over time
+-- .obsidianignore                <- hide code noise from graph view
+-- Streetnotes/                   <- existing (code + docs)
+-- Forgetime/                     <- existing
+-- Career Maniacs/                <- existing
+-- streetnotes-playbook/          <- existing
```

## .obsidianignore Strategy

Hide everything that isn't knowledge from Obsidian's indexer and graph:
- All node_modules, .next, .git, .vercel, .cursor, .vscode, .claude
- Source code dirs: app/, components/, lib/, hooks/, supabase/, scripts/, public/
- Build configs: *.js, *.ts, *.json, *.mjs, *.css at project roots
- .planning/phases/ (execution-level detail)
- docs/codebase/ (auto-generated wiki)

What stays visible:
- Everything in _brain/
- docs/plans/ (design docs are knowledge)
- docs/INDEX.md, docs/SESSION_LOG.md
- Strategy docs (SN ACP/, specs, pricing)
- CLAUDE.md, AGENTS.md at each project root

## Note Templates

### Decision Note (_brain/decisions/)

Frontmatter: type, project (wikilink), date, status (active/superseded), tags
Body: Context, Options considered, Choice + why, Consequences

### Pattern Note (_brain/patterns/)

Frontmatter: type, project (wikilink), date, stack, tags
Body: Problem, Solution, When to use

### Session Note (_brain/sessions/) — auto-generated

Frontmatter: type, project (wikilink), date
Body: What changed, Decisions made (wikilinks), Patterns applied (wikilinks), Open threads

### Evolution Note (_brain/evolution/)

Frontmatter: type, project (wikilink), date, area (positioning/pricing/ICP/etc), tags
Body: Previous thinking, What shifted, New direction, Why this matters

## CONTEXT.md — Token-Efficient Context Loading

A lean (~50 line) briefing doc that answers: "What are we working on, what did we just decide, and what's the current strategic direction?"

Read at session start instead of .planning/STATE.md + PROJECT.md + ROADMAP.md + SESSION_LOG.md. If a task needs deeper context, follow wikilinks from CONTEXT.md to specific notes.

Updated at the end of every session.

CLAUDE.md keeps all technical reference (stack, architecture, key files, env vars, commands).

## MOC.md — Map of Content

Organized by concept (not chronologically). Sections: Projects, Decisions (grouped by domain), Patterns (grouped by stack area), Strategy Evolution (grouped by area), Sessions (last 10).

Differs from docs/INDEX.md: INDEX maps files on disk, MOC maps knowledge connections.

## Capture Workflow

### Session notes — automatic
Written at end of any session that changes code, makes decisions, or shifts strategy. Skipped for trivial sessions. No prompt needed.

### Decisions and patterns — proactive
Claude flags non-obvious choices and reusable patterns during work. Writes the note if user confirms.

### Evolution notes — user-triggered
Strategy shifts are too nuanced to detect automatically. Claude asks to capture when user signals a shift.

### End-of-session checklist
1. Write session note if warranted
2. Write any flagged decision/pattern notes
3. Update CONTEXT.md
4. Add new notes to MOC.md
5. Update docs/SESSION_LOG.md if direction shift (backward compat)
