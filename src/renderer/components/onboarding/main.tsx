import React from 'react';

export const OnboardingScreen: React.FC = () => {
  const handleGoogleContinue = (): void => {
    // Development-only bypass for OAuth.
    window.location.hash = '#/dashboard';
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');

          *,
          *::before,
          *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          html,
          body,
          #root {
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: #121212;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(8px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pulseGlow {
            0%,
            100% {
              opacity: 0.4;
              transform: scale(1);
            }

            50% {
              opacity: 0.7;
              transform: scale(1.05);
            }
          }

          .animate-fade-in {
            animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          .animate-glow {
            animation: pulseGlow 8s ease-in-out infinite;
          }

          .google-btn {
            transition:
              background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .google-btn:hover {
            background-color: #f8fafc !important;
            border-color: #cbd5e1 !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .google-btn:active {
            transform: translateY(0);
            box-shadow: none;
          }
        `}
      </style>

      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100vh',
          maxHeight: '100vh',
          backgroundColor: '#121212',
          color: '#ffffff',
          fontFamily: "'Inter', sans-serif",
          overflow: 'hidden',
          userSelect: 'none',
          boxSizing: 'border-box',
        }}
      >
        {/* LEFT COLUMN: AUTHENTICATION */}

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 'clamp(24px, 4vh, 48px) clamp(32px, 5vw, 64px)',
            backgroundColor: '#161616',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            zIndex: 2,
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          {/* Brand Header */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#FFE600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: '#121212',
                fontSize: '18px',
                fontFamily: "'Playfair Display', serif",
              }}
            >
              M
            </div>

            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '22px',
                fontWeight: 600,
                letterSpacing: '-0.5px',
              }}
            >
              Mailstro
            </span>
          </div>

          {/* Login Action Area */}

          <div
            className="animate-fade-in"
            style={{
              maxWidth: '380px',
              width: '100%',
              margin: '0 auto',
            }}
          >
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 600,
                letterSpacing: '-0.8px',
                marginBottom: '8px',
                color: '#ffffff',
              }}
            >
              Get started
            </h1>

            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '36px',
                lineHeight: 1.5,
              }}
            >
              Sign in to access your local outbound agent pipeline and
              orchestrate messaging workflows.
            </p>

            {/* Google OAuth Button */}

            <button
              type="button"
              className="google-btn"
              onClick={handleGoogleContinue}
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path
                  fill="#4285F4"
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z"
                />

                <path
                  fill="#34A853"
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                />

                <path
                  fill="#FBBC05"
                  d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                />

                <path
                  fill="#EA4335"
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                />
              </svg>

              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#0f172a',
                }}
              >
                Continue with Google
              </span>
            </button>

            <div
              style={{
                marginTop: '24px',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.4)',
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              By continuing, you agree to Mailstro's{' '}
              <a
                href="#terms"
                onClick={(event) => event.preventDefault()}
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                }}
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="#privacy"
                onClick={(event) => event.preventDefault()}
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                }}
              >
                Privacy Policy
              </a>
              .
            </div>
          </div>

          {/* Footer Metadata */}

          <div
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.3)',
            }}
          >
            © {new Date().getFullYear()} Mailstro Inc. Local execution engine.
          </div>
        </div>

        {/* RIGHT COLUMN: GRAPHICS & DISPLAY */}

        <div
          style={{
            flex: 1.2,
            backgroundColor: '#0d0d0d',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 'clamp(24px, 4vh, 64px)',
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          {/* Ambient Glow */}

          <div
            className="animate-glow"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              maxWidth: '500px',
              maxHeight: '500px',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(255, 230, 0, 0.08) 0%, rgba(0, 0, 0, 0) 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Structural Graphic */}

          <div
            className="animate-fade-in"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '440px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '24px',
              backdropFilter: 'blur(8px)',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                paddingBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', gap: '6px' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#ff5f56',
                  }}
                />

                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#ffbd2e',
                  }}
                />

                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#27c93f',
                  }}
                />
              </div>

              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: 'rgba(255, 255, 255, 0.4)',
                }}
              >
                agent_runtime.log
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '6px',
                  borderLeft: '2px solid #FFE600',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
              >
                <div
                  style={{
                    color: '#FFE600',
                    fontWeight: 600,
                  }}
                >
                  SYSTEM_READY
                </div>

                <div
                  style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginTop: '2px',
                  }}
                >
                  Local outbound agent initialized.
                </div>
              </div>

              <div
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '6px',
                  borderLeft: '2px solid rgba(255, 255, 255, 0.2)',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
              >
                <div
                  style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  PIPELINE_STATUS
                </div>

                <div
                  style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    marginTop: '2px',
                  }}
                >
                  Awaiting OAuth authentication scope...
                </div>
              </div>
            </div>
          </div>

          {/* Contextual Text */}

          <div
            style={{
              marginTop: '40px',
              textAlign: 'center',
              maxWidth: '400px',
            }}
          >
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '24px',
                fontWeight: 600,
                color: '#ffffff',
                marginBottom: '12px',
              }}
            >
              Your Local Outbound Agent
            </h2>

            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.5)',
                lineHeight: 1.6,
              }}
            >
              Execute local messaging sequences with complete data sovereignty
              and deterministic controls.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingScreen;