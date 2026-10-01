// src/hooks/campaigns/useStartCampaignPlanning.ts

import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  campaignService,
} from '../../services/campaigns/campaign.services';

import type {
  StartCampaignPlanningRequest,
  StartCampaignPlanningResponse,
} from '../../services/campaigns/campaign.types';

import {
  campaignQueryKeys,
} from './keys';


// ============================================================================
// TYPES
// ============================================================================

export interface StartCampaignPlanningVariables {
  campaignId: string;
  campaignLeadIds?: number[];
}


// ============================================================================
// HOOK
// ============================================================================
//
// Starts a campaign planning run.
//
// campaignLeadIds omitted/empty:
//   -> backend plans all eligible CampaignLeads
//
// campaignLeadIds supplied:
//   -> backend plans only the selected CampaignLead IDs
//
// The backend immediately returns a plan_run. Actual report generation runs
// asynchronously, so the frontend should subsequently poll that run through
// useCampaignPlanRun.
// ============================================================================

export function useStartCampaignPlanning() {
  const queryClient = useQueryClient();

  return useMutation<
    StartCampaignPlanningResponse,
    Error,
    StartCampaignPlanningVariables
  >({
    mutationFn: async ({
      campaignId,
      campaignLeadIds,
    }) => {
      if (!campaignId?.trim()) {
        throw new Error(
          'Campaign ID is required to start planning.',
        );
      }

      const normalizedIds =
        campaignLeadIds?.filter(
          (id) =>
            Number.isInteger(id) &&
            id > 0,
        ) ?? [];

      const data: StartCampaignPlanningRequest =
        normalizedIds.length > 0
          ? {
              campaign_lead_ids: normalizedIds,
            }
          : {};

      return campaignService.startCampaignPlanning(
        campaignId,
        data,
      );
    },

    onSuccess: async (
      response,
      variables,
    ) => {
      const {
        campaignId,
      } = variables;

      const {
        plan_run,
      } = response;

      await Promise.all([
        // --------------------------------------------------------------------
        // Refresh campaign-level context metadata / campaign state
        // --------------------------------------------------------------------

        queryClient.invalidateQueries({
          queryKey:
            campaignQueryKeys.detail(
              campaignId,
            ),
        }),

        // --------------------------------------------------------------------
        // Refresh leads so PLANNING state becomes visible immediately
        // --------------------------------------------------------------------

        queryClient.invalidateQueries({
          queryKey:
            campaignQueryKeys.campaignLeads(
              campaignId,
            ),
        }),

        // --------------------------------------------------------------------
        // Refresh plan-run list
        // --------------------------------------------------------------------

        queryClient.invalidateQueries({
          queryKey:
            campaignQueryKeys.campaignPlanRuns(
              campaignId,
            ),
        }),

        // --------------------------------------------------------------------
        // Prime the exact run cache returned by the backend
        // --------------------------------------------------------------------

        queryClient.setQueryData(
          campaignQueryKeys.planRun(
            campaignId,
            plan_run.id,
          ),
          {
            success: true,
            campaign_id: campaignId,
            plan_run,
            items: [],
          },
        ),
      ]);
    },
  });
}

export default useStartCampaignPlanning;