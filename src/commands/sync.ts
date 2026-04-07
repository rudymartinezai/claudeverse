import { join, resolve } from 'node:path';
import { readdirSync, readFileSync, existsSync, copyFileSync } from 'node:fs';
import { homedir } from 'node:os';
import chalk from 'chalk';
import ora from 'ora';
import { getClaudeverseDir, ensureDir, writeFileSafe, readFileSafe, backupFile } from '../utils.js';
import { parseConfig } from '../config.js';
import { parseSections, KNOWN_USER_SLOTS } from '../parser.js';
import { summarizeLogs, DailyLog } from '../summarizer.js';
import { generateEcoA } from '../generators/eco-a.js';
import { generateEcoB } from '../generators/eco-b.js';
import { extractUserBlocks, extractUnknownUserBlocks } from '../markers.js';

interface SyncOptions {
  baseDir?: string;
  skipApi?: boolean;
  quiet?: boolean;
}

function resolvePath(p: string, label: string): string {
  const home = homedir();
  const resolved = p.startsWith('~/') ? join(home, p.slice(2)) : resolve(p);
  if (resolved.includes('..')) {
    throw new Error(`Config error: ${label} contains path traversal sequence: ${resolved}`);
  }
  if (!resolved.startsWith(home + '/') && resolved !== home) {
    throw new Error(`Config error: ${label} resolves outside home directory: ${resolved}`);
  }
  return resolved;
}

function loadDailyLogs(dailyDir: string, daysBack: number): DailyLog[] {
  if (!existsSync(dailyDir)) return [];
  const files = readdirSync(dailyDir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysBack);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const recent = files.filter(f => {
    const date = f.replace('.md', '');
    return date >= cutoffStr;
  });
  return recent.map(f => ({
    filename: f,
    content: readFileSync(join(dailyDir, f), 'utf-8'),
  }));
}

export async function runSync(options: SyncOptions = {}): Promise<void> {
  const baseDir = options.baseDir ?? getClaudeverseDir();
  const configPath = join(baseDir, '.claudeverse.yaml');
  const sourcePath = join(baseDir, 'CLAUDE.md');
  const dailyDir = join(baseDir, 'daily');
  const generatedDir = join(baseDir, 'generated');

  const configContent = readFileSafe(configPath);
  if (!configContent) {
    if (!options.quiet) console.log(chalk.red('\u2717') + ' No .claudeverse.yaml found. Run `claudeverse init` first.');
    return;
  }
  const config = parseConfig(configContent);

  const sourceContent = readFileSafe(sourcePath);
  if (!sourceContent) {
    if (!options.quiet) console.log(chalk.red('\u2717') + ' No CLAUDE.md found. Run `claudeverse init` first.');
    return;
  }
  const sections = parseSections(sourceContent);

  const logs = loadDailyLogs(dailyDir, config.summary.days_to_summarize);

  let summary: string | null = null;
  if (logs.length > 0 && !options.skipApi) {
    if (!/^[A-Z_][A-Z0-9_]*$/.test(config.anthropic_api_key_env)) {
        if (!options.quiet) console.log(chalk.red('\u2717') + ' Invalid anthropic_api_key_env value in config');
        return;
      }
      const apiKey = process.env[config.anthropic_api_key_env];
    if (!apiKey) {
      if (!options.quiet) console.log(chalk.yellow('\u26a0') + ` ${config.anthropic_api_key_env} not set — skipping log summarization`);
    } else {
      const spinner = options.quiet ? null : ora('Summarizing daily logs...').start();
      try {
        summary = await summarizeLogs(logs, apiKey, config.summary.model, config.summary.max_summary_words);
        spinner?.succeed('Daily logs summarized');
      } catch (err) {
        spinner?.fail('Failed to summarize logs');
        if (!options.quiet) console.log(chalk.red(`  ${err}`));
      }
    }
  }

  if (config.targets.eco_a.enabled) {
    const ecoADir = join(generatedDir, 'eco-a');
    ensureDir(ecoADir);

    const targetPath = resolvePath(config.targets.eco_a.claude_md_path, 'eco_a.claude_md_path');

    // Extract existing user blocks from the live target for preservation across syncs
    let existingUserBlocks: Map<string, string> | undefined;
    let unknownBlocks: Array<{ id: string; body: string }> | undefined;
    const existingRaw = existsSync(targetPath) ? readFileSync(targetPath, 'utf-8') : null;
    if (existingRaw) {
      existingUserBlocks = extractUserBlocks(existingRaw);
      unknownBlocks = extractUnknownUserBlocks(existingRaw, KNOWN_USER_SLOTS);
    }

    const ecoAContent = generateEcoA(sections, summary, existingUserBlocks, unknownBlocks);
    writeFileSafe(join(ecoADir, 'CLAUDE.md'), ecoAContent);

    if (targetPath !== join(ecoADir, 'CLAUDE.md')) {
      ensureDir(join(targetPath, '..'));
      const backupPath = backupFile(targetPath);
      copyFileSync(join(ecoADir, 'CLAUDE.md'), targetPath);
      if (backupPath && !options.quiet) {
        console.log(chalk.dim(`  Backed up previous \u2192 ${backupPath}`));
      }
    }
    if (!options.quiet) {
      console.log(chalk.green('\u2713') + ` Eco A: ${targetPath}`);
    }
  }

  if (config.targets.eco_b.enabled) {
    const ecoBContent = generateEcoB(sections, summary);
    writeFileSafe(join(generatedDir, 'eco-b.md'), ecoBContent);

    if (config.targets.eco_b.copy_to_clipboard && !options.quiet) {
      try {
        const { default: clipboardy } = await import('clipboardy');
        await clipboardy.write(ecoBContent);
        console.log(chalk.green('\u2713') + ' Eco B: Copied to clipboard \u2014 paste into Claude.ai Project instructions');
      } catch {
        console.log(chalk.yellow('\u26a0') + ` Eco B: ${join(generatedDir, 'eco-b.md')}`);
        console.log(chalk.yellow('  Could not copy to clipboard \u2014 copy manually from the file above'));
      }
    } else if (!options.quiet) {
      console.log(chalk.green('\u2713') + ` Eco B: ${join(generatedDir, 'eco-b.md')}`);
    }
  }

  if (!options.quiet) {
    console.log('');
    console.log(chalk.bold('Sync complete.'));
    if (logs.length > 0) {
      console.log(`  ${logs.length} daily log(s) processed (${logs[logs.length - 1].filename.replace('.md', '')} \u2192 ${logs[0].filename.replace('.md', '')})`);
    } else {
      console.log('  No daily logs found \u2014 identity-only sync');
    }
  }
}
