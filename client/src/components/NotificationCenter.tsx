import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { Bell, BellRing, Check, X, ExternalLink, Calendar, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function NotificationCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const { data: notifications = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/notifications', user?.id],
    enabled: !!user?.id
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <BellRing className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const filteredNotifications = showUnreadOnly 
    ? (notifications as any[]).filter((n: any) => !n.isRead)
    : notifications;

  const unreadCount = (notifications as any[]).filter((n: any) => !n.isRead).length;

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Уведомления
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Загрузка уведомлений...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Уведомления
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 min-w-[20px] text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showUnreadOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            >
              {showUnreadOnly ? 'Все' : 'Непрочитанные'}
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Центр уведомлений о заявках и событиях в системе
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {showUnreadOnly ? 'Нет непрочитанных уведомлений' : 'Уведомлений пока нет'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification: any) => (
              <div
                key={notification.id}
                className={`border rounded-lg p-4 transition-colors ${
                  notification.isRead 
                    ? 'bg-muted/50' 
                    : 'bg-background border-blue-200 dark:border-blue-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-sm">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={getNotificationBadgeColor(notification.type)}>
                          {notification.type === 'success' && 'Успех'}
                          {notification.type === 'warning' && 'Внимание'}
                          {notification.type === 'error' && 'Ошибка'}
                          {notification.type === 'info' && 'Информация'}
                        </Badge>
                        
                        {!notification.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(notification.createdAt), { 
                          addSuffix: true, 
                          locale: ru 
                        })}
                      </div>
                      
                      {notification.linkUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = notification.linkUrl}
                          className="h-7 text-xs"
                        >
                          Перейти
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}