
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Shield, User } from 'lucide-react';

export default function AdminRoleChecker() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Не авторизован
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Необходимо войти в систему</p>
          <Button onClick={() => window.location.href = '/api/login'}>
            Войти
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Информация о пользователе
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>ID:</strong> {user?.id}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Роль:</strong> {(user as any)?.role || 'user'}</p>
          <p><strong>Имя:</strong> {user?.firstName} {user?.lastName}</p>
        </div>
        
        {(user as any)?.role === 'admin' ? (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
            ✅ У вас есть права администратора
          </div>
        ) : (
          <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
            ❌ У вас нет прав администратора
          </div>
        )}
      </CardContent>
    </Card>
  );
}
