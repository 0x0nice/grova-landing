"use client";

import { Component, type ReactNode } from "react";
import { captureException } from "@/lib/sentry";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-bg text-text font-mono">
          <div className="text-center space-y-4 px-6">
            <span className="text-[2rem] block">⚠️</span>
            <h1 className="font-serif text-title text-text">
              Something went wrong.
            </h1>
            <p className="text-callout text-text3">
              We&apos;ve been notified and are looking into it.
            </p>
            <button
              onClick={this.handleReload}
              className="mt-4 px-5 py-2.5 bg-surface border border-border rounded
                         font-mono text-footnote text-text hover:bg-surface/80
                         transition-colors duration-[180ms] cursor-pointer"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
