import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { 
  User, 
  Settings, 
  Bell, 
  FileText, 
  ShoppingCart, 
  Star, 
  Calendar,
  Award,
  Activity,
  Upload,
  Save
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function UserProfileDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['/api/profile', user?.id],
    enabled: !!user?.id
  });

  const { data: userStats } = useQuery({
    queryKey: ['/api/profile/stats', user?.id],
    enabled: !!user?.id
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['/api/profile/activity', user?.id],
    enabled: !!user?.id
  });

  const updateProfileMutation = useMutation({
    mutationFn: (profileData: any) =>
      fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({ title: 'Профиль обновлен', description: 'Изменения сохранены успешно' });
      setEditMode(false);
    }
  });

  const [formData, setFormData] = useState({
    firstName: (user as any)?.firstName || '',
    lastName: (user as any)?.lastName || '',
    email: (user as any)?.email || '',
    phone: '',
    company: '',
    position: '',
    bio: '',
    skills: [],
    location: ''
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const completionPercentage = 60; // Calculate based on filled fields

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={`https://avatar.vercel.sh/${(user as any)?.email}`} />
              <AvatarFallback className="text-lg">
                {(user as any)?.firstName?.[0]}{(user as any)?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold">
                  {(user as any)?.firstName} {(user as any)?.lastName}
                </h1>
                <p className="text-muted-foreground">{(user as any)?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={
                    (user as any)?.role === 'admin' ? 'destructive' :
                    (user as any)?.role === 'supplier' ? 'default' : 'secondary'
                  }>
                    {(user as any)?.role === 'admin' ? 'Администратор' :
                     (user as any)?.role === 'supplier' ? 'Поставщик' : 'Пользователь'}
                  </Badge>
                  <Badge variant="outline">
                    Участник с {new Date((user as any)?.createdAt || Date.now()).toLocaleDateString('ru-RU')}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Заполненность профиля</span>
                  <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
            </div>

            <Button 
              variant={editMode ? "default" : "outline"}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? <Save className="h-4 w-4 mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
              {editMode ? 'Сохранить' : 'Редактировать'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Обзор
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Профиль
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Активность
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Заказы
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Достижения
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Просмотры</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(userStats as any)?.postsViewed || 0}</div>
                <p className="text-xs text-muted-foreground">документов прочитано</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Скачивания</CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(userStats as any)?.downloads || 0}</div>
                <p className="text-xs text-muted-foreground">файлов скачано</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Заказы</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(userStats as any)?.orders || 0}</div>
                <p className="text-xs text-muted-foreground">активных заказов</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Рейтинг</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(userStats as any)?.rating || '5.0'}</div>
                <p className="text-xs text-muted-foreground">средняя оценка</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Последняя активность</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { action: 'Просмотрел документ', item: 'Основы пожарной безопасности', time: '2 часа назад' },
                  { action: 'Скачал файл', item: 'План эвакуации.pdf', time: '1 день назад' },
                  { action: 'Оставил отзыв', item: 'Пожарная сигнализация', time: '3 дня назад' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.item}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Рекомендации</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-sm">Заполните профиль</h4>
                    <p className="text-sm text-muted-foreground">
                      Добавьте информацию о компании и навыках
                    </p>
                    <Button size="sm" variant="outline" className="mt-2">
                      Заполнить
                    </Button>
                  </div>
                  
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-medium text-sm">Новые документы</h4>
                    <p className="text-sm text-muted-foreground">
                      Доступны 5 новых документов по вашим интересам
                    </p>
                    <Button size="sm" variant="outline" className="mt-2">
                      Посмотреть
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Личная информация</CardTitle>
              <CardDescription>Управляйте настройками своего профиля</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Имя</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({...prev, firstName: e.target.value}))}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Фамилия</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({...prev, lastName: e.target.value}))}
                    disabled={!editMode}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled // Email usually shouldn't be editable
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Местоположение</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
                    disabled={!editMode}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Компания</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({...prev, company: e.target.value}))}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label htmlFor="position">Должность</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({...prev, position: e.target.value}))}
                    disabled={!editMode}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">О себе</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({...prev, bio: e.target.value}))}
                  disabled={!editMode}
                  rows={4}
                />
              </div>

              {editMode && (
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
                    Сохранить изменения
                  </Button>
                  <Button variant="outline" onClick={() => setEditMode(false)}>
                    Отмена
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>История активности</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({length: 10}, (_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Активность {i + 1}</p>
                      <p className="text-xs text-muted-foreground">Описание активности</p>
                    </div>
                    <Badge variant="outline">Тип</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace">
          <Card>
            <CardHeader>
              <CardTitle>Мои заказы</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Здесь будут отображаться ваши заказы и предложения</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Достижения</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { title: 'Первый визит', description: 'Зарегистрировались на сайте', earned: true },
                  { title: 'Активный читатель', description: 'Прочитали 10 документов', earned: true },
                  { title: 'Эксперт', description: 'Получили 5 положительных отзывов', earned: false },
                ].map((achievement, index) => (
                  <div key={index} className={`p-4 border rounded-lg ${achievement.earned ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-900/20'}`}>
                    <Award className={`h-8 w-8 mb-2 ${achievement.earned ? 'text-green-600' : 'text-gray-400'}`} />
                    <h3 className="font-medium">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}