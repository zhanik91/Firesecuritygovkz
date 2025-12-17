import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Bell, Check, X, MessageSquare, FileText, ShoppingCart, UserPlus } from 'lucide-react';

interface Notification {
  id: string;
  type: 'message' | 'post' | 'bid' | 'user_registered' | 'admin_alert';
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface NotificationSystemProps {
  userId?: string;
}

export default function NotificationSystem({ userId }: NotificationSystemProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['/api/notifications', userId],
    enabled: !!userId,
    refetchInterval: 30000, // Обновлять каждые 30 секунд
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () =>
      fetch('/api/notifications/mark-all-read', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) =>
      fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="h-4 w-4" />;
      case 'post': return <FileText className="h-4 w-4" />;
      case 'bid': return <ShoppingCart className="h-4 w-4" />;
      case 'user_registered': return <UserPlus className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Только что';
    if (diffInHours < 24) return `${diffInHours} ч. назад`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} дн. назад`;
  };

  if (!userId) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Уведомления</CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => markAllAsReadMutation.mutate()}
                >
                  Прочитать все
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Загрузка уведомлений...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Нет уведомлений
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification: Notification, index: number) => (
                    <div key={notification.id}>
                      <div 
                        className={`p-3 hover:bg-muted/50 cursor-pointer ${
                          !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => {
                          if (!notification.isRead) {
                            markAsReadMutation.mutate(notification.id);
                          }
                          if (notification.actionUrl) {
                            window.location.href = notification.actionUrl;
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium truncate">
                                {notification.title}
                              </p>
                              <div className="flex items-center gap-1 ml-2">
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotificationMutation.mutate(notification.id);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {getTimeAgo(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {index < notifications.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

// Hook для отправки уведомлений (для админов)
export function useNotifications() {
  const queryClient = useQueryClient();

  const sendNotification = useMutation({
    mutationFn: (notification: {
      userId: string;
      type: string;
      title: string;
      description: string;
      actionUrl?: string;
    }) =>
      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  return { sendNotification };
}