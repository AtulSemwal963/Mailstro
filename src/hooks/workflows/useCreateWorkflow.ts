// src/hooks/workflows/useCreateWorkflow.ts

import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  workflowService,
} from '../../services/workflows/workflow.services';

import type {
  CreateWorkflowRequest,
} from '../../services/workflows/workflow.types';

import {
  workflowQueryKeys,
} from './keys';


// ============================================================================
// CREATE WORKFLOW
// ============================================================================
//
// Creates a new workflow through the frontend service layer.
//
// Backend:
//
//     POST /workflows
//
// On success:
//   - invalidates the workflow list so the new workflow appears
//   - seeds the individual workflow detail cache
//
// IMPORTANT:
//
// Creating a workflow does NOT automatically make it the currently loaded
// workflow for browser replay.
//
// Loading is a separate operation:
//
//     POST /workflows/{workflowId}/load
// ============================================================================

export function useCreateWorkflow() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateWorkflowRequest,
    ) =>
      workflowService.createWorkflow(
        data,
      ),

    onSuccess: (
      response,
    ) => {

      // ----------------------------------------------------------------------
      // INVALIDATE WORKFLOW LIST
      // ----------------------------------------------------------------------

      queryClient.invalidateQueries({
        queryKey:
          workflowQueryKeys.lists(),
      });


      // ----------------------------------------------------------------------
      // SEED WORKFLOW DETAIL CACHE
      // ----------------------------------------------------------------------

      const workflow =
        response?.workflow;

      if (
        workflow?.id
      ) {
        queryClient.setQueryData(
          workflowQueryKeys.detail(
            workflow.id,
          ),
          response,
        );
      }
    },
  });
}


export default useCreateWorkflow;