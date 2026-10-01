// src/renderer/components/dashboard/campaigns/CampaignLeadReportModal.tsx

import React, { useEffect, useState } from 'react';
import type { CampaignLead, UpdateCampaignLeadReportRequest } from '../../../../services/campaigns/campaign.types';

export interface CampaignLeadReportModalProps {
  isOpen: boolean;
  lead: CampaignLead | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (data: UpdateCampaignLeadReportRequest) => void | Promise<void>;
}

interface KeyPointItem {
  claim: string;
  evidence_type?: string;
  relevance?: string;
  source_url?: string;
}

interface SupportingSignalItem {
  claim: string;
  importance?: string;
  source?: string;
}

interface EvidenceParsedData {
  key_points?: KeyPointItem[];
  supporting_signals?: SupportingSignalItem[];
  interpretation?: string;
  limitations?: string[];
  summary?: string;
}

function getLeadDisplayName(lead: CampaignLead): string {
  return lead.name?.trim() || lead.email?.trim() || lead.company?.trim() || `Lead #${lead.id}`;
}

function normalizeValue(value: string | null): string {
  return value ?? '';
}

function parseEvidenceJson(raw: string): EvidenceParsedData | null {
  if (!raw || !raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      (parsed.key_points || parsed.supporting_signals || parsed.summary || parsed.interpretation || parsed.limitations)
    ) {
      return parsed as EvidenceParsedData;
    }
  } catch {
    // Plain text evidence fallback
  }
  return null;
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 1100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: 'rgba(0,0,0,0.72)',
    backdropFilter: 'blur(4px)',
    fontFamily: "'Montserrat', sans-serif",
  },
  modal: {
    width: '100%',
    maxWidth: '1000px',
    maxHeight: 'calc(100vh - 48px)',
    display: 'flex',
    flexDirection: 'column' as const,
    background: '#161616',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    boxShadow: '0 24px 90px rgba(0,0,0,0.5)',
    overflow: 'hidden',
    color: '#ffffff',
    fontFamily: "'Montserrat', sans-serif",
  },
  header: {
    padding: '18px 22px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  heading: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    fontFamily: "'Playfair Display', serif",
    letterSpacing: '-0.02em',
  },
  sectionTitle: {
    marginBottom: '12px',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: "'Playfair Display', serif",
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: '-0.01em',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '11px',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.42)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.4px',
    fontFamily: "'Montserrat', sans-serif",
  },
  input: {
    width: '100%',
    boxSizing: 'border-box' as const,
    borderRadius: '0px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.035)',
    color: '#ffffff',
    outline: 'none',
    fontFamily: "'Montserrat', sans-serif",
    fontSize: '12px',
    lineHeight: 1.55,
    padding: '9px 10px',
  },
  textarea: {
    width: '100%',
    boxSizing: 'border-box' as const,
    resize: 'vertical' as const,
    borderRadius: '0px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.035)',
    color: '#ffffff',
    outline: 'none',
    fontFamily: "'Montserrat', sans-serif",
    fontSize: '12px',
    lineHeight: 1.55,
    padding: '10px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0',
  },
  btnBase: {
    borderRadius: '0px',
    fontSize: '12px',
    fontWeight: 500,
    padding: '8px 14px',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    fontFamily: "'Montserrat', sans-serif",
  },
  accordionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.035)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.85)',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.4px',
    cursor: 'pointer',
    textAlign: 'left' as const,
    fontFamily: "'Montserrat', sans-serif",
  },
  accordionContent: {
    padding: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
    borderTop: 'none',
    background: 'rgba(0,0,0,0.2)',
  },
  cardCell: {
    padding: '10px 12px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.02)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  sourceBadge: {
    display: 'inline-block',
    alignSelf: 'flex-start' as const,
    fontSize: '9px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    padding: '2px 6px',
    borderRadius: '0px',
    background: 'rgba(255,230,0,0.1)',
    border: '1px solid rgba(255,230,0,0.25)',
    color: '#FFE600',
  },
  sourceLink: {
    fontSize: '11px',
    color: '#FFE600',
    textDecoration: 'underline',
    wordBreak: 'break-all' as const,
    lineHeight: '1.4',
  },
};

