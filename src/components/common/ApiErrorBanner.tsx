import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ApiErrorBannerProps {
  error: string | null;
  onRetry?: () => void;
  isRetrying?: boolean;
  title?: string;
}

export const ApiErrorBanner: React.FC<ApiErrorBannerProps> = ({
  error,
  onRetry,
  isRetrying = false,
  title = 'API Synchronization Error',
}) => {
  if (!error) return null;

  return (
    <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3.5 mb-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-semibold text-rose-900">{title}</div>
          <div className="text-xs text-rose-700 mt-0.5 leading-relaxed">{error}</div>
        </div>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 shrink-0 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Retrying...' : 'Retry Connection'}</span>
        </button>
      )}
    </div>
  );
};
