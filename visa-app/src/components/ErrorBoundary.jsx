import React from 'react';
import { L } from './home/utils/helpers';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // GA4 이벤트로 에러 추적
    if (typeof gtag !== 'undefined') {
      gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
          <div className="text-center max-w-md w-full">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 ">
              <div className="text-6xl mb-4">😵</div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {L('오류가 발생했습니다', '发生错误', 'An error occurred')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {L(
                  '앱에 문제가 발생했습니다. 새로고침을 시도해주세요.',
                  '应用出现问题。请尝试刷新页面。',
                  'Something went wrong with the app. Please try refreshing the page.'
                )}
              </p>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium mb-3"
              >
                {L('새로고침', '刷新', 'Refresh')}
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                {L('다시 시도', '重试', 'Try Again')}
              </button>
              
              {/* 개발 모드에서만 에러 상세 정보 표시 */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-3 bg-red-50 dark:bg-red-900 rounded text-left text-xs">
                  <summary className="cursor-pointer font-bold text-red-700 dark:text-red-300">
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-2 text-red-600 dark:text-red-400">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </div>
                  {this.state.errorInfo && (
                    <div className="mt-2 text-red-600 dark:text-red-400">
                      <strong>Stack Trace:</strong>
                      <pre className="whitespace-pre-wrap text-xs mt-1 overflow-auto max-h-48">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;