import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import AdminSidebar from '@/components/AdminSidebar';
import AdminDashboard from '@/pages/AdminDashboard';
import SEOHead from '@/components/SEOHead';

export default function AdminPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Доступ запрещен",
        description: "Необходима авторизация для доступа к админ-панели",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    // Check if user is admin
    if (!isLoading && isAuthenticated && (user as any)?.role !== 'admin') {
      toast({
        title: "Недостаточно прав",
        description: "У вас нет прав доступа к админ-панели",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (user as any)?.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <SEOHead 
        title="Админ-панель | NewsFire"
        description="Панель администратора для управления порталом пожарной безопасности"
        keywords="админ, управление, модерация, NewsFire"
      />

      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <AdminDashboard />
      </div>
    </div>
  );
}