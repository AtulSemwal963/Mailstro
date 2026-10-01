// src/hooks/workflows/useDeleteWorkflow.ts

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
// DELETE WORKFLOW
// ============================================================================
//
// Deletes a workflow through the frontend service layer.
//
// Backend:
//
//     DELETE /workflows/{workflowId}
//
// On success:
//   - removes the individual workflow from the detail cache
//   - invalidates the workflow list
//   - invalidates loaded-workflow state
//
// IMPORTANT:
//
// If the deleted workflow was currently selected for browser replay, the
// backend clears that runtime selection. Therefore the loaded-workflow query
// must also be invalidated.
// ============================================================================

export function useDeleteWorkflow() {
  const queryClient =
    useQueryClient();


  return useMutation({
    mutationFn: (
      workflowId: string,
    ) =>
      workflowService.deleteWorkflow(
        workflowId,
      ),


    onSuccess: (
      _response,
      workflowId,
    ) => {

      // ----------------------------------------------------------------------
      // REMOVE DETAIL CACHE
      // ----------------------------------------------------------------------

      queryClient.removeQueries({
        queryKey:
          workflowQueryKeys.detail(
            workflowId,
          ),
      });


      // ----------------------------------------------------------------------
      // INVALIDATE WORKFLOW LIST
      // ----------------------------------------------------------------------

      queryClient.invalidateQueries({
        queryKey:
          workflowQueryKeys.lists(),
      });


      // ----------------------------------------------------------------------
      // INVALIDATE LOADED WORKFLOW
      // ----------------------------------------------------------------------
      //
      // The deleted workflow may have been the workflow selected for replay.
      //
      // Backend runtime state is therefore no longer safely represented by
      // the cached loaded-workflow query.
      //

      queryClient.invalidateQueries({
        queryKey:
          workflowQueryKeys.loaded(),
      });
    },
  });
}


export default useDeleteWorkflow;