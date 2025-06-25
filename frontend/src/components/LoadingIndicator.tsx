import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'md',
  text = 'Loading...',
  fullScreen = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  );
};

// Skeleton loading component for specific UI elements
export const SkeletonLoader: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-300 rounded h-4 w-full mb-2"></div>
      <div className="bg-gray-300 rounded h-4 w-3/4 mb-2"></div>
      <div className="bg-gray-300 rounded h-4 w-1/2"></div>
    </div>
  );
};

// Chart skeleton loader
export const ChartSkeleton: React.FC = () => {
  return (
    <div className="w-full h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="bg-gray-300 rounded w-32 h-6 mx-auto mb-4"></div>
        <div className="space-y-2">
          <div className="bg-gray-300 rounded w-48 h-4 mx-auto"></div>
          <div className="bg-gray-300 rounded w-36 h-4 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;