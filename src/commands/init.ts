import { join } from 'node:path';
import { existsSync, copyFileSync } from 'node:fs';
import chalk from 'chalk';
import { getClaudeverseDir, ensureDir, writeFileSafe, backupFile } from '../utils.js';
import { getDefaultConfig, serializeConfig } from '../config.js';

interface InitOptions {
  targetDir?: string;
  skipPrompts?: boolean;
  importFrom?: string;
}

export async function runInit(options: InitOptions = {}): Promise<void> {
  const baseDir = options.targetDir ?? getClaudeverseDir();
  const claudeMdPath = join(baseDir, 'CLAUDE.md');
  const configPath = join(baseDir, '.claudeverse.yaml');
  const dailyDir = join(baseDir, 'daily');
  const generatedDir = join(baseDir, 'generated');

  ensureDir(baseDir);
  ensureDir(dailyDir);
  ensureDir(generatedDir);

  if (!existsSync(claudeMdPath)) {
    if (options.importFrom && existsSync(options.importFrom)) {
      backupFile(options.importFrom);
      copyFileSync(options.importFrom, claudeMdPath);
      if (!options.skipPrompts) {
        console.log(chalk.green('✓') + ` Imported CLAUDE.md from ${options.importFrom}`);
      }
    } else {
      writeFileSafe(claudeMdPath, getMinimalTemplate());
      if (!options.skipPrompts) {
        console.log(chalk.green('✓') + ' Created CLAUDE.md with starter template');
      }
    }
  } else if (!options.skipPrompts) {
    console.log(chalk.yellow('⚠') + ' CLAUDE.md already exists — skipping');
  }

  if (!existsSync(configPath)) {
    const config = getDefaultConfig();
    writeFileSafe(configPath, serializeConfig(config));
    if (!options.skipPrompts) {
      console.log(chalk.green('✓') + ' Created .claudeverse.yaml with defaults');
    }
  } else if (!options.skipPrompts) {
    console.log(chalk.yellow('⚠') + ' .claudeverse.yaml already exists — skipping');
  }

  if (!options.skipPrompts) {
    console.log('');
    console.log(chalk.bold('Claudeverse initialized at ') + chalk.cyan(baseDir));
    console.log('');
    console.log('Next steps:');
    console.log(`  1. Edit ${chalk.cyan('~/.claudeverse/CLAUDE.md')} with your identity and rules`);
    console.log(`  2. Set ${chalk.cyan('ANTHROPIC_API_KEY')} env var for log summarization`);
    console.log(`  3. Run ${chalk.cyan('claudeverse sync')} to distribute to all ecosystems`);
  }
}

function getMinimalTemplate(): string {
  return `# Your Name — Claude Instructions

## Identity
[Describe who you are and what you do]

## Rules
[Hard rules Claude must always follow]

## Conventions
[Code style, tech stack, patterns]

## Current Focus
[What you're working on right now]

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
`;
}
