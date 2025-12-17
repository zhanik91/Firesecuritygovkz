import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Search,
  Eye,
  MessageSquare,
  FileText,
  Clock
} from 'lucide-react';

export default function AdminModerationPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');

  const { data: pendingAds } = useQuery({
    queryKey: ['/api/admin/ads/pending']
  });

  const { data: reportedContent } = useQuery({
    queryKey: ['/api/admin/reports']
  });

  const { data: moderationStats } = useQuery({
    queryKey: ['/api/admin/moderation/stats']
  });

  const approveAdMutation = useMutation({
    mutationFn: (adId: string) =>
      fetch(`/api/admin/ads/${adId}/approve`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ads/pending'] });
      toast({ title: 'Объявление одобрено', description: 'Объявление опубликовано' });
    }
  });

  const rejectAdMutation = useMutation({
    mutationFn: ({ adId, reason }: { adId: string; reason: string }) =>
      fetch(`/api/admin/ads/${adId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ads/pending'] });
      toast({ title: 'Объявление отклонено', description: 'Автор уведомлен о причине' });
    }
  });

  const stats = moderationStats || {
    pending: 12,
    approved: 45,
    rejected: 8,
    reports: 3
  };

  const mockPendingAds = [
    {
      id: '1',
      title: 'Установка пожарной сигнализации',
      author: 'ТОО "Безопасность+"',
      category: 'Монтаж систем',
      createdAt: '2025-01-09',
      status: 'pending'
    },
    {
      id: '2',
      title: 'Проверка огнетушителей',
      author: 'ИП Султанов А.Б.',
      category: 'Обслуживание',
      createdAt: '2025-01-09',
      status: 'pending'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600">На модерации</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600">Одобрено</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600">Отклонено</Badge>;
      default:
        return <Badge variant="outline">Неизвестно</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white p-6 rounded-lg">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Модерация контента</h1>
            <p className="opacity-90">Управление публикацией объявлений и контента</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">На модерации</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Одобрено</p>
                <p className="text-2xl font-bold text-green-600">{stats?.approved || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Отклонено</p>
                <p className="text-2xl font-bold text-red-600">{stats?.rejected || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Жалобы</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.reports || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Interface */}
      <Tabs defaultValue="ads" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ads" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Объявления
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Жалобы
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Комментарии
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Объявления на модерации</CardTitle>
              <CardDescription>
                Проверьте и одобрите или отклоните объявления пользователей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по названию или автору..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select 
                  className="px-3 py-2 border rounded-md"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="pending">На модерации</option>
                  <option value="all">Все</option>
                  <option value="approved">Одобренные</option>
                  <option value="rejected">Отклоненные</option>
                </select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Объявление</TableHead>
                    <TableHead>Автор</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(Array.isArray(pendingAds) ? pendingAds : mockPendingAds).map((ad: any) => (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium">{ad.title}</TableCell>
                      <TableCell>{ad.author}</TableCell>
                      <TableCell>{ad.category}</TableCell>
                      <TableCell>{new Date(ad.createdAt).toLocaleDateString('ru-RU')}</TableCell>
                      <TableCell>{getStatusBadge(ad.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {ad.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => approveAdMutation.mutate(ad.id)}
                                disabled={approveAdMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => rejectAdMutation.mutate({ 
                                  adId: ad.id, 
                                  reason: 'Не соответствует требованиям' 
                                })}
                                disabled={rejectAdMutation.isPending}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Жалобы пользователей</CardTitle>
              <CardDescription>
                Рассмотрите жалобы на контент и примите соответствующие меры
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                <p>Новых жалоб нет</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Модерация комментариев</CardTitle>
              <CardDescription>
                Управление комментариями к объявлениям и статьям
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                <p>Комментариев на модерации нет</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}