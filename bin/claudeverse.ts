#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Command } from 'commander';
import { runInit } from '../src/commands/init.js';
import { runSync } from '../src/commands/sync.js';
import { runLog } from '../src/commands/log.js';
import { runStatus } from '../src/commands/status.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgPath = join(__dirname, '..', '..', 'package.json');
const { version } = JSON.parse(readFileSync(pkgPath, 'utf-8'));

const program = new Command();

program
  .name('claudeverse')
  .description('One config. Every Claude interface. Connected.')
  .version(version);

program
  .command('init')
  .description('Initialize ~/.claudeverse/ with starter config')
  .option('--import <path>', 'Import an existing CLAUDE.md file')
  .action(async (opts) => {
    await runInit({ importFrom: opts.import });
  });

program
  .command('sync')
  .description('Compile and distribute config to all Claude ecosystems')
  .action(async () => {
    await runSync();
  });

program
  .command('log [message...]')
  .description("Append an entry to today's daily log")
  .action(async (messageParts: string[]) => {
    const message = messageParts.length > 0 ? messageParts.join(' ') : undefined;
    await runLog({ message });
  });

program
  .command('status')
  .description('Show current sync state across ecosystems')
  .action(() => {
    runStatus();
  });

program.parse();
