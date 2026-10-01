// src/services/workflows/workflow.services.ts

import { apiClient } from '../api/client';

import type {
  ClearLoadedWorkflowResponse,
  CreateWorkflowRequest,
  DeleteWorkflowResponse,
  GetLoadedWorkflowResponse,
  LoadWorkflowResponse,
  UpdateWorkflowRequest,
  WorkflowListResponse,
  WorkflowResponse,
} from './workflow.types';


// ============================================================================
// WORKFLOW SERVICE
// ============================================================================
//
// Frontend service layer for the Workflow domain.
//
// Responsibilities:
//   - communicate with FastAPI workflow endpoints
//   - keep HTTP details out of React components/hooks
//   - expose workflow CRUD operations
//   - expose loaded-workflow selection operations
//
// TanStack Query hooks consume this service.
//
// IMPORTANT:
//
// Process Workflow is NOT implemented here.
//
// Process Workflow is a campaign-level operation because it consumes:
//
//     Campaign
//         +
//     CampaignLead report outputs
//         +
//     Campaign.workflow_id
//
// and creates/reassigns the campaign's processed workflow.
//
// Therefore:
//
//     campaignService.processCampaignWorkflow()
//
// owns the processing operation.
//
// This service only manages generic Workflow entities.
//
// "Loaded workflow" means:
//
//     the workflow currently selected for browser replay.
//
// Loading a workflow does NOT execute it.
// ============================================================================

const WORKFLOWS_ENDPOINT = '/workflows';


export const workflowService = {

  // ========================================================================
  // GET ALL WORKFLOWS
  // ========================================================================

  async getWorkflows(): Promise<WorkflowListResponse> {
    return apiClient.get<WorkflowListResponse>(
      WORKFLOWS_ENDPOINT,
    );
  },


  // ========================================================================
  // GET WORKFLOW BY ID
  // ========================================================================

  async getWorkflow(
    workflowId: string,
  ): Promise<WorkflowResponse> {
    const normalizedId =
      workflowId.trim();

    if (!normalizedId) {
      throw new Error(
        'Workflow ID is required.',
      );
    }

    return apiClient.get<WorkflowResponse>(
      `${WORKFLOWS_ENDPOINT}/${encodeURIComponent(normalizedId)}`,
    );
  },


  // ========================================================================
  // CREATE WORKFLOW
  // ========================================================================
  //
  // Used for ordinary workflow creation, including workflows received from
  // the Chrome extension.
  //
  // Processed campaign workflows are created by the campaign-level backend
  // Process Workflow operation and therefore do not need to be created
  // manually through this method.
  // ========================================================================

  async createWorkflow(
    data: CreateWorkflowRequest,
  ): Promise<WorkflowResponse> {
    return apiClient.post<WorkflowResponse>(
      WORKFLOWS_ENDPOINT,
      data,
    );
  },


  // ========================================================================
  // UPDATE WORKFLOW
  // ========================================================================

  async updateWorkflow(
    workflowId: string,
    data: UpdateWorkflowRequest,
  ): Promise<WorkflowResponse> {
    const normalizedId =
      workflowId.trim();

    if (!normalizedId) {
      throw new Error(
        'Workflow ID is required.',
      );
    }

    return apiClient.patch<WorkflowResponse>(
      `${WORKFLOWS_ENDPOINT}/${encodeURIComponent(normalizedId)}`,
      data,
    );
  },


  // ========================================================================
  // DELETE WORKFLOW
  // ========================================================================

  async deleteWorkflow(
    workflowId: string,
  ): Promise<DeleteWorkflowResponse> {
    const normalizedId =
      workflowId.trim();

    if (!normalizedId) {
      throw new Error(
        'Workflow ID is required.',
      );
    }

    return apiClient.delete<DeleteWorkflowResponse>(
      `${WORKFLOWS_ENDPOINT}/${encodeURIComponent(normalizedId)}`,
    );
  },


  // ========================================================================
  // LOAD WORKFLOW
  // ========================================================================
  //
  // POST /workflows/{workflow_id}/load
  //
  // This changes the backend's persistent replay selection.
  //
  // It does NOT:
  //   - execute the workflow
  //   - increment execution_count
  //   - change last_executed_at
  //   - modify workflow actions
  // ========================================================================

  async loadWorkflow(
    workflowId: string,
  ): Promise<LoadWorkflowResponse> {
    const normalizedId =
      workflowId.trim();

    if (!normalizedId) {
      throw new Error(
        'Workflow ID is required.',
      );
    }

    return apiClient.post<LoadWorkflowResponse>(
      `${WORKFLOWS_ENDPOINT}/${encodeURIComponent(normalizedId)}/load`,
    );
  },


  // ========================================================================
  // GET CURRENTLY LOADED WORKFLOW
  // ========================================================================
  //
  // GET /workflows/loaded
  //
  // Returns:
  //
  //     {
  //       success: true,
  //       workflow: Workflow | null
  //     }
  //
  // `workflow: null` is a valid state.
  // ========================================================================

  async getLoadedWorkflow(): Promise<GetLoadedWorkflowResponse> {
    return apiClient.get<GetLoadedWorkflowResponse>(
      `${WORKFLOWS_ENDPOINT}/loaded`,
    );
  },


  // ========================================================================
  // CLEAR CURRENTLY LOADED WORKFLOW
  // ========================================================================
  //
  // DELETE /workflows/loaded
  //
  // This clears the replay selection.
  //
  // It does NOT delete the underlying workflow.
  // ========================================================================

  async clearLoadedWorkflow(): Promise<ClearLoadedWorkflowResponse> {
    return apiClient.delete<ClearLoadedWorkflowResponse>(
      `${WORKFLOWS_ENDPOINT}/loaded`,
    );
  },
};


// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default workflowService;