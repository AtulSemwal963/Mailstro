// src/hooks/campaigns/useDeleteCampaignLeads.ts

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
// TYPES
// ============================================================================

export interface DeleteCampaignLeadsVariables {
  campaignId: string;

  campaignLeadIds: number[];
}


// ============================================================================
// HOOK
// ============================================================================
//
// Deletes selected CampaignLead associations from a campaign.
//
// Important:
//
//   - campaignLeadIds are CampaignLead IDs
//   - canonical Lead records are NOT deleted
//   - the backend scopes deletion to the supplied campaignId
//
// On success, affected campaign queries are invalidated so the UI reloads
// authoritative state from the backend.
//
// ============================================================================

export function useDeleteCampaignLeads() {

  const queryClient =
    useQueryClient();


  return useMutation({

    // ========================================================================
    // MUTATION
    // ========================================================================

    mutationFn:
      async ({
        campaignId,
        campaignLeadIds,
      }: DeleteCampaignLeadsVariables) => {

        if (
          !campaignId.trim()
        ) {
          throw new Error(
            'Campaign ID is required to delete campaign leads.',
          );
        }


        if (
          !Array.isArray(
            campaignLeadIds,
          ) ||
          campaignLeadIds.length === 0
        ) {
          throw new Error(
            'At least one campaign lead must be selected.',
          );
        }


        const normalizedIds =
          Array.from(
            new Set(
              campaignLeadIds,
            ),
          );


        for (
          const id
          of normalizedIds
        ) {

          if (
            !Number.isInteger(
              id,
            ) ||
            id <= 0
          ) {
            throw new Error(
              'Campaign lead IDs must be positive integers.',
            );
          }
        }


        return campaignService.deleteCampaignLeads(
          campaignId,
          {
            campaign_lead_ids:
              normalizedIds,
          },
        );
      },


    // ========================================================================
    // SUCCESS
    // ========================================================================

    onSuccess:
      async (
        _response,
        variables,
      ) => {

        const {
          campaignId,
        } = variables;


        await Promise.all([

          // ------------------------------------------------------------------
          // CAMPAIGN LEADS
          // ------------------------------------------------------------------
          //
          // This is the primary query affected by deletion.
          //

          queryClient.invalidateQueries({
            queryKey:
              campaignQueryKeys.campaignLeads(
                campaignId,
              ),
          }),


          // ------------------------------------------------------------------
          // CAMPAIGN DETAIL
          // ------------------------------------------------------------------
          //
          // Keeps any campaign-level lead counts/aggregates synchronized.
          //

          queryClient.invalidateQueries({
            queryKey:
              campaignQueryKeys.detail(
                campaignId,
              ),
          }),


          // ------------------------------------------------------------------
          // CAMPAIGN LIST
          // ------------------------------------------------------------------
          //
          // Useful if the campaign list eventually exposes lead counts or
          // other aggregates affected by campaign-lead deletion.
          //

          queryClient.invalidateQueries({
            queryKey:
              campaignQueryKeys.list(),
          }),
        ]);
      },
  });
}


export default useDeleteCampaignLeads;