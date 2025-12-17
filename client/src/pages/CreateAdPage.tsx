import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CreateAdForm from '@/components/CreateAdForm';
import { useLocation } from 'wouter';

export default function CreateAdPage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Вход в систему</h1>
            <p className="text-muted-foreground mb-4">
              Для размещения заказа необходимо авторизоваться
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
    );
  }

  const handleSuccess = () => {
    setLocation('/marketplace');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <CreateAdForm onSuccess={handleSuccess} />
      </div>
      <Footer />
    </div>
  );
}