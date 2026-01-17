import React, { Component, ErrorInfo, ReactNode } from 'react';
import logger from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary', 'Caught error', { error: error.message, stack: error.stack, componentStack: errorInfo.componentStack });
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <div className="bg-red-100 border border-red-300 rounded p-4 mb-4">
              <p className="font-mono text-sm text-red-800">{this.state.error?.message}</p>
            </div>
            <details className="mb-4">
              <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                Error Details (click to expand)
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto text-xs">
                {this.state.error?.stack}
              </pre>
              {this.state.errorInfo && (
                <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto text-xs">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </details>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
