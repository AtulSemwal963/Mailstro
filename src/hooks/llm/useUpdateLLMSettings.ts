// src/hooks/llm/useUpdateLLMSettings.ts

import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  llmService,
} from '../../services/llm/llm.services';

import {
  llmQueryKeys,
} from './keys';

import type {
  UpdateLLMSettingsRequest as UpdateLLMSettingsInput,
} from '../../services/llm/llm.types';


export function useUpdateLLMSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      input: UpdateLLMSettingsInput,
    ) =>
      llmService.updateSettings(input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: llmQueryKeys.settings(),
      });

      queryClient.invalidateQueries({
        queryKey: llmQueryKeys.status(),
      });
    },
  });
}