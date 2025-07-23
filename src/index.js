import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './ErrorBoundary'; // ✅ Import the error boundary
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary> {/* ✅ Wrap App in ErrorBoundary */}
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

reportWebVitals();
