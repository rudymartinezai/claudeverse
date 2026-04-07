export type SectionType = 'title' | 'identity' | 'rules' | 'conventions' | 'focus' | 'routing' | 'custom';

export interface Section {
  heading: string;
  level: number;
  type: SectionType;
  body: string;
}

const KNOWN_SECTIONS: Record<string, SectionType> = {
  'identity': 'identity',
  'rules': 'rules',
  'conventions': 'conventions',
  'current focus': 'focus',
  'tool routing': 'routing',
};

function classifySection(heading: string, level: number): SectionType {
  if (level === 1) return 'title';
  const key = heading.toLowerCase();
  return KNOWN_SECTIONS[key] ?? 'custom';
}

export function parseSections(markdown: string): Section[] {
  const lines = markdown.split('\n');
  const sections: Section[] = [];
  let currentHeading = '';
  let currentLevel = 0;
  let currentBody: string[] = [];

  function flush() {
    if (currentHeading || currentBody.length > 0) {
      sections.push({
        heading: currentHeading,
        level: currentLevel,
        type: classifySection(currentHeading, currentLevel),
        body: currentBody.join('\n').trim(),
      });
    }
  }

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flush();
      currentLevel = headingMatch[1].length;
      currentHeading = headingMatch[2].trim();
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }
  flush();
  return sections;
}

export const KNOWN_USER_SLOTS = new Set(['custom-rules', 'custom-routing', 'custom-footer']);

export function getSectionByType(sections: Section[], type: SectionType): Section | undefined {
  return sections.find(s => s.type === type);
}

export function getSectionsByType(sections: Section[], type: SectionType): Section[] {
  return sections.filter(s => s.type === type);
}

export function sectionsToMarkdown(sections: Section[]): string {
  return sections
    .map(s => {
      const prefix = '#'.repeat(s.level);
      const heading = `${prefix} ${s.heading}`;
      return s.body ? `${heading}\n\n${s.body}` : heading;
    })
    .join('\n\n');
}
