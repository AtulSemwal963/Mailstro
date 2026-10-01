// src/hooks/campaigns/useUpdateCampaign.ts

import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  campaignService,
} from '../../services/campaigns/campaign.services';

import type {
  UpdateCampaignRequest,
} from '../../services/campaigns/campaign.types';

import {
  campaignQueryKeys,
} from './keys';


// ============================================================================
// UPDATE CAMPAIGN
// ============================================================================
//
// Updates campaign metadata through the frontend service layer.
//
// On success:
//   - updates the individual campaign cache
//   - invalidates the campaign list so cards reflect the new metadata
// ============================================================================

export interface UpdateCampaignVariables {
  campaignId: string;

  data: UpdateCampaignRequest;
}


export function useUpdateCampaign() {
  const queryClient =
    useQueryClient();


  return useMutation({
    mutationFn: ({
      campaignId,
      data,
    }: UpdateCampaignVariables) =>
      campaignService.updateCampaign(
        campaignId,
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
        campaignQueryKeys.detail(
          variables.campaignId,
        ),
        response,
      );


      // ----------------------------------------------------------------------
      // REFRESH LIST CACHE
      // ----------------------------------------------------------------------

      queryClient.invalidateQueries({
        queryKey:
          campaignQueryKeys.lists(),
      });
    },
  });
}


export default useUpdateCampaign;