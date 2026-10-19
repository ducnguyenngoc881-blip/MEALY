import React, { Component, ErrorInfo, ReactNode } from 'react';

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
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[MealWise ErrorBoundary] Caught render exception:', error, errorInfo);
    if (error?.message?.includes('MealWiseProvider')) {
      console.warn('[MealWise ErrorBoundary] Detected transient context hook error, auto-recovering...');
      setTimeout(() => {
        this.setState({ hasError: false, error: null, errorInfo: null });
      }, 50);
      return;
    }
    this.setState({ error, errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleResetAndReload = () => {
    try {
      // Clear potentially corrupt session/cached states while preserving user profile
      localStorage.removeItem('mealwise_weekly_plan');
      localStorage.removeItem('mealwise_grocery_checked');
      localStorage.removeItem('mealwise_extra_grocery');
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0B0D0E] text-slate-800 dark:text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/40 rounded-3xl p-6 shadow-xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center text-3xl">
              🍲
            </div>
            
            <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white mb-2">
              Đã xảy ra sự cố hiển thị
            </h2>
            
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              Mealy gặp trục trặc khi tải màn hình này. Dữ liệu của bạn vẫn an toàn và không bị mất.
            </p>

            {this.state.error?.message && (
              <div className="mb-6 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-500 dark:text-slate-400 font-mono text-left overflow-auto max-h-24 border border-slate-200/60 dark:border-slate-700/60">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={this.handleRetry}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm transition-colors shadow-sm shadow-emerald-500/20"
              >
                Thử lại ngay
              </button>
              <button
                type="button"
                onClick={this.handleResetAndReload}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl text-sm transition-colors"
              >
                Khôi phục & Tải lại
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
