import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// In-app Dialog Shield: Intercept browser-native dialogs to prevent "localhost:5173 says..."
if (typeof window !== 'undefined') {
  window.alert = (message?: unknown) => {
    console.warn('[MealWise Dialog Shield] window.alert intercepted:', message);
    if (message !== undefined && message !== null) {
      window.dispatchEvent(new CustomEvent('mealwise:toast', { detail: String(message) }));
    }
  };

  window.confirm = (message?: string) => {
    console.warn('[MealWise Dialog Shield] window.confirm intercepted:', message);
    return false;
  };

  window.prompt = (message?: string) => {
    console.warn('[MealWise Dialog Shield] window.prompt intercepted:', message);
    return null;
  };

  // Capacitor iOS Simulator & Android Emulator Backend Bridge
  const isCapacitorNative =
    window.location.protocol === 'capacitor:' ||
    (window.location.hostname === 'localhost' && window.location.port !== '5173' && window.location.port !== '4173');

  if (isCapacitorNative && typeof window.fetch === 'function') {
    const originalFetch = window.fetch.bind(window);
    let cachedBackendOrigin: string | null = null;
    const envApiBase =
      typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL
        ? String((import.meta as any).env.VITE_API_BASE_URL).replace(/\/$/, '')
        : '';
    const candidateOrigins = [
      ...(envApiBase ? [envApiBase] : []),
      'http://localhost:5173',
      'http://10.0.2.2:5173',
      'http://192.168.100.187:5173',
      'https://mealy-api-server.onrender.com'
    ];

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      if (urlStr.startsWith('/api/')) {
        if (cachedBackendOrigin) {
          try {
            return await originalFetch(`${cachedBackendOrigin}${urlStr}`, init);
          } catch {
            cachedBackendOrigin = null;
          }
        }
        for (const origin of candidateOrigins) {
          try {
            const res = await originalFetch(`${origin}${urlStr}`, init);
            cachedBackendOrigin = origin;
            return res;
          } catch {}
        }
      }
      return originalFetch(input, init);
    };
  }
}

import { ErrorBoundary } from './components/ErrorBoundary';
import { MealWiseProvider } from './context/MealWiseContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
