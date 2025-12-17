
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Users, 
  FileText, 
  Settings, 
  BarChart, 
  ShieldCheck,
  Database,
  MessageSquare,
  Image,
  Video,
  Download,
  AlertTriangle
} from 'lucide-react';
import { useLocation } from 'wouter';

interface AdminPanelProps {
  user: any;
}

export default function AdminPanel({ user }: AdminPanelProps) {
  const [, setLocation] = useLocation();

  const adminFeatures = [
    {
      title: 'Управление пользователями',
      description: 'Добавление, редактирование и удаление пользователей',
      icon: Users,
      action: () => setLocation('/admin/users'),
      color: 'bg-blue-500'
    },
    {
      title: 'Управление контентом',
      description: 'Создание и редактирование статей, документов',
      icon: FileText,
      action: () => setLocation('/admin/content'),
      color: 'bg-green-500'
    },
    {
      title: 'Модерация',
      description: 'Модерация объявлений и комментариев',
      icon: ShieldCheck,
      action: () => setLocation('/admin/moderation'),
      color: 'bg-orange-500'
    },
    {
      title: 'Аналитика',
      description: 'Просмотр статистики и отчетов',
      icon: BarChart,
      action: () => setLocation('/admin/analytics'),
      color: 'bg-purple-500'
    },
    {
      title: 'Медиа библиотека',
      description: 'Управление файлами и изображениями',
      icon: Image,
      action: () => setLocation('/admin/media'),
      color: 'bg-pink-500'
    },
    {
      title: 'Системные настройки',
      description: 'Конфигурация системы и безопасности',
      icon: Settings,
      action: () => setLocation('/admin/settings'),
      color: 'bg-gray-500'
    }
  ];

  const quickStats = [
    { label: 'Всего пользователей', value: '1,234', trend: '+12%' },
    { label: 'Активных объявлений', value: '567', trend: '+5%' },
    { label: 'Документов', value: '890', trend: '+8%' },
    { label: 'Просмотров сегодня', value: '12,345', trend: '+15%' }
  ];

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Панель администратора</h1>
            <p className="opacity-90">
              Добро пожаловать, {user?.firstName} {user?.lastName}
            </p>
          </div>
          <Badge variant="outline" className="bg-white text-red-600 border-white">
            <ShieldCheck className="w-4 h-4 mr-1" />
            Администратор
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <Badge variant="outline" className="text-green-600">
                  {stat.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminFeatures.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={feature.action}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${feature.color} text-white`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  Открыть
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Последняя активность
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: 'Новый пользователь зарегистрирован', time: '2 минуты назад', type: 'user' },
              { action: 'Объявление отправлено на модерацию', time: '15 минут назад', type: 'moderation' },
              { action: 'Опубликован новый документ', time: '1 час назад', type: 'content' },
              { action: 'Обновлены системные настройки', time: '2 часа назад', type: 'system' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'user' ? 'bg-blue-500' :
                    activity.type === 'moderation' ? 'bg-orange-500' :
                    activity.type === 'content' ? 'bg-green-500' : 'bg-gray-500'
                  }`} />
                  <span className="text-sm">{activity.action}</span>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
