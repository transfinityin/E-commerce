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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-red-200 rounded-full blur-xl opacity-50" />
                <div className="relative bg-white rounded-full p-4 shadow-lg">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>

            {/* Error Content */}
            <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 sm:p-10">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center font-[Playfair_Display]">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 text-center mb-6">
                We're sorry, but something unexpected happened. Our team has been notified.
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg max-h-40 overflow-y-auto">
                  <p className="text-xs font-mono text-red-800 mb-2 font-bold">Error Details:</p>
                  <p className="text-xs font-mono text-red-700 break-words">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-3 text-xs">
                      <summary className="font-bold text-red-800 cursor-pointer mb-2">
                        Stack Trace
                      </summary>
                      <pre className="text-red-700 overflow-x-auto whitespace-pre-wrap break-words">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                <Link
                  to="/"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Link>
              </div>

              {/* Support Info */}
              <p className="text-xs text-gray-500 text-center mt-6">
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
