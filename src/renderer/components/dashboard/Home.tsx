import React from 'react';

import goldenBg from '../../assets/shimmering_golden_bg.jpg';

import { useCampaignStats } from '../../../hooks/campaigns';


// ============================================================================
// TYPES
// ============================================================================

interface Campaign {
  id: string;
  name: string;
  status: 'Active' | 'Draft' | 'Completed' | 'Paused';
  description: string;
  createdAt: string;
}


// ============================================================================
// TEMPORARY RECENT CAMPAIGNS
// ============================================================================
//
// These remain static until the dashboard is connected to a recent-campaign
// endpoint.
//

const recentCampaigns: Campaign[] = [
  {
    id: 'cmp_1',
    name: 'Q3 Product Update Blast',
    status: 'Active',
    description:
      'Targeted reachout for existing enterprise users announcing the main release of new modular intelligence workflows.',
    createdAt: 'Sep 24, 2026',
  },
  {
    id: 'cmp_2',
    name: 'Inbound Founder Sequence',
    status: 'Active',
    description:
      'Automated multi-touch outreach geared towards incoming early-stage founders seeking infrastructure advisory.',
    createdAt: 'Sep 22, 2026',
  },
  {
    id: 'cmp_3',
    name: 'Enterprise Cold Outreach v2',
    status: 'Paused',
    description:
      'Cold pipeline targeting technical directors and engineering leads across high-growth SaaS organizations.',
    createdAt: 'Sep 18, 2026',
  },
];


// ============================================================================
// HOME
// ============================================================================

