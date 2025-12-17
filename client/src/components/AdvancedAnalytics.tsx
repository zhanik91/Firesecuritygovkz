import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, FileText, Eye, Download, Calendar, Activity } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdvancedAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/admin/analytics/detailed'],
  });

  const { data: realTimeStats } = useQuery({
    queryKey: ['/api/admin/analytics/realtime'],
    refetchInterval: 5000, // Update every 5 seconds
  });

  if (isLoading) {
    return <div className="p-6">Загрузка аналитики...</div>;
  }

  const trafficData = [
    { name: 'Пн', visitors: 120, pageViews: 240 },
    { name: 'Вт', visitors: 150, pageViews: 310 },
    { name: 'Ср', visitors: 180, pageViews: 380 },
    { name: 'Чт', visitors: 200, pageViews: 420 },
    { name: 'Пт', visitors: 250, pageViews: 520 },
    { name: 'Сб', visitors: 300, pageViews: 600 },
    { name: 'Вс', visitors: 280, pageViews: 580 },
  ];

  const contentData = [
    { name: 'Документы', value: 45, color: '#0088FE' },
    { name: 'Статьи', value: 30, color: '#00C49F' },
    { name: 'Видео', value: 15, color: '#FFBB28' },
    { name: 'Презентации', value: 10, color: '#FF8042' },
  ];

  const userGrowthData = [
    { month: 'Янв', users: 50 },
    { month: 'Фев', users: 75 },
    { month: 'Мар', users: 120 },
    { month: 'Апр', users: 160 },
    { month: 'Май', users: 210 },
    { month: 'Июн', users: 280 },
  ];

  return (
    <div className="space-y-6">
      {/* Real-time Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Онлайн сейчас</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(realTimeStats as any)?.onlineUsers || 23}
            </div>
            <p className="text-xs text-muted-foreground">
              Активные пользователи
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Сегодня</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,254</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
              +12% от вчера
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Скачивания</CardTitle>
            <Download className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 mr-1 text-red-500" />
              -5% от вчера
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Новые пользователи</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
              +3 за последний час
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="traffic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="traffic">Трафик</TabsTrigger>
          <TabsTrigger value="content">Контент</TabsTrigger>
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="performance">Производительность</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Посещаемость по дням</CardTitle>
                <CardDescription>Уникальные посетители и просмотры страниц</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trafficData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="visitors" fill="#8884d8" name="Посетители" />
                    <Bar dataKey="pageViews" fill="#82ca9d" name="Просмотры" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Источники трафика</CardTitle>
                <CardDescription>Откуда приходят пользователи</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Прямые переходы</span>
                  <div className="flex items-center gap-2">
                    <Progress value={45} className="w-20" />
                    <span className="text-sm font-medium">45%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Поисковые системы</span>
                  <div className="flex items-center gap-2">
                    <Progress value={30} className="w-20" />
                    <span className="text-sm font-medium">30%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Социальные сети</span>
                  <div className="flex items-center gap-2">
                    <Progress value={15} className="w-20" />
                    <span className="text-sm font-medium">15%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Рефералы</span>
                  <div className="flex items-center gap-2">
                    <Progress value={10} className="w-20" />
                    <span className="text-sm font-medium">10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Популярность контента</CardTitle>
                <CardDescription>Распределение просмотров по типам контента</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={contentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {contentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Топ публикаций</CardTitle>
                <CardDescription>Самые популярные материалы</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: 'Основы пожарной безопасности', views: 1240, type: 'Документ' },
                  { title: 'Системы пожаротушения', views: 980, type: 'Статья' },
                  { title: 'Эвакуационные планы', views: 756, type: 'Презентация' },
                  { title: 'Средства пожаротушения', views: 650, type: 'Видео' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.type}</p>
                    </div>
                    <Badge variant="secondary">{item.views} просмотров</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Рост пользователей</CardTitle>
              <CardDescription>Динамика регистрации новых пользователей</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Время загрузки</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">1.2s</div>
                <p className="text-sm text-muted-foreground">Среднее время</p>
                <Progress value={85} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Доступность</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">99.9%</div>
                <p className="text-sm text-muted-foreground">Uptime за месяц</p>
                <Progress value={99.9} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ошибки</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">0.1%</div>
                <p className="text-sm text-muted-foreground">Частота ошибок</p>
                <Progress value={0.1} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}