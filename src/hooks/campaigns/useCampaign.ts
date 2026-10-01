// src/hooks/campaigns/useCampaign.ts

import { useQuery } from '@tanstack/react-query';

import { campaignService } from '../../services/campaigns/campaign.services';

import { campaignQueryKeys } from './keys';

// ============================================================================
// SINGLE CAMPAIGN QUERY
// ============================================================================
//
// Retrieves one complete campaign by ID.
//
// This is separate from useCampaigns() because the campaign list and an
// individual campaign have different cache identities.
//
// ============================================================================

export function useCampaign(
  campaignId: string | null | undefined,
) {
  return useQuery({
    queryKey:
      campaignId
        ? campaignQueryKeys.detail(
            campaignId,
          )
        : campaignQueryKeys.detail(''),

    queryFn: () => {
      if (!campaignId) {
        throw new Error(
          'Campaign ID is required.',
        );
      }

      return campaignService.getCampaign(
        campaignId,
      );
    },

    enabled:
      Boolean(campaignId),

    staleTime:
      5 * 60 * 1000,

    retry:
      2,

    refetchOnWindowFocus:
      false,
  });
}

export default useCampaign;