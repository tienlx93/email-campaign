import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { store } from './store';
import './index.css';
import App from './App.tsx';

// Apply persisted theme before first render to prevent flash
try {
  const ui = JSON.parse(localStorage.getItem('ui_state') ?? '{}') as { theme?: string };
  if (ui.theme === 'dark') document.documentElement.classList.add('dark');
} catch { /* ignore */ }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster richColors position="bottom-right" />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
