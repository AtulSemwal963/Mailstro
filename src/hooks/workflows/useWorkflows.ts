// src/hooks/workflows/useWorkflows.ts

import { useQuery } from '@tanstack/react-query';

import { workflowService } from '../../services/workflows/workflow.services';

import { workflowQueryKeys } from './keys';


// ============================================================================
// WORKFLOW LIST QUERY
// ============================================================================
//
// Retrieves the workflow collection from the backend.
//
// Backend contract:
//
//     GET /workflows
//
// The list endpoint intentionally returns workflow summaries without the
// executable action sequence.
//
// TanStack Query owns:
//   - request lifecycle
//   - caching
//   - loading state
//   - error state
//   - refetching
//
// Components should consume this hook rather than calling
// workflowService.getWorkflows() directly.
// ============================================================================

export function useWorkflows() {
  return useQuery({
    queryKey:
      workflowQueryKeys.list(),

    queryFn:
      () =>
        workflowService.getWorkflows(),

    /*
     * Keep the workflow gallery reasonably fresh without causing a request
     * every time the component renders.
     */
    staleTime:
      30 * 1000,

    /*
     * The application QueryClient already disables window-focus refetching.
     *
     * Keep this explicit here so the workflow list has deterministic
     * behavior even if the global QueryClient defaults change later.
     */
    refetchOnWindowFocus:
      false,

    /*
     * The workflow page can recover from a transient backend failure.
     */
    retry:
      2,
  });
}


export default useWorkflows;