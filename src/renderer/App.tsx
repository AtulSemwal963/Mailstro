import React, { useEffect, useState } from 'react';
import SplashScreen from './components/splash/main';
import Dashboard from './components/dashboard/main';

export const App: React.FC = () => {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  if (hash === '#/splash') {
    return <SplashScreen />;
  }

  if (hash === '#/dashboard') {
    return <Dashboard />;
  }

  return <Dashboard />;
};

export default App;