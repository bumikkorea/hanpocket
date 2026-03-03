import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, showDetails: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
          {/* Logo */}
          <div className="mb-6">
            <span className="text-2xl font-black tracking-tighter text-[#111827]">HANPOCKET</span>
          </div>

          <h2 className="text-lg font-semibold text-[#111827] mb-2">
            문제가 발생했습니다
          </h2>
          <p className="text-sm text-gray-500 mb-1">出现了问题</p>
          <p className="text-sm text-gray-500 mb-6">Something went wrong</p>

          <button
            onClick={() => window.location.reload()}
            className="bg-[#111827] text-white px-6 py-3 rounded-xl text-sm font-medium active:scale-[0.97] transition-transform mb-4"
          >
            새로고침 / 刷新 / Refresh
          </button>

          {/* Error details (collapsible) */}
          <button
            onClick={() => this.setState({ showDetails: !this.state.showDetails })}
            className="text-xs text-gray-400 underline"
          >
            {this.state.showDetails ? '상세 접기' : '상세 보기'}
          </button>
          {this.state.showDetails && this.state.error && (
            <pre className="mt-3 p-3 bg-gray-100 rounded-lg text-xs text-gray-600 max-w-full overflow-x-auto max-h-40 overflow-y-auto">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
