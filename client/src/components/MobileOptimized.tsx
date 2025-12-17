import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  Search, 
  Filter, 
  ChevronDown,
  X,
  Phone,
  MapPin,
  Star,
  ArrowUp,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';

// Мобильное меню с плавным открытием
export function MobileMenu({ isOpen, onClose, children }: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
          
          {/* Menu Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 z-50 shadow-xl md:hidden"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Меню</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Sticky заголовок с эффектом прокрутки
export function StickyMobileHeader({ title, onMenuClick }: { 
  title: string; 
  onMenuClick: () => void; 
}) {
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  const headerScale = useTransform(scrollY, [0, 100], [1, 0.98]);

  return (
    <motion.header
      style={{ opacity: headerOpacity, scale: headerScale }}
      className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b backdrop-blur-md md:hidden"
    >
      <div className="flex items-center justify-between p-4">
        <Button variant="ghost" size="sm" onClick={onMenuClick}>
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold truncate mx-4">{title}</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>
    </motion.header>
  );
}

// Карточка оптимизированная для мобильных устройств
interface MobileAdCardProps {
  ad: {
    id: string;
    title: string;
    description: string;
    budget?: number;
    city: string;
    createdAt: string;
    isUrgent?: boolean;
    category?: { title: string };
    author?: { companyName?: string };
  };
  onTap?: () => void;
}

export function MobileAdCard({ ad, onTap }: MobileAdCardProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={onTap}
    >
      <Card className="mb-4 shadow-sm border-0 bg-white dark:bg-gray-800">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex-1 mr-3">
                <h3 className="text-base font-semibold line-clamp-2 mb-1">
                  {ad.title}
                </h3>
                {ad.category && (
                  <Badge variant="outline" className="text-xs">
                    {ad.category.title}
                  </Badge>
                )}
              </div>
              {ad.isUrgent && (
                <Badge variant="destructive" className="text-xs">
                  Срочно
                </Badge>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {ad.description}
            </p>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                {ad.budget && (
                  <span className="font-medium">
                    {ad.budget.toLocaleString()} ₸
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{ad.city}</span>
                </div>
              </div>
              <span>
                {new Date(ad.createdAt).toLocaleDateString('ru-RU')}
              </span>
            </div>

            {/* Footer */}
            {ad.author?.companyName && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-500 truncate">
                  {ad.author.companyName}
                </span>
                <Button variant="ghost" size="sm" className="h-6 text-xs">
                  Подробнее
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Плавающая кнопка действия
interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  className?: string;
}

export function FloatingActionButton({ 
  onClick, 
  icon, 
  label, 
  className = '' 
}: FloatingActionButtonProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.onChange((latest) => {
      const previous = scrollY.getPrevious() || 0;
      setIsVisible(latest < previous || latest < 100);
    });
  }, [scrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className={`fixed bottom-6 right-6 z-40 md:hidden ${className}`}
        >
          <Button
            onClick={onClick}
            size="lg"
            className="rounded-full shadow-lg bg-kz-blue hover:bg-kz-blue/90 text-white h-14 w-14 p-0"
            title={label}
          >
            {icon}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Мобильные фильтры в виде bottom sheet
export function MobileFilters({ 
  isOpen, 
  onClose, 
  children 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 z-50 rounded-t-xl shadow-xl max-h-[80vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Фильтры</h3>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
              {children}
              <div className="flex gap-3 pt-4 border-t mt-6">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Отмена
                </Button>
                <Button onClick={onClose} className="flex-1 bg-kz-blue">
                  Применить
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Бесконечная прокрутка для мобильных
interface InfiniteScrollProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export function InfiniteScroll({ 
  items, 
  renderItem, 
  hasMore, 
  isLoading, 
  onLoadMore 
}: InfiniteScrollProps) {
  const [isFetching, setIsFetching] = useState(false);
  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading && !isFetching) {
          setIsFetching(true);
          onLoadMore();
          setTimeout(() => setIsFetching(false), 1000);
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, isFetching, onLoadMore]);

  return (
    <div className="space-y-4">
      {items.map(renderItem)}
      
      {hasMore && (
        <div ref={loadingRef} className="flex justify-center py-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-kz-blue border-t-transparent rounded-full"
          />
        </div>
      )}
    </div>
  );
}

// Кнопка "Вернуться наверх"
export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsVisible(latest > 300);
    });
  }, [scrollY]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="fixed bottom-20 right-6 z-30 md:hidden"
        >
          <Button
            onClick={scrollToTop}
            size="sm"
            variant="outline"
            className="rounded-full shadow-lg bg-white dark:bg-gray-800 h-10 w-10 p-0"
          >
            <ArrowUp className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Мобильная поисковая панель
export function MobileSearchBar({ 
  value, 
  onChange, 
  onFocus, 
  placeholder = 'Поиск...' 
}: {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        className="pl-10 pr-4 py-3 text-base border-0 bg-gray-100 dark:bg-gray-800 rounded-full"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

// Swipeable карточки
interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export function SwipeableCard({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  className = '' 
}: SwipeableCardProps) {
  const [dragX, setDragX] = useState(0);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.x > 150 && onSwipeRight) {
          onSwipeRight();
        } else if (info.offset.x < -150 && onSwipeLeft) {
          onSwipeLeft();
        }
      }}
      onDrag={(_, info) => setDragX(info.offset.x)}
      className={`select-none ${className}`}
    >
      {children}
    </motion.div>
  );
}