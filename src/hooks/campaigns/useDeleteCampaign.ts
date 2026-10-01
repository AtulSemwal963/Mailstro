// src/hooks/campaigns/useDeleteCampaign.ts

import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  campaignService,
} from '../../services/campaigns/campaign.services';

import {
  campaignQueryKeys,
} from './keys';


// ============================================================================
// DELETE CAMPAIGN
// ============================================================================
//
// Deletes a campaign through the frontend service layer.
//
// On success:
//   - removes the individual campaign from the TanStack Query cache
//   - invalidates the campaign list so the deleted campaign disappears
// ============================================================================

export function useDeleteCampaign() {
  const queryClient =
    useQueryClient();


  return useMutation({
    mutationFn: (
      campaignId: string,
    ) =>
      campaignService.deleteCampaign(
        campaignId,
      ),


    onSuccess: (
      _response,
      campaignId,
    ) => {

      // ----------------------------------------------------------------------
      // REMOVE DETAIL CACHE
      // ----------------------------------------------------------------------

      queryClient.removeQueries({
        queryKey:
          campaignQueryKeys.detail(
            campaignId,
          ),
      });


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


export default useDeleteCampaign;