import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';

import './index.css';

// MSW worker 초기화 (개발 환경에서만)
if (import.meta.env.DEV) {
  import('@mocks/browser')
    .then(({ worker }) => {
      console.log('Starting MSW worker...');
      return worker.start({
        onUnhandledRequest: 'warn',
      });
    })
    .then(() => {
      console.log('MSW worker started successfully!');
    })
    .catch((error) => {
      console.error('Failed to start MSW worker:', error);
    });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
