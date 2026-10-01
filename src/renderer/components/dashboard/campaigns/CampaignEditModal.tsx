import React from 'react';
import type { CampaignStatus } from '../../../../services/campaigns/campaign.types';

export interface CampaignEditEditor {
  name: string;
  description: string;
  instructions: string;
  workflowId: string;
  status?: CampaignStatus;
}

export interface CampaignEditWorkflow {
  id: string;
  title: string;
}

interface CampaignEditModalProps {
  isOpen: boolean;
  editor: CampaignEditEditor;
  workflows: CampaignEditWorkflow[];
  isWorkflowsLoading: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onInstructionsChange: (value: string) => void;
  onStatusChange: (value: CampaignStatus) => void;
  onWorkflowChange: (value: string) => void;
}

const fontBase: React.CSSProperties = {
  fontFamily: "'Montserrat', sans-serif",
};

const inputStyle: React.CSSProperties = {
  ...fontBase,
  width: '100%',
  padding: '10px 12px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
};

const selectStyle: React.CSSProperties = { ...inputStyle, background: '#1d1d1d' };

const labelStyle: React.CSSProperties = {
  ...fontBase,
  display: 'block',
  marginBottom: '8px',
  fontSize: '12px',
  fontWeight: 500,
  color: 'rgba(255,255,255,0.8)',
};

const headingStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', serif",
  margin: 0,
  fontSize: '18px',
  fontWeight: 600,
  color: '#ffffff',
  letterSpacing: '-0.02em',
};

const buttonBaseStyle: React.CSSProperties = {
  ...fontBase,
  fontSize: '13px',
  borderRadius: '8px',
  padding: '10px 16px',
  cursor: 'pointer',
};

const CampaignEditModal: React.FC<CampaignEditModalProps> = ({
  isOpen,
  editor,
  workflows,
  isWorkflowsLoading,
  isSaving,
  onClose,
  onSubmit,
  onNameChange,
  onDescriptionChange,
  onInstructionsChange,
  onStatusChange,
  onWorkflowChange,
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    onStatusChange('draft' as CampaignStatus);
    onSubmit(e);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#161616',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
          ...fontBase,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={headingStyle}>Edit Campaign</h2>
            <p style={{ ...fontBase, margin: '5px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
              Update campaign configuration.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close"
            style={{
              width: '30px',
              height: '30px',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '22px',
              lineHeight: 1,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              ...fontBase,
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="detail-campaign-name" style={labelStyle}>Campaign Name</label>
            <input
              id="detail-campaign-name"
              type="text"
              value={editor.name}
              onChange={(e) => onNameChange(e.target.value)}
              disabled={isSaving}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="detail-campaign-description" style={labelStyle}>Description</label>
            <textarea
              id="detail-campaign-description"
              rows={4}
              value={editor.description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              disabled={isSaving}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div>
            <label htmlFor="detail-campaign-instructions" style={labelStyle}>Instructions</label>
            <textarea
              id="detail-campaign-instructions"
              rows={4}
              value={editor.instructions}
              onChange={(e) => onInstructionsChange(e.target.value)}
              disabled={isSaving}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div>
            <label htmlFor="detail-campaign-workflow" style={labelStyle}>Workflow</label>
            <select
              id="detail-campaign-workflow"
              value={editor.workflowId}
              onChange={(e) => onWorkflowChange(e.target.value)}
              disabled={isSaving || isWorkflowsLoading}
              style={{ ...selectStyle, color: editor.workflowId ? '#ffffff' : 'rgba(255,255,255,0.4)' }}
            >
              <option value="">No workflow selected</option>
              {workflows.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.title}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              style={{
                ...buttonBaseStyle,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#ffffff',
                cursor: isSaving ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                ...buttonBaseStyle,
                backgroundColor: '#FFE600',
                color: '#121212',
                border: 'none',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.6 : 1,
              }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampaignEditModal;