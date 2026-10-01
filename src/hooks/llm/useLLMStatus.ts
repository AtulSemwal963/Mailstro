// src/hooks/llm/useLLMStatus.ts

import { useQuery } from '@tanstack/react-query';

import { llmService } from '../../services/llm/llm.services';
import { llmQueryKeys } from './keys';

export function useLLMStatus() {
  return useQuery({
    queryKey: llmQueryKeys.settings(),

    queryFn: () => llmService.getSettings(),

    staleTime: 5 * 60 * 1000,

    retry: false,
  });
}