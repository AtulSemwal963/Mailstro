import React, { useState } from 'react';

const cardStyle: React.CSSProperties = {
  backgroundColor: '#161616',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '12px',
  overflow: 'hidden',
  color: '#ffffff',
  fontFamily: "'Montserrat', sans-serif",
};

const headerButtonStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 20px',
  background: 'transparent',
  border: 'none',
  color: '#ffffff',
  cursor: 'pointer',
  textAlign: 'left',
  fontFamily: "'Montserrat', sans-serif",
};

const headingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '18px',
  fontWeight: 600,
  fontFamily: "'Playfair Display', serif",
  letterSpacing: '-0.02em',
};

const iconStyle = (isOpen: boolean): React.CSSProperties => ({
  display: 'inline-block',
  fontSize: '12px',
  color: 'rgba(255, 255, 255, 0.45)',
  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
  transition: 'transform 0.2s ease',
  fontFamily: "'Montserrat', sans-serif",
});

const bodyContainerStyle: React.CSSProperties = {
  padding: '0 20px 20px',
  paddingTop: '4px',
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '15px',
  color: 'rgba(255, 255, 255, 0.6)',
  lineHeight: 1.6,
  whiteSpace: 'pre-wrap',
  fontFamily: "'Montserrat', sans-serif",
};

export interface CampaignInstructionsProps {
  instructions: string | null;
  style?: React.CSSProperties;
}

export const CampaignInstructions: React.FC<CampaignInstructionsProps> = ({
  instructions,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section style={{ ...cardStyle, ...style }}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        style={headerButtonStyle}
      >
        <h2 style={headingStyle}>Instructions</h2>
        <span style={iconStyle(isOpen)}>▼</span>
      </button>

      {isOpen && (
        <div style={bodyContainerStyle}>
          <p style={bodyStyle}>{instructions || 'No instructions provided.'}</p>
        </div>
      )}
    </section>
  );
};

export default CampaignInstructions;