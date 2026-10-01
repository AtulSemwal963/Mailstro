// src/hooks/campaigns/useImportCampaignLeads.ts

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

export interface ImportCampaignLeadsVariables {
  campaignId: string;

  file: File;
}


// ============================================================================
// HOOK
// ============================================================================
//
// Imports a CSV/XLS/XLSX file into a campaign.
//
// The backend is responsible for:
//
//   - reading the uploaded file
//   - normalizing columns
//   - validating lead rows
//   - creating/reusing canonical leads
//   - creating CampaignLead associations
//
// On successful import, the campaign-leads query is invalidated so the
// LeadsTable retrieves the authoritative state from the backend.
//
// ============================================================================

export function useImportCampaignLeads() {

  const queryClient =
    useQueryClient();


  return useMutation({

    // ========================================================================
    // MUTATION
    // ========================================================================

    mutationFn:
      async ({
        campaignId,
        file,
      }: ImportCampaignLeadsVariables) => {

        if (
          !campaignId.trim()
        ) {
          throw new Error(
            'Campaign ID is required to import leads.',
          );
        }


        if (
          !(file instanceof File)
        ) {
          throw new Error(
            'A valid lead file is required.',
          );
        }


        if (
          file.size === 0
        ) {
          throw new Error(
            'The selected lead file is empty.',
          );
        }


        return campaignService.importCampaignLeads(
          campaignId,
          file,
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
          // This is the primary query affected by ingestion.
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
          // Keeps campaign-level aggregate data synchronized if the backend
          // later exposes lead counts or planning state here.
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
          // Keeps the campaign list synchronized if campaign-level
          // aggregates are displayed there.
          //

          queryClient.invalidateQueries({
            queryKey:
              campaignQueryKeys.list(),
          }),
        ]);
      },
  });
}


export default useImportCampaignLeads;