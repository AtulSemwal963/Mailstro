// src/hooks/llm/useCreateLLMSettings.ts

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
 CreateLLMSettingsRequest as  CreateLLMSettingsInput,
} from '../../services/llm/llm.types';


export function useCreateLLMSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      input: CreateLLMSettingsInput,
    ) =>
      llmService.createSettings(input),

    onSuccess: () => {
      /*
       * The newly created settings should immediately
       * become available to settings/status queries.
       */
      queryClient.invalidateQueries({
        queryKey: llmQueryKeys.settings(),
      });

      queryClient.invalidateQueries({
        queryKey: llmQueryKeys.status(),
      });
    },
  });
}