import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Users, 
  ShoppingCart, 
  CheckCircle, 
  X, 
  Settings,
  Archive,
  Trash2,
  Filter
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: 'system' | 'content' | 'marketplace' | 'user';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  metadata?: any;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketplaceUpdates: boolean;
  contentUpdates: boolean;
  systemAlerts: boolean;
  weeklyDigest: boolean;
}

export default function EnhancedNotifications({ userId }: { userId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data: notifications = [] } = useQuery({
    queryKey: ['/api/notifications', userId],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: settings = {} } = useQuery({
    queryKey: ['/api/notifications/settings', userId],
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      fetch(`/api/notifications/${notificationId}/read`, { method: 'PUT' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/notifications/mark-all-read`, { method: 'PUT' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({ title: 'Все уведомления отмечены как прочитанные' });
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) =>
      fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: Partial<NotificationSettings>) =>
      fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/settings'] });
      toast({ title: 'Настройки уведомлений обновлены' });
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'system': return <Settings className="h-4 w-4" />;
      case 'content': return <Bell className="h-4 w-4" />;
      case 'marketplace': return <ShoppingCart className="h-4 w-4" />;
      case 'user': return <Users className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const filteredNotifications = (notifications as Notification[])
    .filter((notification) => {
      if (filter === 'read' && !notification.isRead) return false;
      if (filter === 'unread' && notification.isRead) return false;
      if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
      return true;
    });

  const unreadCount = (notifications as Notification[]).filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Уведомления</h2>
          <p className="text-muted-foreground">
            Управляйте уведомлениями и настройками
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{unreadCount} непрочитанных</Badge>
          <Button
            size="sm"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={unreadCount === 0}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Отметить все
          </Button>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Уведомления
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Настройки
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="space-y-2">
                  <Label>Статус</Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={filter === 'all' ? 'default' : 'outline'}
                      onClick={() => setFilter('all')}
                    >
                      Все
                    </Button>
                    <Button
                      size="sm"
                      variant={filter === 'unread' ? 'default' : 'outline'}
                      onClick={() => setFilter('unread')}
                    >
                      Непрочитанные ({unreadCount})
                    </Button>
                    <Button
                      size="sm"
                      variant={filter === 'read' ? 'default' : 'outline'}
                      onClick={() => setFilter('read')}
                    >
                      Прочитанные
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Тип</Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={typeFilter === 'all' ? 'default' : 'outline'}
                      onClick={() => setTypeFilter('all')}
                    >
                      Все типы
                    </Button>
                    <Button
                      size="sm"
                      variant={typeFilter === 'system' ? 'default' : 'outline'}
                      onClick={() => setTypeFilter('system')}
                    >
                      Система
                    </Button>
                    <Button
                      size="sm"
                      variant={typeFilter === 'content' ? 'default' : 'outline'}
                      onClick={() => setTypeFilter('content')}
                    >
                      Контент
                    </Button>
                    <Button
                      size="sm"
                      variant={typeFilter === 'marketplace' ? 'default' : 'outline'}
                      onClick={() => setTypeFilter('marketplace')}
                    >
                      Маркетплейс
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Список уведомлений ({filteredNotifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Нет уведомлений для отображения</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredNotifications.map((notification, index) => (
                      <div key={notification.id}>
                        <div className={`p-4 rounded-lg border transition-all ${
                          !notification.isRead 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                            : 'bg-card'
                        }`}>
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${
                              !notification.isRead ? 'bg-blue-100 dark:bg-blue-800' : 'bg-muted'
                            }`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium">{notification.title}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {notification.message}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={getPriorityColor(notification.priority) as any}>
                                    {notification.priority}
                                  </Badge>
                                  <Badge variant="outline">
                                    {notification.type}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>
                                  {new Date(notification.createdAt).toLocaleString('ru-RU')}
                                </span>
                                <div className="flex items-center gap-2">
                                  {!notification.isRead && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => markAsReadMutation.mutate(notification.id)}
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Прочитано
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteNotificationMutation.mutate(notification.id)}
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Удалить
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {index < filteredNotifications.length - 1 && <Separator className="my-2" />}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Настройки уведомлений</CardTitle>
              <CardDescription>
                Управляйте типами уведомлений, которые хотите получать
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email">Email уведомления</Label>
                    <p className="text-sm text-muted-foreground">
                      Получать уведомления на email
                    </p>
                  </div>
                  <Switch
                    id="email"
                    checked={(settings as NotificationSettings).emailNotifications}
                    onCheckedChange={(checked) => 
                      updateSettingsMutation.mutate({ emailNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push">Push уведомления</Label>
                    <p className="text-sm text-muted-foreground">
                      Показывать уведомления в браузере
                    </p>
                  </div>
                  <Switch
                    id="push"
                    checked={(settings as NotificationSettings).pushNotifications}
                    onCheckedChange={(checked) => 
                      updateSettingsMutation.mutate({ pushNotifications: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketplace">Маркетплейс</Label>
                    <p className="text-sm text-muted-foreground">
                      Новые заказы и отклики на ваши объявления
                    </p>
                  </div>
                  <Switch
                    id="marketplace"
                    checked={(settings as NotificationSettings).marketplaceUpdates}
                    onCheckedChange={(checked) => 
                      updateSettingsMutation.mutate({ marketplaceUpdates: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="content">Новый контент</Label>
                    <p className="text-sm text-muted-foreground">
                      Новые статьи, документы и видео
                    </p>
                  </div>
                  <Switch
                    id="content"
                    checked={(settings as NotificationSettings).contentUpdates}
                    onCheckedChange={(checked) => 
                      updateSettingsMutation.mutate({ contentUpdates: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="system">Системные уведомления</Label>
                    <p className="text-sm text-muted-foreground">
                      Обновления системы и важные объявления
                    </p>
                  </div>
                  <Switch
                    id="system"
                    checked={(settings as NotificationSettings).systemAlerts}
                    onCheckedChange={(checked) => 
                      updateSettingsMutation.mutate({ systemAlerts: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="digest">Еженедельная сводка</Label>
                    <p className="text-sm text-muted-foreground">
                      Сводка активности за неделю
                    </p>
                  </div>
                  <Switch
                    id="digest"
                    checked={(settings as NotificationSettings).weeklyDigest}
                    onCheckedChange={(checked) => 
                      updateSettingsMutation.mutate({ weeklyDigest: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}