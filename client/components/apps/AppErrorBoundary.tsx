import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface Props {
  children: ReactNode
  appName?: string
}

interface State {
  hasError: boolean
  error?: Error
}

export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-black/20 backdrop-blur-xl p-8 text-center">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-lg mb-2">
              {this.props.appName || 'App'} Crashed
            </h3>
            <p className="text-white/70 text-sm mb-6">
              Something went wrong with this app. Don't worry, this happens sometimes in quantum computing.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-lg transition-colors text-red-300 mx-auto"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-white/50 text-xs cursor-pointer">Technical Details</summary>
                <pre className="text-white/40 text-xs mt-2 p-2 bg-black/40 rounded overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
