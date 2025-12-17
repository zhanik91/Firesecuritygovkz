import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import UserProfileDashboard from '@/components/UserProfileDashboard';

export default function UserDashboard() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Доступ ограничен</h1>
          <p className="text-muted-foreground mb-4">Для доступа к личному кабинету необходимо авторизоваться</p>
          <button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Войти в систему
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <UserProfileDashboard />
    </div>
  );
}