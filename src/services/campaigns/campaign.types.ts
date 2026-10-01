// src/services/campaigns/campaign.types.ts

import type {
  Workflow,
} from '../workflows/workflow.types';


// ============================================================================
// CAMPAIGN STATUS
// ============================================================================

export type CampaignStatus =
  | 'active'
  | 'draft'
  | 'archived';


// ============================================================================
// WORKFLOW PROCESSING STATUS
// ============================================================================

export type WorkflowProcessingStatus =
  | 'NOT_PROCESSED'
  | 'PROCESSING'
  | 'PROCESSED'
  | 'FAILED';


// ============================================================================
// CAMPAIGN AI CONTEXT
// ============================================================================

export interface CampaignContextMetadata {
  version: number | null;

  updated_at: string | null;
}


// ============================================================================
// CAMPAIGN
// ============================================================================

export interface Campaign {
  id: string;

  name: string;

  description: string | null;

  instructions: string | null;

  // --------------------------------------------------------------------------
  // SOURCE WORKFLOW
  // --------------------------------------------------------------------------
  //
  // Original user-selected workflow.
  //
  // This remains the canonical source workflow and is not replaced when
  // Process Workflow completes.
  // --------------------------------------------------------------------------

  workflow_id: string | null;

  // --------------------------------------------------------------------------
  // PROCESSED WORKFLOW
  // --------------------------------------------------------------------------
  //
  // Campaign-specific processed/template workflow generated from workflow_id.
  //
  // This is the workflow consumed by Execute Workflow.
  // --------------------------------------------------------------------------

  processed_workflow_id: string | null;

  workflow_processing_status: WorkflowProcessingStatus;

  workflow_processing_error: string | null;

  workflow_processed_at: string | null;

  workflow_source_version: number | null;

  // --------------------------------------------------------------------------
  // CAMPAIGN STATUS
  // --------------------------------------------------------------------------

  status: CampaignStatus;

  // --------------------------------------------------------------------------
  // CAMPAIGN AI CONTEXT
  // --------------------------------------------------------------------------

  planning_context: CampaignContextMetadata | null;

  // --------------------------------------------------------------------------
  // EXECUTION
  // --------------------------------------------------------------------------

  last_executed_at: string | null;

  // --------------------------------------------------------------------------
  // TIMESTAMPS
  // --------------------------------------------------------------------------

  created_at: string;

  updated_at: string;
}


// ============================================================================
// CREATE
// ============================================================================

export interface CreateCampaignRequest {
  name: string;

  description?: string | null;

  instructions?: string | null;

  workflow_id?: string | null;

  status?: CampaignStatus;
}


// ============================================================================
// UPDATE
// ============================================================================

export interface UpdateCampaignRequest {
  name?: string;

  description?: string | null;

  instructions?: string | null;

  workflow_id?: string | null;

  status?: CampaignStatus;
}


// ============================================================================
// CAMPAIGN LEAD STATUS
// ============================================================================

export type CampaignLeadStatus =
  | 'INGESTED'
  | 'PLANNING'
  | 'PLANNED'
  | 'FAILED';


// ============================================================================
// CAMPAIGN LEAD
// ============================================================================

export interface CampaignLead {
  // --------------------------------------------------------------------------
  // Campaign-lead identity
  // --------------------------------------------------------------------------

  id: number;

  campaign_id: string;

  lead_id: number;

  // --------------------------------------------------------------------------
  // Canonical lead data
  // --------------------------------------------------------------------------

  email: string | null;

  linkedin_url: string | null;

  website: string | null;

  company: string | null;

  name: string | null;

  linkedin_text: string | null;

  lead_status: string;

  // --------------------------------------------------------------------------
  // Campaign-specific research/report
  // --------------------------------------------------------------------------

  linkedin_evidence: string | null;

  website_evidence: string | null;

  overall_evidence: string | null;

  outreach_angle: string | null;

  // --------------------------------------------------------------------------
  // Generated email
  // --------------------------------------------------------------------------

