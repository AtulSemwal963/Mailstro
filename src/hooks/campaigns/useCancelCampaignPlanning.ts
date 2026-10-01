// src/hooks/campaigns/useCancelCampaignPlanning.ts

import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  campaignService,
} from '../../services/campaigns/campaign.services';

import type {
  CancelCampaignPlanningResponse,
} from '../../services/campaigns/campaign.types';

import {
  campaignQueryKeys,
} from './keys';


// ============================================================================
// TYPES
// ============================================================================

export interface CancelCampaignPlanningVariables {
  campaignId: string;
  planRunId: string;
}


// ============================================================================
// HOOK
// ============================================================================
//
// Cancels an active campaign planning run.
//
// The backend transitions the run to CANCELLED. Individual lead items that
// have already completed remain completed; items that have not completed are
// handled by the backend planner's cancellation logic.
//
// On success, all affected campaign planning state is invalidated.
//
// ============================================================================

export function useCancelCampaignPlanning() {
  const queryClient = useQueryClient();

  return useMutation<
    CancelCampaignPlanningResponse,
    Error,
    CancelCampaignPlanningVariables
  >({
    mutationFn: async ({
      campaignId,
      planRunId,
    }) => {
      if (!campaignId?.trim()) {
        throw new Error(
          'Campaign ID is required to cancel planning.',
        );
      }

      if (!planRunId?.trim()) {
        throw new Error(
          'Plan run ID is required to cancel planning.',
        );
      }

      return campaignService.cancelCampaignPlanning(
        campaignId,
        planRunId,
      );
    },

    onSuccess: async (
      _response,
      variables,
    ) => {
      const {
        campaignId,
        planRunId,
      } = variables;

      await Promise.all([
        // --------------------------------------------------------------------
        // Exact planning run
        // --------------------------------------------------------------------

        queryClient.invalidateQueries({
          queryKey:
            campaignQueryKeys.planRun(
              campaignId,
              planRunId,
            ),
        }),

        // --------------------------------------------------------------------
        // Planning run list
        // --------------------------------------------------------------------

        queryClient.invalidateQueries({
          queryKey:
            campaignQueryKeys.campaignPlanRuns(
              campaignId,
            ),
        }),

        // --------------------------------------------------------------------
        // Campaign leads
        //
        // Already-completed reports must remain visible and any lead state
        // changes caused by cancellation must be reflected immediately.
        // --------------------------------------------------------------------

        queryClient.invalidateQueries({
          queryKey:
            campaignQueryKeys.campaignLeads(
              campaignId,
            ),
        }),

        // --------------------------------------------------------------------
        // Campaign detail
        // --------------------------------------------------------------------

        queryClient.invalidateQueries({
          queryKey:
            campaignQueryKeys.detail(
              campaignId,
            ),
        }),
      ]);
    },
  });
}


export default useCancelCampaignPlanning;