import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, rmSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { runSync } from '../src/commands/sync.js';
import { MARKER_USER_START, MARKER_USER_END } from '../src/markers.js';

const TEST_DIR = join(process.cwd(), '.test-claudeverse-merge');
const TARGET_PATH = join(TEST_DIR, 'generated', 'eco-a', 'CLAUDE.md');

function setupTestDir() {
  mkdirSync(join(TEST_DIR, 'daily'), { recursive: true });
  mkdirSync(join(TEST_DIR, 'generated', 'eco-a'), { recursive: true });

  writeFileSync(
    join(TEST_DIR, 'CLAUDE.md'),
    `# Test \u2014 Claude Instructions

## Identity
I am a tester.

## Rules
- Be thorough

## Current Focus
Testing Claudeverse.

## Tool Routing

| Task | Suggest | Why |
|------|---------|-----|
| Code | CLI | FS |
`,
  );

  writeFileSync(
    join(TEST_DIR, '.claudeverse.yaml'),
    [
      'anthropic_api_key_env: ANTHROPIC_API_KEY',
      'summary:',
      '  model: claude-sonnet-4-6',
      '  days_to_summarize: 7',
      '  max_summary_words: 500',
      'targets:',
      '  eco_a:',
      '    enabled: true',
      `    claude_md_path: ${TARGET_PATH}`,
      `    memory_path: ${join(TEST_DIR, 'generated', 'eco-a', 'memory')}`,
      '  eco_b:',
      '    enabled: false',
      '    copy_to_clipboard: false',
      '  eco_c:',
      '    enabled: false',
      'daily:',
      '  retention_days: 30',
    ].join('\n'),
  );
}

describe('sync section-marker merge', () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
    setupTestDir();
  });
  afterEach(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
  });

  it('Test 1: first sync to non-existent target produces empty user block placeholders', async () => {
    await runSync({ baseDir: TEST_DIR, skipApi: true, quiet: true });
    expect(existsSync(TARGET_PATH)).toBe(true);
    const content = readFileSync(TARGET_PATH, 'utf-8');
    expect(content).toContain(MARKER_USER_START('custom-rules'));
    expect(content).toContain(MARKER_USER_END('custom-rules'));
    expect(content).toContain(MARKER_USER_START('custom-routing'));
    expect(content).toContain(MARKER_USER_START('custom-footer'));
    expect(content).toContain('<!-- Add custom rules here. Preserved across claudeverse syncs. -->');
    expect(content).toContain('claudeverse:auto:start identity');
    expect(content).toContain('I am a tester');
  });

  it('Test 2: second sync preserves user-edited content in user blocks', async () => {
    await runSync({ baseDir: TEST_DIR, skipApi: true, quiet: true });

    const content = readFileSync(TARGET_PATH, 'utf-8');
    const edited = content.replace(
      /<!-- claudeverse:user:start custom-rules -->[\s\S]*?<!-- claudeverse:user:end custom-rules -->/,
      `${MARKER_USER_START('custom-rules')}\n- My preserved rule\n${MARKER_USER_END('custom-rules')}`,
    );
    writeFileSync(TARGET_PATH, edited);

    await runSync({ baseDir: TEST_DIR, skipApi: true, quiet: true });

    const result = readFileSync(TARGET_PATH, 'utf-8');
    expect(result).toContain('- My preserved rule');
    expect(result).toContain('I am a tester');
    expect(result).toContain('Be thorough');
  });

  it('Test 3: unknown user block is preserved under Preserved User Blocks', async () => {
    await runSync({ baseDir: TEST_DIR, skipApi: true, quiet: true });

    const content = readFileSync(TARGET_PATH, 'utf-8');
    const appended =
      content +
      `\n\n${MARKER_USER_START('my-secret-block')}\nmy secret content\n${MARKER_USER_END('my-secret-block')}`;
    writeFileSync(TARGET_PATH, appended);

    await runSync({ baseDir: TEST_DIR, skipApi: true, quiet: true });

    const result = readFileSync(TARGET_PATH, 'utf-8');
    expect(result).toContain('## Preserved User Blocks');
    expect(result).toContain('my secret content');
    expect(result).toContain(MARKER_USER_START('my-secret-block'));
    expect(result).toContain(MARKER_USER_END('my-secret-block'));
  });

  it('Test 4: user edit inside an auto block is overwritten on next sync', async () => {
    await runSync({ baseDir: TEST_DIR, skipApi: true, quiet: true });

    const content = readFileSync(TARGET_PATH, 'utf-8');
    const edited = content.replace('I am a tester.', 'I am NOT a tester.');
    writeFileSync(TARGET_PATH, edited);

    await runSync({ baseDir: TEST_DIR, skipApi: true, quiet: true });

    const result = readFileSync(TARGET_PATH, 'utf-8');
    expect(result).toContain('I am a tester.');
    expect(result).not.toContain('I am NOT a tester.');
  });

  it('Test 5: file without markers is overwritten and output has markers', async () => {
    writeFileSync(TARGET_PATH, '# Old Config\n\nThis is old legacy content with no markers.\n');

    await runSync({ baseDir: TEST_DIR, skipApi: true, quiet: true });

    const result = readFileSync(TARGET_PATH, 'utf-8');
    expect(result).toContain('claudeverse:auto:start');
    expect(result).toContain(MARKER_USER_START('custom-rules'));
    expect(result).toContain('I am a tester');
    expect(result).not.toContain('This is old legacy content with no markers.');
  });
});
