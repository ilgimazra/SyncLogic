import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SyncLogicProvider } from './context/SyncLogicContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SyncLogicProvider>
      <App />
    </SyncLogicProvider>
  </StrictMode>,
);
