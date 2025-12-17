import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  FolderTree, 
  FileText, 
  BookOpen, 
  Image, 
  ShoppingCart, 
  Bot, 
  BarChart, 
  Settings, 
  Trash2, 
  Edit, 
  Plus, 
  Eye, 
  Download,
  Upload,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'supplier' | 'admin';
  createdAt: string;
  updatedAt: string;
}

interface Section {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  isActive: boolean;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  authorId: string;
  subsectionId: string;
  isPublished: boolean;
  isFeatured: boolean;
  views: number;
  createdAt: string;
}

interface Ad {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'pending' | 'rejected';
  views: number;
  bidCount: number;
  createdAt: string;
}

// Admin Panel Component
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: activeTab === 'users'
  });

  const { data: sections, isLoading: sectionsLoading } = useQuery({
    queryKey: ['/api/sections'],
    enabled: activeTab === 'sections'
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['/api/admin/posts'],
    enabled: activeTab === 'posts'
  });

  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: ['/api/admin/documents'],
    enabled: activeTab === 'documents'
  });

  const { data: media, isLoading: mediaLoading } = useQuery({
    queryKey: ['/api/admin/media'],
    enabled: activeTab === 'media'
  });

  const { data: marketplace, isLoading: marketplaceLoading } = useQuery({
    queryKey: ['/api/admin/marketplace'],
    enabled: activeTab === 'marketplace'
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/admin/analytics'],
    enabled: activeTab === 'analytics'
  });

  const { data: aiTasks, isLoading: aiLoading } = useQuery({
    queryKey: ['/api/admin/ai/tasks'],
    enabled: activeTab === 'ai'
  });

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/admin/settings'],
    enabled: activeTab === 'settings'
  });

  // Mutations
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => 
      fetch(`/api/admin/users/${userId}`, { method: 'DELETE' }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: 'Пользователь удален' });
    }
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      fetch(`/api/admin/posts/${id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data) 
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/posts'] });
      toast({ title: 'Публикация обновлена' });
    }
  });

  const updateAdStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      fetch(`/api/admin/marketplace/${id}/status`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }) 
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/marketplace'] });
      toast({ title: 'Статус объявления обновлен' });
    }
  });

  const aiChatMutation = useMutation({
    mutationFn: (message: string) => 
      fetch('/api/admin/ai/chat', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }) 
      }).then(res => res.json())
  });

  // Users Management Tab
  const UsersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управление пользователями</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Добавить пользователя
        </Button>
      </div>

      {usersLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Имя</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Дата регистрации</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(users as User[] || [])?.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                        {user.role === 'admin' ? 'Администратор' : 
                         user.role === 'supplier' ? 'Поставщик' : 'Пользователь'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString('ru-RU')}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Это действие нельзя отменить. Пользователь будет полностью удален.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteUserMutation.mutate(user.id)}>
                                Удалить
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Sections Management Tab
  const SectionsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управление разделами</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Добавить раздел
        </Button>
      </div>

      {sectionsLoading ? (
        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {(sections as Section[] || [])?.map((section: Section) => (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{section.name}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant={section.isActive ? 'default' : 'secondary'}>
                      {section.isActive ? 'Активен' : 'Неактивен'}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Posts Management Tab
  const PostsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управление публикациями</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Создать публикацию
        </Button>
      </div>

      {postsLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {(posts as Post[] || [])?.map((post: Post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    <CardDescription>
                      Просмотры: {post.views} • Создано: {new Date(post.createdAt).toLocaleDateString('ru-RU')}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant={post.isPublished ? 'default' : 'secondary'}>
                      {post.isPublished ? 'Опубликован' : 'Черновик'}
                    </Badge>
                    {post.isFeatured && (
                      <Badge variant="destructive">Рекомендуемый</Badge>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updatePostMutation.mutate({ 
                        id: post.id, 
                        data: { isPublished: !post.isPublished } 
                      })}
                    >
                      {post.isPublished ? 'Скрыть' : 'Опубликовать'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Documents Management Tab
  const DocumentsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управление документами</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Загрузить документ
        </Button>
      </div>

      {documentsLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {(documents as any[] || [])?.map((doc: any) => (
            <Card key={doc.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base">{doc.title}</CardTitle>
                    <CardDescription>
                      Загрузки: {doc.downloads} • {new Date(doc.createdAt).toLocaleDateString('ru-RU')}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Media Library Tab
  const MediaTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Медиабиблиотека</h2>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Загрузить файлы
        </Button>
      </div>

      {mediaLoading ? (
        <div className="grid grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {(media as any[] || [])?.map((file: any) => (
            <Card key={file.id} className="overflow-hidden">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <Image className="w-8 h-8 text-gray-400" />
              </div>
              <CardContent className="p-2">
                <p className="text-xs truncate">{file.fileName}</p>
                <p className="text-xs text-gray-500">{(file.fileSize / 1024).toFixed(1)} KB</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Marketplace Management Tab
  const MarketplaceTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Модерация маркетплейса</h2>

      {marketplaceLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {(marketplace as Ad[] || [])?.map((ad: Ad) => (
            <Card key={ad.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{ad.title}</CardTitle>
                    <CardDescription>
                      Просмотры: {ad.views} • Откликов: {ad.bidCount}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant={
                      ad.status === 'active' ? 'default' : 
                      ad.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {ad.status === 'active' ? 'Активно' : 
                       ad.status === 'pending' ? 'На модерации' : 'Отклонено'}
                    </Badge>
                    <Select
                      value={ad.status}
                      onValueChange={(status) => updateAdStatusMutation.mutate({ id: ad.id, status })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Одобрить</SelectItem>
                        <SelectItem value="pending">На модерации</SelectItem>
                        <SelectItem value="rejected">Отклонить</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // AI Assistant Tab
  const AITab = () => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<any[]>([]);

    const sendMessage = () => {
      if (!message.trim()) return;
      
      setChatHistory(prev => [...prev, { type: 'user', content: message }]);
      
      aiChatMutation.mutate(message, {
        onSuccess: (response: any) => {
          setChatHistory(prev => [...prev, { type: 'ai', content: response?.message || 'Ответ получен' }]);
          setMessage('');
        }
      });
    };

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">AI Помощник</h2>
        
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Чат с AI</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-64 border rounded p-4 overflow-y-auto space-y-2">
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`p-2 rounded ${
                      msg.type === 'user' ? 'bg-blue-100 ml-auto max-w-xs' : 'bg-gray-100 max-w-xs'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Задайте вопрос AI помощнику..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage} disabled={aiChatMutation.isPending}>
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>AI Задачи</CardTitle>
              </CardHeader>
              <CardContent>
                {aiLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(aiTasks as any[] || [])?.map((task: any) => (
                      <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">{task.title}</p>
                          <Badge variant={
                            task.status === 'completed' ? 'default' :
                            task.status === 'in_progress' ? 'secondary' : 'destructive'
                          }>
                            {task.status === 'completed' ? 'Выполнено' :
                             task.status === 'in_progress' ? 'В работе' : 'Ожидает'}
                          </Badge>
                        </div>
                        <Badge variant="outline">
                          {task.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  // Analytics Tab
  const AnalyticsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Аналитика</h2>

      {analyticsLoading ? (
        <div className="grid grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Основные метрики */}
          <div className="grid grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(analytics as any)?.users?.total || 0}</div>
                <div className="text-xs text-muted-foreground">
                  Админы: {(analytics as any)?.users?.admins || 0}, Поставщики: {(analytics as any)?.users?.suppliers || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Публикации</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(analytics as any)?.content?.posts || 0}</div>
                <div className="text-xs text-muted-foreground">
                  Опубликовано: {(analytics as any)?.content?.publishedPosts || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Объявления</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(analytics as any)?.marketplace?.ads || 0}</div>
                <div className="text-xs text-muted-foreground">
                  Активных: {(analytics as any)?.marketplace?.activeAds || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Общие просмотры</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((analytics as any)?.views?.totalPostViews || 0) + ((analytics as any)?.views?.totalAdViews || 0)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Постов: {(analytics as any)?.views?.totalPostViews || 0}, Объявлений: {(analytics as any)?.views?.totalAdViews || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Графики активности */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Активность пользователей</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Администраторы</span>
                    <span className="text-sm font-medium">{(analytics as any)?.users?.admins || 0}</span>
                  </div>
                  <Progress value={((analytics as any)?.users?.admins / (analytics as any)?.users?.total) * 100 || 0} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Поставщики</span>
                    <span className="text-sm font-medium">{(analytics as any)?.users?.suppliers || 0}</span>
                  </div>
                  <Progress value={((analytics as any)?.users?.suppliers / (analytics as any)?.users?.total) * 100 || 0} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Пользователи</span>
                    <span className="text-sm font-medium">{(analytics as any)?.users?.regular || 0}</span>
                  </div>
                  <Progress value={((analytics as any)?.users?.regular / (analytics as any)?.users?.total) * 100 || 0} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Статистика контента</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Опубликованные посты</span>
                    <span className="text-sm font-medium">{(analytics as any)?.content?.publishedPosts || 0}</span>
                  </div>
                  <Progress value={((analytics as any)?.content?.publishedPosts / (analytics as any)?.content?.posts) * 100 || 0} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Черновики</span>
                    <span className="text-sm font-medium">{(analytics as any)?.content?.draftPosts || 0}</span>
                  </div>
                  <Progress value={((analytics as any)?.content?.draftPosts / (analytics as any)?.content?.posts) * 100 || 0} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Документы</span>
                    <span className="text-sm font-medium">{(analytics as any)?.content?.documents || 0}</span>
                  </div>
                  <Progress value={75} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );

  // Settings Tab
  const SettingsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Системные настройки</h2>

      {settingsLoading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Основные настройки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Название сайта</Label>
                  <Input id="siteName" defaultValue={(settings as any)?.siteName} />
                </div>
                <div>
                  <Label htmlFor="adminEmail">Email администратора</Label>
                  <Input id="adminEmail" type="email" defaultValue={(settings as any)?.adminEmail} />
                </div>
              </div>
              <div>
                <Label htmlFor="siteDescription">Описание сайта</Label>
                <Textarea id="siteDescription" defaultValue={(settings as any)?.siteDescription} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Настройки безопасности</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance">Режим обслуживания</Label>
                  <p className="text-sm text-gray-500">Отключить сайт для пользователей</p>
                </div>
                <Switch id="maintenance" defaultChecked={(settings as any)?.maintenanceMode} />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="registration">Разрешить регистрацию</Label>
                  <p className="text-sm text-gray-500">Новые пользователи могут регистрироваться</p>
                </div>
                <Switch id="registration" defaultChecked={(settings as any)?.registrationEnabled} />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="moderation">Модерация контента</Label>
                  <p className="text-sm text-gray-500">Проверять новый контент перед публикацией</p>
                </div>
                <Switch id="moderation" defaultChecked={(settings as any)?.moderationRequired} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Настройки файлов</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="maxFileSize">Максимальный размер файла (MB)</Label>
                <Input 
                  id="maxFileSize" 
                  type="number" 
                  defaultValue={Math.round(((settings as any)?.maxFileSize || 0) / 1024 / 1024)} 
                />
              </div>
              <div>
                <Label htmlFor="allowedTypes">Разрешенные типы файлов</Label>
                <Input 
                  id="allowedTypes" 
                  defaultValue={(settings as any)?.allowedFileTypes?.join(', ')} 
                  placeholder="jpg, png, pdf, doc..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Информация о системе</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Версия системы:</span>
                <Badge variant="outline">{(settings as any)?.systemVersion}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Последний бэкап:</span>
                <span className="text-sm text-gray-500">
                  {(settings as any)?.lastBackup ? new Date((settings as any).lastBackup).toLocaleString('ru-RU') : 'Никогда'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Частота бэкапов:</span>
                <Badge variant="secondary">{(settings as any)?.backupFrequency === 'daily' ? 'Ежедневно' : 'Еженедельно'}</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline">Отменить</Button>
            <Button>Сохранить настройки</Button>
          </div>
        </div>
      )}
    </div>
  );

  // Subsections Tab (new)
  const SubsectionsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управление подразделами</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Добавить подраздел
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="text-center text-gray-500">Функционал подразделов в разработке</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Панель администратора</h1>
          <p className="text-gray-600">Управление контентом и пользователями портала Fire Safety KZ</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-10">
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Пользователи</span>
            </TabsTrigger>
            <TabsTrigger value="sections" className="flex items-center space-x-2">
              <FolderTree className="w-4 h-4" />
              <span className="hidden sm:inline">Разделы</span>
            </TabsTrigger>
            <TabsTrigger value="subsections" className="flex items-center space-x-2">
              <FolderTree className="w-4 h-4" />
              <span className="hidden sm:inline">Подразделы</span>
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Публикации</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Документы</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center space-x-2">
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">Медиа</span>
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Маркетплейс</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center space-x-2">
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">AI</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart className="w-4 h-4" />
              <span className="hidden sm:inline">Аналитика</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Настройки</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <UsersTab />
          </TabsContent>

          <TabsContent value="sections" className="space-y-6">
            <SectionsTab />
          </TabsContent>

          <TabsContent value="subsections" className="space-y-6">
            <SubsectionsTab />
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <PostsTab />
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <DocumentsTab />
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <MediaTab />
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            <MarketplaceTab />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <AITab />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}