export const Home: React.FC = () => {

  // --------------------------------------------------------------------------
  // CAMPAIGN DASHBOARD STATS
  // --------------------------------------------------------------------------
  //
  // GET /campaigns/stats
  //
  // Returns:
  //
  //   total_mails_sent
  //   total_campaigns
  //   total_leads
  //

  const {
    data: campaignStats,
    isLoading: isCampaignStatsLoading,
    isError: isCampaignStatsError,
  } = useCampaignStats();


  // --------------------------------------------------------------------------
  // DISPLAY VALUES
  // --------------------------------------------------------------------------

  const mailsSentValue =
    isCampaignStatsLoading
      ? '...'
      : isCampaignStatsError
        ? '—'
        : (
            campaignStats?.total_mails_sent ?? 0
          ).toLocaleString();

  const campaignsValue =
    isCampaignStatsLoading
      ? '...'
      : isCampaignStatsError
        ? '—'
        : (
            campaignStats?.total_campaigns ?? 0
          ).toLocaleString();

  const leadsValue =
    isCampaignStatsLoading
      ? '...'
      : isCampaignStatsError
        ? '—'
        : (
            campaignStats?.total_leads ?? 0
          ).toLocaleString();


  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Montserrat', sans-serif",
      }}
    >

      {/* ==================================================================== */}
      {/* DYNAMIC INLINE STYLES */}
      {/* ==================================================================== */}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');

        .liquid-glass-btn {
          font-family: 'Montserrat', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #ffffff;
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.35);
          padding: 16px 28px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 8px 32px 0 rgba(0, 0, 0, 0.37),
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.4),
            inset 0 -1px 2px 0 rgba(0, 0, 0, 0.2);
          transition: all 0.35s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .liquid-glass-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          transition: left 0.6s ease;
        }

        .liquid-glass-btn:hover {
          color: #121212;
          background: #ffe600;
          border-color: #ffe600;
          box-shadow:
            0 12px 36px rgba(255, 230, 0, 0.45),
            inset 0 1px 2px rgba(255, 255, 255, 0.8);
          transform: translateY(-2px) scale(1.02);
        }

        .liquid-glass-btn:hover::before {
          left: 100%;
        }

        .liquid-glass-btn:active {
          transform: translateY(0) scale(0.98);
        }

        .truncated-desc {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .view-all-btn {
          background-color: rgba(255, 230, 0, 0.1);
          border: 1px solid rgba(255, 230, 0, 0.25);
          color: #ffe600;
          font-size: 12px;
          font-weight: 600;
          padding: 8px 14px;
          border-radius: 6px;
          cursor: pointer;
          font-family: 'Montserrat', sans-serif;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .view-all-btn:hover {
          background-color: rgba(255, 230, 0, 0.2);
          border-color: rgba(255, 230, 0, 0.4);
        }
      `}</style>


      {/* ==================================================================== */}
      {/* BANNER */}
      {/* ==================================================================== */}

      <div
        style={{
          width: '100%',
          height: '40vh',
          backgroundImage: `
            linear-gradient(
              rgba(0,0,0,0.4),
              rgba(0,0,0,0.6)
            ),
            url(${goldenBg})
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 0,
          padding: '40px 48px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            maxWidth: '640px',
          }}
        >
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '42px',
              fontWeight: 600,
              letterSpacing: '-0.8px',
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Welcome
          </h1>

          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '20px',
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.9)',
              marginTop: '12px',
              marginBottom: 0,
              lineHeight: 1.3,
            }}
          >
            Spin up your next Campaign and put your agent to work
          </p>
        </div>


        <button
          className="liquid-glass-btn"
          onClick={() => {}}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line
              x1="12"
              y1="5"
              x2="12"
              y2="19"
            />

            <line
              x1="5"
              y1="12"
              x2="19"
              y2="12"
            />
          </svg>

          Create Campaign
        </button>
      </div>


      {/* ==================================================================== */}
      {/* LOWER BODY */}
      {/* ==================================================================== */}

      <div
        style={{
          padding: '32px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}
      >

        {/* ================================================================== */}
        {/* METRICS */}
        {/* ================================================================== */}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '18px',
              fontWeight: 600,
              letterSpacing: '-0.3px',
              margin: 0,
            }}
          >
            Overview
          </h3>


          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
            }}
          >
            <MetricCard
              label="Outbound Volume"
              value={mailsSentValue}
            />

            <MetricCard
              label="Total Campaigns"
              value={campaignsValue}
            />

            <MetricCard
              label="Leads Aggregated"
              value={leadsValue}
            />
          </div>
        </div>


        {/* ================================================================== */}
        {/* RECENT CAMPAIGNS */}
        {/* ================================================================== */}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '18px',
                  fontWeight: 600,
                  letterSpacing: '-0.3px',
                  margin: 0,
                }}
              >
                Recent Campaigns
              </h3>
            </div>


            <button className="view-all-btn">
              View all

              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>


          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
            }}
          >
            {recentCampaigns.map((cmp) => (
              <div
                key={cmp.id}
                style={{
                  backgroundColor: '#161616',
                  border:
                    '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <h4
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#ffffff',
                      margin: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    {cmp.name}
                  </h4>

                  <span
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: '11px',
                      color:
                        'rgba(255, 255, 255, 0.4)',
                    }}
                  >
                    {cmp.createdAt}
                  </span>
                </div>


                <p
                  className="truncated-desc"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '12px',
                    color:
                      'rgba(255, 255, 255, 0.6)',
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {cmp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


// ============================================================================
// METRIC CARD
// ============================================================================

interface MetricCardProps {
  label: string;
  value: string;
}


const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
}) => (
  <div
    style={{
      backgroundColor: '#161616',
      border:
        '1px solid rgba(255, 230, 0, 0.25)',
      padding: '20px',
    }}
  >
    <div
      style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '15px',
        fontWeight: 600,
        color: 'rgba(255, 255, 255, 0.85)',
        marginBottom: '8px',
      }}
    >
      {label}
    </div>

    <div
      style={{
        fontFamily: "'Montserrat', sans-serif",
        fontSize: '26px',
        fontWeight: 600,
      }}
    >
      {value}
    </div>
  </div>
);


export default Home;