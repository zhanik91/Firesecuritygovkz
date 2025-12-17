import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NotificationCenter from '@/components/NotificationCenter';
import SEOHead from '@/components/SEOHead';

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <>
        <SEOHead 
          title="Уведомления - Вход в систему"
          description="Для просмотра уведомлений необходимо авторизоваться в системе"
        />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header />
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Вход в систему</h1>
              <p className="text-muted-foreground mb-4">
                Для просмотра уведомлений необходимо авторизоваться
              </p>
              <button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Войти в систему
              </button>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title="Уведомления - Fire Safety KZ"
        description="Центр уведомлений о заявках, событиях и обновлениях в системе Fire Safety KZ"
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <NotificationCenter />
        </div>
        <Footer />
      </div>
    </>
  );
}