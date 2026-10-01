// src/renderer/providers/AppBootstrap.tsx

import React from 'react';

import {
  useAppBootstrap,
} from '../../hooks/app/useAppBootstrap';


// ============================================================================
// PROPS
// ============================================================================

interface AppBootstrapProps {
  children: React.ReactNode;
}


// ============================================================================
// APP BOOTSTRAP
// ============================================================================
//
// Responsibilities:
//
//   - Run application-level initialization.
//   - Keep the renderer blocked only while genuine bootstrap work is pending.
//   - Never require LLM configuration for the application to render.
//
// LLM configuration is optional on first launch.
//
// Therefore:
//
//   LLM configured
//       -> application renders
//
//   LLM not configured
//       -> application renders
//
//   LLM request fails
//       -> application still renders
//
// Backend availability is NOT handled here.
// Electron's main process owns backend startup and health verification.
// ============================================================================

export const AppBootstrap: React.FC<
  AppBootstrapProps
> = ({
  children,
}) => {
  const {
    isLoading,
  } = useAppBootstrap();


  // ==========================================================================
  // INITIAL BOOTSTRAP
  // ==========================================================================

  if (
    isLoading
  ) {
    return (
      <div
        style={{
          minHeight:
            '100vh',

          backgroundColor:
            '#0f0f0f',

          color:
            '#ffffff',

          display:
            'flex',

          alignItems:
            'center',

          justifyContent:
            'center',

          fontFamily:
            "'Inter', sans-serif",

          fontSize:
            '13px',
        }}
      >
        Loading application...
      </div>
    );
  }


  // ==========================================================================
  // APPLICATION
  // ==========================================================================

  return (
    <>
      {children}
    </>
  );
};


export default AppBootstrap;