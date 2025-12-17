
import { Link } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const { t } = useLanguage();

  const allItems = [
    { label: t('breadcrumbs.home', 'Главная'), href: '/' },
    ...items
  ];

  return (
    <nav 
      className={`flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 ${className}`}
      aria-label="Breadcrumb"
    >
      {allItems.map((item, index) => (
        <div key={index} className="flex items-center">
          {index === 0 && (
            <Home className="w-4 h-4 text-gray-500" />
          )}

          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}

          {item.href && index < allItems.length - 1 ? (
            <Link href={item.href}>
              <span className="hover:text-kz-blue transition-colors cursor-pointer">
                {item.label}
              </span>
            </Link>
          ) : (
            <span 
              className={index === allItems.length - 1 
                ? "text-gray-900 dark:text-white font-medium" 
                : "text-gray-600 dark:text-gray-400"
              }
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

// Хук для автоматической генерации breadcrumbs из URL
export function useBreadcrumbs() {
  const { t } = useLanguage();

  return (customItems?: BreadcrumbItem[]) => {
    const pathname = window.location.pathname;
    const segments = pathname.split('/').filter(Boolean);

    const items: BreadcrumbItem[] = [];

    // Преобразуем сегменты URL в breadcrumbs
    segments.forEach((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');

      // Переводы для стандартных роутов
      const translations: Record<string, string> = {
        'marketplace': t('breadcrumbs.marketplace', 'Маркетплейс'),
        'calculators': t('breadcrumbs.calculators', 'Калькуляторы'),
        'games': t('breadcrumbs.games', 'Игры'),
        'admin': t('breadcrumbs.admin', 'Администрирование'),
        'profile': t('breadcrumbs.profile', 'Профиль'),
        'sections': t('breadcrumbs.sections', 'Разделы'),
        'create': t('breadcrumbs.create', 'Создать'),
        'edit': t('breadcrumbs.edit', 'Редактировать')
      };

      items.push({
        label: translations[segment] || decodeURIComponent(segment),
        href: index < segments.length - 1 ? href : undefined
      });
    });

    return customItems || items;
  };
}