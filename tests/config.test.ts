import { describe, it, expect } from 'vitest';
import { parseConfig, getDefaultConfig, ClaudeverseConfig } from '../src/config.js';

describe('config', () => {
  it('getDefaultConfig returns valid defaults', () => {
    const config = getDefaultConfig();
    expect(config.summary.model).toBe('claude-sonnet-4-6');
    expect(config.summary.days_to_summarize).toBe(7);
    expect(config.summary.max_summary_words).toBe(500);
    expect(config.targets.eco_a.enabled).toBe(true);
    expect(config.targets.eco_b.enabled).toBe(true);
    expect(config.targets.eco_c.enabled).toBe(false);
    expect(config.daily.retention_days).toBe(30);
  });

  it('parseConfig parses valid YAML', () => {
    const yaml = `
anthropic_api_key_env: MY_KEY
summary:
  model: claude-haiku-4-5
  days_to_summarize: 3
  max_summary_words: 300
targets:
  eco_a:
    enabled: true
    claude_md_path: ~/.claude/CLAUDE.md
    memory_path: ~/.claude/projects/-/memory/
  eco_b:
    enabled: false
    copy_to_clipboard: false
  eco_c:
    enabled: false
daily:
  retention_days: 14
`;
    const config = parseConfig(yaml);
    expect(config.anthropic_api_key_env).toBe('MY_KEY');
    expect(config.summary.model).toBe('claude-haiku-4-5');
    expect(config.summary.days_to_summarize).toBe(3);
    expect(config.targets.eco_b.enabled).toBe(false);
    expect(config.daily.retention_days).toBe(14);
  });

  it('parseConfig merges with defaults for missing fields', () => {
    const yaml = `
anthropic_api_key_env: MY_KEY
`;
    const config = parseConfig(yaml);
    expect(config.anthropic_api_key_env).toBe('MY_KEY');
    expect(config.summary.model).toBe('claude-sonnet-4-6');
    expect(config.targets.eco_a.enabled).toBe(true);
  });
});
