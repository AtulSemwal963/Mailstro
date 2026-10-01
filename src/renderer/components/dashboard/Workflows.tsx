import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDeleteWorkflow, useLoadWorkflow, useUpdateWorkflow, useWorkflows } from '../../../hooks/workflows';
import { workflowService } from '../../../services/workflows/workflow.services';
import type { WorkflowSummary } from '../../../services/workflows/workflow.types';
import { workflowQueryKeys } from '../../../hooks/workflows/keys';
import { useWorkflowsStore } from '../../store/workflows/workflows.store';

import grad1 from '../../assets/grad_1.png';
import grad2 from '../../assets/grad_2.png';
import grad3 from '../../assets/grad_3.png';
import grad4 from '../../assets/grad_4.png';
import grad5 from '../../assets/grad_5.png';

type StatusNotification = { type: 'success' | 'error'; message: string } | null;

const GRADIENT_BANNERS = [grad1, grad2, grad3, grad4, grad5];

function getDeterministicBanner(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_BANNERS.length;
  return GRADIENT_BANNERS[index];
}

export const Workflows: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useWorkflows();

  const loadedWorkflowQuery = useQuery({
    queryKey: workflowQueryKeys.loaded(),
    queryFn: () => workflowService.getLoadedWorkflow(),
    staleTime: 15 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const updateMutation = useUpdateWorkflow();
  const deleteMutation = useDeleteWorkflow();
  const loadMutation = useLoadWorkflow();

  const {
    tagFilter,
    selectedWorkflowId,
    selectWorkflow,
    isEditorOpen,
    editor,
    openEditEditor,
    closeEditor,
    setEditorTitle,
    setEditorDescription,
  } = useWorkflowsStore();

  const [notification, setNotification] = useState<StatusNotification>(null);

  const loadedWorkflowId = loadedWorkflowQuery.data?.workflow?.id ?? null;
  const workflows = useMemo(() => data?.workflows ?? [], [data?.workflows]);

  const filteredWorkflows = useMemo(() => {
    return workflows.filter((workflow) => tagFilter === 'All' || workflow.tags.includes(tagFilter));
  }, [workflows, tagFilter]);

  const handleEdit = (workflow: WorkflowSummary) => {
    selectWorkflow(workflow.id);
    openEditEditor(workflow);
    setNotification(null);
  };

  const handleUpdate = async () => {
    if (!selectedWorkflowId) return;
    const title = editor.title.trim();
    if (!title) {
      setNotification({ type: 'error', message: 'Workflow name is required.' });
      return;
    }
    try {
      await updateMutation.mutateAsync({
        workflowId: selectedWorkflowId,
        data: {
          title,
          description: editor.description.trim() || null,
          status: 'active',
          tags: [],
        },
      });
      closeEditor();
      selectWorkflow(null);
      setNotification({ type: 'success', message: 'Workflow updated successfully.' });
    } catch (mutationError) {
      setNotification({
        type: 'error',
        message: mutationError instanceof Error ? mutationError.message : 'Failed to update workflow.',
      });
    }
  };

  const handleDelete = async (workflow: WorkflowSummary) => {
    const confirmed = window.confirm(`Delete "${workflow.title}"?\n\nThis will permanently remove the workflow and its recorded actions.`);
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(workflow.id);
      if (selectedWorkflowId === workflow.id) {
        selectWorkflow(null);
        closeEditor();
      }
      setNotification({ type: 'success', message: 'Workflow deleted successfully.' });
    } catch (mutationError) {
      setNotification({
        type: 'error',
        message: mutationError instanceof Error ? mutationError.message : 'Failed to delete workflow.',
      });
    }
  };

  const handleLoadWorkflow = async (workflow: WorkflowSummary) => {
    if (loadedWorkflowId === workflow.id) {
      setNotification({ type: 'success', message: `"${workflow.title}" is already loaded for replay.` });
      return;
    }
    if (loadMutation.isPending) return;
    setNotification(null);
    try {
      const response = await loadMutation.mutateAsync({ workflowId: workflow.id });
      const loadedWorkflow = response?.workflow;
      if (!loadedWorkflow) throw new Error('The backend did not return the loaded workflow.');
      setNotification({ type: 'success', message: `"${loadedWorkflow.title}" is now loaded for browser replay.` });
    } catch (mutationError) {
      setNotification({
        type: 'error',
        message: mutationError instanceof Error ? mutationError.message : 'Failed to load workflow.',
      });
    }
  };

  if (isLoading) {
    return <div style={{ minHeight: '100%', padding: '32px 40px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Montserrat', sans-serif", fontSize: '13px' }}>Loading workflows...</div>;
  }

  if (isError) {
    return (
      <div style={{ minHeight: '100%', padding: '32px 40px', color: '#ff6b6b', fontFamily: "'Montserrat', sans-serif", fontSize: '13px' }}>
        <div>Failed to load workflows.</div>
        {error instanceof Error && <div style={{ marginTop: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{error.message}</div>}
        <button type="button" onClick={() => refetch()} style={{ marginTop: '14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff', padding: '8px 14px', fontSize: '12px', cursor: 'pointer', fontFamily: "'Montserrat', sans-serif" }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100%', padding: '32px 40px', color: '#ffffff', fontFamily: "'Montserrat', sans-serif" }}>
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

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 600, letterSpacing: '-0.5px', fontFamily: "'Playfair Display', serif" }}>Workflows</h1>
        <p style={{ margin: '5px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontFamily: "'Montserrat', sans-serif" }}>Browse, manage, and execute recorded workspace automation flows.</p>
      </div>

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
            fontFamily: "'Montserrat', sans-serif",
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

      {filteredWorkflows.length === 0 ? (
        <div style={{ backgroundColor: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '56px 40px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontFamily: "'Montserrat', sans-serif" }}>
          {workflows.length === 0 ? 'No workflows have been recorded yet.' : 'No workflows found matching the current filters.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredWorkflows.map((workflow) => {
            const isLoaded = loadedWorkflowId === workflow.id;
            const isLoadingThisWorkflow = loadMutation.isPending && loadMutation.variables?.workflowId === workflow.id;
            const isUpdating = updateMutation.isPending && selectedWorkflowId === workflow.id;
            const isDeleting = deleteMutation.isPending && selectedWorkflowId === workflow.id;
            const bannerImage = getDeterministicBanner(workflow.id);

            return (
              <div key={workflow.id} style={{ backgroundColor: '#161616', border: isLoaded ? '1px solid rgba(255,230,0,0.34)' : '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: isLoaded ? '0 0 0 1px rgba(255,230,0,0.04)' : 'none', transition: 'border-color 0.15s ease, box-shadow 0.15s ease' }}>
                <div>
                  <div style={{ position: 'relative', minHeight: '140px', width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }}>
                    <img src={bannerImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)' }} />
                    
                    <h3 style={{ position: 'relative', zIndex: 1, margin: '0 0 6px 0', fontSize: '18px', fontWeight: 600, color: '#ffffff', textAlign: 'center', lineHeight: '1.3', wordBreak: 'break-word', textShadow: '0 2px 8px rgba(0,0,0,0.6)', fontFamily: "'Playfair Display', serif" }}>
                      {workflow.title}
                    </h3>

                    <p style={{ position: 'relative', zIndex: 1, margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: '1.4', wordBreak: 'break-word', textShadow: '0 1px 4px rgba(0,0,0,0.8)', fontFamily: "'Montserrat', sans-serif" }}>
                      {workflow.description || ''}
                    </p>
                  </div>
                </div>

                <div style={{ padding: '16px 20px 20px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Montserrat', sans-serif" }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                      <span>{workflow.steps_count} {workflow.steps_count === 1 ? 'step' : 'steps'}</span>
                    </div>
                    {isLoaded && <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 500, background: 'rgba(255,230,0,0.1)', color: '#ffe600', border: '1px solid rgba(255,230,0,0.2)', fontFamily: "'Montserrat', sans-serif" }}>Loaded</span>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '8px' }}>
                    <button type="button" onClick={() => handleLoadWorkflow(workflow)} disabled={loadMutation.isPending || updateMutation.isPending || deleteMutation.isPending} style={{ backgroundColor: isLoaded ? 'rgba(255,230,0,0.1)' : '#FFE600', color: isLoaded ? '#FFE600' : '#121212', border: isLoaded ? '1px solid rgba(255,230,0,0.22)' : 'none', borderRadius: '7px', padding: '9px 12px', fontSize: '12px', fontWeight: 600, cursor: loadMutation.isPending || updateMutation.isPending || deleteMutation.isPending ? 'not-allowed' : 'pointer', opacity: loadMutation.isPending || updateMutation.isPending || deleteMutation.isPending ? 0.55 : 1, fontFamily: "'Montserrat', sans-serif" }}>
                      {isLoadingThisWorkflow ? 'Loading...' : isLoaded ? 'Loaded' : 'Load Workflow'}
                    </button>
                    <button type="button" onClick={() => handleEdit(workflow)} disabled={isUpdating || isDeleting || loadMutation.isPending} style={{ background: 'transparent', color: '#ffffff', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '7px', padding: '9px 12px', fontSize: '12px', cursor: isUpdating || isDeleting || loadMutation.isPending ? 'not-allowed' : 'pointer', opacity: isUpdating || isDeleting || loadMutation.isPending ? 0.5 : 1, fontFamily: "'Montserrat', sans-serif" }}>
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(workflow)} disabled={isUpdating || isDeleting || loadMutation.isPending} style={{ background: 'transparent', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.2)', borderRadius: '7px', padding: '9px 12px', fontSize: '12px', cursor: isUpdating || isDeleting || loadMutation.isPending ? 'not-allowed' : 'pointer', opacity: isUpdating || isDeleting || loadMutation.isPending ? 0.5 : 1, fontFamily: "'Montserrat', sans-serif" }}>
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isEditorOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'rgba(0,0,0,0.68)', fontFamily: "'Montserrat', sans-serif" }}>
          <div style={{ width: '100%', maxWidth: '520px', backgroundColor: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', boxShadow: '0 24px 80px rgba(0,0,0,0.45)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#ffffff', fontFamily: "'Playfair Display', serif" }}>Edit Workflow</h2>
                <p style={{ margin: '5px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Montserrat', sans-serif" }}>Change the workflow's name and description.</p>
              </div>
              <button type="button" onClick={closeEditor} disabled={updateMutation.isPending} aria-label="Close" style={{ width: '30px', height: '30px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '22px', lineHeight: 1, cursor: updateMutation.isPending ? 'not-allowed' : 'pointer', fontFamily: "'Montserrat', sans-serif" }}>×</button>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label htmlFor="workflow-title" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.8)', fontFamily: "'Montserrat', sans-serif" }}>Name</label>
              <input id="workflow-title" type="text" value={editor.title} onChange={(event) => setEditorTitle(event.target.value)} autoFocus disabled={updateMutation.isPending} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: "'Montserrat', sans-serif" }} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="workflow-description" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.8)', fontFamily: "'Montserrat', sans-serif" }}>Description</label>
              <textarea id="workflow-description" value={editor.description} onChange={(event) => setEditorDescription(event.target.value)} rows={4} disabled={updateMutation.isPending} placeholder="Describe what this workflow does..." style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: "'Montserrat', sans-serif" }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={closeEditor} disabled={updateMutation.isPending} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff', padding: '10px 16px', fontSize: '13px', cursor: updateMutation.isPending ? 'not-allowed' : 'pointer', fontFamily: "'Montserrat', sans-serif" }}>
                Cancel
              </button>
              <button type="button" onClick={handleUpdate} disabled={updateMutation.isPending} style={{ backgroundColor: '#FFE600', color: '#121212', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontWeight: 600, cursor: updateMutation.isPending ? 'not-allowed' : 'pointer', opacity: updateMutation.isPending ? 0.6 : 1, fontFamily: "'Montserrat', sans-serif" }}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workflows;