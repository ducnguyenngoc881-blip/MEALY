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
