import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { getStatusInfo } from '../../src/commands/status.js';

const TEST_DIR = join(process.cwd(), '.test-claudeverse-status');

describe('status command', () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
    mkdirSync(join(TEST_DIR, 'daily'), { recursive: true });
    mkdirSync(join(TEST_DIR, 'generated', 'eco-a'), { recursive: true });
    writeFileSync(join(TEST_DIR, 'CLAUDE.md'), '# Test');
    writeFileSync(join(TEST_DIR, '.claudeverse.yaml'), 'anthropic_api_key_env: TEST_KEY');
  });
  afterEach(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
  });

  it('detects source CLAUDE.md exists', () => {
    const info = getStatusInfo(TEST_DIR);
    expect(info.sourceExists).toBe(true);
  });

  it('detects config exists', () => {
    const info = getStatusInfo(TEST_DIR);
    expect(info.configExists).toBe(true);
  });

  it('counts daily logs', () => {
    writeFileSync(join(TEST_DIR, 'daily', '2026-04-02.md'), 'log1');
    writeFileSync(join(TEST_DIR, 'daily', '2026-04-03.md'), 'log2');
    const info = getStatusInfo(TEST_DIR);
    expect(info.dailyLogCount).toBe(2);
  });

  it('detects Eco A sync state', () => {
    writeFileSync(join(TEST_DIR, 'generated', 'eco-a', 'CLAUDE.md'), 'synced');
    const info = getStatusInfo(TEST_DIR);
    expect(info.ecoASynced).toBe(true);
  });

  it('detects missing Eco A sync', () => {
    const info = getStatusInfo(TEST_DIR);
    expect(info.ecoASynced).toBe(false);
  });
});
