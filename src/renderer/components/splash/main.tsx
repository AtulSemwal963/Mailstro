import React from 'react';
import splashBackground from '../../assets/splash_bg.jpg';
import icon from '../../assets/icon.png';

export const SplashScreen: React.FC = () => {
  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@500;600;700&display=swap');

          /* ----------------------------------------
              LOGO SHIFT
          ---------------------------------------- */

          @keyframes logoShift {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-32px);
            }
          }

          /* ----------------------------------------
              WORDMARK REVEAL
          ---------------------------------------- */

          @keyframes wordmarkReveal {
            0% {
              opacity: 0;
              transform: translateX(20px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }

          /* ----------------------------------------
              SUBHEADING ONE
          ---------------------------------------- */

          @keyframes subtitleOne {
            0% {
              opacity: 0;
              transform: translateY(6px);
            }
            15% {
              opacity: 1;
              transform: translateY(0);
            }
            75% {
              opacity: 1;
              transform: translateY(0);
            }
            100% {
              opacity: 0;
              transform: translateY(-6px);
            }
          }

          /* ----------------------------------------
              SUBHEADING TWO
          ---------------------------------------- */

          @keyframes subtitleTwo {
            0% {
              opacity: 0;
              transform: translateY(6px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* ----------------------------------------
              CLASS ASSIGNMENTS
          ---------------------------------------- */

          .splash-logo {
            animation: logoShift 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
            will-change: transform;
          }

          .splash-wordmark {
            animation: wordmarkReveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
            will-change: transform, opacity;
          }

          .splash-subtitle-one {
            opacity: 0;
            animation: subtitleOne 2.6s cubic-bezier(0.16, 1, 0.3, 1) 1.2s forwards;
            will-change: transform, opacity;
          }

          .splash-subtitle-two {
            opacity: 0;
            animation: subtitleTwo 0.8s cubic-bezier(0.16, 1, 0.3, 1) 3.8s forwards;
            will-change: transform, opacity;
          }
        `}
      </style>

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: `url(${splashBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          userSelect: 'none',
          WebkitAppRegion: 'drag',
        } as React.CSSProperties}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={icon}
            alt="Mailstro Icon"
            className="splash-logo"
            style={{
              width: '110px',
              height: '110px',
              objectFit: 'contain',
              position: 'relative',
              zIndex: 2,
            }}
            draggable={false}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              marginLeft: '16px',
            }}
          >
            <div
              className="splash-wordmark"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '56px',
                fontWeight: 600,
                letterSpacing: '-1.5px',
                color: '#ffffff',
                whiteSpace: 'nowrap',
                position: 'relative',
                zIndex: 1,
              }}
            >
              Mailstro
            </div>

            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '28px',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}
            >
              <div
                className="splash-subtitle-one"
                style={{
                  position: 'absolute',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '18px',
                  fontWeight: 500,
                  letterSpacing: '0.2px',
                  color: '#FFE600',
                  whiteSpace: 'nowrap',
                }}
              >
                Your Local Outbound Agent
              </div>

              <div
                className="splash-subtitle-two"
                style={{
                  position: 'absolute',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '18px',
                  fontWeight: 500,
                  letterSpacing: '0.2px',
                  color: '#FFE600',
                  whiteSpace: 'nowrap',
                }}
              >
                Always Yours.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SplashScreen;