export const CampaignLeadReportModal: React.FC<CampaignLeadReportModalProps> = ({
  isOpen,
  lead,
  isSaving,
  onClose,
  onSave,
}) => {
  const [linkedinEvidence, setLinkedinEvidence] = useState('');
  const [websiteEvidence, setWebsiteEvidence] = useState('');
  const [overallEvidence, setOverallEvidence] = useState('');
  const [outreachAngle, setOutreachAngle] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const [expandedLinkedin, setExpandedLinkedin] = useState(true);
  const [expandedWebsite, setExpandedWebsite] = useState(false);
  const [expandedOverall, setExpandedOverall] = useState(false);
  const [expandedOutreach, setExpandedOutreach] = useState(false);

  useEffect(() => {
    if (!lead) {
      setLinkedinEvidence('');
      setWebsiteEvidence('');
      setOverallEvidence('');
      setOutreachAngle('');
      setEmailSubject('');
      setEmailBody('');
      return;
    }

    setLinkedinEvidence(normalizeValue(lead.linkedin_evidence));
    setWebsiteEvidence(normalizeValue(lead.website_evidence));
    setOverallEvidence(normalizeValue(lead.overall_evidence));
    setOutreachAngle(normalizeValue(lead.outreach_angle));
    setEmailSubject(normalizeValue(lead.email_subject));
    setEmailBody(normalizeValue(lead.email_body));
  }, [lead]);

  const handleSave = async () => {
    if (!lead) return;
    await onSave({
      linkedin_evidence: linkedinEvidence.trim() || null,
      website_evidence: websiteEvidence.trim() || null,
      overall_evidence: overallEvidence.trim() || null,
      outreach_angle: outreachAngle.trim() || null,
      email_subject: emailSubject.trim() || null,
      email_body: emailBody.trim() || null,
    });
  };

  if (!isOpen || !lead) return null;

  const linkedInParsed = parseEvidenceJson(linkedinEvidence);
  const websiteParsed = parseEvidenceJson(websiteEvidence);
  const overallParsed = parseEvidenceJson(overallEvidence);

  return (
    <div
      style={styles.overlay}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="campaign-lead-report-title" style={styles.modal}>
        {/* HEADER */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <h2 id="campaign-lead-report-title" style={styles.heading}>
                Lead Report
              </h2>
              <div style={{ marginTop: '5px', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                {getLeadDisplayName(lead)}
                {lead.company ? ` · ${lead.company}` : ''}
              </div>
            </div>

            <span
              style={{
                flexShrink: 0,
                padding: '5px 8px',
                borderRadius: '0px',
                background: lead.status === 'PLANNED' ? 'rgba(39,201,63,0.1)' : lead.status === 'FAILED' ? 'rgba(255,95,86,0.1)' : 'rgba(255,255,255,0.05)',
                border: lead.status === 'PLANNED' ? '1px solid rgba(39,201,63,0.2)' : lead.status === 'FAILED' ? '1px solid rgba(255,95,86,0.2)' : '1px solid rgba(255,255,255,0.08)',
                color: lead.status === 'PLANNED' ? '#27c93f' : lead.status === 'FAILED' ? '#ff6b6b' : 'rgba(255,255,255,0.5)',
                fontSize: '10px',
                fontWeight: 600,
              }}
            >
              {lead.status}
            </span>
          </div>
        </div>

        {/* 2-COLUMN BODY */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', overflowY: 'auto', minHeight: 0, flex: 1 }}>
          {/* LEFT COLUMN: ACCORDION PANELS */}
          <div style={{ padding: '22px', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
            <div>
              <div style={styles.sectionTitle}>Research Evidence</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* LINKEDIN EVIDENCE ACCORDION */}
                <div>
                  <button
                    type="button"
                    onClick={() => setExpandedLinkedin((prev) => !prev)}
                    style={styles.accordionHeader}
                  >
                    <span>LinkedIn Evidence</span>
                    <span>{expandedLinkedin ? '▲' : '▼'}</span>
                  </button>
                  {expandedLinkedin && (
                    <div style={styles.accordionContent}>
                      {linkedInParsed && linkedInParsed.key_points ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {linkedInParsed.key_points.map((item, idx) => (
                            <div key={idx} style={styles.cardCell}>
                              <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff', lineHeight: '1.4' }}>
                                {item.claim}
                              </div>
                              {item.relevance && (
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.4' }}>
                                  {item.relevance}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <textarea
                          value={linkedinEvidence}
                          onChange={(e) => setLinkedinEvidence(e.target.value)}
                          disabled={isSaving}
                          placeholder="LinkedIn-derived evidence..."
                          style={{ ...styles.textarea, minHeight: '110px' }}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* WEBSITE EVIDENCE ACCORDION */}
                <div>
                  <button
                    type="button"
                    onClick={() => setExpandedWebsite((prev) => !prev)}
                    style={styles.accordionHeader}
                  >
                    <span>Website Evidence</span>
                    <span>{expandedWebsite ? '▲' : '▼'}</span>
                  </button>
                  {expandedWebsite && (
                    <div style={styles.accordionContent}>
                      {websiteParsed && websiteParsed.key_points ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {websiteParsed.key_points.map((item, idx) => (
                            <div key={idx} style={styles.cardCell}>
                              <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff', lineHeight: '1.4' }}>
                                {item.claim}
                              </div>
                              {item.source_url && (
                                <a
                                  href={item.source_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={styles.sourceLink}
                                >
                                  {item.source_url}
                                </a>
                              )}
                              {item.relevance && (
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.4' }}>
                                  {item.relevance}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <textarea
                          value={websiteEvidence}
                          onChange={(e) => setWebsiteEvidence(e.target.value)}
                          disabled={isSaving}
                          placeholder="Website-derived evidence..."
                          style={{ ...styles.textarea, minHeight: '110px' }}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div style={styles.sectionTitle}>Synthesis</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* OVERALL EVIDENCE ACCORDION */}
                <div>
                  <button
                    type="button"
                    onClick={() => setExpandedOverall((prev) => !prev)}
                    style={styles.accordionHeader}
                  >
                    <span>Overall Evidence</span>
                    <span>{expandedOverall ? '▲' : '▼'}</span>
                  </button>
                  {expandedOverall && (
                    <div style={styles.accordionContent}>
                      {overallParsed && (overallParsed.supporting_signals || overallParsed.key_points) ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {(overallParsed.supporting_signals || overallParsed.key_points!).map((item: any, idx: number) => (
                            <div key={idx} style={styles.cardCell}>
                              <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff', lineHeight: '1.4' }}>
                                {item.claim}
                              </div>
                              {item.source && (
                                <span style={styles.sourceBadge}>
                                  Source: {item.source}
                                </span>
                              )}
                              {(item.importance || item.relevance) && (
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.4' }}>
                                  {item.importance || item.relevance}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <textarea
                          value={overallEvidence}
                          onChange={(e) => setOverallEvidence(e.target.value)}
                          disabled={isSaving}
                          placeholder="Overall evidence and factual synthesis..."
                          style={{ ...styles.textarea, minHeight: '110px' }}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* OUTREACH ANGLE ACCORDION */}
                <div>
                  <button
                    type="button"
                    onClick={() => setExpandedOutreach((prev) => !prev)}
                    style={styles.accordionHeader}
                  >
                    <span>Outreach Angle</span>
                    <span>{expandedOutreach ? '▲' : '▼'}</span>
                  </button>
                  {expandedOutreach && (
                    <div style={styles.accordionContent}>
                      {outreachAngle ? (
                        <div style={styles.cardCell}>
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.5' }}>
                            {outreachAngle}
                          </div>
                        </div>
                      ) : (
                        <textarea
                          value={outreachAngle}
                          onChange={(e) => setOutreachAngle(e.target.value)}
                          disabled={isSaving}
                          placeholder="Personalized outreach angle..."
                          style={{ ...styles.textarea, minHeight: '110px' }}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: EMAIL SUBJECT & BODY */}
          <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
            <div style={styles.sectionTitle}>Email Draft</div>

            <label style={styles.field}>
              <span style={styles.label}>Subject</span>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                disabled={isSaving}
                placeholder="Email subject..."
                style={styles.input}
              />
            </label>

            <label style={{ ...styles.field, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span style={styles.label}>Body</span>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                disabled={isSaving}
                placeholder="Email body..."
                style={{ ...styles.textarea, flex: 1, minHeight: '380px' }}
              />
            </label>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', padding: '14px 22px', borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.015)' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            style={{
              ...styles.btnBase,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.65)',
              opacity: isSaving ? 0.45 : 1,
              cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            style={{
              ...styles.btnBase,
              border: 'none',
              background: isSaving ? 'rgba(255,230,0,0.35)' : '#FFE600',
              color: '#121212',
              fontWeight: 600,
              minWidth: '90px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
          >
            {isSaving ? 'Saving...' : 'Save Report'}
          </button>
        </div>
      </section>
    </div>
  );
};

export default CampaignLeadReportModal;