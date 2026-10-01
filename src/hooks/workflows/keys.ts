// src/hooks/workflows/keys.ts

// ============================================================================
// WORKFLOW QUERY KEYS
// ============================================================================
//
// Centralized TanStack Query keys for the Workflow domain.
//
// These keys cover:
//
//   - workflow collection
//   - individual workflow details
//   - currently loaded workflow
//
// Process Workflow does not introduce a separate query key.
//
// It is a campaign-level mutation:
//
//     POST /campaigns/{campaign_id}/process-workflow
//
// The mutation creates a normal Workflow entity and the frontend therefore
// refreshes the existing:
//
//     workflow list
//     workflow detail
//
// caches rather than maintaining a separate "processed workflow" cache.
//
// ============================================================================

export const workflowQueryKeys = {

  // ==========================================================================
  // ROOT
  // ==========================================================================

  all: [
    'workflows',
  ] as const,


  // ==========================================================================
  // WORKFLOW LIST
  // ==========================================================================

  lists: () =>
    [
      ...workflowQueryKeys.all,
      'list',
    ] as const,

  list: () =>
    [
      ...workflowQueryKeys.lists(),
    ] as const,


  // ==========================================================================
  // INDIVIDUAL WORKFLOW
  // ==========================================================================

  details: () =>
    [
      ...workflowQueryKeys.all,
      'detail',
    ] as const,

  detail: (
    workflowId: string,
  ) =>
    [
      ...workflowQueryKeys.details(),
      workflowId,
    ] as const,


  // ==========================================================================
  // LOADED WORKFLOW
  // ==========================================================================
  //
  // Represents the workflow currently selected by:
  //
  //     POST /workflows/{workflow_id}/load
  //
  // This is backend runtime state and is intentionally distinct from:
  //
  //     workflow list
  //     workflow detail
  //
  // caches.
  //
  // Process Workflow does not automatically load the newly created workflow.
  // Loading remains an explicit browser-replay selection operation.
  //
  // ==========================================================================

  loaded: () =>
    [
      ...workflowQueryKeys.all,
      'loaded',
    ] as const,
};


// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default workflowQueryKeys;