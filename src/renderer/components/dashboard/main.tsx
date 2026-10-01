import React, { useState } from 'react';
import Home from './Home';
import Settings from './Settings';
import Campaigns from './Campaigns';
import Workflows from './Workflows';
import CampaignDetail from './campaigns/main';
import logoIcon from '../../../assets/icon.png';

type DashboardPage = 'home' | 'campaigns' | 'campaign-detail' | 'settings' | 'workflows';

export const DashboardScreen: React.FC = () => {
  const [activePage, setActivePage] = useState<DashboardPage>('home');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const openCampaign = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setActivePage('campaign-detail');
  };

  const backToCampaigns = () => {
    setSelectedCampaignId(null);
    setActivePage('campaigns');
  };

  const navigateTo = (page: DashboardPage) => {
    setSelectedCampaignId(null);
    setActivePage(page);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <Home />;
      case 'campaigns':
        return <Campaigns onCampaignClick={openCampaign} />;
      case 'campaign-detail':
        if (!selectedCampaignId) {
          return (
            <div style={{ minHeight: '100%', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: '#ffffff' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '8px' }}>No Campaign Selected</h1>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '20px' }}>Select a campaign to view its details.</p>
              <button type="button" onClick={backToCampaigns} style={{ backgroundColor: '#FFE600', color: '#121212', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Back to Campaigns
              </button>
            </div>
          );
        }
        return <CampaignDetail campaignId={selectedCampaignId} onBack={backToCampaigns} />;
      case 'settings':
        return <Settings />;
      case 'workflows':
        return <Workflows />;
      default:
        return <Home />;
    }
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body, #root { width: 100%; height: 100%; overflow: hidden; background-color: #121212; }
          .dashboard-nav-item { transition: background-color 0.15s ease, color 0.15s ease; }
          .dashboard-nav-item:hover { background-color: rgba(255, 255, 255, 0.05) !important; color: #ffffff !important; }
          .dashboard-nav-item.active { background-color: rgba(255, 230, 0, 0.1) !important; color: #ffe600 !important; border-right: 2px solid #ffe600 !important; }
          .dashboard-custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .dashboard-custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.1); }
          .dashboard-custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 3px; }
          .dashboard-custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.25); }
        `}
      </style>

      <div style={{ display: 'flex', width: '100%', height: '100vh', backgroundColor: '#121212', color: '#ffffff', fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
        <aside style={{ width: '240px', height: '100%', backgroundColor: '#161616', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', flexShrink: 0, userSelect: 'none' }}>
          <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <img src={logoIcon} alt="Mailstro Logo" style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '6px' }} />
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 600, letterSpacing: '-0.5px' }}>Mailstro</span>
          </div>

          <nav style={{ padding: '16px 0' }}>
            <NavItem label="Home" active={activePage === 'home'} onClick={() => navigateTo('home')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </NavItem>

            <NavItem label="Campaigns" active={activePage === 'campaigns' || activePage === 'campaign-detail'} onClick={() => navigateTo('campaigns')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9" />
                <polyline points="22 17 19 20 17 18" />
                <path d="M2 6l10 7 10-7" />
              </svg>
            </NavItem>

            <NavItem label="Workflows" active={activePage === 'workflows'} onClick={() => navigateTo('workflows')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="23" y1="21" x2="16" y2="16" />
              </svg>
            </NavItem>

            <NavItem label="Settings" active={activePage === 'settings'} onClick={() => navigateTo('settings')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </NavItem>
          </nav>
        </aside>

        <main className="dashboard-custom-scrollbar" style={{ flex: 1, minWidth: 0, height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
          {renderPage()}
        </main>
      </div>
    </>
  );
};

interface NavItemProps {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ label, active, onClick, children }) => (
  <button
    type="button"
    className={`dashboard-nav-item ${active ? 'active' : ''}`}
    onClick={onClick}
    style={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 20px',
      backgroundColor: 'transparent',
      border: 'none',
      borderRight: '2px solid transparent',
      color: 'rgba(255,255,255,0.6)',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      textAlign: 'left',
    }}
  >
    {children}
    {label}
  </button>
);

export default DashboardScreen;