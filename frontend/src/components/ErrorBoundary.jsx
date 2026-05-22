import React from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }))
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4 py-8">
          <div className="w-full max-w-sm sm:max-w-md">
            {/* Error Icon */}
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--color-danger)]/20 rounded-full blur-xl opacity-50" />
                <div className="relative bg-[var(--color-surface)] rounded-full p-3 sm:p-4 shadow-lg border border-[var(--color-border)]">
                  <AlertCircle size={24} className="sm:w-8 sm:h-8 text-[var(--color-danger)]" />
                </div>
              </div>
            </div>

            {/* Error Content */}
            <div className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl shadow-lg border border-[var(--color-border)] p-5 sm:p-8 lg:p-10">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text)] mb-2 text-center">
                Oops! Something went wrong
              </h1>
              <p className="text-xs sm:text-sm text-[var(--color-muted)] text-center mb-4 sm:mb-6">
                We're sorry, but something unexpected happened. Our team has been notified.
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20 rounded-lg max-h-32 sm:max-h-40 overflow-y-auto">
                  <p className="text-[10px] sm:text-xs font-mono text-[var(--color-danger)] mb-2 font-bold">Error Details:</p>
                  <p className="text-[10px] sm:text-xs font-mono text-[var(--color-danger)]/80 break-words">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2 sm:mt-3 text-[10px] sm:text-xs">
                      <summary className="font-bold text-[var(--color-danger)] cursor-pointer mb-2">
                        Stack Trace
                      </summary>
                      <pre className="text-[var(--color-danger)]/70 overflow-x-auto whitespace-pre-wrap break-words text-[9px] sm:text-[10px]">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2.5 sm:py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-xs sm:text-sm hover:bg-[var(--color-primary-dark)] transition-colors cursor-pointer border-none"
                >
                  <RefreshCw size={14} className="sm:w-4 sm:h-4" />
                  Try Again
                </button>
                <Link
                  to="/"
                  className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2.5 sm:py-3 bg-[var(--color-bg-alt)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl font-semibold text-xs sm:text-sm hover:bg-[var(--color-border-light)] transition-colors"
                >
                  <Home size={14} className="sm:w-4 sm:h-4" />
                  Go Home
                </Link>
              </div>

              {/* Support Info */}
              <p className="text-[10px] sm:text-xs text-[var(--color-muted)] text-center mt-4 sm:mt-6">
                Error ID: {Math.random().toString(36).substr(2, 9)}
                <br />
                If this persists, please contact support
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}