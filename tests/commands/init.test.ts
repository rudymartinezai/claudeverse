import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runInit } from '../../src/commands/init.js';

const TEST_DIR = join(process.cwd(), '.test-claudeverse');

describe('init command', () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
  });
  afterEach(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
  });

  it('creates directory structure', async () => {
    await runInit({ targetDir: TEST_DIR, skipPrompts: true });
    expect(existsSync(TEST_DIR)).toBe(true);
    expect(existsSync(join(TEST_DIR, 'CLAUDE.md'))).toBe(true);
    expect(existsSync(join(TEST_DIR, '.claudeverse.yaml'))).toBe(true);
    expect(existsSync(join(TEST_DIR, 'daily'))).toBe(true);
    expect(existsSync(join(TEST_DIR, 'generated'))).toBe(true);
  });

  it('CLAUDE.md contains Tool Routing section', async () => {
    await runInit({ targetDir: TEST_DIR, skipPrompts: true });
    const content = readFileSync(join(TEST_DIR, 'CLAUDE.md'), 'utf-8');
    expect(content).toContain('## Tool Routing');
    expect(content).toContain('Claudeverse');
  });

  it('config file has valid defaults', async () => {
    await runInit({ targetDir: TEST_DIR, skipPrompts: true });
    const content = readFileSync(join(TEST_DIR, '.claudeverse.yaml'), 'utf-8');
    expect(content).toContain('anthropic_api_key_env');
    expect(content).toContain('eco_a');
    expect(content).toContain('eco_b');
  });

  it('does not overwrite existing CLAUDE.md', async () => {
    await runInit({ targetDir: TEST_DIR, skipPrompts: true });
    const original = readFileSync(join(TEST_DIR, 'CLAUDE.md'), 'utf-8');
    await runInit({ targetDir: TEST_DIR, skipPrompts: true });
    const after = readFileSync(join(TEST_DIR, 'CLAUDE.md'), 'utf-8');
    expect(after).toBe(original);
  });
});
