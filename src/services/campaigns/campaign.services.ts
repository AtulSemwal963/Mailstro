// src/services/campaigns/campaign.services.ts

import { apiClient } from '../api/client';

import type {
  CampaignStatsResponse,
  // existing imports...
} from './campaign.types';

import type {
  CancelCampaignPlanningResponse,
  CancelWorkflowExecutionResponse,
  CreateCampaignRequest,
  CreateCampaignResponse,
  DeleteCampaignLeadsRequest,
  DeleteCampaignLeadsResponse,
  DeleteCampaignResponse,
  GetCampaignPlanRunResponse,
  GetCampaignResponse,
  GetWorkflowExecutionItemResponse,
  GetWorkflowExecutionRunResponse,
  ImportCampaignLeadsResponse,
  ListCampaignLeadsResponse,
  ListCampaignPlanRunsResponse,
  ListCampaignsResponse,
  ListWorkflowExecutionRunsResponse,
  ProcessCampaignWorkflowResponse,
  StartCampaignPlanningRequest,
  StartCampaignPlanningResponse,
  StartWorkflowExecutionRequest,
  StartWorkflowExecutionResponse,
  UpdateCampaignLeadReportRequest,
  UpdateCampaignLeadReportResponse,
  UpdateCampaignRequest,
  UpdateCampaignResponse,
} from './campaign.types';


// ============================================================================
// CAMPAIGN SERVICE
// ============================================================================
//
// Frontend service layer for the Campaign domain.
//
// Responsibilities:
//
//   Campaign CRUD
//   CampaignLead ingestion/retrieval/deletion
//   CampaignLead report editing
//   Campaign planning
//   Campaign workflow processing
//   Campaign workflow execution preparation
//
// Architectural lifecycle:
//
//   1. Select source workflow
//   2. Plan Campaign
//        -> CampaignLead research/report data
//
//   3. Process Workflow
//        -> independent processed/template workflow
//        -> campaign.processed_workflow_id
//
//   4. Execute Workflow
//        -> backend reads campaign.processed_workflow_id
//        -> resolves selected CampaignLeads
//        -> expands workflow N x M
//        -> resolves {campaignLead.*} values
//        -> loads/materializes runtime workflow
//        -> returns execution-run state
//
// Execute Workflow does NOT mean "send/perform browser actions" from the
// frontend's perspective. The backend prepares the runtime workflow and
// hands it to the browser/extension execution boundary. The extension
// remains responsible for the actual user-triggered replay.
// ============================================================================

const CAMPAIGNS_ENDPOINT = '/campaigns';


// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function requireCampaignId(
  campaignId: string,
  message = 'Campaign ID is required.',
): string {
  const normalizedId = campaignId.trim();

  if (!normalizedId) {
    throw new Error(message);
  }

  return normalizedId;
}


function requireRunId(
  runId: string,
): string {
  const normalizedId = runId.trim();

  if (!normalizedId) {
    throw new Error(
      'Workflow execution run ID is required.',
    );
  }

  return normalizedId;
}


// ============================================================================
// CAMPAIGN SERVICE
// ============================================================================

