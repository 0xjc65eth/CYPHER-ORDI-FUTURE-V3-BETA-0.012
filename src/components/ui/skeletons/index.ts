// Export all skeleton components
export { DashboardSkeleton } from './DashboardSkeleton';
export { 
  ChartSkeleton, 
  PriceChartSkeleton, 
  PortfolioChartSkeleton, 
  VolumeChartSkeleton, 
  TrendChartSkeleton 
} from './ChartSkeleton';

// Table skeleton components
export function TableSkeleton({ 
  rows = 5, 
  cols = 6, 
  showHeader = true,
  className = '' 
}: { 
  rows?: number; 
  cols?: number; 
  showHeader?: boolean;
  className?: string;
}) {
  return (
    <div className={`border rounded-lg ${className}`}>
      {showHeader && (
        <div className="border-b p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        </div>
      )}
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Card skeleton components
export function CardSkeleton({ 
  variant = 'default',
  showImage = false,
  className = '' 
}: { 
  variant?: 'default' | 'stat' | 'news' | 'market';
  showImage?: boolean;
  className?: string;
}) {
  if (variant === 'stat') {
    return (
      <div className={`border rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32 mb-2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
      </div>
    );
  }

  if (variant === 'news') {
    return (
      <div className={`border rounded-lg p-4 ${className}`}>
        {showImage && (
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
        )}
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1 w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
      </div>
    );
  }

  if (variant === 'market') {
    return (
      <div className={`border rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16 mb-1" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16" />
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      {showImage && (
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
      )}
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
    </div>
  );
}

// List skeleton components
export function ListSkeleton({ 
  items = 5,
  variant = 'default',
  className = '' 
}: { 
  items?: number;
  variant?: 'default' | 'transaction' | 'activity';
  className?: string;
}) {
  if (variant === 'transaction') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              <div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32 mb-1" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
              </div>
            </div>
            <div className="text-right">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16 mb-1" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'activity') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="border-b pb-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
            <div className="flex justify-between mt-1">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Form skeleton components
export function FormSkeleton({ 
  fields = 4,
  showSubmit = true,
  className = '' 
}: { 
  fields?: number;
  showSubmit?: boolean;
  className?: string;
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24 mb-2" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      ))}
      {showSubmit && (
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" />
      )}
    </div>
  );
}