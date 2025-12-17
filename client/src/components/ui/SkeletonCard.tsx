import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface SkeletonCardProps {
  lines?: number;
  showAvatar?: boolean;
  height?: string;
}

export function SkeletonCard({ lines = 3, showAvatar = false, height = "auto" }: SkeletonCardProps) {
  return (
    <Card className="animate-pulse" style={{ height }}>
      <CardHeader>
        <div className="flex items-center space-x-4">
          {showAvatar && (
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
          )}
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-3 bg-gray-200 dark:bg-gray-700 rounded ${
              i === lines - 1 ? 'w-2/3' : 'w-full'
            }`}
          />
        ))}
      </CardContent>
    </Card>
  );
}

export function SkeletonGrid({ count = 6, columns = 3 }: { count?: number; columns?: number }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}