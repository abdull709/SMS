import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './styles/index.css';

const root = document.getElementById('root');
document.documentElement.dataset.appMounted = 'starting';

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

window.requestAnimationFrame(() => {
  document.documentElement.dataset.appMounted = 'true';
});
