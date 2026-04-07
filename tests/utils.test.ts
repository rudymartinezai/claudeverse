import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, rmSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { getClaudeverseDir, getTodayFilename, formatTimestamp, backupFile } from '../src/utils.js';

const TEST_BACKUP_DIR = join(process.cwd(), '.test-backup');

describe('utils', () => {
  it('getClaudeverseDir returns ~/.claudeverse', () => {
    const dir = getClaudeverseDir();
    expect(dir).toMatch(/\.claudeverse$/);
    expect(dir).toContain(process.env.HOME || '');
  });

  it('getTodayFilename returns YYYY-MM-DD.md', () => {
    const filename = getTodayFilename();
    expect(filename).toMatch(/^\d{4}-\d{2}-\d{2}\.md$/);
  });

  it('formatTimestamp returns HH:MM', () => {
    const ts = formatTimestamp();
    expect(ts).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe('backupFile', () => {
  beforeEach(() => {
    if (existsSync(TEST_BACKUP_DIR)) rmSync(TEST_BACKUP_DIR, { recursive: true });
    mkdirSync(TEST_BACKUP_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_BACKUP_DIR)) rmSync(TEST_BACKUP_DIR, { recursive: true });
  });

  it('returns null if source file does not exist', () => {
    const result = backupFile(join(TEST_BACKUP_DIR, 'nonexistent.md'));
    expect(result).toBeNull();
  });

  it('creates .pre-claudeverse on first backup', () => {
    const filePath = join(TEST_BACKUP_DIR, 'CLAUDE.md');
    writeFileSync(filePath, 'original content');
    const result = backupFile(filePath);
    expect(result).toBe(filePath + '.pre-claudeverse');
    expect(readFileSync(result!, 'utf-8')).toBe('original content');
  });

  it('creates .bak on subsequent backups', () => {
    const filePath = join(TEST_BACKUP_DIR, 'CLAUDE.md');
    writeFileSync(filePath, 'original content');
    backupFile(filePath);
    writeFileSync(filePath, 'modified content');
    const result = backupFile(filePath);
    expect(result).toBe(filePath + '.bak');
    expect(readFileSync(result!, 'utf-8')).toBe('modified content');
    expect(readFileSync(filePath + '.pre-claudeverse', 'utf-8')).toBe('original content');
  });
});
