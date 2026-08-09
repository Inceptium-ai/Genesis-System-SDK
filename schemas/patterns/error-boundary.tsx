/**
 * Genesis SDK - React Error Boundary Pattern
 * 
 * Prevents full-page crashes by catching render errors.
 * Shows user-friendly error messages instead of blank screens.
 * 
 * Copy to your project's src/components/ directory.
 * 
 * Note: This is a Class Component (Error Boundaries cannot be function components)
 */

import React, { Component, ReactNode } from 'react';

// =============================================================================
// ERROR BOUNDARY COMPONENT
// =============================================================================

interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;
  
  /** Custom fallback UI (optional) */
  fallback?: ReactNode;
  
  /** Custom error handler function (optional) */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  
  /** Show error details in development (default: true) */
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Catches JavaScript errors in child component tree and displays fallback UI
 * 
 * @example
 * // Basic usage
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * 
 * @example
 * // With custom fallback
 * <ErrorBoundary fallback={<div>Something went wrong</div>}>
 *   <MyComponent />
 * </ErrorBoundary>
 * 
 * @example
 * // With error logging
 * <ErrorBoundary onError={(error) => logToService(error)}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary] Caught error:', error);
      console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      const showDetails = this.props.showDetails ?? process.env.NODE_ENV === 'development';

      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <h2 style={styles.title}>Something went wrong</h2>
            <p style={styles.message}>
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            
            <button onClick={this.handleReset} style={styles.button}>
              Try Again
            </button>
            
            <button onClick={() => window.location.reload()} style={styles.secondaryButton}>
              Refresh Page
            </button>
            
            {showDetails && this.state.error && (
              <details style={styles.details}>
                <summary style={styles.summary}>Error Details (Development Only)</summary>
                <pre style={styles.errorText}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Default inline styles (override with your own CSS/Tailwind)
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '1rem',
    backgroundColor: '#f9fafb',
  },
  card: {
    maxWidth: '32rem',
    padding: '2rem',
    backgroundColor: '#ffffff',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: '1rem',
  },
  message: {
    color: '#6b7280',
    marginBottom: '1.5rem',
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    marginRight: '0.5rem',
    fontSize: '1rem',
  },
  secondaryButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#e5e7eb',
    color: '#374151',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  details: {
    marginTop: '1.5rem',
    textAlign: 'left',
  },
  summary: {
    cursor: 'pointer',
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  errorText: {
    marginTop: '0.5rem',
    padding: '1rem',
    backgroundColor: '#fee2e2',
    borderRadius: '0.375rem',
    fontSize: '0.75rem',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    color: '#991b1b',
  },
};

// =============================================================================
// HOOK FOR RESETTING ERROR BOUNDARY (Optional)
// =============================================================================

/**
 * Key-based error boundary reset
 * When the key changes, the error boundary resets
 * 
 * @example
 * const [errorKey, resetError] = useErrorReset();
 * 
 * return (
 *   <ErrorBoundary key={errorKey}>
 *     <button onClick={resetError}>Reset</button>
 *     <ProblematicComponent />
 *   </ErrorBoundary>
 * );
 */
export function useErrorReset(): [number, () => void] {
  const [key, setKey] = React.useState(0);
  const reset = React.useCallback(() => setKey(k => k + 1), []);
  return [key, reset];
}

// =============================================================================
// PAGE-LEVEL ERROR BOUNDARY
// =============================================================================

interface PageErrorBoundaryProps {
  children: ReactNode;
  /** Page name for error logging */
  pageName?: string;
}

/**
 * Error boundary specifically for page-level components
 * Includes navigation back to home
 * 
 * @example
 * // In Next.js app/dashboard/page.tsx
 * export default function DashboardPage() {
 *   return (
 *     <PageErrorBoundary pageName="Dashboard">
 *       <Dashboard />
 *     </PageErrorBoundary>
 *   );
 * }
 */
export function PageErrorBoundary({ children, pageName }: PageErrorBoundaryProps): JSX.Element {
  return (
    <ErrorBoundary
      onError={(error) => {
        // Pass the page name as a separate argument (not interpolated into the
        // first console argument) so it can never act as a format string.
        console.error('[PageErrorBoundary]', pageName ?? 'Page', error);
      }}
      fallback={
        <div style={styles.container}>
          <div style={styles.card}>
            <h2 style={styles.title}>Page Error</h2>
            <p style={styles.message}>
              {pageName ? `The ${pageName} page` : 'This page'} encountered an error.
            </p>
            <a href="/" style={{ ...styles.button, textDecoration: 'none', display: 'inline-block' }}>
              Go to Home
            </a>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// =============================================================================
// ASYNC ERROR BOUNDARY (For Data Fetching)
// =============================================================================

interface AsyncBoundaryProps {
  children: ReactNode;
  /** Fallback while loading */
  loading?: ReactNode;
  /** Fallback on error */
  error?: ReactNode;
}

/**
 * Combines Suspense (for loading) with ErrorBoundary (for errors)
 * 
 * @example
 * <AsyncBoundary
 *   loading={<Spinner />}
 *   error={<ErrorMessage />}
 * >
 *   <DataComponent />
 * </AsyncBoundary>
 */
export function AsyncBoundary({ 
  children, 
  loading = <DefaultLoading />,
  error 
}: AsyncBoundaryProps): JSX.Element {
  return (
    <ErrorBoundary fallback={error}>
      <React.Suspense fallback={loading}>
        {children}
      </React.Suspense>
    </ErrorBoundary>
  );
}

function DefaultLoading(): JSX.Element {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div style={{
        width: '2rem',
        height: '2rem',
        border: '2px solid #e5e7eb',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// =============================================================================
// USAGE WITH TAILWIND CSS
// =============================================================================

/*
// If you're using Tailwind CSS, replace the inline styles with Tailwind classes:

export function TailwindErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              We apologize for the inconvenience. Please try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
*/

// =============================================================================
// NEXT.JS APP ROUTER INTEGRATION
// =============================================================================

/*
// For Next.js 14+ App Router, you can also create error.tsx files:

// app/error.tsx - Global error UI
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="error-page">
          <h2>Something went wrong!</h2>
          <button onClick={() => reset()}>Try again</button>
        </div>
      </body>
    </html>
  );
}

// app/dashboard/error.tsx - Route-specific error UI
'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-bold text-red-600">Dashboard Error</h2>
      <p className="text-gray-600">{error.message}</p>
      <button onClick={reset} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Try Again
      </button>
    </div>
  );
}
*/

export default ErrorBoundary;
