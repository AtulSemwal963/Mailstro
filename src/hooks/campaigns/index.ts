// ============================================================================
// CAMPAIGN QUERIES
// ============================================================================

export {
  useCampaigns,
} from './useCampaigns';

export {
  useCampaignStats,
} from './useCampaignStats';

export {
  useCampaign,
} from './useCampaign';

export {
  useCampaignLeads,
} from './useCampaignLeads';

export {
  useCampaignPlanRun,
} from './useCampaignPlanRun';

export type {
  UseCampaignPlanRunOptions,
} from './useCampaignPlanRun';


// ============================================================================
// CAMPAIGN MUTATIONS
// ============================================================================

export {
  useCreateCampaign,
} from './useCreateCampaign';

export {
  useUpdateCampaign,
} from './useUpdateCampaign';

export {
  useDeleteCampaign,
} from './useDeleteCampaign';

export {
  useImportCampaignLeads,
} from './useImportCampaignLeads';

export type {
  ImportCampaignLeadsVariables,
} from './useImportCampaignLeads';

export {
  useDeleteCampaignLeads,
} from './useDeleteCampaignLeads';

export type {
  DeleteCampaignLeadsVariables,
} from './useDeleteCampaignLeads';

export {
  useStartCampaignPlanning,
} from './useStartCampaignPlanning';

export type {
  StartCampaignPlanningVariables,
} from './useStartCampaignPlanning';

export {
  useCancelCampaignPlanning,
} from './useCancelCampaignPlanning';

export type {
  CancelCampaignPlanningVariables,
} from './useCancelCampaignPlanning';

export {
  useUpdateCampaignLeadReport,
} from './useUpdateCampaignLeadReport';

export type {
  UpdateCampaignLeadReportVariables,
} from './useUpdateCampaignLeadReport';


// ============================================================================
// PROCESS WORKFLOW
// ============================================================================

export {
  useProcessCampaignWorkflow,
} from './useProcessCampaignWorkflow.ts';

export type {
  ProcessCampaignWorkflowVariables,
} from './useProcessCampaignWorkflow.ts';

export {
  useStartWorkflowExecution,
} from './useStartWorkflowExecution.ts';

export type {
  StartWorkflowExecutionVariables,
} from './useStartWorkflowExecution.ts';


// ============================================================================
// QUERY KEYS
// ============================================================================

export {
  campaignQueryKeys,
} from './keys';