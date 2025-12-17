import React, { useMemo, useCallback, memo, lazy, Suspense } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Eye,
  Clock,
  User
} from 'lucide-react';

// Ленивая загрузка компонентов
const AdDetailModal = lazy(() => import('@/components/AdDetailModal'));

interface Ad {
  id: string;
  title: string;
  description: string;
  budget?: number;
  city: string;
  createdAt: string;
  views: number;
  isUrgent?: boolean;
  category?: {
    id: string;
    title: string;
  };
  author?: {
    companyName?: string;
  };
}

interface VirtualizedAdItemProps {
  index: number;
  style: React.CSSProperties;
  data: Ad[];
}

// Мемоизированный элемент списка для производительности
const AdItem = memo(({ ad, onClick }: { ad: Ad; onClick: (ad: Ad) => void }) => {
  const handleClick = useCallback(() => onClick(ad), [ad, onClick]);

  return (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={handleClick}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold line-clamp-2 mb-2">
                {ad.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 line-clamp-3 text-sm">
                {ad.description}
              </p>
            </div>
            {ad.isUrgent && (
              <Badge variant="destructive" className="ml-2">
                Срочно
              </Badge>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {ad.budget && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>{ad.budget.toLocaleString()} ₸</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{ad.city}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(ad.createdAt).toLocaleDateString('ru-RU')}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{ad.views}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-2 border-t">
            {ad.category && (
              <Badge variant="outline">
                {ad.category.title}
              </Badge>
            )}
            
            {ad.author?.companyName && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <User className="w-4 h-4" />
                <span className="truncate max-w-32">{ad.author.companyName}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

AdItem.displayName = 'AdItem';

// Виртуализированный элемент списка
const VirtualizedAdItem = memo(({ index, style, data }: VirtualizedAdItemProps) => (
  <div style={style} className="p-2">
    <AdItem 
      ad={data[index]} 
      onClick={() => console.log('Ad clicked:', data[index].id)} 
    />
  </div>
));

VirtualizedAdItem.displayName = 'VirtualizedAdItem';

// Скелетон для загрузки
export const AdSkeleton = memo(() => (
  <Card>
    <CardContent className="p-6 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      
      <div className="flex gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      
      <div className="flex justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    </CardContent>
  </Card>
));

AdSkeleton.displayName = 'AdSkeleton';

// Оптимизированный список с виртуализацией
interface OptimizedAdListProps {
  ads: Ad[];
  isLoading?: boolean;
  height?: number;
  itemHeight?: number;
}

export const OptimizedAdList = memo(({ 
  ads, 
  isLoading = false, 
  height = 600, 
  itemHeight = 200 
}: OptimizedAdListProps) => {
  // Мемоизация отфильтрованных данных
  const memoizedAds = useMemo(() => ads, [ads]);
  
  // Обработчик клика с useCallback для избежания лишних ререндеров
  const handleAdClick = useCallback((ad: Ad) => {
    console.log('Opening ad:', ad.id);
    // Здесь можно открыть модальное окно или навигацию
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <AdSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (memoizedAds.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="space-y-4">
            <div className="text-6xl">🔍</div>
            <h3 className="text-lg font-medium">Заказы не найдены</h3>
            <p className="text-gray-500">
              Попробуйте изменить параметры фильтрации
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <List
        height={height}
        itemCount={memoizedAds.length}
        itemSize={itemHeight}
        itemData={memoizedAds}
        width="100%"
      >
        {VirtualizedAdItem}
      </List>
    </div>
  );
});

OptimizedAdList.displayName = 'OptimizedAdList';

// Оптимизированная сетка с ленивой загрузкой изображений
interface LazyImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallback?: string;
}

export const LazyImage = memo(({ src, alt, className, fallback = '/images/placeholder.jpg' }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  const handleLoad = useCallback(() => setIsLoaded(true), []);
  const handleError = useCallback(() => setError(true), []);

  if (error && fallback) {
    return (
      <img 
        src={fallback} 
        alt={alt}
        className={className}
        onLoad={handleLoad}
      />
    );
  }

  return (
    <div className="relative">
      {!isLoaded && (
        <Skeleton className={`absolute inset-0 ${className}`} />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

// Хук для оптимизации поиска с debounce
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}