import React, { useMemo } from 'react';
import type { CampaignLead } from '../../../../services/campaigns/campaign.types';

export type CampaignPlanningScope = 'all' | 'selected';

export interface CampaignPlanningModalProps {
  isOpen: boolean;
  leads: CampaignLead[];
  selectedLeadIds: number[];
  isStarting: boolean;
  onClose: () => void;
  onStart: (
    scope: CampaignPlanningScope,
    campaignLeadIds: number[],
  ) => void | Promise<void>;
}

export const CampaignPlanningModal: React.FC<CampaignPlanningModalProps> = ({
  isOpen,
  leads,
  selectedLeadIds,
  isStarting,
  onClose,
  onStart,
}) => {
  const eligibleLeads = useMemo(
    () =>
      leads.filter(
        (lead) => lead.status !== 'PLANNED' && lead.status !== 'PLANNING',
      ),
    [leads],
  );

  const eligibleLeadIds = useMemo(
    () => eligibleLeads.map((lead) => lead.id),
    [eligibleLeads],
  );

  const selectedEligibleLeadIds = useMemo(
    () => selectedLeadIds.filter((id) => eligibleLeadIds.includes(id)),
    [selectedLeadIds, eligibleLeadIds],
  );

  const allCount = eligibleLeads.length;
  const selectedCount = selectedEligibleLeadIds.length;

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isStarting) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(4px)',
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="campaign-planning-modal-title"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '440px',
          background: '#161616',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '28px 24px 24px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
          color: '#ffffff',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isStarting}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '20px',
            lineHeight: 1,
            cursor: isStarting ? 'not-allowed' : 'pointer',
            padding: '4px',
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          &times;
        </button>

        <h2
          id="campaign-planning-modal-title"
          style={{
            margin: 0,
            fontFamily: "'Playfair Display', serif",
            fontSize: '22px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
          }}
        >
          Plan Campaign
        </h2>

        <p
          style={{
            margin: '8px 0 24px',
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.5)',
            lineHeight: 1.5,
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          Research leads and generate targeted campaign reports in the background.
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={() => onStart('selected', selectedEligibleLeadIds)}
            disabled={isStarting || selectedCount === 0}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(255, 255, 255, 0.04)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 500,
              fontFamily: "'Montserrat', sans-serif",
              cursor: isStarting || selectedCount === 0 ? 'not-allowed' : 'pointer',
              opacity: isStarting || selectedCount === 0 ? 0.45 : 1,
            }}
          >
            Start Selected ({selectedCount})
          </button>

          <button
            type="button"
            onClick={() => onStart('all', [])}
            disabled={isStarting || allCount === 0}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              background: '#FFE600',
              color: '#121212',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: "'Montserrat', sans-serif",
              cursor: isStarting || allCount === 0 ? 'not-allowed' : 'pointer',
              opacity: isStarting || allCount === 0 ? 0.45 : 1,
            }}
          >
            Start All ({allCount})
          </button>
        </div>
      </section>
    </div>
  );
};

export default CampaignPlanningModal;