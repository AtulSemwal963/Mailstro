// src/hooks/campaigns/useCampaignStats.ts

import { useQuery } from '@tanstack/react-query';

import { campaignService } from '../../services/campaigns/campaign.services';

import { campaignQueryKeys } from './keys';

// ============================================================================
// CAMPAIGN DASHBOARD STATS QUERY
// ============================================================================
//
// Retrieves aggregate campaign statistics from:
//
//     GET /campaigns/stats
//
// Returned statistics:
//
//     - total_mails_sent
//     - total_campaigns
//     - total_leads
//
// TanStack Query owns:
//
//     - request lifecycle
//     - caching
//     - refetching
//     - loading state
//     - error state
//
// Components should consume this hook rather than calling
// campaignService.getCampaignStats() directly.
// ============================================================================

export function useCampaignStats() {
  return useQuery({
    queryKey:
      campaignQueryKeys.stats(),

    queryFn:
      () =>
        campaignService.getCampaignStats(),

    staleTime:
      30 * 1000,

    refetchOnWindowFocus:
      true,

    retry:
      2,
  });
}

export default useCampaignStats;