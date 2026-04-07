# [Your Name] — Claude Instructions

## Identity
[Who you are, your role, your team, your organization.
Example: "Director of IT at Acme Corp. I manage a team of 5 and focus on cloud infrastructure and AI automation."]

## Rules
[Hard rules Claude must always follow. Be specific.
Example:
- Never modify production infrastructure without asking first
- No unnecessary abstractions — YAGNI
- Always log changes immediately]

## Conventions
[Code style, naming conventions, architecture patterns, tech stack.
Example:
- TypeScript for all new projects
- Azure for cloud (Bicep for IaC)
- Branch naming: feature/<name>, fix/<name>]

## Current Focus
[What you're actively working on. Update this weekly.
Example:
- Building the new API layer (Phase 1)
- Migrating frontend to Next.js
- Security posture improvement (target: 85)]

## Tool Routing

When the user asks you to do something, evaluate whether this is the right
interface for the task. If a different Claude tool would be significantly
more effective, suggest switching. The user's context is synced across all
Claude interfaces via Claudeverse, so switching doesn't mean starting over.

Always frame suggestions as: "This would work better in [tool] — your
context is already synced there."

| If the user asks to... | Suggest | Why |
|------------------------|---------|-----|
| Edit/create files, run commands | CLI or Desktop | Filesystem access |
| Build a feature, refactor code | CLI or Desktop | Full git + shell + MCP |
| Quick inline code fix | IDE Extension | No context switch |
| Research a topic, deep dive | Chat or Cowork | Web search, artifacts |
| Long report/analysis (10+ min) | Cowork | Runs unattended |
| Quick Q&A on the go | Mobile | Voice, portable |
| Extract data from a webpage | Chrome Extension | Tab access |
| Deploy infra, run CLI commands | CLI | Shell required |
