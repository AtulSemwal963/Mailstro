// src/hooks/campaigns/useProcessCampaignWorkflow.ts

import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  campaignService,
} from '../../services/campaigns/campaign.services';

import type {
  ProcessCampaignWorkflowResponse,
} from '../../services/campaigns/campaign.types';

import {
  campaignQueryKeys,
} from './keys';

import {
  workflowQueryKeys,
} from '../workflows/keys';


// ============================================================================
// TYPES
// ============================================================================

export interface ProcessCampaignWorkflowVariables {
  campaignId: string;
}


// ============================================================================
// HOOK
// ============================================================================
//
// Processes the workflow configured for one campaign.
//
// Process Workflow is independent from:
//
//     Plan Campaign
//     Execute Workflow
//
// The backend consumes:
//
//     campaign.workflow_id
//         +
//     CampaignLead planning/report data
//
// and creates:
//
//     independent processed/template workflow
//
// The backend persists its ID as:
//
//     campaign.processed_workflow_id
//
// The original source workflow remains unchanged.
//
// This mutation does NOT:
//
//     - execute the workflow
//     - expand the workflow
//     - resolve CampaignLead placeholders
//     - load anything into the browser extension
//     - start WorkflowExecutionRun
//
// Those responsibilities belong to Execute Workflow.
// ============================================================================

export function useProcessCampaignWorkflow() {
  const queryClient =
    useQueryClient();

  return useMutation<
    ProcessCampaignWorkflowResponse,
    Error,
    ProcessCampaignWorkflowVariables
  >({

    // ========================================================================
    // MUTATION
    // ========================================================================

    mutationFn: async ({
      campaignId,
    }) => {
      const normalizedCampaignId =
        campaignId?.trim();

      if (!normalizedCampaignId) {
        throw new Error(
          'Campaign ID is required to process the workflow.',
        );
      }

      return campaignService.processCampaignWorkflow(
        normalizedCampaignId,
      );
    },


    // ========================================================================
    // SUCCESS
    // ========================================================================

    onSuccess: async (
      response,
      variables,
    ) => {
      const campaignId =
        variables.campaignId.trim();

      const processedWorkflowId =
        response.processed_workflow_id;


      // ======================================================================
      // PRIME PROCESSED WORKFLOW CACHE
      // ======================================================================
      //
      // The backend returns the complete processed workflow.
      //
      // Store it directly so consumers do not need to immediately issue:
      //
      //     GET /workflows/{processedWorkflowId}
      //
      queryClient.setQueryData(
        workflowQueryKeys.detail(
          processedWorkflowId,
        ),
        response.workflow,
      );


      // ======================================================================
      // INVALIDATE CAMPAIGN DETAIL
      // ======================================================================
      //
      // The campaign's workflow-processing state changed:
      //
      //     workflow_id
      //         -> original source workflow
      //
      //     processed_workflow_id
      //         -> newly generated processed workflow
      //
      //     workflow_processing_status
      //         -> PROCESSED
      //
      queryClient.invalidateQueries({
        queryKey:
          campaignQueryKeys.detail(
            campaignId,
          ),
      });


      // ======================================================================
      // INVALIDATE CAMPAIGN LIST
      // ======================================================================

      queryClient.invalidateQueries({
        queryKey:
          campaignQueryKeys.lists(),
      });


      // ======================================================================
      // INVALIDATE WORKFLOW LIST
      // ======================================================================
      //
      // Processing created a new Workflow entity.
      //

      await queryClient.invalidateQueries({
        queryKey:
          workflowQueryKeys.lists(),
      });
    },
  });
}


export default useProcessCampaignWorkflow;