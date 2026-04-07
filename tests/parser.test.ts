import { describe, it, expect } from 'vitest';
import { parseSections, Section } from '../src/parser.js';

const SAMPLE_MD = `# Claude Instructions

## Identity
Software engineer. Building side projects.

## Rules
- Never modify production without asking
- No unnecessary abstractions

## Conventions
TypeScript for new projects.
Conventional commits for git.

## Current Focus
Working on the API layer and the CLI tool.

## Tool Routing

| If the user asks to... | Suggest | Why |
|------------------------|---------|-----|
| Build a feature | CLI | Filesystem |

## My Custom Section
Some custom content here.
`;

describe('parseSections', () => {
  it('extracts all sections from markdown', () => {
    const sections = parseSections(SAMPLE_MD);
    expect(sections.length).toBe(7);
  });
  it('parses title correctly', () => {
    const sections = parseSections(SAMPLE_MD);
    expect(sections[0].heading).toBe('Claude Instructions');
    expect(sections[0].level).toBe(1);
  });
  it('parses Identity section', () => {
    const sections = parseSections(SAMPLE_MD);
    const identity = sections.find(s => s.heading === 'Identity');
    expect(identity).toBeDefined();
    expect(identity!.body).toContain('Software engineer');
  });
  it('parses Rules section', () => {
    const sections = parseSections(SAMPLE_MD);
    const rules = sections.find(s => s.heading === 'Rules');
    expect(rules).toBeDefined();
    expect(rules!.body).toContain('Never modify production');
  });
  it('identifies known section types', () => {
    const sections = parseSections(SAMPLE_MD);
    const identity = sections.find(s => s.heading === 'Identity');
    const custom = sections.find(s => s.heading === 'My Custom Section');
    expect(identity!.type).toBe('identity');
    expect(custom!.type).toBe('custom');
  });
  it('preserves Tool Routing table', () => {
    const sections = parseSections(SAMPLE_MD);
    const routing = sections.find(s => s.heading === 'Tool Routing');
    expect(routing).toBeDefined();
    expect(routing!.type).toBe('routing');
    expect(routing!.body).toContain('Build a feature');
  });
});
