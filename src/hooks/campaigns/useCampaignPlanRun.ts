// src/hooks/campaigns/useCampaignPlanRun.ts

import {
  useEffect,
} from 'react';

import {
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  campaignService,
} from '../../services/campaigns/campaign.services';

import type {
  CampaignPlanRunStatus,
  GetCampaignPlanRunResponse,
} from '../../services/campaigns/campaign.types';

import {
  campaignQueryKeys,
} from './keys';


// ============================================================================
// TYPES
// ============================================================================

export interface UseCampaignPlanRunOptions {
  enabled?: boolean;
  pollInterval?: number;
}


// ============================================================================
// HELPERS
// ============================================================================

function isTerminalPlanRunStatus(
  status: CampaignPlanRunStatus,
): boolean {
  return (
    status === 'COMPLETED' ||
    status === 'FAILED' ||
    status === 'CANCELLED'
  );
}


// ============================================================================
// HOOK
// ============================================================================
//
// Polls one CampaignPlanRun while it is active.
//
// The backend returns:
//
//   plan_run
//   items
//
// The items expose per-lead progress while the background planner processes
// leads one at a time.
//
// TanStack Query v5 does not support query-level onSuccess callbacks, so
// related query invalidation is handled through useEffect.
//
// ============================================================================

export function useCampaignPlanRun(
  campaignId: string,
  planRunId: string | null | undefined,
  options: UseCampaignPlanRunOptions = {},
) {
  const queryClient = useQueryClient();

  const {
    enabled = true,
    pollInterval = 1500,
  } = options;

  const query = useQuery<
    GetCampaignPlanRunResponse,
    Error
  >({
    queryKey:
      planRunId
        ? campaignQueryKeys.planRun(
            campaignId,
            planRunId,
          )
        : [
            ...campaignQueryKeys.all,
            'plan-run',
            'disabled',
          ],

    enabled:
      Boolean(
        enabled &&
        campaignId?.trim() &&
        planRunId?.trim(),
      ),

    queryFn: async () => {
      if (!campaignId?.trim()) {
        throw new Error(
          'Campaign ID is required to retrieve a planning run.',
        );
      }

      if (!planRunId?.trim()) {
        throw new Error(
          'Plan run ID is required to retrieve a planning run.',
        );
      }

      return campaignService.getCampaignPlanRun(
        campaignId,
        planRunId,
      );
    },

    staleTime: 0,

    refetchInterval: (
      currentQuery,
    ) => {
      const status =
        currentQuery.state.data?.plan_run?.status;

      if (
        !status ||
        isTerminalPlanRunStatus(
          status,
        )
      ) {
        return false;
      }

      return pollInterval;
    },

    retry: 3,
  });


  // ==========================================================================
  // SYNCHRONIZE RELATED CAMPAIGN STATE
  // ==========================================================================

  useEffect(() => {
    const planRun =
      query.data?.plan_run;

    if (!planRun) {
      return;
    }

    void queryClient.invalidateQueries({
      queryKey:
        campaignQueryKeys.campaignLeads(
          campaignId,
        ),
    });

    void queryClient.invalidateQueries({
      queryKey:
        campaignQueryKeys.campaignPlanRuns(
          campaignId,
        ),
    });

    if (
      isTerminalPlanRunStatus(
        planRun.status,
      )
    ) {
      void queryClient.invalidateQueries({
        queryKey:
          campaignQueryKeys.detail(
            campaignId,
          ),
      });
    }
  }, [
    campaignId,
    query.data?.plan_run?.status,
    query.data?.plan_run?.completed_count,
    query.data?.plan_run?.failed_count,
    queryClient,
  ]);


  return query;
}


export default useCampaignPlanRun;