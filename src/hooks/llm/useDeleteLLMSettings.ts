// src/hooks/llm/useDeleteLLMSettings.ts

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


export function useDeleteLLMSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      llmService.deleteSettings(),

    onSuccess: () => {
      /*
       * There is no longer a settings object.
       * Remove the cached value instead of leaving stale
       * configuration in memory.
       */
      queryClient.removeQueries({
        queryKey: llmQueryKeys.settings(),
      });

      queryClient.invalidateQueries({
        queryKey: llmQueryKeys.status(),
      });
    },
  });
}