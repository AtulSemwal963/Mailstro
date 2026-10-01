import React from 'react';

const bodyStyle: React.CSSProperties = {
  margin: '12px 0 0 0',
  fontSize: '15px',
  fontFamily: "'Montserrat', sans-serif",
  fontWeight: 400,
  color: 'rgba(255, 255, 255, 0.7)',
  lineHeight: 1.5,
  whiteSpace: 'pre-wrap',
  maxWidth: '60%',
};

export interface CampaignDescriptionProps {
  description: string | null;
  style?: React.CSSProperties;
}

export const CampaignDescription: React.FC<CampaignDescriptionProps> = ({
  description,
  style,
}) => {
  return (
    <p style={{ ...bodyStyle, ...style }}>
      {description || 'No description provided.'}
    </p>
  );
};

export default CampaignDescription;