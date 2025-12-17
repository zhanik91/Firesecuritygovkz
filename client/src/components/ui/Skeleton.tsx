import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Специализированные скелетоны для разных компонентов
function PostCardSkeleton() {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-16 w-16 ml-4" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

function MarketplaceCardSkeleton() {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start gap-3 mb-3">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr>
      <td className="p-4"><Skeleton className="h-4 w-full" /></td>
      <td className="p-4"><Skeleton className="h-4 w-24" /></td>
      <td className="p-4"><Skeleton className="h-4 w-16" /></td>
      <td className="p-4"><Skeleton className="h-4 w-20" /></td>
      <td className="p-4"><Skeleton className="h-8 w-16" /></td>
    </tr>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-6">
      {/* Widget скелетон */}
      <div className="border rounded-lg p-4">
        <Skeleton className="h-5 w-32 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      
      {/* Список скелетон */}
      <div className="border rounded-lg p-4">
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i}>
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardCardSkeleton() {
  return (
    <div className="border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-4 w-40" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="border rounded-lg p-6">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className={`h-6 ${i === 1 ? 'w-32' : i === 2 ? 'w-24' : i === 3 ? 'w-40' : 'w-20'}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export { 
  Skeleton, 
  PostCardSkeleton, 
  MarketplaceCardSkeleton, 
  TableRowSkeleton, 
  SidebarSkeleton,
  DashboardCardSkeleton,
  ChartSkeleton
};