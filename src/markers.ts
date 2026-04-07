export const MARKER_AUTO_START = (id: string): string => `<!-- claudeverse:auto:start ${id} -->`;
export const MARKER_AUTO_END = (id: string): string => `<!-- claudeverse:auto:end ${id} -->`;
export const MARKER_USER_START = (id: string): string => `<!-- claudeverse:user:start ${id} -->`;
export const MARKER_USER_END = (id: string): string => `<!-- claudeverse:user:end ${id} -->`;

const USER_PATTERN = '<!-- claudeverse:user:start (\\w[\\w-]*) -->([\\s\\S]*?)<!-- claudeverse:user:end \\1 -->';

export function extractUserBlocks(content: string): Map<string, string> {
  const map = new Map<string, string>();
  const regex = new RegExp(USER_PATTERN, 'g');
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    map.set(match[1], match[2].trim());
  }
  return map;
}

export function wrapAuto(id: string, content: string): string {
  return `${MARKER_AUTO_START(id)}\n${content}\n${MARKER_AUTO_END(id)}`;
}

export function wrapUser(id: string, content: string): string {
  return `${MARKER_USER_START(id)}\n${content}\n${MARKER_USER_END(id)}`;
}

export function extractUnknownUserBlocks(content: string, knownIds: Set<string>): Array<{ id: string; body: string }> {
  const result: Array<{ id: string; body: string }> = [];
  const regex = new RegExp(USER_PATTERN, 'g');
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const id = match[1];
    if (!knownIds.has(id)) {
      result.push({ id, body: match[2].trim() });
    }
  }
  return result;
}
