import React, { useMemo, useState } from 'react';
import { useCampaigns, useCreateCampaign, useDeleteCampaign, useUpdateCampaign } from '../../../hooks/campaigns';
import { useWorkflows } from '../../../hooks/workflows';
import type { Campaign, CampaignStatus } from '../../../services/campaigns/campaign.types';
import type { WorkflowSummary } from '../../../services/workflows/workflow.types';
import { useCampaignsStore } from '../../store/campaigns/campaigns.store';

type StatusNotification = { type: 'success' | 'error'; message: string } | null;

interface CampaignFormModalProps {
  title: string;
  submitLabel: string;
  pending: boolean;
  isCreateMode?: boolean;
  editor: { name: string; description: string; instructions: string; workflowId: string; status: CampaignStatus };
  workflows: WorkflowSummary[];
  isWorkflowsLoading: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  setEditorName: (value: string) => void;
  setEditorDescription: (value: string) => void;
  setEditorInstructions: (value: string) => void;
  setEditorWorkflowId: (value: string) => void;
  setEditorStatus: (value: CampaignStatus) => void;
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function getStatusBadge(status: CampaignStatus) {
  switch (status) {
    case 'active': return { bg: 'rgba(39, 201, 63, 0.15)', text: '#27c93f', border: 'rgba(39, 201, 63, 0.3)' };
    case 'archived': return { bg: 'rgba(255, 189, 46, 0.15)', text: '#ffbd2e', border: 'rgba(255, 189, 46, 0.3)' };
    case 'draft': default: return { bg: 'rgba(255, 255, 255, 0.1)', text: '#a1a1aa', border: 'rgba(255, 255, 255, 0.2)' };
  }
}

function getStatusLabel(status: CampaignStatus): string {
  switch (status) {
    case 'active': return 'Active';
    case 'archived': return 'Archived';
    case 'draft': default: return 'Draft';
  }
}

const CampaignFormModal: React.FC<CampaignFormModalProps> = ({ title, submitLabel, pending, isCreateMode, editor, workflows, isWorkflowsLoading, onClose, onSubmit, setEditorName, setEditorDescription, setEditorInstructions, setEditorWorkflowId, setEditorStatus }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '20px' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', width: '100%', maxWidth: '520px', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto', padding: '28px', boxSizing: 'border-box', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', fontFamily: "'Montserrat', sans-serif" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 600, margin: 0 }}>{title}</h2>
          <button type="button" onClick={onClose} disabled={pending} aria-label="Close" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: pending ? 'not-allowed' : 'pointer', fontSize: '22px', padding: '4px' }}>×</button>
        </div>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="campaign-name" style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>Campaign Name</label>
            <input id="campaign-name" type="text" required value={editor.name} onChange={(e) => setEditorName(e.target.value)} placeholder="e.g. Q4 Enterprise Outreach" disabled={pending} style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#ffffff', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: "'Montserrat', sans-serif" }} />
          </div>
          <div>
            <label htmlFor="campaign-description" style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>Description</label>
            <textarea id="campaign-description" rows={3} value={editor.description} onChange={(e) => setEditorDescription(e.target.value)} placeholder="Describe the purpose of this campaign." disabled={pending} style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#ffffff', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: "'Montserrat', sans-serif" }} />
          </div>
          <div>
            <label htmlFor="campaign-instructions" style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>Content Instructions</label>
            <textarea id="campaign-instructions" rows={4} value={editor.instructions} onChange={(e) => setEditorInstructions(e.target.value)} placeholder="Enter instructions for content generation." disabled={pending} style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#ffffff', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: "'Montserrat', sans-serif" }} />
          </div>
          {!isCreateMode && (
            <div>
              <label htmlFor="campaign-status" style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>Status</label>
              <select id="campaign-status" value={editor.status} onChange={(e) => setEditorStatus(e.target.value as CampaignStatus)} disabled={pending} style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#ffffff', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: "'Montserrat', sans-serif" }}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          )}
          <div>
            <label htmlFor="campaign-workflow" style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>Workflow</label>
            <select id="campaign-workflow" value={editor.workflowId} onChange={(e) => setEditorWorkflowId(e.target.value)} disabled={pending || isWorkflowsLoading} style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: editor.workflowId ? '#ffffff' : 'rgba(255,255,255,0.4)', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: "'Montserrat', sans-serif" }}>
              <option value="">No workflow selected</option>
              {workflows.map((wf) => (
                <option key={wf.id} value={wf.id} style={{ backgroundColor: '#161616', color: '#ffffff' }}>{wf.title}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} disabled={pending} style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '8px 16px', color: '#ffffff', fontSize: '12px', fontWeight: 500, cursor: pending ? 'not-allowed' : 'pointer', fontFamily: "'Montserrat', sans-serif" }}>Cancel</button>
            <button type="submit" disabled={pending} style={{ backgroundColor: '#FFE600', border: 'none', borderRadius: '6px', padding: '8px 16px', color: '#121212', fontSize: '12px', fontWeight: 600, cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.6 : 1, fontFamily: "'Montserrat', sans-serif" }}>{pending ? 'Saving...' : submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface CampaignsProps {
  onCampaignClick: (campaignId: string) => void;
}

export const Campaigns: React.FC<CampaignsProps> = ({ onCampaignClick }) => {
  const { data, isLoading, isError, error, refetch } = useCampaigns();
  const { data: workflowData, isLoading: isWorkflowsLoading } = useWorkflows();

  const createMutation = useCreateCampaign();
  const updateMutation = useUpdateCampaign();
  const deleteMutation = useDeleteCampaign();

  const { isCreateModalOpen, openCreateModal, closeCreateModal, editor, setEditorName, setEditorDescription, setEditorInstructions, setEditorWorkflowId, setEditorStatus, resetEditor } = useCampaignsStore();

  const [notification, setNotification] = useState<StatusNotification>(null);
  const [openMenuCampaignId, setOpenMenuCampaignId] = useState<string | null>(null);
  const [editCampaignId, setEditCampaignId] = useState<string | null>(null);
  const [deleteCampaignId, setDeleteCampaignId] = useState<string | null>(null);

  const campaigns = data?.campaigns ?? [];
  const workflows = workflowData?.workflows ?? [];

  const workflowMap = useMemo(() => {
    const map = new Map<string, WorkflowSummary>();
    for (const workflow of workflows) map.set(workflow.id, workflow);
    return map;
  }, [workflows]);

  const campaignBeingEdited = editCampaignId ? campaigns.find((c) => c.id === editCampaignId) ?? null : null;
  const campaignBeingDeleted = deleteCampaignId ? campaigns.find((c) => c.id === deleteCampaignId) ?? null : null;

  const handleCreateCampaign = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = editor.name.trim();
    if (!name) return setNotification({ type: 'error', message: 'Campaign name is required.' });

    try {
      await createMutation.mutateAsync({ name, description: editor.description.trim() || null, instructions: editor.instructions.trim() || null, workflow_id: editor.workflowId.trim() || null, status: 'draft' });
      resetEditor();
      closeCreateModal();
      setNotification({ type: 'success', message: 'Campaign created successfully.' });
    } catch (e) {
      setNotification({ type: 'error', message: e instanceof Error ? e.message : 'Failed to create campaign.' });
    }
  };

  const handleOpenCreate = () => { setNotification(null); setOpenMenuCampaignId(null); resetEditor(); openCreateModal(); };
  const handleCloseCreate = () => { if (!createMutation.isPending) { closeCreateModal(); resetEditor(); } };

  const handleOpenEdit = (campaign: Campaign) => {
    setNotification(null);
    setOpenMenuCampaignId(null);
    setEditorName(campaign.name);
    setEditorDescription(campaign.description || '');
    setEditorInstructions(campaign.instructions || '');
    setEditorWorkflowId(campaign.workflow_id || '');
    setEditorStatus(campaign.status);
    setEditCampaignId(campaign.id);
  };

  const handleCloseEdit = () => { if (!updateMutation.isPending) { setEditCampaignId(null); resetEditor(); } };

  const handleUpdateCampaign = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!campaignBeingEdited) return;
    const name = editor.name.trim();
    if (!name) return setNotification({ type: 'error', message: 'Campaign name is required.' });

    try {
      await updateMutation.mutateAsync({ campaignId: campaignBeingEdited.id, data: { name, description: editor.description.trim() || null, instructions: editor.instructions.trim() || null, workflow_id: editor.workflowId.trim() || null, status: editor.status } });
      setEditCampaignId(null);
      resetEditor();
      setNotification({ type: 'success', message: 'Campaign updated successfully.' });
    } catch (e) {
      setNotification({ type: 'error', message: e instanceof Error ? e.message : 'Failed to update campaign.' });
    }
  };

  const handleOpenDelete = (campaign: Campaign) => { setNotification(null); setOpenMenuCampaignId(null); setDeleteCampaignId(campaign.id); };
  const handleCloseDelete = () => { if (!deleteMutation.isPending) setDeleteCampaignId(null); };

  const handleConfirmDelete = async () => {
    if (!campaignBeingDeleted) return;
    try {
      await deleteMutation.mutateAsync(campaignBeingDeleted.id);
      setDeleteCampaignId(null);
      setNotification({ type: 'success', message: 'Campaign deleted successfully.' });
    } catch (e) {
      setNotification({ type: 'error', message: e instanceof Error ? e.message : 'Failed to delete campaign.' });
    }
  };

  if (isLoading) return <div style={{ minHeight: '100%', padding: '32px 40px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Montserrat', sans-serif", fontSize: '13px' }}>Loading campaigns...</div>;
  if (isError) return (
    <div style={{ minHeight: '100%', padding: '32px 40px', color: '#ff6b6b', fontFamily: "'Montserrat', sans-serif", fontSize: '13px' }}>
      <div>Failed to load campaigns.</div>
      {error instanceof Error && <div style={{ marginTop: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{error.message}</div>}
      <button type="button" onClick={() => refetch()} style={{ marginTop: '14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff', padding: '8px 14px', fontSize: '12px', cursor: 'pointer', fontFamily: "'Montserrat', sans-serif" }}>Retry</button>
    </div>
  );

  return (
    <div style={{ minHeight: '100%', padding: '32px 40px', color: '#ffffff', fontFamily: "'Montserrat', sans-serif", position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');

        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .toast-banner {
          animation: toastIn 0.22s ease-out forwards;
        }
      `}</style>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", margin: 0, fontSize: '24px', fontWeight: 600, letterSpacing: '-0.5px' }}>Campaigns</h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '5px 0 0' }}>Manage your outbound campaigns and their workflow configuration.</p>
        </div>
        <button type="button" onClick={handleOpenCreate} style={{ backgroundColor: '#FFE600', color: '#121212', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Montserrat', sans-serif" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New Campaign
        </button>
      </div>

      {/* NOTIFICATION */}
      {notification && (
        <div
          className="toast-banner"
          style={{
            marginBottom: '20px',
            padding: '12px 16px',
            borderRadius: '8px',
            background: notification.type === 'success' ? 'rgba(39,201,63,0.08)' : 'rgba(255,107,107,0.08)',
            border: notification.type === 'success' ? '1px solid rgba(39,201,63,0.25)' : '1px solid rgba(255,107,107,0.25)',
            color: notification.type === 'success' ? '#27c93f' : '#ff6b6b',
            fontSize: '13px',
            lineHeight: 1.4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <span style={{ flex: 1 }}>{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            aria-label="Dismiss notification"
            style={{
              background: 'transparent',
              border: 'none',
              color: notification.type === 'success' ? 'rgba(39,201,63,0.7)' : 'rgba(255,107,107,0.7)',
              fontSize: '16px',
              lineHeight: 1,
              cursor: 'pointer',
              padding: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              transition: 'color 0.15s ease',
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* CAMPAIGN TABLE */}
      <div style={{ backgroundColor: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'visible' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 500 }}>Name</th>
              <th style={{ padding: '14px 20px', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '14px 20px', fontWeight: 500 }}>Workflow</th>
              <th style={{ padding: '14px 20px', fontWeight: 500 }}>Created</th>
              <th style={{ width: '60px', padding: '14px 12px', fontWeight: 500, textAlign: 'right' }} />
            </tr>
          </thead>
          <tbody>
            {campaigns.length > 0 ? (
              campaigns.map((campaign: Campaign) => {
                const badge = getStatusBadge(campaign.status);
                const workflow = campaign.workflow_id ? workflowMap.get(campaign.workflow_id) : null;
                const isMenuOpen = openMenuCampaignId === campaign.id;

                return (
                  <tr key={campaign.id} onClick={() => onCampaignClick(campaign.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCampaignClick(campaign.id); } }} tabIndex={0} role="button" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background-color 0.15s ease', cursor: 'pointer', outline: 'none' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.025)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                    <td style={{ padding: '16px 20px', fontWeight: 500 }}>{campaign.name}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 500, backgroundColor: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}>
                        {getStatusLabel(campaign.status)}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'rgba(255,255,255,0.7)' }}>{workflow?.title || 'No workflow'}</td>
                    <td style={{ padding: '16px 20px', color: 'rgba(255,255,255,0.4)' }}>{formatDate(campaign.created_at)}</td>
                    <td style={{ padding: '8px 12px', width: '60px', position: 'relative', textAlign: 'right' }} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                      <button type="button" aria-label={`Actions for ${campaign.name}`} aria-expanded={isMenuOpen} onClick={() => setOpenMenuCampaignId(isMenuOpen ? null : campaign.id)} style={{ width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: isMenuOpen ? 'rgba(255,255,255,0.08)' : 'transparent', border: '1px solid', borderColor: isMenuOpen ? 'rgba(255,255,255,0.12)' : 'transparent', borderRadius: '7px', color: 'rgba(255,255,255,0.55)', cursor: 'pointer' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="5" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="12" cy="19" r="1.7" />
                        </svg>
                      </button>
                      {isMenuOpen && (
                        <div style={{ position: 'absolute', top: 'calc(100% - 4px)', right: '12px', width: '150px', padding: '5px', backgroundColor: '#1d1d1d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 12px 32px rgba(0,0,0,0.45)', zIndex: 200 }}>
                          <button type="button" onClick={() => handleOpenEdit(campaign)} style={{ width: '100%', padding: '9px 10px', display: 'flex', alignItems: 'center', textAlign: 'left', background: 'transparent', border: 'none', borderRadius: '6px', color: 'rgba(255,255,255,0.85)', fontSize: '12px', cursor: 'pointer', fontFamily: "'Montserrat', sans-serif" }}>Edit</button>
                          <button type="button" onClick={() => handleOpenDelete(campaign)} style={{ width: '100%', padding: '9px 10px', display: 'flex', alignItems: 'center', textAlign: 'left', background: 'transparent', border: 'none', borderRadius: '6px', color: '#ff6b6b', fontSize: '12px', cursor: 'pointer', fontFamily: "'Montserrat', sans-serif" }}>Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} style={{ padding: '40px 32px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                  No campaigns have been created yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <CampaignFormModal title="Create New Campaign" submitLabel="Create" pending={createMutation.isPending} isCreateMode={true} editor={editor} workflows={workflows} isWorkflowsLoading={isWorkflowsLoading} onClose={handleCloseCreate} onSubmit={handleCreateCampaign} setEditorName={setEditorName} setEditorDescription={setEditorDescription} setEditorInstructions={setEditorInstructions} setEditorWorkflowId={setEditorWorkflowId} setEditorStatus={setEditorStatus} />
      )}

      {/* EDIT MODAL */}
      {editCampaignId && campaignBeingEdited && (
        <CampaignFormModal title="Edit Campaign" submitLabel="Save Changes" pending={updateMutation.isPending} isCreateMode={false} editor={editor} workflows={workflows} isWorkflowsLoading={isWorkflowsLoading} onClose={handleCloseEdit} onSubmit={handleUpdateCampaign} setEditorName={setEditorName} setEditorDescription={setEditorDescription} setEditorInstructions={setEditorInstructions} setEditorWorkflowId={setEditorWorkflowId} setEditorStatus={setEditorStatus} />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteCampaignId && campaignBeingDeleted && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, backdropFilter: 'blur(4px)', padding: '20px' }} onClick={handleCloseDelete}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '420px', backgroundColor: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', fontFamily: "'Montserrat', sans-serif" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", margin: '0 0 10px', fontSize: '17px', fontWeight: 600, color: '#ffffff' }}>Delete Campaign</h2>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: 'rgba(255,255,255,0.55)' }}>
              Are you sure you want to delete <strong style={{ color: 'rgba(255,255,255,0.85)' }}>"{campaignBeingDeleted.name}"</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
              <button type="button" onClick={handleCloseDelete} disabled={deleteMutation.isPending} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff', padding: '9px 16px', fontSize: '12px', cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer', fontFamily: "'Montserrat', sans-serif" }}>Cancel</button>
              <button type="button" onClick={handleConfirmDelete} disabled={deleteMutation.isPending} style={{ background: '#ff5f56', border: 'none', borderRadius: '8px', color: '#ffffff', padding: '9px 16px', fontSize: '12px', fontWeight: 600, cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer', opacity: deleteMutation.isPending ? 0.6 : 1, fontFamily: "'Montserrat', sans-serif" }}>{deleteMutation.isPending ? 'Deleting...' : 'Delete Campaign'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;