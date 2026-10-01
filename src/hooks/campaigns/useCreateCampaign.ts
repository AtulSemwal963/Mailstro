// src/hooks/campaigns/useCreateCampaign.ts

import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  campaignService,
} from '../../services/campaigns/campaign.services';

import type {
  CreateCampaignRequest,
} from '../../services/campaigns/campaign.types';

import {
  campaignQueryKeys,
} from './keys';


// ============================================================================
// CREATE CAMPAIGN
// ============================================================================
//
// Creates a new campaign through the frontend service layer.
//
// On success:
//   - invalidates the campaign list so the new campaign appears immediately
//   - seeds the individual campaign cache with the returned campaign
// ============================================================================

export function useCreateCampaign() {
  const queryClient =
    useQueryClient();


  return useMutation({
    mutationFn: (
      data: CreateCampaignRequest,
    ) =>
      campaignService.createCampaign(
        data,
      ),


    onSuccess: (
      response,
    ) => {

      // ----------------------------------------------------------------------
      // REFRESH CAMPAIGN LIST
      // ----------------------------------------------------------------------

      queryClient.invalidateQueries({
        queryKey:
          campaignQueryKeys.lists(),
      });


      // ----------------------------------------------------------------------
      // SEED DETAIL CACHE
      // ----------------------------------------------------------------------

      const campaign =
        response.campaign;

      if (
        campaign?.id
      ) {
        queryClient.setQueryData(
          campaignQueryKeys.detail(
            campaign.id,
          ),
          response,
        );
      }
    },
  });
}

export default useCreateCampaign;