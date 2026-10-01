// src/services/workflows/workflow.types.ts


// ============================================================================
// WORKFLOW ACTION TARGET
// ============================================================================

export interface WorkflowActionTarget {
  tag?: string | null;

  id?: string | null;

  name?: string | null;

  text?: string | null;

  ariaLabel?: string | null;

  role?: string | null;

  contentEditable?: boolean;

  selector?: string | null;

  dataAttributes?: Array<{
    name: string;
    value: string;
  }>;

  editor?: {
    type: string;
    ariaLabel?: string | null;
    role?: string | null;
    tag?: string | null;
  };

  /*
   * The Chrome extension owns the target descriptor structure.
   *
   * Preserve unknown target properties so the backend/extension can evolve
   * without requiring the frontend workflow types to be rewritten for every
   * new target field.
   */
  [key: string]: unknown;
}


// ============================================================================
// WORKFLOW ACTION
// ============================================================================

export interface WorkflowAction {
  id: string;

  sequence: number;

  type: string;

  target: WorkflowActionTarget | null;

  value: string | null;

  key: string | null;

  url: string | null;

  timestamp: number | null;

  created_at: string;
}


// ============================================================================
// WORKFLOW STATUS
// ============================================================================

export type WorkflowStatus =
  | 'active'
  | 'draft'
  | 'archived';


// ============================================================================
// WORKFLOW SOURCE
// ============================================================================

export type WorkflowSource =
  | 'extension';


// ============================================================================
// WORKFLOW
// ============================================================================
//
// A Workflow can represent:
//
//     1. the original workflow recorded through the Chrome extension
//     2. a processed workflow generated from a campaign
//
// Processed workflows are still ordinary Workflow entities. The backend
// creates them as independent workflows and then points Campaign.workflow_id
// at the processed workflow.
//
// Therefore the frontend does not need a separate ProcessedWorkflow entity.
// ============================================================================

export interface Workflow {
  id: string;

  title: string;

  description: string | null;

  status: WorkflowStatus;

  tags: string[];

  /*
   * Complete workflow responses contain the executable action sequence.
   */
  actions: WorkflowAction[];

  steps_count: number;

  execution_count: number;

  last_executed_at: string | null;

  source: WorkflowSource;

  version: number;

  created_at: string;

  updated_at: string;
}


// ============================================================================
// WORKFLOW SUMMARY
// ============================================================================
//
// GET /workflows intentionally returns metadata only.
// Actions are omitted from the list response.
//
// This applies equally to original and processed workflows because both are
// persisted as ordinary Workflow records.
// ============================================================================

export interface WorkflowSummary {
  id: string;

  title: string;

  description: string | null;

  status: WorkflowStatus;

  tags: string[];

  steps_count: number;

  execution_count: number;

  last_executed_at: string | null;

  source: WorkflowSource;

  version: number;

  created_at: string;

  updated_at: string;
}


// ============================================================================
// CREATE WORKFLOW ACTION
// ============================================================================

export interface CreateWorkflowActionRequest {
  type: string;

  target?: WorkflowActionTarget | null;

  value?: string | null;

  key?: string | null;

  url?: string | null;

  timestamp?: number | null;
}


// ============================================================================
// CREATE WORKFLOW
// ============================================================================

export interface CreateWorkflowRequest {
  title: string;

  description?: string | null;

  status?: WorkflowStatus;

  tags?: string[];

  actions: CreateWorkflowActionRequest[];
}


// ============================================================================
// UPDATE WORKFLOW
// ============================================================================

export interface UpdateWorkflowRequest {
  title?: string;

  description?: string | null;

  status?: WorkflowStatus;

  tags?: string[];
}


// ============================================================================
// WORKFLOW LIST RESPONSE
// ============================================================================

export interface WorkflowListResponse {
  success: boolean;

  workflows: WorkflowSummary[];
}


// ============================================================================
// COMPLETE WORKFLOW RESPONSE
// ============================================================================
//
// GET /workflows/{workflowId}
// ============================================================================

export interface WorkflowResponse {
  success: boolean;

  workflow: Workflow;
}


// ============================================================================
// LOAD WORKFLOW RESPONSE
// ============================================================================
//
// POST /workflows/{workflowId}/load
//
// Loading selects the workflow for browser replay.
// It does not execute the workflow.
// ============================================================================

export interface LoadWorkflowResponse {
  success: boolean;

  workflow: Workflow;
}


// ============================================================================
// GET LOADED WORKFLOW RESPONSE
// ============================================================================
//
// GET /workflows/loaded
//
// `workflow` is null when there is no current selection.
// ============================================================================

export interface GetLoadedWorkflowResponse {
  success: boolean;

  workflow: Workflow | null;
}


// ============================================================================
// CLEAR LOADED WORKFLOW RESPONSE
// ============================================================================
//
// DELETE /workflows/loaded
// ============================================================================

export interface ClearLoadedWorkflowResponse {
  success: boolean;

  workflow_id: string | null;
}


// ============================================================================
// DELETE WORKFLOW RESPONSE
// ============================================================================

export interface DeleteWorkflowResponse {
  success: boolean;

  message?: string;

  workflow_id?: string;
}