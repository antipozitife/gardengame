import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    message: '',
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'Unexpected application error',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep console signal for debugging in production builds
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, info);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="error-boundary" role="alert">
        <div className="error-boundary__card glass-card">
          <p className="error-boundary__eyebrow">500</p>
          <h1>Что-то сломалось</h1>
          <p className="error-boundary__message">{this.state.message}</p>
          <div className="error-boundary__actions">
            <button type="button" className="btn btn-primary" onClick={this.handleRetry}>
              Попробовать снова
            </button>
            <Link className="btn btn-ghost" to="/">
              На главную
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
