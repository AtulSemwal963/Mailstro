// src/hooks/campaigns/useUpdateCampaignLeadReport.ts

import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  campaignService,
} from '../../services/campaigns/campaign.services';

import type {
  UpdateCampaignLeadReportRequest,
  UpdateCampaignLeadReportResponse,
} from '../../services/campaigns/campaign.types';

import {
  campaignQueryKeys,
} from './keys';


// ============================================================================
// TYPES
// ============================================================================

export interface UpdateCampaignLeadReportVariables {
  campaignId: string;
  campaignLeadId: number;
  data: UpdateCampaignLeadReportRequest;
}


// ============================================================================
// HOOK
// ============================================================================
//
// Updates the editable report fields for one CampaignLead.
//
// Supported fields:
//
//   - linkedin_evidence
//   - website_evidence
//   - overall_evidence
//   - outreach_angle
//   - email_subject
//   - email_body
//
// The backend treats this as a partial update:
//
//   omitted field
//       -> existing value remains unchanged
//
//   explicit null
//       -> existing value is cleared
//
//   supplied string
//       -> existing value is replaced
//
// On success, the campaign-leads query is invalidated so the edited report
// is reflected everywhere in the campaign detail UI.
// ============================================================================

export function useUpdateCampaignLeadReport() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateCampaignLeadReportResponse,
    Error,
    UpdateCampaignLeadReportVariables
  >({
    mutationFn: async ({
      campaignId,
      campaignLeadId,
      data,
    }) => {
      if (!campaignId?.trim()) {
        throw new Error(
          'Campaign ID is required to update the lead report.',
        );
      }

      if (
        !Number.isInteger(campaignLeadId) ||
        campaignLeadId <= 0
      ) {
        throw new Error(
          'Campaign lead ID must be a positive integer.',
        );
      }

      if (!data || typeof data !== 'object') {
        throw new Error(
          'Report update data is required.',
        );
      }

      return campaignService.updateCampaignLeadReport(
        campaignId,
        campaignLeadId,
        data,
      );
    },

    onSuccess: async (
      _response,
      variables,
    ) => {
      const {
        campaignId,
      } = variables;

      await Promise.all([
        // --------------------------------------------------------------------
        // Campaign lead table / report data
        // --------------------------------------------------------------------

        queryClient.invalidateQueries({
          queryKey:
            campaignQueryKeys.campaignLeads(
              campaignId,
            ),
        }),

        // --------------------------------------------------------------------
        // Individual campaign
        // --------------------------------------------------------------------

        queryClient.invalidateQueries({
          queryKey:
            campaignQueryKeys.detail(
              campaignId,
            ),
        }),
      ]);
    },
  });
}


export default useUpdateCampaignLeadReport;