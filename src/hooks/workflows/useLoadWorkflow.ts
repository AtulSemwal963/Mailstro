// src/hooks/workflows/useLoadWorkflow.ts

import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  workflowService,
} from '../../services/workflows/workflow.services';

import {
  workflowQueryKeys,
} from './keys';


// ============================================================================
// LOAD WORKFLOW
// ============================================================================
//
// Selects one workflow as the currently loaded workflow for browser replay.
//
// Backend:
//
//     POST /workflows/{workflowId}/load
//
// IMPORTANT:
//
// Loading a workflow does NOT execute it.
//
// It only changes:
//
//     workflow_runtime.loaded_workflow_id
//
// The returned workflow contains the complete executable action sequence.
//
// On success:
//   - seeds the workflow detail cache
//   - seeds the loaded-workflow cache
//   - refreshes the workflow list metadata
//
// This is the desktop-side entry point for:
//
//     Electron Workflows page
//             ↓
//     Load Workflow
//             ↓
//     Backend runtime selection
//             ↓
//     Extension Refresh
// ============================================================================

export interface LoadWorkflowVariables {
  workflowId: string;
}


export function useLoadWorkflow() {
  const queryClient =
    useQueryClient();


  return useMutation({
    // ========================================================================
    // MUTATION
    // ========================================================================

    mutationFn: ({
      workflowId,
    }: LoadWorkflowVariables) => {

      const normalizedWorkflowId =
        workflowId.trim();

      if (!normalizedWorkflowId) {
        throw new Error(
          'Workflow ID is required.',
        );
      }

      return workflowService.loadWorkflow(
        normalizedWorkflowId,
      );
    },


    // ========================================================================
    // SUCCESS
    // ========================================================================

    onSuccess: (
      response,
      variables,
    ) => {

      const workflow =
        response?.workflow;


      if (!workflow?.id) {
        /*
         * The service should already enforce this contract, but keeping the
         * guard here prevents corrupt query state if the backend ever returns
         * an unexpected response.
         */
        return;
      }


      // ----------------------------------------------------------------------
      // SEED INDIVIDUAL WORKFLOW CACHE
      // ----------------------------------------------------------------------

      queryClient.setQueryData(
        workflowQueryKeys.detail(
          workflow.id,
        ),
        {
          success: true,
          workflow,
        },
      );


      // ----------------------------------------------------------------------
      // SEED LOADED WORKFLOW CACHE
      // ----------------------------------------------------------------------
      //
      // This is the important bridge state:
      //
      //     selected workflow for browser replay
      //

      queryClient.setQueryData(
        workflowQueryKeys.loaded(),
        {
          success: true,
          workflow,
        },
      );


      // ----------------------------------------------------------------------
      // REFRESH WORKFLOW LIST
      // ----------------------------------------------------------------------
      //
      // The list itself does not contain the loaded selection, but invalidating
      // it keeps the gallery synchronized if other metadata changed between
      // the cached list response and the load response.
      //

      queryClient.invalidateQueries({
        queryKey:
          workflowQueryKeys.lists(),
      });


      /*
       * Keep the exact workflow ID that was requested represented by the
       * mutation variables. This also makes accidental mismatches visible
       * during debugging.
       */
      if (
        variables.workflowId.trim() !==
        workflow.id
      ) {
        console.warn(
          'Mailstro: Loaded workflow ID differs from requested workflow ID.',
          {
            requestedWorkflowId:
              variables.workflowId,

            returnedWorkflowId:
              workflow.id,
          },
        );
      }
    },


    // ========================================================================
    // ERROR
    // ========================================================================
    //
    // No cache mutation is performed on failure.
    //
    // Therefore a previously loaded workflow remains represented in the
    // client's cache until the backend successfully selects another workflow.
    // ========================================================================
  });
}


export default useLoadWorkflow;