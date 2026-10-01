// src/hooks/llm/useTestLLMConnection.ts

import {
  useMutation,
} from '@tanstack/react-query';

import {
  llmService,
} from '../../services/llm/llm.services';


export function useTestLLMConnection() {
  return useMutation({
    mutationFn: () =>
      llmService.testConnection(),

    /*
     * Do not retry automatically.
     *
     * If the API key is invalid, model is invalid,
     * or the provider rejects the request, retrying
     * would simply repeat the same failure.
     */
    retry: false,
  });
}