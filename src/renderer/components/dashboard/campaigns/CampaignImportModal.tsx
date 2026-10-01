import React from 'react';

export interface CampaignImportModalProps {
  isOpen: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  selectedImportFile: File | null;
  selectedImportFileName: string;
  isImporting: boolean;
  onClose: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChooseFile: () => void;
  onImport: () => void | Promise<void>;
}

const CampaignImportModal: React.FC<CampaignImportModalProps> = ({
  isOpen, fileInputRef, selectedImportFile, selectedImportFileName, isImporting,
  onClose, onFileChange, onChooseFile, onImport,
}) => {
  if (!isOpen) return null;

  const isDisabled = isImporting || !selectedImportFile;

  return (
    <>
      <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={onFileChange} style={{ display: 'none' }} />

      <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '440px', backgroundColor: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', boxShadow: '0 24px 80px rgba(0,0,0,0.5)', fontFamily: "'Montserrat', sans-serif" }}>
          
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, fontFamily: "'Playfair Display', serif", letterSpacing: '-0.02em', color: '#ffffff' }}>Import Leads</h2>
            <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
              Upload a CSV or Excel file containing an email column along with LinkedIn or website URLs.
            </p>
          </div>

          <div 
            onClick={onChooseFile}
            style={{ 
              border: '1px dashed rgba(255,255,255,0.15)', 
              borderRadius: '8px', 
              padding: '24px 16px', 
              textAlign: 'center', 
              background: 'rgba(255,255,255,0.02)',
              cursor: isImporting ? 'not-allowed' : 'pointer',
              transition: 'border-color 0.15s ease'
            }}
          >
            {selectedImportFile ? (
              <div>
                <div style={{ color: '#ffffff', fontSize: '13px', fontWeight: 500, wordBreak: 'break-word' }}>{selectedImportFileName}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', marginTop: '4px' }}>{(selectedImportFile.size / 1024).toFixed(1)} KB</div>
              </div>
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                Click to select CSV, XLSX, or XLS
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
            <button type="button" onClick={onClose} disabled={isImporting} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff', padding: '9px 16px', fontSize: '12px', cursor: isImporting ? 'not-allowed' : 'pointer' }}>Cancel</button>
            <button type="button" onClick={onImport} disabled={isDisabled} style={{ backgroundColor: '#FFE600', color: '#121212', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '12px', fontWeight: 600, cursor: isDisabled ? 'not-allowed' : 'pointer', opacity: isDisabled ? 0.5 : 1 }}>
              {isImporting ? 'Importing...' : 'Import'}
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default CampaignImportModal;