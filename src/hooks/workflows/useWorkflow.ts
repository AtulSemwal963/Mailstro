// src/hooks/workflows/useWorkflow.ts

import { useQuery } from '@tanstack/react-query';

import { workflowService } from '../../services/workflows/workflow.services';

import { workflowQueryKeys } from './keys';


// ============================================================================
// SINGLE WORKFLOW QUERY
// ============================================================================
//
// Retrieves one complete workflow by ID.
//
// Backend:
//
//     GET /workflows/{workflowId}
//
// This endpoint returns the full executable action sequence.
//
// The hook is intentionally separate from:
//
//     useWorkflows()
//         -> workflow list / summaries
//
// because the list and detail queries have different cache identities.
//
// This hook is also independent from:
//
//     useLoadedWorkflow()
//         -> currently selected workflow for replay
//
// A workflow can exist in the database without being the currently loaded
// workflow.
// ============================================================================

export function useWorkflow(
  workflowId: string | null | undefined,
) {
  const normalizedWorkflowId =
    typeof workflowId === 'string'
      ? workflowId.trim()
      : '';

  return useQuery({
    queryKey:
      normalizedWorkflowId
        ? workflowQueryKeys.detail(
            normalizedWorkflowId,
          )
        : workflowQueryKeys.detail(''),

    queryFn:
      () =>
        workflowService.getWorkflow(
          normalizedWorkflowId,
        ),

    /*
     * Do not execute the query when no workflow has been selected.
     */
    enabled:
      Boolean(
        normalizedWorkflowId,
      ),

    /*
     * Workflow details do not change frequently.
     *
     * Explicit mutations should invalidate this cache when metadata or
     * actions are changed.
     */
    staleTime:
      5 * 60 * 1000,

    /*
     * Allow transient backend failures to recover automatically.
     */
    retry:
      2,

    refetchOnWindowFocus:
      false,
  });
}


export default useWorkflow;