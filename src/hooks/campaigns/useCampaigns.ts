// src/hooks/campaigns/useCampaigns.ts

import { useQuery } from '@tanstack/react-query';

import { campaignService } from '../../services/campaigns/campaign.services';

import { campaignQueryKeys } from './keys';

// ============================================================================
// CAMPAIGN LIST QUERY
// ============================================================================
//
// Retrieves all campaigns from the backend.
//
// TanStack Query owns:
//   - request lifecycle
//   - caching
//   - refetching
//   - loading state
//   - error state
//
// Components should consume this hook rather than calling
// campaignService.getCampaigns() directly.
// ============================================================================

export function useCampaigns() {
  return useQuery({
    queryKey:
      campaignQueryKeys.list(),

    queryFn:
      () =>
        campaignService.getCampaigns(),

    staleTime:
      30 * 1000,

    refetchOnWindowFocus:
      true,

    retry:
      2,
  });
}

export default useCampaigns;