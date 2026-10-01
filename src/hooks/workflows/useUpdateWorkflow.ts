// src/hooks/workflows/useUpdateWorkflow.ts

import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  workflowService,
} from '../../services/workflows/workflow.services';

import type {
  UpdateWorkflowRequest,
} from '../../services/workflows/workflow.types';

import {
  workflowQueryKeys,
} from './keys';


// ============================================================================
// UPDATE WORKFLOW
// ============================================================================
//
// Updates workflow metadata through the frontend service layer.
//
// Backend:
//
//     PATCH /workflows/{workflowId}
//
// This mutation changes:
//   - title
//   - description
//   - status
//   - tags
//
// It does NOT change the recorded action sequence.
//
// Loaded-workflow semantics:
//
// If the workflow being edited is currently loaded for browser replay,
// the backend loaded-workflow selection remains unchanged because the
// workflow ID itself has not changed.
//
// The loaded-workflow cache is invalidated so consumers that represent
// loaded metadata can synchronize with the updated workflow.
// ============================================================================

export interface UpdateWorkflowVariables {
  workflowId: string;

  data: UpdateWorkflowRequest;
}


export function useUpdateWorkflow() {
  const queryClient =
    useQueryClient();


  return useMutation({
    mutationFn: ({
      workflowId,
      data,
    }: UpdateWorkflowVariables) =>
      workflowService.updateWorkflow(
        workflowId,
        data,
      ),


    onSuccess: (
      response,
      variables,
    ) => {

      // ----------------------------------------------------------------------
      // UPDATE DETAIL CACHE
      // ----------------------------------------------------------------------

      queryClient.setQueryData(
        workflowQueryKeys.detail(
          variables.workflowId,
        ),
        response,
      );


      // ----------------------------------------------------------------------
      // INVALIDATE WORKFLOW LIST
      // ----------------------------------------------------------------------
      //
      // This updates the workflow card metadata:
      //
      //     title
      //     description
      //     status
      //     tags
      //
      // ----------------------------------------------------------------------

      queryClient.invalidateQueries({
        queryKey:
          workflowQueryKeys.lists(),
      });


      // ----------------------------------------------------------------------
      // INVALIDATE LOADED WORKFLOW
      // ----------------------------------------------------------------------
      //
      // The loaded workflow is a separate server-state concept.
      //
      // If the edited workflow is currently selected for replay, consumers
      // should not continue relying on stale loaded metadata.
      //
      // This does NOT change the backend's selected workflow.
      //

      queryClient.invalidateQueries({
        queryKey:
          workflowQueryKeys.loaded(),
      });
    },
  });
}


export default useUpdateWorkflow;