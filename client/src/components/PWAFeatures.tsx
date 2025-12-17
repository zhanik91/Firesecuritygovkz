import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Wifi, 
  WifiOff, 
  Bell, 
  BellOff,
  Smartphone,
  Monitor,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';

// Хук для определения состояния PWA
export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Проверяем, установлено ли приложение
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );

    setIsInstalled(isStandalone);

    // Слушаем событие beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Слушаем изменения онлайн/оффлайн статуса
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isStandalone]);

  const installPWA = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  return {
    canInstall: !!deferredPrompt && !isInstalled,
    isInstalled,
    isOnline,
    isStandalone,
    installPWA
  };
}

// Компонент для установки PWA
export function InstallPWAPrompt() {
  const { t } = useLanguage();
  const { canInstall, installPWA } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Показываем промпт через 30 секунд после загрузки
    const timer = setTimeout(() => {
      if (canInstall) {
        setShowPrompt(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [canInstall]);

  if (!canInstall || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-6 md:w-96"
      >
        <Card className="shadow-2xl border-kz-blue">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-kz-blue/10 p-2 rounded-full">
                <Smartphone className="w-5 h-5 text-kz-blue" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">
                  {t('pwa.install.title', 'Установить приложение')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {t('pwa.install.description', 'Получите быстрый доступ с главного экрана')}
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={installPWA}
                    size="sm" 
                    className="bg-kz-blue hover:bg-kz-blue/90"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    {t('pwa.install.button', 'Установить')}
                  </Button>
                  <Button 
                    onClick={() => setShowPrompt(false)}
                    size="sm" 
                    variant="outline"
                  >
                    {t('common.cancel', 'Отмена')}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

// Индикатор состояния сети
export function NetworkStatus() {
  const { t } = useLanguage();
  const { isOnline } = usePWA();
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    setShowStatus(!isOnline);
    
    if (!isOnline) {
      const timer = setTimeout(() => setShowStatus(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-6 md:w-80"
        >
          <Alert className={`border-0 shadow-lg ${
            isOnline 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200'
          }`}>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <WifiOff className="w-4 h-4" />
              )}
              <AlertDescription className="font-medium">
                {isOnline 
                  ? t('network.online', 'Подключение восстановлено')
                  : t('network.offline', 'Отсутствует подключение к интернету')
                }
              </AlertDescription>
            </div>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Управление push-уведомлениями
export function NotificationManager() {
  const { t } = useLanguage();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    const permission = await Notification.requestPermission();
    setPermission(permission);

    if (permission === 'granted') {
      await subscribeToPush();
    }
  };

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push messaging is not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY
      });

      setSubscription(subscription);
      
      // Отправляем подписку на сервер
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  };

  const unsubscribeFromPush = async () => {
    if (subscription) {
      await subscription.unsubscribe();
      setSubscription(null);
      
      // Убираем подписку с сервера
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
    }
  };

  if (permission === 'denied') {
    return (
      <Alert className="mb-4">
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          {t('notifications.denied', 'Уведомления заблокированы. Включите их в настройках браузера.')}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center text-base">
          <Bell className="w-4 h-4 mr-2" />
          {t('notifications.title', 'Уведомления')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('notifications.description', 'Получайте уведомления о новых заказах и обновлениях')}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {subscription ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                {t('notifications.enabled', 'Включены')}
              </Badge>
            ) : (
              <Badge variant="outline">
                <BellOff className="w-3 h-3 mr-1" />
                {t('notifications.disabled', 'Отключены')}
              </Badge>
            )}
          </div>
          
          {subscription ? (
            <Button 
              onClick={unsubscribeFromPush}
              size="sm" 
              variant="outline"
            >
              {t('notifications.disable', 'Отключить')}
            </Button>
          ) : (
            <Button 
              onClick={requestPermission}
              size="sm" 
              className="bg-kz-blue hover:bg-kz-blue/90"
              disabled={permission === 'denied'}
            >
              {t('notifications.enable', 'Включить')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Офлайн индикатор
export function OfflineIndicator() {
  const { t } = useLanguage();
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-white p-2 text-center text-sm font-medium">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="w-4 h-4" />
        {t('offline.message', 'Вы работаете в оффлайн режиме')}
      </div>
    </div>
  );
}

// Статистика использования PWA
export function PWAStats() {
  const { t } = useLanguage();
  const { isStandalone, isInstalled } = usePWA();
  const [usage, setUsage] = useState({
    sessions: 0,
    timeSpent: 0,
    lastVisit: null as Date | null
  });

  useEffect(() => {
    // Загружаем статистику из localStorage
    const stats = localStorage.getItem('pwa-stats');
    if (stats) {
      setUsage(JSON.parse(stats));
    }

    // Обновляем статистику при каждом визите
    const updateStats = () => {
      const newStats = {
        sessions: usage.sessions + 1,
        timeSpent: usage.timeSpent,
        lastVisit: new Date()
      };
      setUsage(newStats);
      localStorage.setItem('pwa-stats', JSON.stringify(newStats));
    };

    updateStats();
  }, []);

  if (!isInstalled && !isStandalone) return null;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center text-base">
          <Monitor className="w-4 h-4 mr-2" />
          {t('pwa.stats.title', 'Статистика использования')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-kz-blue">{usage.sessions}</div>
            <div className="text-sm text-gray-600">{t('pwa.stats.sessions', 'Сессий')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(usage.timeSpent / 60)}
            </div>
            <div className="text-sm text-gray-600">{t('pwa.stats.minutes', 'Минут')}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}