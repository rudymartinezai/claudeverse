import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, rmSync, readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { runLog } from '../../src/commands/log.js';
import { getTodayFilename } from '../../src/utils.js';

const TEST_DIR = join(process.cwd(), '.test-claudeverse-log');

describe('log command', () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
    mkdirSync(join(TEST_DIR, 'daily'), { recursive: true });
  });
  afterEach(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
  });

  it('creates daily log file if not exists', async () => {
    await runLog({ message: 'Test entry', baseDir: TEST_DIR, quiet: true });
    const logPath = join(TEST_DIR, 'daily', getTodayFilename());
    expect(existsSync(logPath)).toBe(true);
  });

  it('writes message with timestamp', async () => {
    await runLog({ message: 'Deployed CRM', baseDir: TEST_DIR, quiet: true });
    const logPath = join(TEST_DIR, 'daily', getTodayFilename());
    const content = readFileSync(logPath, 'utf-8');
    expect(content).toContain('Deployed CRM');
    expect(content).toMatch(/\*\*\d{2}:\d{2}\*\*/);
  });

  it('appends to existing log file', async () => {
    await runLog({ message: 'First entry', baseDir: TEST_DIR, quiet: true });
    await runLog({ message: 'Second entry', baseDir: TEST_DIR, quiet: true });
    const logPath = join(TEST_DIR, 'daily', getTodayFilename());
    const content = readFileSync(logPath, 'utf-8');
    expect(content).toContain('First entry');
    expect(content).toContain('Second entry');
  });

  it('includes header on new file', async () => {
    await runLog({ message: 'Test', baseDir: TEST_DIR, quiet: true });
    const logPath = join(TEST_DIR, 'daily', getTodayFilename());
    const content = readFileSync(logPath, 'utf-8');
    expect(content).toContain('# Daily Log');
  });
});
