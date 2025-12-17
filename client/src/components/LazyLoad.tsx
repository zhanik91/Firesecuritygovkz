import { lazy, Suspense, ComponentType } from 'react';
import { PageLoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorBoundary } from './ErrorBoundary';

// Утилита для lazy loading с Error Boundary
export function createLazyComponent<T extends ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
): ComponentType<React.ComponentProps<T>> {
  const LazyComponent = lazy(importFunction);
  
  return function WrappedLazyComponent(props: React.ComponentProps<T>) {
    return (
      <ErrorBoundary>
        <Suspense fallback={fallback || <PageLoadingSpinner />}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}