// src/hooks/llm/keys.ts

export const llmQueryKeys = {
  all: ['llm'] as const,

  settings: () =>
    [...llmQueryKeys.all, 'settings'] as const,

  status: () =>
    [...llmQueryKeys.all, 'status'] as const,
};