  email_subject: string | null;

  email_body: string | null;

  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------

  status: CampaignLeadStatus;

  // --------------------------------------------------------------------------
  // Timestamps
  // --------------------------------------------------------------------------

  created_at: string;

  updated_at: string;
}


// ============================================================================
// CAMPAIGN LEADS - LIST
// ============================================================================

export interface ListCampaignLeadsResponse {
  success: boolean;

  campaign_id: string;

  leads: CampaignLead[];

  total: number;
}


// ============================================================================
// CAMPAIGN LEADS - IMPORT
// ============================================================================

export interface CampaignLeadImportError {
  row: number;

  message: string;
}

export interface ImportCampaignLeadsResponse {
  success: boolean;

  campaign_id: string;

  imported_count: number;

  skipped_count: number;

  failed_count: number;

  leads: CampaignLead[];

  errors: CampaignLeadImportError[];
}


// ============================================================================
// CAMPAIGN LEADS - BULK DELETE
// ============================================================================

export interface DeleteCampaignLeadsRequest {
  campaign_lead_ids: number[];
}

export interface DeleteCampaignLeadsResponse {
  success: boolean;

  campaign_id: string;

  deleted_count: number;
}


// ============================================================================
// CAMPAIGN LEAD - MANUAL REPORT UPDATE
// ============================================================================

export interface UpdateCampaignLeadReportRequest {
  linkedin_evidence?: string | null;

  website_evidence?: string | null;

  overall_evidence?: string | null;

  outreach_angle?: string | null;

  email_subject?: string | null;

  email_body?: string | null;
}

export interface UpdateCampaignLeadReportResponse {
  success: boolean;

  campaign_id: string;

  campaign_lead_id: number;

  lead: CampaignLead;
}


// ============================================================================
// CAMPAIGN PLAN RUN
// ============================================================================

export type CampaignPlanRunStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface CampaignPlanRun {
  id: string;

  campaign_id: string;

  status: CampaignPlanRunStatus;

  requested_count: number;

  completed_count: number;

  failed_count: number;

  remaining_count: number;

  error: string | null;

  started_at: string | null;

  completed_at: string | null;

  created_at: string;

  updated_at: string;
}


// ============================================================================
// CAMPAIGN PLAN RUN ITEM
// ============================================================================

export type CampaignPlanRunItemStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface CampaignPlanRunItem {
  id: number;

  plan_run_id: string;

  campaign_lead_id: number;

  status: CampaignPlanRunItemStatus;

  current_stage: string | null;

  error: string | null;

  started_at: string | null;

  completed_at: string | null;

  created_at: string;

  updated_at: string;
}


// ============================================================================
// START CAMPAIGN PLANNING
// ============================================================================

export interface StartCampaignPlanningRequest {
  /**
   * Omit or leave undefined to plan all CampaignLeads.
   *
   * Supply IDs to plan only selected CampaignLeads.
   */
  campaign_lead_ids?: number[];
}

export interface StartCampaignPlanningResponse {
  success: boolean;

  campaign_id: string;

  plan_run: CampaignPlanRun;
}


// ============================================================================
// GET CAMPAIGN PLAN RUN
// ============================================================================

export interface GetCampaignPlanRunResponse {
  success: boolean;

  campaign_id: string;

  plan_run: CampaignPlanRun;

  items: CampaignPlanRunItem[];
}


// ============================================================================
// LIST CAMPAIGN PLAN RUNS
// ============================================================================

export interface ListCampaignPlanRunsResponse {
  success: boolean;

  campaign_id: string;

  runs: CampaignPlanRun[];
}


// ============================================================================
// CANCEL CAMPAIGN PLANNING
// ============================================================================

export interface CancelCampaignPlanningResponse {
  success: boolean;

  campaign_id: string;

  plan_run: CampaignPlanRun;
}


