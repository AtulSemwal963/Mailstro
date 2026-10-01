import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

import QueryProvider from './providers/QueryProvider';
import AppBootstrap from './providers/AppBootstrap';

import './index.css';

ReactDOM.createRoot(
  document.getElementById('root')!,
).render(
  <React.StrictMode>
    <QueryProvider>
      <AppBootstrap>
        <App />
      </AppBootstrap>
    </QueryProvider>
  </React.StrictMode>,
);