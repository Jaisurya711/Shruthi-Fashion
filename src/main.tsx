import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
    console.warn('App notice caught:', error?.message);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'system-ui, sans-serif',
          backgroundColor: '#FAF9F5',
          color: '#1c1917',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#78350f', marginBottom: '8px' }}>
            Shruthi Fashion
          </h1>
          <p style={{ fontSize: '14px', color: '#57534e', maxWidth: '360px', marginBottom: '20px' }}>
            Tap below to reload and continue browsing the collection.
          </p>
          <button
            onClick={() => {
              try {
                localStorage.clear();
              } catch (e) {}
              window.location.reload();
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#78350f',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Continue Shopping
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <GlobalErrorBoundary>
    <App />
  </GlobalErrorBoundary>
);
