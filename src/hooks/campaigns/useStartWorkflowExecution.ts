// src/hooks/campaigns/useStartWorkflowExecution.ts

import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  campaignService,
} from '../../services/campaigns/campaign.services';

import type {
  StartWorkflowExecutionRequest,
  StartWorkflowExecutionResponse,
} from '../../services/campaigns/campaign.types';

import {
  campaignQueryKeys,
} from './keys';


// ============================================================================
// TYPES
// ============================================================================

export interface StartWorkflowExecutionVariables {
  campaignId: string;

  /**
   * Selected CampaignLead IDs.
   *
   * When omitted or undefined:
   *     backend executes against all CampaignLeads
   *
   * When supplied:
   *     backend executes only the selected CampaignLeads
   */
  campaignLeadIds?: number[];
}


// ============================================================================
// HOOK
// ============================================================================
//
// This mutation does NOT execute the Chrome extension replay.
//
// It requests the backend to:
//
//     campaign
//         +
//     processed workflow
//         +
//     selected/all CampaignLeads
//         ↓
//     resolve templates
//         ↓
//     expand workflow
//         ↓
//     load runtime workflow into the browser/extension runtime
//
// The user subsequently starts the actual replay from the extension.
//
// ============================================================================

export function useStartWorkflowExecution() {
  const queryClient =
    useQueryClient();

  return useMutation<
    StartWorkflowExecutionResponse,
    Error,
    StartWorkflowExecutionVariables
  >({

    // ========================================================================
    // MUTATION
    // ========================================================================

    mutationFn: async ({
      campaignId,
      campaignLeadIds,
    }) => {
      const normalizedCampaignId =
        campaignId?.trim();

      if (!normalizedCampaignId) {
        throw new Error(
          'Campaign ID is required to execute the workflow.',
        );
      }

      const normalizedLeadIds =
        campaignLeadIds === undefined
          ? undefined
          : Array.from(
              new Set(
                campaignLeadIds,
              ),
            );

      if (
        normalizedLeadIds !== undefined &&
        (
          normalizedLeadIds.length === 0 ||
          normalizedLeadIds.some(
            (
              id,
            ) =>
              !Number.isInteger(id) ||
              id <= 0,
          )
        )
      ) {
        throw new Error(
          'Campaign lead IDs must be positive integers.',
        );
      }

      const request:
        StartWorkflowExecutionRequest =
        normalizedLeadIds === undefined
          ? {}
          : {
              campaign_lead_ids:
                normalizedLeadIds,
            };

      return campaignService.startWorkflowExecution(
        normalizedCampaignId,
        request,
      );
    },


    // ========================================================================
    // SUCCESS
    // ========================================================================

    onSuccess: async (
      _response,
      variables,
    ) => {
      const campaignId =
        variables.campaignId.trim();

      await Promise.all([
        // --------------------------------------------------------------------
        // CAMPAIGN DETAIL
        // --------------------------------------------------------------------

        queryClient.invalidateQueries({
          queryKey:
            campaignQueryKeys.detail(
              campaignId,
            ),
        }),

        // --------------------------------------------------------------------
        // CAMPAIGN LIST
        // --------------------------------------------------------------------

        queryClient.invalidateQueries({
          queryKey:
            campaignQueryKeys.lists(),
        }),

        // --------------------------------------------------------------------
        // CAMPAIGN LEADS
        // --------------------------------------------------------------------
        //
        // Execution itself does not normally change lead data, but the
        // campaign detail should be refreshed because execution metadata
        // may have changed.
        //

        queryClient.invalidateQueries({
          queryKey: [
            'campaigns',
            campaignId,
            'leads',
          ],
        }),
      ]);
    },
  });
}


export default useStartWorkflowExecution;