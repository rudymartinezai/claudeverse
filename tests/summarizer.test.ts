import { describe, it, expect } from 'vitest';
import { buildSummaryPrompt, formatDailyLogs } from '../src/summarizer.js';

describe('summarizer', () => {
  it('formatDailyLogs concatenates log files with headers', () => {
    const logs = [
      { filename: '2026-04-02.md', content: '- **10:00** — Deployed CRM' },
      { filename: '2026-04-03.md', content: '- **11:00** — Fixed DNS' },
    ];
    const result = formatDailyLogs(logs);
    expect(result).toContain('## 2026-04-02');
    expect(result).toContain('Deployed CRM');
    expect(result).toContain('## 2026-04-03');
    expect(result).toContain('Fixed DNS');
  });

  it('formatDailyLogs returns empty string for no logs', () => {
    const result = formatDailyLogs([]);
    expect(result).toBe('');
  });

  it('buildSummaryPrompt includes max words constraint', () => {
    const prompt = buildSummaryPrompt(500);
    expect(prompt).toContain('500');
    expect(prompt).toContain('second person');
  });
});
