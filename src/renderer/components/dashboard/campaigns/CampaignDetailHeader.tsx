import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import type { CampaignStatus } from '../../../../services/campaigns/campaign.types';
import CampaignDescription from './CampaignDescription';

interface CampaignDetailHeaderProps {
  campaign: { id: string; name: string; status: CampaignStatus; created_at: string; description?: string | null };
  badge?: { background: string; color: string; border: string };
  onBack: () => void;
  onEdit: () => void;
  onPlanCampaign?: () => void;
  onProcessWorkflow?: () => void;
  onExecuteWorkflow?: () => void;
  isPlanning?: boolean;
  isProcessingWorkflow?: boolean;
  isExecutingWorkflow?: boolean;
  canProcessWorkflow?: boolean;
  canExecuteWorkflow?: boolean;
}

const liquidGlassBase: React.CSSProperties = {
  fontFamily: "'Montserrat', sans-serif",
  fontSize: '15px',
  fontWeight: 600,
  padding: '14px 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
};

const editButtonStyle: React.CSSProperties = {
  ...liquidGlassBase,
  color: '#ffffff',
  background: 'rgba(255, 255, 255, 0.12)',
  backdropFilter: 'blur(16px) saturate(180%)',
  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
  border: '1px solid rgba(255, 255, 255, 0.35)',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.2)',
};

const actionsButtonStyle: React.CSSProperties = {
  ...liquidGlassBase,
  color: '#121212',
  background: '#ffe600',
  border: '1px solid #ffe600',
  boxShadow: 'none',
};

const CampaignDetailHeader: React.FC<CampaignDetailHeaderProps> = ({
  campaign, onBack, onEdit, onPlanCampaign, onProcessWorkflow, onExecuteWorkflow,
  isPlanning = false, isProcessingWorkflow = false, isExecutingWorkflow = false,
  canProcessWorkflow = false, canExecuteWorkflow = false,
}) => {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const actionsButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (actionsButtonRef.current) {
      const rect = actionsButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  const toggleDropdown = () => {
    if (!isActionsOpen) {
      updatePosition();
    }
    setIsActionsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        actionsButtonRef.current &&
        !actionsButtonRef.current.contains(e.target as Node)
      ) {
        setIsActionsOpen(false);
      }
    };

    const handleReposition = () => {
      if (isActionsOpen) updatePosition();
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isActionsOpen]);

  const isDisabled = isPlanning || isProcessingWorkflow || isExecutingWorkflow;
  const actions = [
    { key: 'plan-workflow', label: isPlanning ? 'Planning...' : 'Plan Campaign', handler: onPlanCampaign, disabled: isDisabled || !onPlanCampaign },
    { key: 'process-workflow', label: isProcessingWorkflow ? 'Processing...' : 'Process Workflow', handler: onProcessWorkflow, disabled: isDisabled || !onProcessWorkflow || !canProcessWorkflow },
    { key: 'execute-workflow', label: isExecutingWorkflow ? 'Preparing...' : 'Execute Workflow', handler: onExecuteWorkflow, disabled: isDisabled || !onExecuteWorkflow || !canExecuteWorkflow },
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', gap: '24px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
      `}</style>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessingWorkflow || isExecutingWorkflow}
          aria-label="Back to campaigns"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px',
            backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
            color: 'rgba(255,255,255,0.8)', cursor: isProcessingWorkflow || isExecutingWorkflow ? 'not-allowed' : 'pointer',
            opacity: isProcessingWorkflow || isExecutingWorkflow ? 0.45 : 1, flexShrink: 0, marginTop: '2px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '-0.5px', lineHeight: 1.1 }}>
            {campaign.name}
          </h1>
          <CampaignDescription description={campaign.description ?? null} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '200px', flexShrink: 0 }}>
        <button
          type="button"
          onClick={onEdit}
          disabled={isDisabled}
          style={{ ...editButtonStyle, cursor: isDisabled ? 'not-allowed' : 'pointer', opacity: isDisabled ? 0.45 : 1 }}
        >
          Edit Campaign
        </button>

        <div style={{ position: 'relative', width: '100%' }}>
          <button
            ref={actionsButtonRef}
            type="button"
            onClick={toggleDropdown}
            disabled={isProcessingWorkflow || isExecutingWorkflow}
            style={{ ...actionsButtonStyle, cursor: isProcessingWorkflow || isExecutingWorkflow ? 'not-allowed' : 'pointer', opacity: isProcessingWorkflow || isExecutingWorkflow ? 0.55 : 1 }}
          >
            Actions
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isActionsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {isActionsOpen && ReactDOM.createPortal(
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute',
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
                backgroundColor: '#1c1c1c',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '12px',
                padding: '6px',
                boxShadow: '0 12px 32px rgba(0,0,0,0.8)',
                zIndex: 999999,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              {actions.map(({ key, label, handler, disabled }) => (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  onClick={() => { if (!disabled && handler) { handler(); setIsActionsOpen(false); } }}
                  style={{
                    backgroundColor: 'transparent', color: disabled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.9)',
                    border: 'none', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', fontWeight: 500, fontFamily: "'Montserrat', sans-serif", textAlign: 'left',
                    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.55 : 1, width: '100%',
                  }}
                  onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {label}
                </button>
              ))}
            </div>,
            document.body
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailHeader;