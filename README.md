# Claudeverse

> One config. Every Claude interface. Connected.

Claude has seven interfaces across three ecosystems. Your instructions don't carry between them. Your terminal Claude knows your projects; your browser Claude doesn't; your mobile Claude forgets you every time. You paste the same context into every new chat forever.

**Claudeverse fixes that.** Write one `CLAUDE.md`. Log your work as you go. Run `claudeverse sync`. Every Claude gets your identity, your rules, and a summary of what you've been working on lately.

---

## Install

```bash
npm install -g claudeverse
```

Node 18+.

---

## Quick start

```bash
# One time — seed from your existing CLAUDE.md
claudeverse init --import ~/.claude/CLAUDE.md

# Set your API key for daily-log summarization
export ANTHROPIC_API_KEY=sk-ant-...

# Daily — log what you do
claudeverse log "shipped the auth fix"
claudeverse log "deployed v0.2 to staging"

# When you want everything updated
claudeverse sync

# Check state whenever
claudeverse status
```

That's the whole daily loop.

---

## The four commands

| Command | What it does |
|---|---|
| `claudeverse init` | Creates `~/.claudeverse/` with your source-of-truth config and starter template. Use `--import <path>` to seed it from an existing `CLAUDE.md`. |
| `claudeverse log "msg"` | Appends a one-line note to today's daily log. 2 seconds. |
| `claudeverse sync` | Summarizes recent logs via the Claude API, regenerates every target, backs up the previous version, copies the browser version to your clipboard. |
| `claudeverse status` | Shows what's synced, what's stale, and when. |

---

## What `sync` actually does

1. Reads your source-of-truth `~/.claudeverse/CLAUDE.md`
2. Parses it into sections (each `##` and `###` heading becomes a section)
3. Summarizes the last 7 days of your `claudeverse log` entries into a short context block (requires `ANTHROPIC_API_KEY`; skipped gracefully if not set)
4. Regenerates `~/.claude/CLAUDE.md` with `<!-- claudeverse:auto:start/end -->` markers wrapping each section
5. **Preserves any `<!-- claudeverse:user:start/end -->` blocks you hand-wrote** — those never get overwritten
6. Writes a condensed version for the browser/mobile ecosystems and copies it to your clipboard
7. Backs up the previous `~/.claude/CLAUDE.md` to `.bak` before writing

---

## Section markers — the feature that matters

Every generated `CLAUDE.md` wraps its sections in markers:

```markdown
<!-- claudeverse:auto:start identity -->
## Identity

I am a software engineer. I build side projects obsessively.
<!-- claudeverse:auto:end identity -->

<!-- claudeverse:user:start custom-rules -->
- Always use kebab-case for filenames
- Never commit secrets to the .env.example template
- Prefer editing existing files over creating new ones
<!-- claudeverse:user:end custom-rules -->
```

- **`auto` blocks** regenerate every sync. Don't hand-edit them — your changes will be overwritten. Edit the source at `~/.claudeverse/CLAUDE.md` instead.
- **`user` blocks** are yours. Anything inside them survives every sync, forever.

This is how you let the tool manage 90% of the file while keeping 10% hand-crafted and safe.

### User slots

Three pre-allocated user slots are always preserved:

| Slot ID | Where it sits | Purpose |
|---|---|---|
| `custom-rules` | After the Rules section | Your project-specific rules |
| `custom-routing` | After the Tool Routing section | Extra routing entries |
| `custom-footer` | End of file | Notes, reminders, links |

You can also add your own `<!-- claudeverse:user:start my-id -->` blocks anywhere. They're gathered and preserved under a `## Preserved User Blocks` heading on every sync.

---

## Safety — Claudeverse never destroys your config

| Backup | When it's made | Purpose |
|---|---|---|
| `~/.claude/CLAUDE.md.pre-claudeverse` | On `init --import` (first time only) | Permanent escape hatch. Never overwritten. |
| `~/.claude/CLAUDE.md.bak` | Before every `sync` | Rolling undo. Overwritten each sync. |

To revert to the pre-Claudeverse original:

```bash
cp ~/.claude/CLAUDE.md.pre-claudeverse ~/.claude/CLAUDE.md
```

---

## Using it across every Claude surface

See **[USAGE.md](USAGE.md)** for the full breakdown of which Claude interfaces auto-read your config and which need a one-time paste.

Short version:

- **Local Claudes** (Claude Code, Desktop, VS Code, JetBrains) — Read `~/.claude/CLAUDE.md` automatically after every sync. You do nothing.
- **Browser Claudes** (Claude.ai Projects, Cowork) — Paste your clipboard into Project Instructions once. Claudeverse copies the right content to your clipboard on every sync.
- **Mobile Claude** — Inherits from browser Projects.

---

## Requirements

- Node 18 or higher
- `ANTHROPIC_API_KEY` (optional — for daily-log summarization; sync still works without it)

---

## Develop locally

```bash
git clone https://github.com/rudymartinezai/claudeverse.git
cd claudeverse
npm install
npm run build
npm test     # 57 tests, should all pass
npm link     # makes `claudeverse` available globally
claudeverse --help
```

---

## License

MIT.

---

## Contributing

Issues and PRs welcome at [github.com/rudymartinezai/claudeverse](https://github.com/rudymartinezai/claudeverse).
