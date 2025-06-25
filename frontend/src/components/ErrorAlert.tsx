import React from 'react';
import { AlertTriangle, X, RefreshCw, Info } from 'lucide-react';

interface ErrorAlertProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  onClose?: () => void;
  onRetry?: () => void;
  retryText?: string;
  dismissible?: boolean;
  className?: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title,
  message,
  type = 'error',
  onClose,
  onRetry,
  retryText = 'Try Again',
  dismissible = true,
  className = ''
}) => {
  const baseClasses = "rounded-lg border p-4 mb-4";
  
  const typeStyles = {
    error: {
      container: "bg-red-50 border-red-200",
      icon: "text-red-500",
      title: "text-red-800",
      message: "text-red-700",
      button: "bg-red-600 hover:bg-red-700 text-white"
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200",
      icon: "text-yellow-500",
      title: "text-yellow-800",
      message: "text-yellow-700",
      button: "bg-yellow-600 hover:bg-yellow-700 text-white"
    },
    info: {
      container: "bg-blue-50 border-blue-200",
      icon: "text-blue-500",
      title: "text-blue-800",
      message: "text-blue-700",
      button: "bg-blue-600 hover:bg-blue-700 text-white"
    }
  };

  const styles = typeStyles[type];

  const getIcon = () => {
    switch (type) {
      case 'error':
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'info':
        return <Info className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  return (
    <div className={`${baseClasses} ${styles.container} ${className}`}>
      <div className="flex">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${styles.title}`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${title ? 'mt-2' : ''} ${styles.message}`}>
            <p>{message}</p>
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${styles.button} transition-colors`}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {retryText}
              </button>
            </div>
          )}
        </div>
        {dismissible && onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={onClose}
                className={`inline-flex rounded-md p-1.5 hover:bg-opacity-20 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600 ${styles.icon}`}
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Network error component
export const NetworkErrorAlert: React.FC<{
  onRetry?: () => void;
  onClose?: () => void;
}> = ({ onRetry, onClose }) => {
  return (
    <ErrorAlert
      title="Connection Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      type="error"
      onRetry={onRetry}
      onClose={onClose}
      retryText="Retry Connection"
    />
  );
};

// Data loading error component
export const DataErrorAlert: React.FC<{
  onRetry?: () => void;
  onClose?: () => void;
}> = ({ onRetry, onClose }) => {
  return (
    <ErrorAlert
      title="Data Loading Failed"
      message="There was an error loading the productivity data. This might be due to a temporary server issue."
      type="error"
      onRetry={onRetry}
      onClose={onClose}
      retryText="Reload Data"
    />
  );
};

export default ErrorAlert;