// src/hooks/campaigns/keys.ts

// ============================================================================
// CAMPAIGN QUERY KEYS
// ============================================================================
//
// Centralized TanStack Query keys for the Campaign domain.
//
// These keys scope:
//
//   - dashboard statistics
//   - campaign lists
//   - individual campaigns
//   - campaign leads
//   - campaign planning runs
//   - individual planning runs
//
// Process Workflow does not require a separate persistent query cache of its
// own because it is a mutation.
//
// ============================================================================

export const campaignQueryKeys = {

  // ==========================================================================
  // ROOT
  // ==========================================================================

  all: ['campaigns'] as const,


  // ==========================================================================
  // DASHBOARD STATS
  // ==========================================================================
  //
  // GET /campaigns/stats
  //
  // This intentionally has its own cache entry rather than sharing the
  // campaign-list cache because the statistics are an aggregate dashboard
  // resource.
  //

  stats: () =>
    [
      ...campaignQueryKeys.all,
      'stats',
    ] as const,


  // ==========================================================================
  // CAMPAIGN LIST
  // ==========================================================================

  lists: () =>
    [
      ...campaignQueryKeys.all,
      'list',
    ] as const,

  list: () =>
    [
      ...campaignQueryKeys.lists(),
    ] as const,


  // ==========================================================================
  // CAMPAIGN DETAIL
  // ==========================================================================

  details: () =>
    [
      ...campaignQueryKeys.all,
      'detail',
    ] as const,

  detail: (
    campaignId: string,
  ) =>
    [
      ...campaignQueryKeys.details(),
      campaignId,
    ] as const,


  // ==========================================================================
  // CAMPAIGN LEADS
  // ==========================================================================

  leads: () =>
    [
      ...campaignQueryKeys.all,
      'leads',
    ] as const,

  campaignLeads: (
    campaignId: string,
  ) =>
    [
      ...campaignQueryKeys.leads(),
      campaignId,
    ] as const,


  // ==========================================================================
  // CAMPAIGN PLAN RUNS
  // ==========================================================================

  planRuns: () =>
    [
      ...campaignQueryKeys.all,
      'plan-runs',
    ] as const,

  campaignPlanRuns: (
    campaignId: string,
  ) =>
    [
      ...campaignQueryKeys.planRuns(),
      campaignId,
    ] as const,


  // ==========================================================================
  // INDIVIDUAL PLAN RUN
  // ==========================================================================

  planRun: (
    campaignId: string,
    planRunId: string,
  ) =>
    [
      ...campaignQueryKeys.campaignPlanRuns(
        campaignId,
      ),
      planRunId,
    ] as const,
};


// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default campaignQueryKeys;