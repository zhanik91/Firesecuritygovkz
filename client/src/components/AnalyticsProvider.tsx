import React, { useEffect, createContext, useContext } from 'react';
import { useLocation } from 'wouter';

interface AnalyticsContextType {
  trackEvent: (event: string, properties?: Record<string, any>) => void;
  trackPageView: (page: string) => void;
  identify: (userId: string, traits?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
}

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const [location] = useLocation();

  // Google Analytics
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.VITE_GA_MEASUREMENT_ID, {
        page_path: location,
      });
    }
  }, [location]);

  // Yandex Metrica
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ym) {
      window.ym(process.env.VITE_YANDEX_METRICA_ID, 'hit', location);
    }
  }, [location]);

  const trackEvent = (event: string, properties?: Record<string, any>) => {
    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, properties);
    }

    // Yandex Metrica
    if (typeof window !== 'undefined' && window.ym) {
      window.ym(process.env.VITE_YANDEX_METRICA_ID, 'reachGoal', event, properties);
    }

    // Custom analytics
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event,
          properties: {
            ...properties,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
          }
        }),
      }).catch(console.error);
    }
  };

  const trackPageView = (page: string) => {
    trackEvent('page_view', { page });
  };

  const identify = (userId: string, traits?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.VITE_GA_MEASUREMENT_ID, {
        user_id: userId,
        custom_map: traits,
      });
    }

    if (typeof window !== 'undefined' && window.ym) {
      window.ym(process.env.VITE_YANDEX_METRICA_ID, 'userParams', traits);
    }
  };

  const contextValue: AnalyticsContextType = {
    trackEvent,
    trackPageView,
    identify,
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// Хук для отслеживания кликов
export function useClickTracking() {
  const { trackEvent } = useAnalytics();

  const trackClick = (element: string, properties?: Record<string, any>) => {
    trackEvent('click', { element, ...properties });
  };

  return { trackClick };
}

// Хук для отслеживания скроллинга
export function useScrollTracking() {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    let scrollDepth = 0;
    const handleScroll = () => {
      const winHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset;
      const trackLength = docHeight - winHeight;
      const pctScrolled = Math.floor((scrollTop / trackLength) * 100);

      if (pctScrolled > scrollDepth && pctScrolled % 25 === 0) {
        scrollDepth = pctScrolled;
        trackEvent('scroll_depth', { depth: pctScrolled });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackEvent]);
}

// Компонент для автоматического отслеживания производительности
export function PerformanceTracker() {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    // Отслеживаем Core Web Vitals
    if (typeof window !== 'undefined' && 'performance' in window) {
      // First Contentful Paint
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            trackEvent('performance_metric', {
              metric: 'FCP',
              value: Math.round(entry.startTime),
            });
          }
        }
      }).observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        trackEvent('performance_metric', {
          metric: 'LCP',
          value: Math.round(lastEntry.startTime),
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as any;
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
          }
        }
        trackEvent('performance_metric', {
          metric: 'CLS',
          value: clsValue,
        });
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }, [trackEvent]);

  return null;
}

// Компонент для отслеживания ошибок
export function ErrorTracker() {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackEvent('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackEvent('unhandled_rejection', {
        reason: event.reason?.toString(),
        stack: event.reason?.stack,
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackEvent]);

  return null;
}

// Расширение window для TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    ym?: (...args: any[]) => void;
  }
}