export const campaignService = {

  // ========================================================================
  // CAMPAIGNS
  // ========================================================================

  async getCampaigns(): Promise<ListCampaignsResponse> {
    return apiClient.get<ListCampaignsResponse>(
      CAMPAIGNS_ENDPOINT,
    );
  },


  async getCampaign(
    campaignId: string,
  ): Promise<GetCampaignResponse> {
    const normalizedId = requireCampaignId(
      campaignId,
    );

    return apiClient.get<GetCampaignResponse>(
      `${CAMPAIGNS_ENDPOINT}/${encodeURIComponent(normalizedId)}`,
    );
  },


  async createCampaign(
    data: CreateCampaignRequest,
  ): Promise<CreateCampaignResponse> {
    return apiClient.post<CreateCampaignResponse>(
      CAMPAIGNS_ENDPOINT,
      data,
    );
  },


  async updateCampaign(
    campaignId: string,
    data: UpdateCampaignRequest,
  ): Promise<UpdateCampaignResponse> {
    const normalizedId = requireCampaignId(
      campaignId,
    );

    return apiClient.patch<UpdateCampaignResponse>(
      `${CAMPAIGNS_ENDPOINT}/${encodeURIComponent(normalizedId)}`,
      data,
    );
  },


  async deleteCampaign(
    campaignId: string,
  ): Promise<DeleteCampaignResponse> {
    const normalizedId = requireCampaignId(
      campaignId,
    );

    return apiClient.delete<DeleteCampaignResponse>(
      `${CAMPAIGNS_ENDPOINT}/${encodeURIComponent(normalizedId)}`,
    );
  },


  // ========================================================================
  // CAMPAIGN LEADS
  // ========================================================================

  async getCampaignLeads(
    campaignId: string,
  ): Promise<ListCampaignLeadsResponse> {
    const normalizedId = requireCampaignId(
      campaignId,
    );

    return apiClient.get<ListCampaignLeadsResponse>(
      `${CAMPAIGNS_ENDPOINT}/${encodeURIComponent(normalizedId)}/leads`,
    );
  },


  async importCampaignLeads(
    campaignId: string,
    file: File,
  ): Promise<ImportCampaignLeadsResponse> {
    const normalizedId = requireCampaignId(
      campaignId,
    );

    const formData = new FormData();

    formData.append(
      'file',
      file,
    );

    return apiClient.postForm<ImportCampaignLeadsResponse>(
      `${CAMPAIGNS_ENDPOINT}/${encodeURIComponent(normalizedId)}/leads/import`,
      formData,
    );
  },


  async deleteCampaignLeads(
    campaignId: string,
    data: DeleteCampaignLeadsRequest,
  ): Promise<DeleteCampaignLeadsResponse> {
    const normalizedId = requireCampaignId(
      campaignId,
    );

    return apiClient.post<DeleteCampaignLeadsResponse>(
      `${CAMPAIGNS_ENDPOINT}/${encodeURIComponent(normalizedId)}/leads/bulk-delete`,
      data,
    );
  },


  // ========================================================================
  // CAMPAIGN LEAD REPORT
  // ========================================================================

  async updateCampaignLeadReport(
    campaignId: string,
    campaignLeadId: number,
    data: UpdateCampaignLeadReportRequest,
  ): Promise<UpdateCampaignLeadReportResponse> {
    const normalizedId = requireCampaignId(
      campaignId,
    );

    if (
      !Number.isInteger(campaignLeadId)
      || campaignLeadId <= 0
    ) {
      throw new Error(
        'Campaign lead ID must be a positive integer.',
      );
    }

    return apiClient.patch<UpdateCampaignLeadReportResponse>(
      `${CAMPAIGNS_ENDPOINT}/${encodeURIComponent(normalizedId)}/leads/${campaignLeadId}/report`,
      data,
    );
  },

  // ============================================================================
// CAMPAIGN DASHBOARD STATS
// ============================================================================

async getCampaignStats(): Promise<CampaignStatsResponse> {
  return apiClient.get<CampaignStatsResponse>(
    `${CAMPAIGNS_ENDPOINT}/stats`,
  );
},

  // ========================================================================
  // CAMPAIGN PLANNING
  // ========================================================================
  //
  // POST /campaigns/{campaign_id}/plan
  //
  // campaign_lead_ids omitted:
  //     plan all CampaignLeads
  //
  // campaign_lead_ids supplied:
  //     plan only selected CampaignLeads
  //
  // Plan Campaign only creates the research/report state.
  //
  // It does NOT:
  //
  //     - process the workflow
  //     - expand the workflow
  //     - load anything into the extension
  //     - execute browser actions
  // ========================================================================

  async startCampaignPlanning(
    campaignId: string,
    data: StartCampaignPlanningRequest = {},
  ): Promise<StartCampaignPlanningResponse> {
    const normalizedId = requireCampaignId(
      campaignId,
      'Campaign ID is required to start planning.',
    );

    return apiClient.post<StartCampaignPlanningResponse>(
      `${CAMPAIGNS_ENDPOINT}/${encodeURIComponent(normalizedId)}/plan`,
      data,
    );
  },


  // ========================================================================
  // PROCESS CAMPAIGN WORKFLOW
  // ========================================================================
  //
  // POST /campaigns/{campaign_id}/process-workflow
  //
  // Reads:
  //
  //     campaign.workflow_id
  //     CampaignLead report state
  //
  // Produces:
  //
  //     independent processed/template workflow
  //
  // Persists:
  //
  //     campaign.processed_workflow_id
  //
  // The original source workflow remains independent.
  //
  // This operation does NOT execute the workflow.
  // ========================================================================

  async processCampaignWorkflow(
    campaignId: string,
  ): Promise<ProcessCampaignWorkflowResponse> {
    const normalizedId = requireCampaignId(
      campaignId,
      'Campaign ID is required to process the workflow.',
    );

    return apiClient.post<ProcessCampaignWorkflowResponse>(
      `${CAMPAIGNS_ENDPOINT}/${encodeURIComponent(normalizedId)}/process-workflow`,
      {},
    );
  },


  // ========================================================================
  // WORKFLOW EXECUTION
  // ========================================================================
  //
  // Execute Workflow is intentionally campaign-scoped.
  //
  // The frontend does NOT provide workflow_id.
  //
  // Backend resolves:
  //
  //     campaign.processed_workflow_id
  //
  // Then:
  //
  //     processed workflow
  //          +
  //     selected CampaignLeads
  //          |
  //          v
  //     template resolution
  //          |
  //          v
  //     NxM runtime workflow
  //          |
  //          v
  //     browser/extension load boundary
  //
  // The extension subsequently performs the actual user-triggered replay.
  // ========================================================================


  async startWorkflowExecution(
    campaignId: string,
    data: StartWorkflowExecutionRequest = {},
  ): Promise<StartWorkflowExecutionResponse> {
    const normalizedId = requireCampaignId(
      campaignId,
      'Campaign ID is required to execute the workflow.',
    );

    return apiClient.post<StartWorkflowExecutionResponse>(
      `${CAMPAIGNS_ENDPOINT}/${encodeURIComponent(normalizedId)}/execute-workflow`,
      data,
    );
  },


  // ========================================================================
  // WORKFLOW EXECUTION RUNS - LIST
  // ========================================================================

  async getWorkflowExecutionRuns(
    campaignId: string,
  ): Promise<ListWorkflowExecutionRunsResponse> {
    const normalizedId = requireCampaignId(
      campaignId,
    );

    return apiClient.get<ListWorkflowExecutionRunsResponse>(
      `${CAMPAIGNS_ENDPOINT}/${encodeURIComponent(normalizedId)}/workflow-executions`,
    );
  },


  // ========================================================================
  // WORKFLOW EXECUTION RUN - GET
  // ========================================================================

  async getWorkflowExecutionRun(
    campaignId: string,
    executionRunId: string,
  ): Promise<GetWorkflowExecutionRunResponse> {
    const normalizedCampaignId = requireCampaignId(
      campaignId,
    );

    const normalizedRunId = requireRunId(
      executionRunId,
    );

    return apiClient.get<GetWorkflowExecutionRunResponse>(
      `${CAMPAIGNS_ENDPOINT}/${encodeURIComponent(normalizedCampaignId)}/workflow-executions/${encodeURIComponent(normalizedRunId)}`,
    );
  },


  // ========================================================================
  // WORKFLOW EXECUTION ITEM - GET
  // ========================================================================

  async getWorkflowExecutionItem(
    campaignId: string,
    executionItemId: number,
  ): Promise<GetWorkflowExecutionItemResponse> {
    const normalizedCampaignId = requireCampaignId(
      campaignId,
    );

    if (
      !Number.isInteger(executionItemId)
      || executionItemId <= 0
    ) {
      throw new Error(
        'Workflow execution item ID must be a positive integer.',
      );
    }

    return apiClient.get<GetWorkflowExecutionItemResponse>(
      `${CAMPAIGNS_ENDPOINT}/${encodeURIComponent(normalizedCampaignId)}/workflow-executions/items/${executionItemId}`,
    );
  },


  // ========================================================================
  // WORKFLOW EXECUTION - CANCEL
  // ========================================================================

  async cancelWorkflowExecution(
    campaignId: string,
    executionRunId: string,
  ): Promise<CancelWorkflowExecutionResponse> {
    const normalizedCampaignId = requireCampaignId(
      campaignId,
    );

    const normalizedRunId = requireRunId(
      executionRunId,
    );

    return apiClient.post<CancelWorkflowExecutionResponse>(
      `${CAMPAIGNS_ENDPOINT}/${encodeURIComponent(normalizedCampaignId)}/workflow-executions/${encodeURIComponent(normalizedRunId)}/cancel`,
      {},
    );
  },


  // ========================================================================
  // PLAN RUNS - LIST
  // ========================================================================

  async getCampaignPlanRuns(
    campaignId: string,
  ): Promise<ListCampaignPlanRunsResponse> {
    const normalizedId = requireCampaignId(
      campaignId,
    );

    return apiClient.get<ListCampaignPlanRunsResponse>(
      `${CAMPAIGNS_ENDPOINT}/${encodeURIComponent(normalizedId)}/plan-runs`,
    );
  },


  // ========================================================================
  // PLAN RUN - GET
  // ========================================================================

  async getCampaignPlanRun(
    campaignId: string,
    planRunId: string,
  ): Promise<GetCampaignPlanRunResponse> {
    const normalizedCampaignId = requireCampaignId(
      campaignId,
    );

    const normalizedPlanRunId = planRunId.trim();

    if (!normalizedPlanRunId) {
      throw new Error(
        'Plan run ID is required.',
      );
    }

    return apiClient.get<GetCampaignPlanRunResponse>(
      `${CAMPAIGNS_ENDPOINT}/${encodeURIComponent(normalizedCampaignId)}/plan-runs/${encodeURIComponent(normalizedPlanRunId)}`,
    );
  },


  // ========================================================================
  // PLAN RUN - CANCEL
  // ========================================================================

  async cancelCampaignPlanning(
    campaignId: string,
    planRunId: string,
  ): Promise<CancelCampaignPlanningResponse> {
    const normalizedCampaignId = requireCampaignId(
      campaignId,
    );

    const normalizedPlanRunId = planRunId.trim();

    if (!normalizedPlanRunId) {
      throw new Error(
        'Plan run ID is required.',
      );
    }

    return apiClient.post<CancelCampaignPlanningResponse>(
      `${CAMPAIGNS_ENDPOINT}/${encodeURIComponent(normalizedCampaignId)}/plan-runs/${encodeURIComponent(normalizedPlanRunId)}/cancel`,
      {},
    );
  },
};


// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default campaignService;