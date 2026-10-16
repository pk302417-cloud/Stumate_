import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-error-50 dark:bg-error-900/20 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-ink-800 dark:text-ink-100 mb-2">Something went wrong</h1>
          <p className="text-ink-500 mb-4">Please reload the page to continue.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700"
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
