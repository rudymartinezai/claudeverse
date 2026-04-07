import { describe, it, expect } from 'vitest';
import {
  extractUserBlocks,
  extractUnknownUserBlocks,
  wrapAuto,
  wrapUser,
  MARKER_AUTO_START,
  MARKER_AUTO_END,
  MARKER_USER_START,
  MARKER_USER_END,
} from '../src/markers.js';

describe('extractUserBlocks', () => {
  it('parses a single block', () => {
    const content = [
      MARKER_USER_START('custom-rules'),
      '- My rule',
      MARKER_USER_END('custom-rules'),
    ].join('\n');
    const blocks = extractUserBlocks(content);
    expect(blocks.size).toBe(1);
    expect(blocks.get('custom-rules')).toBe('- My rule');
  });

  it('parses multiple blocks', () => {
    const content = [
      MARKER_USER_START('custom-rules'),
      'Rule 1',
      MARKER_USER_END('custom-rules'),
      '',
      MARKER_USER_START('custom-footer'),
      'Footer text',
      MARKER_USER_END('custom-footer'),
    ].join('\n');
    const blocks = extractUserBlocks(content);
    expect(blocks.size).toBe(2);
    expect(blocks.get('custom-rules')).toBe('Rule 1');
    expect(blocks.get('custom-footer')).toBe('Footer text');
  });

  it('ignores unclosed markers', () => {
    const content = [
      MARKER_USER_START('custom-rules'),
      'some content without closing marker',
    ].join('\n');
    const blocks = extractUserBlocks(content);
    expect(blocks.size).toBe(0);
  });

  it('ignores mismatched ids', () => {
    const content = [
      MARKER_USER_START('custom-rules'),
      'content',
      MARKER_USER_END('custom-footer'),
    ].join('\n');
    const blocks = extractUserBlocks(content);
    expect(blocks.size).toBe(0);
  });
});

describe('wrapAuto / wrapUser', () => {
  it('wrapAuto produces expected string', () => {
    const inner = '## Identity\n\nI am a test user.';
    const result = wrapAuto('identity', inner);
    expect(result).toBe(`${MARKER_AUTO_START('identity')}\n${inner}\n${MARKER_AUTO_END('identity')}`);
    expect(result).toContain('claudeverse:auto:start identity');
    expect(result).toContain('claudeverse:auto:end identity');
    expect(result).toContain(inner);
  });

  it('wrapUser produces expected string', () => {
    const inner = '- My rule';
    const result = wrapUser('custom-rules', inner);
    expect(result).toBe(`${MARKER_USER_START('custom-rules')}\n${inner}\n${MARKER_USER_END('custom-rules')}`);
    expect(result).toContain('claudeverse:user:start custom-rules');
    expect(result).toContain('claudeverse:user:end custom-rules');
    expect(result).toContain(inner);
  });
});

describe('extractUnknownUserBlocks', () => {
  it('separates known from unknown ids', () => {
    const known = new Set(['custom-rules', 'custom-routing', 'custom-footer']);
    const content = [
      MARKER_USER_START('custom-rules'),
      'rule content',
      MARKER_USER_END('custom-rules'),
      '',
      MARKER_USER_START('my-custom-block'),
      'my custom content',
      MARKER_USER_END('my-custom-block'),
    ].join('\n');
    const unknown = extractUnknownUserBlocks(content, known);
    expect(unknown).toHaveLength(1);
    expect(unknown[0].id).toBe('my-custom-block');
    expect(unknown[0].body).toBe('my custom content');
  });

  it('returns empty array when all blocks are known', () => {
    const known = new Set(['custom-rules', 'custom-routing', 'custom-footer']);
    const content = [
      MARKER_USER_START('custom-rules'),
      'rule content',
      MARKER_USER_END('custom-rules'),
    ].join('\n');
    const unknown = extractUnknownUserBlocks(content, known);
    expect(unknown).toHaveLength(0);
  });
});

describe('round-trip', () => {
  it('parse → wrap → parse returns same content', () => {
    const originalContent = '- My custom rule\n- Another rule';
    const wrapped = wrapUser('custom-rules', originalContent);
    const parsed = extractUserBlocks(wrapped);
    expect(parsed.get('custom-rules')).toBe(originalContent);
  });

  it('is stable across multiple round-trips', () => {
    const originalContent = 'some user content';
    let current = wrapUser('custom-footer', originalContent);
    for (let i = 0; i < 3; i++) {
      const parsed = extractUserBlocks(current);
      const body = parsed.get('custom-footer') ?? '';
      current = wrapUser('custom-footer', body);
    }
    expect(extractUserBlocks(current).get('custom-footer')).toBe(originalContent);
  });
});