// ============================================================================
// PROCESS CAMPAIGN WORKFLOW
// ============================================================================
//
// Process Workflow:
//
//     campaign.workflow_id
//          +
//     CampaignLead report state
//          |
//          v
//     independent processed Workflow
//
// The source workflow remains unchanged.
//
// The resulting processed workflow is stored separately in
// campaign.processed_workflow_id.
//
// Execute Workflow later consumes:
//     campaign.processed_workflow_id
//
// ============================================================================

export interface ProcessCampaignWorkflowResponse {
  success: boolean;

  campaign_id: string;

  /*
   * Original workflow used as the processing source.
   */
  source_workflow_id: string;

  /*
   * Newly created campaign-specific processed workflow.
   */
  processed_workflow_id: string;

  /*
   * Complete processed workflow.
   */
  workflow: Workflow;
}


// ============================================================================
// WORKFLOW EXECUTION STATUS
// ============================================================================

export type WorkflowExecutionStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'COMPLETED_WITH_ERRORS'
  | 'FAILED'
  | 'CANCELLED';

export type WorkflowExecutionItemStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type WorkflowExecutionStage =
  | 'TEMPLATE_RESOLUTION'
  | 'ACTION_EXECUTION';

export type WorkflowExecutionSelectionMode =
  | 'ALL'
  | 'SELECTED';


// ============================================================================
// START WORKFLOW EXECUTION
// ============================================================================
//
// The request intentionally does NOT contain workflow_id.
//
// Backend resolution:
//
//     campaign
//         |
//         +-- processed_workflow_id
//         |
//         +-- selected CampaignLead IDs
//         |
//         v
//     workflow expansion
//         |
//         v
//     template resolution
//         |
//         v
//     runtime workflow
//
// campaign_lead_ids omitted/null:
//     execute for all campaign leads
//
// campaign_lead_ids supplied:
//     execute only selected campaign leads
//
// ============================================================================

export interface StartWorkflowExecutionRequest {
  campaign_lead_ids?: number[] | null;
}


// ============================================================================
// WORKFLOW EXECUTION RUN
// ============================================================================

export interface WorkflowExecutionRun {
  id: string;

  campaign_id: string;

  /*
   * Persisted processed/template workflow.
   */
  workflow_id: string;

  /*
   * Temporary runtime workflow created during execution preparation.
   *
   * This may be null before runtime materialization.
   */
  runtime_workflow_id: string | null;

  selection_mode: WorkflowExecutionSelectionMode;

  status: WorkflowExecutionStatus;

  // --------------------------------------------------------------------------
  // CampaignLead aggregate progress
  // --------------------------------------------------------------------------

  requested_count: number;

  completed_count: number;

  failed_count: number;

  cancelled_count: number;

  remaining_count: number;

  // --------------------------------------------------------------------------
  // Runtime materialization
  // --------------------------------------------------------------------------

  /*
   * Number of concrete actions in the flattened runtime workflow.
   *
   * Example:
   *
   *     workflow = 5 actions
   *     leads    = 5
   *
   *     materialized_action_count = 25
   */
  materialized_action_count: number;

  // --------------------------------------------------------------------------
  // Error / lifecycle
  // --------------------------------------------------------------------------

  error: string | null;

  started_at: string | null;

  completed_at: string | null;

  created_at: string;

  updated_at: string;
}


// ============================================================================
// WORKFLOW EXECUTION ITEM
// ============================================================================

export interface WorkflowExecutionItem {
  id: number;

  execution_run_id: string;

  campaign_id: string;

  campaign_lead_id: number;

  /*
   * Persisted processed/template workflow.
   */
  workflow_id: string;

  /*
   * Temporary runtime workflow containing the flattened sequence.
   */
  runtime_workflow_id: string | null;

  status: WorkflowExecutionItemStatus;

  current_stage: WorkflowExecutionStage | null;

  /*
   * Global action sequence inside the temporary runtime workflow.
   */
  current_action_sequence: number | null;

  /*
   * Start of this CampaignLead's contiguous runtime segment.
   */
  runtime_action_start_sequence: number | null;

