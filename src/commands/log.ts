import { join } from 'node:path';
import { existsSync, appendFileSync, writeFileSync } from 'node:fs';
import chalk from 'chalk';
import { getClaudeverseDir, getTodayFilename, formatTimestamp, ensureDir } from '../utils.js';

interface LogOptions {
  message?: string;
  baseDir?: string;
  quiet?: boolean;
}

export async function runLog(options: LogOptions = {}): Promise<void> {
  const baseDir = options.baseDir ?? getClaudeverseDir();
  const dailyDir = join(baseDir, 'daily');
  ensureDir(dailyDir);

  const filename = getTodayFilename();
  const logPath = join(dailyDir, filename);
  const timestamp = formatTimestamp();
  const date = filename.replace('.md', '');

  if (!options.message) {
    if (!options.quiet) {
      console.log(chalk.yellow('No message provided.'));
      console.log('Usage: claudeverse log "your message here"');
    }
    return;
  }

  // Sanitize: strip newlines to prevent prompt injection via log entries
  const MAX_LOG_MSG = 500;
  let sanitized = options.message.replace(/[\r\n]+/g, ' ').trim();
  if (sanitized.length > MAX_LOG_MSG) {
    sanitized = sanitized.slice(0, MAX_LOG_MSG);
    if (!options.quiet) {
      console.log(chalk.yellow('\u26a0') + ` Message truncated to ${MAX_LOG_MSG} chars`);
    }
  }

  const entry = `- **${timestamp}** — ${sanitized}`;

  if (!existsSync(logPath)) {
    const header = `# Daily Log — ${date}\n\n`;
    writeFileSync(logPath, header + entry + '\n', 'utf-8');
  } else {
    appendFileSync(logPath, entry + '\n', 'utf-8');
  }

  if (!options.quiet) {
    console.log(chalk.green('\u2713') + ` Logged to ${filename}: ${options.message}`);
  }
}
