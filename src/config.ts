import yaml from 'js-yaml';

export interface ClaudeverseConfig {
  anthropic_api_key_env: string;
  summary: {
    model: string;
    days_to_summarize: number;
    max_summary_words: number;
  };
  targets: {
    eco_a: {
      enabled: boolean;
      claude_md_path: string;
      memory_path: string;
    };
    eco_b: {
      enabled: boolean;
      copy_to_clipboard: boolean;
    };
    eco_c: {
      enabled: boolean;
    };
  };
  daily: {
    retention_days: number;
  };
}

export function getDefaultConfig(): ClaudeverseConfig {
  return {
    anthropic_api_key_env: 'ANTHROPIC_API_KEY',
    summary: {
      model: 'claude-sonnet-4-6',
      days_to_summarize: 7,
      max_summary_words: 500,
    },
    targets: {
      eco_a: {
        enabled: true,
        claude_md_path: '~/.claude/CLAUDE.md',
        memory_path: '~/.claude/projects/-/memory/',
      },
      eco_b: {
        enabled: true,
        copy_to_clipboard: false,
      },
      eco_c: {
        enabled: false,
      },
    },
    daily: {
      retention_days: 30,
    },
  };
}

export function parseConfig(yamlContent: string): ClaudeverseConfig {
  const parsed = yaml.load(yamlContent, { schema: yaml.CORE_SCHEMA }) as Partial<ClaudeverseConfig> | null;
  const defaults = getDefaultConfig();
  if (!parsed) return defaults;
  return {
    anthropic_api_key_env: parsed.anthropic_api_key_env ?? defaults.anthropic_api_key_env,
    summary: {
      model: parsed.summary?.model ?? defaults.summary.model,
      days_to_summarize: parsed.summary?.days_to_summarize ?? defaults.summary.days_to_summarize,
      max_summary_words: parsed.summary?.max_summary_words ?? defaults.summary.max_summary_words,
    },
    targets: {
      eco_a: {
        enabled: parsed.targets?.eco_a?.enabled ?? defaults.targets.eco_a.enabled,
        claude_md_path: parsed.targets?.eco_a?.claude_md_path ?? defaults.targets.eco_a.claude_md_path,
        memory_path: parsed.targets?.eco_a?.memory_path ?? defaults.targets.eco_a.memory_path,
      },
      eco_b: {
        enabled: parsed.targets?.eco_b?.enabled ?? defaults.targets.eco_b.enabled,
        copy_to_clipboard: parsed.targets?.eco_b?.copy_to_clipboard ?? defaults.targets.eco_b.copy_to_clipboard,
      },
      eco_c: {
        enabled: parsed.targets?.eco_c?.enabled ?? defaults.targets.eco_c.enabled,
      },
    },
    daily: {
      retention_days: parsed.daily?.retention_days ?? defaults.daily.retention_days,
    },
  };
}

export function serializeConfig(config: ClaudeverseConfig): string {
  return yaml.dump(config, { indent: 2, lineWidth: 120 });
}
