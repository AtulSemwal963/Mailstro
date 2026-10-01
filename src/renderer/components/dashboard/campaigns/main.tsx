import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import goldParticlesBg from '../../../assets/gold_particles_bg.jpg';
import {
  useCampaign,
  useCampaignLeads,
  useDeleteCampaignLeads,
  useImportCampaignLeads,
  useProcessCampaignWorkflow,
  useStartCampaignPlanning,
  useStartWorkflowExecution,
  useUpdateCampaign,
  useUpdateCampaignLeadReport,
  useCampaignPlanRun,
} from '../../../../hooks/campaigns';
import { useWorkflows } from '../../../../hooks/workflows';
import type { CampaignLead, CampaignStatus, UpdateCampaignLeadReportRequest } from '../../../../services/campaigns/campaign.types';
import { useCampaignDetailsStore } from '../../../store/campaigns/campaign_details.store';
import CampaignDetailHeader from './CampaignDetailHeader';
// import CampaignDescription from './CampaignDescription';
import CampaignInstructions from './CampaignInstructions';
import CampaignEditModal from './CampaignEditModal';
import CampaignImportModal from './CampaignImportModal';
import CampaignPlanningModal from './CampaignPlanningModal';
import CampaignLeadReportModal from './CampaignLeadReportModal';
import LeadsTable from './LeadsTable';

export interface CampaignDetailProps {
  campaignId: string;
  onBack: () => void;
}

type StatusNotification = { type: 'success' | 'error'; message: string } | null;

const STATUS_MAP: Record<CampaignStatus, { bg: string; color: string; border: string; label: string }> = {
  active: { bg: 'rgba(39,201,63,0.15)', color: '#27c93f', border: 'rgba(39,201,63,0.3)', label: 'Active' },
  archived: { bg: 'rgba(255,189,46,0.15)', color: '#ffbd2e', border: 'rgba(255,189,46,0.3)', label: 'Archived' },
  draft: { bg: 'rgba(255,255,255,0.1)', color: '#a1a1aa', border: 'rgba(255,255,255,0.2)', label: 'Draft' },
};

const getStatusBadge = (status: CampaignStatus) => {
  const config = STATUS_MAP[status] || STATUS_MAP.draft;
  return { background: config.bg, color: config.color, border: config.border };
};

const formatCreatedDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatExecutionTime = (value: string | null) => {
  if (!value) return 'Never';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';

  const seconds = Math.floor(Math.max(0, Date.now() - parsed.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d ago` : parsed.toLocaleDateString();
};

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
      {label}
    </span>
    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', wordBreak: 'break-word' }}>
      {value}
    </span>
  </div>
);

export const CampaignDetail: React.FC<CampaignDetailProps> = ({ campaignId, onBack }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data, isLoading, isError, error, refetch } = useCampaign(campaignId);
  const { data: leadsData, isLoading: isLeadsLoading, isError: isLeadsError, error: leadsError, refetch: refetchLeads } = useCampaignLeads(campaignId);
  const { data: workflowData, isLoading: isWorkflowsLoading } = useWorkflows();

  const updateMutation = useUpdateCampaign();
  const importMutation = useImportCampaignLeads();
  const deleteMutation = useDeleteCampaignLeads();
  const startPlanningMutation = useStartCampaignPlanning();
  const processWorkflowMutation = useProcessCampaignWorkflow();
  const executeWorkflowMutation = useStartWorkflowExecution();
  const updateReportMutation = useUpdateCampaignLeadReport();

  const [activePlanRunId, setActivePlanRunId] = useState<string | null>(null);
  const { data: planRunData, isError: isPlanRunError, error: planRunError } = useCampaignPlanRun(campaignId, activePlanRunId, {
    enabled: Boolean(activePlanRunId),
    pollInterval: 1500,
  });

  const {
    isEditModalOpen, openEditModal, closeEditModal, editor, setEditorName,
    setEditorDescription, setEditorInstructions, setEditorWorkflowId, setEditorStatus,
    hydrateEditor, resetEditor, isImportModalOpen, openImportModal, closeImportModal,
    selectedImportFile, selectedImportFileName, setSelectedImportFile, resetImport,
  } = useCampaignDetailsStore();

  const [notification, setNotification] = useState<StatusNotification>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
  const [reportLead, setReportLead] = useState<CampaignLead | null>(null);

  const campaign = data?.campaign ?? null;
  const leads = leadsData?.leads ?? [];
  const leadsTotal = leadsData?.total ?? leads.length;
  const workflows = workflowData?.workflows ?? [];

  const workflowMap = useMemo(
    () => new Map(workflows.map((w) => [w.id, w.title])),
    [workflows]
  );

  const planRun = planRunData?.plan_run ?? null;
  const isPlanning = startPlanningMutation.isPending || planRun?.status === 'QUEUED' || planRun?.status === 'RUNNING';
  const isProcessingWorkflow = processWorkflowMutation.isPending;
  const isExecutingWorkflow = executeWorkflowMutation.isPending;

  const sourceWorkflowId = campaign?.workflow_id?.trim() || null;
  const hasSourceWorkflow = Boolean(sourceWorkflowId);
  const processedWorkflowId = campaign?.processed_workflow_id?.trim() || null;
  const hasProcessedWorkflow = Boolean(processedWorkflowId);
  const hasLeads = leads.length > 0;
  const hasProcessedReports = leads.some((lead) => lead.status === 'PLANNED');

  const canProcessWorkflow = hasSourceWorkflow && hasLeads && hasProcessedReports && !isPlanning && !isProcessingWorkflow && !isExecutingWorkflow;
  const canExecuteWorkflow = hasProcessedWorkflow && hasLeads && !isPlanning && !isProcessingWorkflow && !isExecutingWorkflow;

  useEffect(() => {
    if (!planRun) return;
    if (planRun.status === 'COMPLETED') {
      setNotification({
        type: 'success',
        message: `Campaign planning completed. ${planRun.completed_count} report${planRun.completed_count === 1 ? '' : 's'} generated${planRun.failed_count > 0 ? ` · ${planRun.failed_count} failed` : ''}.`,
      });
    } else if (planRun.status === 'FAILED') {
      setNotification({ type: 'error', message: planRun.error || 'Campaign planning failed.' });
    } else if (planRun.status === 'CANCELLED') {
      setNotification({
        type: 'error',
        message: `Campaign planning cancelled. ${planRun.completed_count} report${planRun.completed_count === 1 ? '' : 's'} completed.`,
      });
    }
  }, [planRun?.id, planRun?.status, planRun?.completed_count, planRun?.failed_count, planRun?.error]);

  useEffect(() => {
    if (campaign) hydrateEditor(campaign);
  }, [campaign, hydrateEditor]);

  useEffect(() => {
    setSelectedLeadIds([]);
    setReportLead(null);
    setIsPlanningModalOpen(false);
    setActivePlanRunId(null);
    setNotification(null);
  }, [campaignId]);

  const handleSelectionChange = useCallback((ids: number[]) => setSelectedLeadIds(ids), []);

  const handleOpenEdit = () => {
    if (!campaign) return;
    setNotification(null);
    hydrateEditor(campaign);
    openEditModal();
  };

  const handleCloseEdit = () => {
    if (updateMutation.isPending || isProcessingWorkflow || isExecutingWorkflow) return;
    closeEditModal();
    resetEditor();
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!campaign) return;

    const name = editor.name.trim();
    if (!name) {
      setNotification({ type: 'error', message: 'Campaign name is required.' });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        campaignId: campaign.id,
        data: {
          name,
          description: editor.description.trim() || null,
          instructions: editor.instructions.trim() || null,
          workflow_id: editor.workflowId.trim() || null,
          status: editor.status,
        },
      });
      closeEditModal();
      resetEditor();
      setNotification({ type: 'success', message: 'Campaign updated successfully.' });
      await refetch();
    } catch (err) {
      setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Failed to update campaign.' });
    }
  };

  const handleOpenImport = () => {
    setNotification(null);
    resetImport();
    openImportModal();
  };

  const handleCloseImport = () => {
    if (importMutation.isPending) return;
    closeImportModal();
    resetImport();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !['csv', 'xlsx', 'xls'].includes(extension)) {
      setSelectedImportFile(null);
      setNotification({ type: 'error', message: 'Unsupported file type. Please select a CSV, XLSX, or XLS file.' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setNotification(null);
    setSelectedImportFile(file);
  };

  const handleImport = async () => {
    if (!selectedImportFile) {
      setNotification({ type: 'error', message: 'Select a CSV or Excel file before importing.' });
      return;
    }

    try {
      const response = await importMutation.mutateAsync({ campaignId, file: selectedImportFile });
      closeImportModal();
      resetImport();
      if (fileInputRef.current) fileInputRef.current.value = '';

      const parts: string[] = [];
      if (response.imported_count > 0) parts.push(`${response.imported_count} lead${response.imported_count === 1 ? '' : 's'} imported`);
      if (response.skipped_count > 0) parts.push(`${response.skipped_count} skipped`);
      if (response.failed_count > 0) parts.push(`${response.failed_count} failed`);

      setNotification({
        type: response.failed_count > 0 ? 'error' : 'success',
        message: parts.length > 0 ? parts.join(' · ') : 'Lead import completed.',
      });
      setSelectedLeadIds([]);
      await refetchLeads();
    } catch (err) {
      setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Failed to import leads.' });
    }
  };

  const handleDeleteSelected = async (campaignLeadIds: number[]) => {
    if (!campaignLeadIds.length) return;
    if (campaignLeadIds.some((id) => !Number.isInteger(id) || id <= 0)) {
      setNotification({ type: 'error', message: 'One or more selected lead IDs are invalid.' });
      return;
    }

    try {
      const response = await deleteMutation.mutateAsync({ campaignId, campaignLeadIds });
      setSelectedLeadIds([]);
      setNotification({
        type: 'success',
        message: `${response.deleted_count} lead${response.deleted_count === 1 ? '' : 's'} removed from this campaign.`,
      });
      await refetchLeads();
    } catch (err) {
      setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Failed to delete selected leads.' });
    }
  };

  const handleOpenPlanning = () => {
    if (isPlanning || isProcessingWorkflow || isExecutingWorkflow) return;
    setNotification(null);
    setIsPlanningModalOpen(true);
  };

  const handleClosePlanning = () => {
    if (startPlanningMutation.isPending) return;
    setIsPlanningModalOpen(false);
  };

  const handleStartPlanning = async (_scope: 'all' | 'selected', campaignLeadIds: number[]) => {
    if (startPlanningMutation.isPending || isProcessingWorkflow || isExecutingWorkflow) return;

    try {
      const response = await startPlanningMutation.mutateAsync({
        campaignId,
        campaignLeadIds: campaignLeadIds.length > 0 ? campaignLeadIds : undefined,
      });
      setActivePlanRunId(response.plan_run.id);
      setIsPlanningModalOpen(false);
      setNotification({
        type: 'success',
        message: `Campaign planning started for ${response.plan_run.requested_count} lead${response.plan_run.requested_count === 1 ? '' : 's'}.`,
      });
      setSelectedLeadIds([]);
      await refetchLeads();
    } catch (err) {
      setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Failed to start campaign planning.' });
    }
  };

  const handleProcessWorkflow = async () => {
    if (!campaign || processWorkflowMutation.isPending || isExecutingWorkflow) return;

    if (!sourceWorkflowId) {
      setNotification({ type: 'error', message: 'This campaign does not have a source workflow selected.' });
      return;
    }
    if (isPlanning) {
      setNotification({ type: 'error', message: 'Campaign planning is still running. Wait for planning to finish before processing the workflow.' });
      return;
    }
    if (!hasLeads) {
      setNotification({ type: 'error', message: 'This campaign has no leads to process against.' });
      return;
    }
    if (leads.filter((lead) => lead.status === 'PLANNED').length === 0) {
      setNotification({ type: 'error', message: 'No completed campaign reports are available for workflow processing.' });
      return;
    }

    setNotification(null);
    try {
      const response = await processWorkflowMutation.mutateAsync({ campaignId: campaign.id });
      await refetch();
      await refetchLeads();

      const processedWorkflowTitle = response.workflow?.title || 'Processed workflow';
      setNotification({
        type: 'success',
        message: `Workflow processed successfully. "${processedWorkflowTitle}" is now available for execution.`,
      });
    } catch (err) {
      setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Failed to process the campaign workflow.' });
    }
  };

  const handleExecuteWorkflow = async () => {
    if (!campaign || executeWorkflowMutation.isPending) return;

    if (!campaign.processed_workflow_id?.trim()) {
      setNotification({ type: 'error', message: 'This campaign does not have a processed workflow. Process the workflow before executing it.' });
      return;
    }
    if (isPlanning) {
      setNotification({ type: 'error', message: 'Campaign planning is still running. Wait for planning to finish before preparing the workflow.' });
      return;
    }
    if (isProcessingWorkflow) {
      setNotification({ type: 'error', message: 'Workflow processing is still running. Wait for it to finish before preparing the workflow.' });
      return;
    }
    if (!hasLeads) {
      setNotification({ type: 'error', message: 'This campaign has no leads available for workflow execution.' });
      return;
    }
    if (selectedLeadIds.some((id) => !Number.isInteger(id) || id <= 0)) {
      setNotification({ type: 'error', message: 'One or more selected CampaignLead IDs are invalid.' });
      return;
    }

    setNotification(null);
    try {
      const response = await executeWorkflowMutation.mutateAsync({
        campaignId: campaign.id,
        campaignLeadIds: selectedLeadIds.length > 0 ? selectedLeadIds : undefined,
      });

      const requestedCount = response.execution_run?.requested_count ?? (selectedLeadIds.length > 0 ? selectedLeadIds.length : leads.length);
      const materializedActionCount = response.materialized_action_count ?? response.execution_run?.materialized_action_count ?? 0;
      const leadWord = requestedCount === 1 ? 'lead' : 'leads';

      setSelectedLeadIds([]);
      setNotification({
        type: 'success',
        message: `Workflow prepared for ${requestedCount} ${leadWord}${materializedActionCount > 0 ? ` (${materializedActionCount} runtime actions)` : ''}. The expanded workflow has been loaded into the extension. Open the extension and start it manually.`,
      });
    } catch (err) {
      setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Failed to prepare the workflow for execution.' });
    }
  };

  const handleViewReport = (lead: CampaignLead) => {
    setReportLead(lead);
    setNotification(null);
  };

  const handleCloseReport = () => {
    if (updateReportMutation.isPending || isProcessingWorkflow || isExecutingWorkflow) return;
    setReportLead(null);
  };

  const handleSaveReport = async (report: UpdateCampaignLeadReportRequest) => {
    if (!reportLead) return;
    try {
      await updateReportMutation.mutateAsync({ campaignId, campaignLeadId: reportLead.id, data: report });
      setReportLead(null);
      setNotification({ type: 'success', message: 'Lead report updated successfully.' });
      await refetchLeads();
    } catch (err) {
      setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Failed to update lead report.' });
    }
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100%',
    padding: '32px 40px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
  };

  if (isLoading) {
    return <div style={{ ...containerStyle, color: 'rgba(255,255,255,0.4)' }}>Loading campaign...</div>;
  }

  if (isError || !campaign) {
    return (
      <div style={{ ...containerStyle, color: '#ff6b6b' }}>
        <div>Failed to load campaign.</div>
        {error instanceof Error && (
          <div style={{ marginTop: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{error.message}</div>
        )}
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
          {[
            { label: 'Retry', action: () => refetch() },
            { label: 'Back', action: onBack },
          ].map((button) => (
            <button
              key={button.label}
              type="button"
              onClick={button.action}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                color: '#ffffff',
                padding: '8px 14px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const badge = getStatusBadge(campaign.status);
  const displayedWorkflowId = processedWorkflowId || sourceWorkflowId || null;
  const workflowTitle = displayedWorkflowId ? workflowMap.get(displayedWorkflowId) ?? displayedWorkflowId : null;
  const isSuccessNotification = notification?.type === 'success';

  return (
    <div style={{ ...containerStyle, color: '#ffffff', boxSizing: 'border-box' }}>
      <div
        style={{
          position: 'relative',
          borderRadius: '2px',
          overflow: 'hidden',
          backgroundImage: `linear-gradient(180deg, rgba(12, 12, 12, 0.4) 0%, rgba(12, 12, 12, 0.85) 100%), url("${goldParticlesBg}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          // border: '1px solid rgba(255, 215, 0, 0.15)',
          // boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          padding: '28px 32px',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <CampaignDetailHeader
          campaign={campaign}
          badge={badge}
          onBack={onBack}
          onEdit={handleOpenEdit}
          onPlanCampaign={handleOpenPlanning}
          onProcessWorkflow={handleProcessWorkflow}
          onExecuteWorkflow={handleExecuteWorkflow}
          isPlanning={isPlanning}
          isProcessingWorkflow={isProcessingWorkflow}
          isExecutingWorkflow={isExecutingWorkflow}
          canProcessWorkflow={canProcessWorkflow}
          canExecuteWorkflow={canExecuteWorkflow}
        />

        {/* <CampaignDescription description={campaign.description} /> */}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <CampaignInstructions instructions={campaign.instructions} />
      </div>

      {isPlanRunError && (
        <div
          style={{
            marginBottom: '20px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(255,107,107,0.08)',
            border: '1px solid rgba(255,107,107,0.22)',
            color: '#ff6b6b',
            fontSize: '12px',
          }}
        >
          {planRunError?.message || 'Failed to retrieve campaign planning progress.'}
        </div>
      )}

      {notification && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px 16px',
            borderRadius: '8px',
            background: isSuccessNotification ? 'rgba(39,201,63,0.08)' : 'rgba(255,107,107,0.08)',
            border: `1px solid ${isSuccessNotification ? 'rgba(39,201,63,0.25)' : 'rgba(255,107,107,0.25)'}`,
            color: isSuccessNotification ? '#27c93f' : '#ff6b6b',
          }}
        >
          {notification.message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 4fr) minmax(280px, 1fr)', gap: '20px', alignItems: 'start' }}>
        <LeadsTable
          leads={leads}
          total={leadsTotal}
          isLoading={isLeadsLoading}
          isError={isLeadsError}
          error={leadsError}
          onRetry={() => refetchLeads()}
          onImport={handleOpenImport}
          onDeleteSelected={handleDeleteSelected}
          onSelectionChange={handleSelectionChange}
          onViewReport={handleViewReport}
        />

        <aside style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'Montserrat', sans-serif" }}>
  <section style={{  borderRadius: '12px', padding: '20px' }}>
    <h2 style={{ margin: '0 0 18px', fontSize: '18px', fontWeight: 600, fontFamily: "'Playfair Display', serif", letterSpacing: '-0.02em', color: '#ffffff' }}>
      Campaign Details
    </h2>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'Montserrat', sans-serif" }}>
      <DetailRow label="Status" value={<span style={{ color: badge.color }}>{STATUS_MAP[campaign.status]?.label}</span>} />
      <DetailRow label="Leads" value={leadsTotal.toLocaleString()} />
      <DetailRow label="Workflow" value={isWorkflowsLoading ? 'Loading...' : workflowTitle || 'No workflow selected'} />
      <DetailRow label="Created" value={formatCreatedDate(campaign.created_at)} />
      {planRun && (
        <DetailRow
          label="Planning"
          value={
            planRun.status === 'COMPLETED' || planRun.status === 'CANCELLED'
              ? `${planRun.completed_count}/${planRun.requested_count} completed`
              : planRun.status === 'FAILED'
              ? 'Failed'
              : `${planRun.completed_count}/${planRun.requested_count} completed`
          }
        />
      )}
      <DetailRow
        label="Workflow Execution"
        value={
          isExecutingWorkflow
            ? 'Preparing runtime workflow...'
            : canExecuteWorkflow
            ? selectedLeadIds.length > 0
              ? `${selectedLeadIds.length} selected lead${selectedLeadIds.length === 1 ? '' : 's'} ready`
              : 'All leads ready'
            : 'Unavailable'
        }
      />
    </div>
  </section>
</aside>
      </div>

      <CampaignEditModal
        isOpen={isEditModalOpen}
        editor={editor}
        workflows={workflows}
        isWorkflowsLoading={isWorkflowsLoading}
        isSaving={updateMutation.isPending}
        onClose={handleCloseEdit}
        onSubmit={handleUpdate}
        onNameChange={setEditorName}
        onDescriptionChange={setEditorDescription}
        onInstructionsChange={setEditorInstructions}
        onStatusChange={(value: CampaignStatus) => setEditorStatus(value)}
        onWorkflowChange={setEditorWorkflowId}
      />

      <CampaignImportModal
        isOpen={isImportModalOpen}
        fileInputRef={fileInputRef}
        selectedImportFile={selectedImportFile}
        selectedImportFileName={selectedImportFileName}
        isImporting={importMutation.isPending}
        onClose={handleCloseImport}
        onFileChange={handleFileChange}
        onChooseFile={() => {
          if (!importMutation.isPending) fileInputRef.current?.click();
        }}
        onImport={handleImport}
      />

      <CampaignPlanningModal
        isOpen={isPlanningModalOpen}
        leads={leads}
        selectedLeadIds={selectedLeadIds}
        isStarting={startPlanningMutation.isPending}
        onClose={handleClosePlanning}
        onStart={handleStartPlanning}
      />

      <CampaignLeadReportModal
        isOpen={Boolean(reportLead)}
        lead={reportLead}
        isSaving={updateReportMutation.isPending}
        onClose={handleCloseReport}
        onSave={handleSaveReport}
      />
    </div>
  );
};

export default CampaignDetail;