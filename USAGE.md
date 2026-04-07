# USAGE — Claudeverse across every Claude interface

> The short answer: **you don't type anything different inside Claude.** You run three new commands in your terminal, and you paste once into browser Claude. That's it.

This file explains exactly what changes — and what doesn't — for every Claude surface.

---

## The daily loop (this is all you do)

```bash
# Throughout the day, whenever something notable happens
claudeverse log "shipped the X feature"
claudeverse log "decided to drop the Y approach"
claudeverse log "interview with Z on Thursday"

# Once — usually at the end of the day, or whenever you want everything refreshed
claudeverse sync
```

After `sync`:
- Every local Claude (terminal, desktop, VS Code, JetBrains) automatically has the updated config
- Your clipboard contains the condensed browser version, ready to paste into Claude.ai Projects

Inside every Claude chat, **you type the same thing you already type.** Ask questions, give instructions, ship code, debug, review, whatever. The context is already there.

---

## What to type, by interface

### Local Claudes (auto-updated, zero manual work)

These read `~/.claude/CLAUDE.md` automatically on every session. After `claudeverse sync` finishes, they're already up to date. Just open a conversation and work.

| Interface | Reads | What you type |
|---|---|---|
| **Claude Code** (terminal) | `~/.claude/CLAUDE.md` | Exactly what you type today. Nothing changes. |
| **Claude Desktop** (macOS/Windows app) | `~/.claude/CLAUDE.md` via project config | Exactly what you type today. Nothing changes. |
| **Claude for VS Code** | `~/.claude/CLAUDE.md` | Exactly what you type today. Nothing changes. |
| **Claude for JetBrains** (IntelliJ, PyCharm, WebStorm) | `~/.claude/CLAUDE.md` | Exactly what you type today. Nothing changes. |

**The point:** if you've been editing `~/.claude/CLAUDE.md` by hand, stop. Edit `~/.claudeverse/CLAUDE.md` instead — that's the source of truth. Run `claudeverse sync` and every local Claude picks up the change.

---

### Browser Claudes (one-time paste per sync)

These **do not read your local files.** They live inside `claude.ai`. You give them context once, per Project.

| Interface | Setup | What you type |
|---|---|---|
| **Claude.ai Projects** | After `sync`, paste your clipboard into the Project's **Project Instructions** field. Update whenever you sync. | Ask whatever you'd normally ask. The project now has your identity, your current work, your rules. |
| **Claude.ai one-off chats** (no project) | Not the target. Use Projects for anything where context matters. | — |
| **Cowork** (claude.ai team workspace) | Same as Projects — paste the clipboard into the workspace instructions. | Exactly what you type today. |

**What `claudeverse sync` copies to your clipboard:** a condensed version of your config — identity, active projects, rules, and the recent daily-log summary. Not the full local CLAUDE.md. The browser version is optimized for Project Instructions length limits.

**How often to paste:** whenever you care about having the latest context in a browser Project. If you don't update often, browser Claude will be behind — but it'll still have whatever you pasted last.

---

### Mobile Claude

Inherits from **Claude.ai Projects.** If you've pasted the clipboard into a Project on desktop, mobile Claude in that same Project already has the context. Nothing extra to type.

For one-off mobile chats outside a Project — same deal as browser one-off chats. Use Projects.

---

## The three new commands (this is the actual delta)

### `claudeverse log "message"`
Appends a one-line note to today's daily log. Two seconds. Use it throughout the day.

```bash
claudeverse log "finally got the auth bug fixed in the API layer"
claudeverse log "decided to drop the Redis cache layer"
claudeverse log "shipped v0.2 to staging"
```

### `claudeverse sync`
The moment of truth. Reads your source-of-truth, summarizes recent logs (via the Claude API if `ANTHROPIC_API_KEY` is set), regenerates every target, backs up the previous version, and copies the browser version to your clipboard.

Run this when you want everything refreshed — end of day, after a big decision, before a new chat, whatever feels right.

### `claudeverse status`
Tells you what's synced, what's stale, when the last sync happened. Use it whenever you're not sure if everything's current.

```bash
claudeverse status
```

---

## Rules to live by

1. **Don't hand-edit `~/.claude/CLAUDE.md`.** Edit `~/.claudeverse/CLAUDE.md` instead. That's the source.
2. **Don't hand-edit inside `<!-- claudeverse:auto:start/end -->` blocks.** They get regenerated on every sync. Your changes will vanish.
3. **Do hand-edit inside `<!-- claudeverse:user:start/end -->` blocks.** Those are preserved forever. Use them for anything personal that doesn't belong in the source template.
4. **After any big edit to the source, run `sync`.** The file on disk is useless until you sync it out.
5. **Paste the clipboard into Claude.ai Projects when you want browser Claude to know what you've been working on.** Not required — but browser Claude gets dumber over time without it.

---

## What you should never do

- ❌ Edit `~/.claude/CLAUDE.md` directly — it's auto-generated. Your edits will be overwritten on the next sync.
- ❌ Delete `~/.claude/CLAUDE.md.pre-claudeverse` — that's your permanent escape hatch back to life before Claudeverse.
- ❌ Commit `~/.claudeverse/` to a public git repo if it contains secrets. The source-of-truth file is personal.
- ❌ Expect browser Claude to magically know about a sync you just ran on another machine. Browser Claude only knows what you've pasted into it.

---

## Restoring to life before Claudeverse

If you ever want to walk away:

```bash
# Restore the original CLAUDE.md you had before init
cp ~/.claude/CLAUDE.md.pre-claudeverse ~/.claude/CLAUDE.md

# Optional: uninstall
npm uninstall -g claudeverse
```

Your `.pre-claudeverse` backup is never overwritten. It's your permanent undo button.

---

## Troubleshooting

**"`claudeverse` command not found"**
Check your npm global bin path is in `$PATH`:
```bash
echo $PATH | tr ':' '\n' | grep -i npm
npm config get prefix
```
If the prefix isn't in your PATH, add it: `export PATH="$(npm config get prefix)/bin:$PATH"`

**"ANTHROPIC_API_KEY not set — skipping log summarization"**
This is a warning, not an error. Sync still works — it just won't summarize your daily logs. Set the env var to enable summarization:
```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

**"My hand-written block got wiped"**
You probably put it inside an `auto` block. Move it into a `user` block (`<!-- claudeverse:user:start my-id -->...<!-- claudeverse:user:end my-id -->`) and it'll survive every sync forever.

**"Claude.ai Project still has old context"**
Browser Claudes don't auto-update. Run `claudeverse sync` (copies the latest to your clipboard) and paste into the Project Instructions field again.

---

## One more time, in one sentence

Local Claudes update automatically after `sync`. Browser Claudes update when you paste. Inside any Claude, you type what you'd type anyway — the context is just already there.
