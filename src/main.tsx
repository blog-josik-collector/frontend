import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';

import './index.css';

const enableMocking = async () => {
  if (!import.meta.env.DEV) {
    return;
  }

  try {
    const { worker } = await import('@mocks/browser');
    console.log('Starting MSW worker...');
    await worker.start({
      onUnhandledRequest: 'warn',
    });
    console.log('MSW worker started successfully!');
  } catch (error) {
    console.error('Failed to start MSW worker:', error);
  }
};

const renderApp = () => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

void enableMocking().then(renderApp);