  /*
   * End of this CampaignLead's contiguous runtime segment.
   */
  runtime_action_end_sequence: number | null;

  /*
   * Number of actions belonging to this CampaignLead's resolved workflow.
   */
  total_action_count: number;

  completed_action_count: number;

  error: string | null;

  started_at: string | null;

  completed_at: string | null;

  created_at: string;

  updated_at: string;
}


// ============================================================================
// START WORKFLOW EXECUTION RESPONSE
// ============================================================================

export interface StartWorkflowExecutionResponse {
  success: boolean;

  campaign_id: string;

  /*
   * Persisted processed/template workflow.
   */
  workflow_id: string;

  /*
   * Temporary materialized runtime workflow.
   */
  runtime_workflow_id: string | null;

  selection_mode: WorkflowExecutionSelectionMode;

  materialized_action_count: number;

  execution_run: WorkflowExecutionRun;

  items: WorkflowExecutionItem[];
}


// ============================================================================
// GET WORKFLOW EXECUTION RUN
// ============================================================================

export interface GetWorkflowExecutionRunResponse {
  success: boolean;

  campaign_id: string;

  execution_run: WorkflowExecutionRun;

  items: WorkflowExecutionItem[];
}


// ============================================================================
// LIST WORKFLOW EXECUTION RUNS
// ============================================================================

export interface ListWorkflowExecutionRunsResponse {
  success: boolean;

  campaign_id: string;

  runs: WorkflowExecutionRun[];
}


// ============================================================================
// GET WORKFLOW EXECUTION ITEM
// ============================================================================

export interface GetWorkflowExecutionItemResponse {
  success: boolean;

  campaign_id: string;

  execution_run_id: string;

  item: WorkflowExecutionItem;
}


// ============================================================================
// CANCEL WORKFLOW EXECUTION
// ============================================================================

export interface CancelWorkflowExecutionResponse {
  success: boolean;

  campaign_id: string;

  execution_run: WorkflowExecutionRun;
}


// ============================================================================
// WORKFLOW EXECUTION PROGRESS
// ============================================================================

export interface WorkflowExecutionProgressResponse {
  success: boolean;

  campaign_id: string;

  execution_run_id: string;

  status: WorkflowExecutionStatus;

  requested_count: number;

  completed_count: number;

  failed_count: number;

  cancelled_count: number;

  remaining_count: number;

  progress_percent: number;
}


// ============================================================================
// WORKFLOW EXECUTION SUMMARY
// ============================================================================

export interface WorkflowExecutionSummaryResponse {
  id: string;

  campaign_id: string;

  workflow_id: string;

  runtime_workflow_id: string | null;

  selection_mode: WorkflowExecutionSelectionMode;

  status: WorkflowExecutionStatus;

  requested_count: number;

  completed_count: number;

  failed_count: number;

  cancelled_count: number;

  remaining_count: number;

  materialized_action_count: number;

  started_at: string | null;

  completed_at: string | null;

  created_at: string;

  updated_at: string;
}

// ============================================================================
// CAMPAIGN DASHBOARD STATS
// ============================================================================

export interface CampaignStatsResponse {
  success: boolean;

  /**
   * Total number of mails successfully sent.
   *
   * This value is supplied by the backend statistics endpoint.
   */
  total_mails_sent: number;

  /**
   * Total number of campaigns owned by the current user.
   */
  total_campaigns: number;

  /**
   * Total number of CampaignLead associations across all campaigns.
   */
  total_leads: number;
}

// ============================================================================
// CAMPAIGN CRUD RESPONSES
// ============================================================================

export interface CreateCampaignResponse {
  success: boolean;

  campaign: Campaign;
}

export interface GetCampaignResponse {
  success: boolean;

  campaign: Campaign;
}

export interface ListCampaignsResponse {
  success: boolean;

  campaigns: Campaign[];
}

export interface UpdateCampaignResponse {
  success: boolean;

  campaign: Campaign;
}

export interface DeleteCampaignResponse {
  success: boolean;

  campaign_id: string;
}