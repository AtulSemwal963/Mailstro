// src/renderer/components/dashboard/campaigns/LeadsTable.tsx

import React, { useEffect, useMemo, useState } from 'react';
import type { CampaignLead } from '../../../../services/campaigns/campaign.types';

interface LeadsTableProps {
  leads: CampaignLead[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  onImport: () => void;
  onDeleteSelected?: (campaignLeadIds: number[]) => void | Promise<void>;
  onSelectionChange?: (campaignLeadIds: number[]) => void;
  onViewReport?: (lead: CampaignLead) => void;
}

type ReportState = 'not-planned' | 'planning' | 'planned' | 'failed';

const getReportState = (lead: CampaignLead): ReportState => {
  if (lead.status === 'FAILED') return 'failed';
  if (lead.status === 'PLANNING') return 'planning';
  if (
    lead.status === 'PLANNED' ||
    Boolean(
      lead.linkedin_evidence ||
      lead.website_evidence ||
      lead.overall_evidence ||
      lead.outreach_angle ||
      lead.email_subject ||
      lead.email_body
    )
  ) {
    return 'planned';
  }
  return 'not-planned';
};

const formatUrl = (value: string | null): string =>
  value ? value.replace(/^https?:\/\//i, '').replace(/\/$/, '') : '—';

const getLeadDisplayName = (lead: CampaignLead): string =>
  lead.name?.trim() || lead.email?.trim() || lead.company?.trim() || 'Unnamed Lead';

const truncate = (value: string | null | undefined, length = 8): string =>
  !value ? '—' : value.length > length ? `${value.slice(0, length)}...` : value;

const styles = {
  fontBase: {
    fontFamily: "'Montserrat', sans-serif",
  },
  cell: {
    padding: '16px 20px',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontFamily: "'Montserrat', sans-serif",
  },
  leadNameCell: {
    padding: '16px 20px',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontWeight: 600,
    fontFamily: "'Playfair Display', serif",
    fontSize: '14px',
  },
  headerCell: {
    padding: '14px 20px',
    fontWeight: 600,
    fontFamily: "'Playfair Display', serif",
    fontSize: '14px',
    letterSpacing: '-0.01em',
  },
  link: {
    color: 'rgba(255,255,255,0.65)',
    textDecoration: 'none',
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    fontFamily: "'Montserrat', sans-serif",
  },
  checkboxCell: {
    width: '48px',
    padding: '14px 8px 14px 20px',
    textAlign: 'center' as const,
  },
  btnBase: {
    borderRadius: '0px',
    fontSize: '12px',
    fontWeight: 500,
    padding: '8px 12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    fontFamily: "'Montserrat', sans-serif",
  },
};

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  total,
  isLoading,
  isError,
  error,
  onRetry,
  onImport,
  onDeleteSelected,
  onSelectionChange,
  onViewReport,
}) => {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<number>>(() => new Set<number>());

  const visibleLeadIds = useMemo(() => leads.map((lead) => lead.id), [leads]);
  const selectedCount = selectedLeadIds.size;
  const allVisibleSelected = visibleLeadIds.length > 0 && visibleLeadIds.every((id) => selectedLeadIds.has(id));
  const selectionDisabled = isLoading || isError || leads.length === 0;

  useEffect(() => {
    onSelectionChange?.(Array.from(selectedLeadIds));
  }, [selectedLeadIds, onSelectionChange]);

  useEffect(() => {
    setSelectedLeadIds((current) => {
      const visibleIds = new Set(visibleLeadIds);
      const next = new Set<number>();
      current.forEach((id) => {
        if (visibleIds.has(id)) next.add(id);
      });
      return next;
    });
  }, [visibleLeadIds]);

  const handleExitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedLeadIds(new Set<number>());
  };

  const handleToggleLead = (id: number) => {
    setSelectedLeadIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedCount === 0 || !onDeleteSelected) return;
    await onDeleteSelected(Array.from(selectedLeadIds));
    handleExitSelectionMode();
  };

  return (
    <section
      style={{
        backgroundColor: '#161616',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        overflow: 'hidden',
        minWidth: 0,
        ...styles.fontBase,
      }}
    >
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, fontFamily: "'Playfair Display', serif", letterSpacing: '-0.02em', color: '#ffffff' }}>
            Leads ({total})
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)', ...styles.fontBase }}>
            Imported leads associated with this campaign.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {!isSelectionMode ? (
            <>
              <button
                type="button"
                onClick={() => setIsSelectionMode(true)}
                disabled={selectionDisabled}
                style={{
                  ...styles.btnBase,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#ffffff',
                  padding: '8px 14px',
                  opacity: selectionDisabled ? 0.45 : 1,
                  cursor: selectionDisabled ? 'not-allowed' : 'pointer',
                }}
              >
                Select
              </button>
              <button
                type="button"
                onClick={onImport}
                style={{
                  ...styles.btnBase,
                  backgroundColor: '#FFE600',
                  border: 'none',
                  color: '#121212',
                  fontWeight: 600,
                  padding: '8px 14px',
                }}
              >
                + Import Leads
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setSelectedLeadIds(new Set(visibleLeadIds))}
                disabled={allVisibleSelected}
                style={{
                  ...styles.btnBase,
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#ffffff',
                  opacity: allVisibleSelected ? 0.4 : 1,
                  cursor: allVisibleSelected ? 'not-allowed' : 'pointer',
                }}
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => setSelectedLeadIds(new Set<number>())}
                disabled={selectedCount === 0}
                style={{
                  ...styles.btnBase,
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#ffffff',
                  opacity: selectedCount === 0 ? 0.4 : 1,
                  cursor: selectedCount === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                Unselect All
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={selectedCount === 0 || !onDeleteSelected}
                style={{
                  ...styles.btnBase,
                  background: selectedCount > 0 && onDeleteSelected ? 'rgba(255,95,86,0.1)' : 'transparent',
                  border: selectedCount > 0 && onDeleteSelected ? '1px solid rgba(255,95,86,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  color: selectedCount > 0 && onDeleteSelected ? '#ff6b6b' : 'rgba(255,255,255,0.35)',
                  opacity: selectedCount === 0 || !onDeleteSelected ? 0.5 : 1,
                  cursor: selectedCount === 0 || !onDeleteSelected ? 'not-allowed' : 'pointer',
                }}
              >
                Delete Selected{selectedCount > 0 ? ` (${selectedCount})` : ''}
              </button>
              <button
                type="button"
                onClick={handleExitSelectionMode}
                style={{
                  ...styles.btnBase,
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.55)',
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {isSelectionMode && (
        <div style={{ padding: '9px 24px', background: 'rgba(255,230,0,0.035)', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: '11px', ...styles.fontBase }}>
          {selectedCount === 0 ? 'No leads selected.' : `${selectedCount} lead${selectedCount === 1 ? '' : 's'} selected.`}
        </div>
      )}

      {isLoading && (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '13px', ...styles.fontBase }}>
          Loading leads...
        </div>
      )}

      {!isLoading && isError && (
        <div style={{ padding: '48px 24px', textAlign: 'center', ...styles.fontBase }}>
          <div style={{ color: '#ff6b6b', fontSize: '13px' }}>Failed to load campaign leads.</div>
          {error instanceof Error && <div style={{ marginTop: '6px', color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>{error.message}</div>}
          <button
            type="button"
            onClick={onRetry}
            style={{ ...styles.btnBase, marginTop: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff', padding: '7px 12px', fontSize: '12px' }}
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && leads.length === 0 && (
        <div style={{ padding: '56px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', ...styles.fontBase }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,230,0,0.08)', border: '1px solid rgba(255,230,0,0.16)', color: '#FFE600', fontSize: '22px', marginBottom: '14px' }}>
            +
          </div>
          <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>No leads imported yet</div>
          <div style={{ maxWidth: '460px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
            Import a CSV or Excel file containing each lead's email and at least one research source.
          </div>
        </div>
      )}

      {!isLoading && !isError && leads.length > 0 && (
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', ...styles.fontBase }}>
            <colgroup>
              {isSelectionMode && <col style={{ width: '48px' }} />}
              <col style={{ width: isSelectionMode ? '21%' : '22%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '10%' }} />
            </colgroup>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
                {isSelectionMode && (
                  <th style={styles.checkboxCell}>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', ...styles.fontBase }}>#</span>
                  </th>
                )}
                <th style={styles.headerCell}>Name</th>
                <th style={styles.headerCell}>Email</th>
                <th style={styles.headerCell}>LinkedIn</th>
                <th style={styles.headerCell}>Company</th>
                <th style={styles.headerCell}>Website</th>
                <th style={{ ...styles.headerCell, textAlign: 'left' }}>Report</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const isSelected = selectedLeadIds.has(lead.id);
                const reportState = getReportState(lead);
                const canViewReport = reportState === 'planned' && Boolean(onViewReport);

                return (
                  <tr
                    key={lead.id}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      backgroundColor: isSelected ? 'rgba(255,230,0,0.035)' : 'transparent',
                      transition: 'background-color 0.12s ease',
                    }}
                  >
                    {isSelectionMode && (
                      <td style={styles.checkboxCell}>
                        <input
                          type="checkbox"
                          aria-label={`Select ${getLeadDisplayName(lead)}`}
                          checked={isSelected}
                          onChange={() => handleToggleLead(lead.id)}
                          style={{ width: '15px', height: '15px', accentColor: '#FFE600', cursor: 'pointer' }}
                        />
                      </td>
                    )}
                    <td style={styles.leadNameCell}>{getLeadDisplayName(lead)}</td>
                    <td style={{ ...styles.cell, color: 'rgba(255,255,255,0.72)' }}>{truncate(lead.email, 6)}</td>
                    <td style={styles.cell}>
                      {lead.linkedin_url ? (
                        <a href={lead.linkedin_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={styles.link}>
                          {truncate(formatUrl(lead.linkedin_url), 6)}
                        </a>
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.28)' }}>—</span>
                      )}
                    </td>
                    <td style={{ ...styles.cell, color: 'rgba(255,255,255,0.8)' }}>{lead.company || '—'}</td>
                    <td style={styles.cell}>
                      {lead.website ? (
                        <a href={lead.website} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={styles.link}>
                          {truncate(formatUrl(lead.website), 6)}
                        </a>
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.28)' }}>—</span>
                      )}
                    </td>
                    <td style={{ ...styles.cell, textAlign: 'left' }}>
                      {reportState === 'not-planned' && <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>Not Planned</span>}
                      {reportState === 'planning' && <span style={{ color: 'rgba(255,230,0,0.8)', fontSize: '12px' }}>Planning...</span>}
                      {reportState === 'planned' && (
                        <button
                          type="button"
                          onClick={() => onViewReport?.(lead)}
                          disabled={!canViewReport}
                          title="View and edit report"
                          style={{
                            ...styles.btnBase,
                            background: canViewReport ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: canViewReport ? '#ffffff' : 'rgba(255,255,255,0.4)',
                            padding: '6px 10px',
                            fontSize: '12px',
                            cursor: canViewReport ? 'pointer' : 'not-allowed',
                          }}
                        >
                          View Report
                        </button>
                      )}
                      {reportState === 'failed' && <span style={{ color: '#ff5f56', fontSize: '12px' }}>Failed</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default LeadsTable;