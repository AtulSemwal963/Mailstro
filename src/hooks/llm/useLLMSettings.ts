// src/hooks/llm/useLLMSettings.ts

import {
  useQuery,
} from '@tanstack/react-query';

import {
  llmService,
} from '../../services/llm/llm.services';

import {
  ApiError,
} from '../../services/api/client';

import {
  llmQueryKeys,
} from './keys';

import type {
  LLMSettingsResponse,
} from '../../services/llm/llm.types';


// ============================================================================
// LLM SETTINGS QUERY
// ============================================================================
//
// Normal backend contract:
//
// Configured:
//
// {
//   "success": true,
//   "configured": true,
//   "settings": {
//     ...
//   }
// }
//
// Not configured:
//
// {
//   "success": true,
//   "configured": false,
//   "settings": null
// }
//
// The absence of LLM configuration is valid application state and therefore
// must not put the query into an error state.
//
// The 404 fallback is retained only for compatibility with an older backend
// instance during development.
// ============================================================================

export function useLLMSettings() {
  return useQuery<LLMSettingsResponse>({
    queryKey:
      llmQueryKeys.settings(),

    queryFn:
      async () => {
        try {
          return await llmService.getSettings();

        } catch (error) {
          // ------------------------------------------------------------------
          // BACKWARD-COMPATIBLE UNCONFIGURED STATE
          // ------------------------------------------------------------------

          if (
            error instanceof ApiError &&
            error.status === 404
          ) {
            return {
              success: true,
              configured: false,
              settings: null,
            };
          }

          // ------------------------------------------------------------------
          // REAL BACKEND / NETWORK ERROR
          // ------------------------------------------------------------------

          throw error;
        }
      },

    staleTime:
      5 * 60 * 1000,

    refetchOnWindowFocus:
      false,

    retry:
      false,

    throwOnError:
      false,
  });
}


export default useLLMSettings;