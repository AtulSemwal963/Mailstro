// src/hooks/campaigns/useCampaignLeads.ts

import {
  useQuery,
} from '@tanstack/react-query';

import {
  campaignService,
} from '../../services/campaigns/campaign.services';

import {
  campaignQueryKeys,
} from './keys';


// ============================================================================
// HOOK
// ============================================================================
//
// Retrieves all leads associated with one campaign.
//
// Server state is owned by TanStack Query.
// Zustand should only contain campaign-detail UI state.
//
// ============================================================================

export function useCampaignLeads(
  campaignId: string | null | undefined,
) {

  return useQuery({
    queryKey:
      campaignId
        ? campaignQueryKeys.campaignLeads(
            campaignId,
          )
        : campaignQueryKeys.campaignLeads(
            '',
          ),

    queryFn:
      () => {
        if (!campaignId) {
          throw new Error(
            'Campaign ID is required to load campaign leads.',
          );
        }

        return campaignService.getCampaignLeads(
          campaignId,
        );
      },

    enabled:
      Boolean(
        campaignId,
      ),

    staleTime:
      30 * 1000,
  });
}