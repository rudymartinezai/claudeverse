import { join } from 'node:path';
import { existsSync, readdirSync, statSync } from 'node:fs';
import chalk from 'chalk';
import { getClaudeverseDir } from '../utils.js';

export interface StatusInfo {
  sourceExists: boolean;
  configExists: boolean;
  dailyLogCount: number;
  dailyLogRange: { oldest: string; newest: string } | null;
  ecoASynced: boolean;
  ecoALastSync: Date | null;
  ecoBSynced: boolean;
  ecoBLastSync: Date | null;
}

export function getStatusInfo(baseDir: string): StatusInfo {
  const dailyDir = join(baseDir, 'daily');
  const generatedDir = join(baseDir, 'generated');

  let dailyLogCount = 0;
  let dailyLogRange: { oldest: string; newest: string } | null = null;
  if (existsSync(dailyDir)) {
    const files = readdirSync(dailyDir).filter(f => f.endsWith('.md')).sort();
    dailyLogCount = files.length;
    if (files.length > 0) {
      dailyLogRange = {
        oldest: files[0].replace('.md', ''),
        newest: files[files.length - 1].replace('.md', ''),
      };
    }
  }

  const ecoAPath = join(generatedDir, 'eco-a', 'CLAUDE.md');
  const ecoASynced = existsSync(ecoAPath);
  const ecoALastSync = ecoASynced ? statSync(ecoAPath).mtime : null;

  const ecoBPath = join(generatedDir, 'eco-b.md');
  const ecoBSynced = existsSync(ecoBPath);
  const ecoBLastSync = ecoBSynced ? statSync(ecoBPath).mtime : null;

  return {
    sourceExists: existsSync(join(baseDir, 'CLAUDE.md')),
    configExists: existsSync(join(baseDir, '.claudeverse.yaml')),
    dailyLogCount,
    dailyLogRange,
    ecoASynced,
    ecoALastSync,
    ecoBSynced,
    ecoBLastSync,
  };
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function runStatus(options: { baseDir?: string } = {}): void {
  const baseDir = options.baseDir ?? getClaudeverseDir();
  const info = getStatusInfo(baseDir);

  console.log('');
  console.log(chalk.bold('Claudeverse Status'));
  console.log('\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');

  if (info.sourceExists) {
    console.log(`Source:     ${chalk.green('\u2713')} ~/.claudeverse/CLAUDE.md`);
  } else {
    console.log(`Source:     ${chalk.red('\u2717')} CLAUDE.md not found \u2014 run ${chalk.cyan('claudeverse init')}`);
  }

  if (info.configExists) {
    console.log(`Config:     ${chalk.green('\u2713')} .claudeverse.yaml`);
  } else {
    console.log(`Config:     ${chalk.red('\u2717')} .claudeverse.yaml not found`);
  }

  if (info.dailyLogCount > 0 && info.dailyLogRange) {
    console.log(`Daily logs: ${info.dailyLogCount} files (${info.dailyLogRange.oldest} \u2192 ${info.dailyLogRange.newest})`);
  } else {
    console.log(`Daily logs: ${chalk.dim('none')}`);
  }

  console.log('');
  console.log(chalk.bold('Eco A (CLI/Desktop/IDE):'));
  if (info.ecoASynced && info.ecoALastSync) {
    console.log(`  ${chalk.green('\u2713')} CLAUDE.md \u2014 synced ${timeAgo(info.ecoALastSync)}`);
  } else {
    console.log(`  ${chalk.dim('\u25CB')} Not synced \u2014 run ${chalk.cyan('claudeverse sync')}`);
  }

  console.log(chalk.bold('Eco B (Chat/Cowork/Mobile):'));
  if (info.ecoBSynced && info.ecoBLastSync) {
    console.log(`  ${chalk.green('\u2713')} Project instructions \u2014 generated ${timeAgo(info.ecoBLastSync)}`);
  } else {
    console.log(`  ${chalk.dim('\u25CB')} Not synced \u2014 run ${chalk.cyan('claudeverse sync')}`);
  }

  console.log(chalk.bold('Eco C (Chrome Extension):'));
  console.log(`  ${chalk.dim('\u25CB')} Not enabled`);
  console.log('');
}
