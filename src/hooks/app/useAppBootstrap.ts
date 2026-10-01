// src/hooks/app/useAppBootstrap.ts

import { useLLMSettings } from '../llm';


// ============================================================================
// APPLICATION BOOTSTRAP
// ============================================================================
//
// Application startup must NOT depend on LLM configuration.
//
// First launch is expected to have:
//
//     GET /llm
//         -> 404
//         -> settings = null
//
// That is a valid application state.
//
// This hook therefore exposes LLM state for the renderer, but LLM state must
// never determine whether the application itself is allowed to render.
//
// Electron's main process is responsible for backend startup/readiness.
// ============================================================================

export function useAppBootstrap() {
  const llmSettings =
    useLLMSettings();


  return {
    // ------------------------------------------------------------------------
    // LLM STATE
    // ------------------------------------------------------------------------

    llmSettings,

    // These remain available to consumers that actually need to know whether
    // the LLM query is still loading.
    llmIsLoading:
      llmSettings.isLoading,

    llmIsError:
      llmSettings.isError,

    // ------------------------------------------------------------------------
    // APPLICATION BOOTSTRAP
    // ------------------------------------------------------------------------
    //
    // Deliberately NOT tied to LLM state.
    //
    // AppBootstrap.tsx should therefore render the application regardless of
    // whether the user has configured an LLM.
    //

    isLoading:
      false,

    isError:
      false,
  };
}


export default useAppBootstrap;