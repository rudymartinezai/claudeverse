import { homedir } from 'node:os';
import { join } from 'node:path';
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';

export function getClaudeverseDir(): string {
  return join(homedir(), '.claudeverse');
}

export function getGeneratedDir(): string {
  return join(getClaudeverseDir(), 'generated');
}

export function getDailyDir(): string {
  return join(getClaudeverseDir(), 'daily');
}

export function getSourceClaudeMd(): string {
  return join(getClaudeverseDir(), 'CLAUDE.md');
}

export function getConfigPath(): string {
  return join(getClaudeverseDir(), '.claudeverse.yaml');
}

export function getTodayFilename(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}.md`;
}

export function formatTimestamp(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

export function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true, mode: 0o700 });
  }
}

export function readFileSafe(path: string): string | null {
  try {
    return readFileSync(path, 'utf-8');
  } catch {
    return null;
  }
}

export function writeFileSafe(path: string, content: string): void {
  ensureDir(join(path, '..'));
  writeFileSync(path, content, { encoding: 'utf-8', mode: 0o600 });
}

export function backupFile(filePath: string): string | null {
  if (!existsSync(filePath)) return null;

  const preBackup = filePath + '.pre-claudeverse';
  const bakBackup = filePath + '.bak';

  if (!existsSync(preBackup)) {
    copyFileSync(filePath, preBackup);
    return preBackup;
  } else {
    copyFileSync(filePath, bakBackup);
    return bakBackup;
  }
}
